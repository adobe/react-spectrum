//! `get-published-api` command: downloads the latest published versions of all
//! packages from npm and extracts their type API from `.d.ts` files.

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use tempfile::TempDir;

use crate::config::RepoConfig;
use crate::extract::{extract_packages, resolve_toolchain_root, ExtractOpts, PackageEntry};
use crate::npm::get_published_packages;
use crate::workspace::{run_npm_install, write_package_json};
use crate::workspaces::discover_names;

#[derive(Debug)]
pub struct GetPublishedOpts {
    /// Root of the repo (to discover which packages exist).
    pub repo_root: PathBuf,
    /// Where to write the extracted API files.
    pub output_dir: PathBuf,
    /// Explicit config file, overriding the `tsdiff.json` probe at the root.
    pub config: Option<PathBuf>,
    /// Repo supplying the parcel3 toolchain (defaults to `repo_root`).
    pub toolchain_root: Option<PathBuf>,
    /// Max concurrent npm registry requests.
    pub concurrency: usize,
    /// npm dist-tag to install (e.g. "latest", "nightly").
    pub tag: String,
    /// Print per-phase timing breakdown on completion.
    pub timing: bool,
    /// Report packages that fail to extract and continue, rather than
    /// aborting the run.
    pub allow_failures: bool,
}

/// Read the installed version of a package from `node_modules/<pkg>/package.json`.
///
/// Returns an error with full context if the file is missing or unreadable so
/// the caller can bail instead of silently falling back to "latest" — a silent
/// fallback would let React/ReactDOM type changes between the local and
/// published runs produce spurious diffs that look like our API changed.
fn local_installed_version(repo_root: &Path, package_name: &str) -> Result<String> {
    let pkg_json = repo_root
        .join("node_modules")
        .join(package_name)
        .join("package.json");
    let contents = std::fs::read_to_string(&pkg_json)
        .with_context(|| format!("reading {}", pkg_json.display()))?;
    let parsed: serde_json::Value = serde_json::from_str(&contents)
        .with_context(|| format!("parsing {}", pkg_json.display()))?;
    parsed["version"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow::anyhow!("no \"version\" field in {}", pkg_json.display()))
}

/// Recognise version specifiers that are NOT concrete semver: `workspace:*`,
/// `workspace:^1.2`, `*`, empty string, etc. When a package.json resolves to
/// one of these we can't hand it to `npm install` as-is — npm will bail with
/// ETARGET or (for `*`) accept it but install arbitrary versions. Callers
/// should resolve via the npm `latest` dist-tag instead, with a warning.
fn is_wildcard_version(version: &str) -> bool {
    let trimmed = version.trim();
    trimmed.is_empty()
        || trimmed == "*"
        || trimmed == "latest"
        || trimmed.starts_with("workspace:")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wildcard_version_detects_star_and_workspace_forms() {
        assert!(is_wildcard_version("*"));
        assert!(is_wildcard_version("workspace:*"));
        assert!(is_wildcard_version("workspace:^1.2.3"));
        assert!(is_wildcard_version("workspace:~1.0.0"));
        assert!(is_wildcard_version(""));
        assert!(is_wildcard_version("  "));
        assert!(is_wildcard_version("latest"));
    }

    #[test]
    fn wildcard_version_accepts_concrete_semver() {
        assert!(!is_wildcard_version("1.2.3"));
        assert!(!is_wildcard_version("^1.2.3"));
        assert!(!is_wildcard_version("~1.2.3"));
        assert!(!is_wildcard_version("18.0.0-beta.1"));
    }
}

pub async fn execute(opts: GetPublishedOpts) -> Result<()> {
    let t_total = std::time::Instant::now();
    let cfg = RepoConfig::load(&opts.repo_root, opts.config.as_deref())?;
    println!("{}", cfg.describe());
    let toolchain_root =
        resolve_toolchain_root(opts.toolchain_root.as_deref(), &opts.repo_root);

    // Clean output directory
    if opts.output_dir.exists() {
        std::fs::remove_dir_all(&opts.output_dir)
            .context("removing existing output directory")?;
    }

    // 1. Discover the repo's publishable workspace package names.
    let t_discover = std::time::Instant::now();
    let names = discover_names(&cfg).await?;
    println!("Discovered {} public packages", names.len());
    if names.is_empty() {
        anyhow::bail!(
            "No workspace packages found under {}. Check the `workspaces` globs \
             (currently [{}]) — set them explicitly in tsdiff.json if this repo \
             has an unusual layout.",
            opts.repo_root.display(),
            cfg.workspaces.join(", ")
        );
    }

    // 2. Query npm to find which of them are published.
    let published = get_published_packages(names, opts.concurrency, &opts.tag).await?;
    if published.is_empty() {
        anyhow::bail!("No published packages found");
    }
    let discover_elapsed = t_discover.elapsed();

    // 2. Create temp workspace and install from npm
    let tmp = TempDir::new().context("creating temp directory")?;
    let tmp_dir = tmp.path();
    println!("Working in {}", tmp_dir.display());

    let tag = &opts.tag;
    let mut deps: Vec<(String, String)> = published
        .iter()
        .map(|p| (p.name.clone(), tag.clone()))
        .collect();

    // Pinned peers (for a React repo: react + @types/react) are needed so the
    // TS checker can resolve JSX.Element, ReactNode, etc. Pin them to the SAME
    // versions the local repo uses, to avoid false diffs from external type
    // definition changes between versions. Failing loudly here beats silently
    // installing "latest" — an external types change between runs would look
    // like our API changed. Configure via `pinnedPeers` in tsdiff.json.
    for peer in &cfg.pinned_peers {
        let peer = peer.as_str();
        if !deps.iter().any(|(n, _)| n == peer) {
            let version = local_installed_version(&opts.repo_root, peer)
                .with_context(|| format!(
                    "could not resolve local version of `{peer}` — \
                     this must be installed in the monorepo's node_modules/ \
                     so the published run uses matching React types"
                ))?;
            // If the local version is non-concrete (e.g. `workspace:*` got
            // copied in by mistake), fall through to npm latest. This should
            // never happen for external React types, but we'd rather tell
            // the user what we're doing than silently install a wildcard.
            let resolved = if is_wildcard_version(&version) {
                println!(
                    "  warn: local version of {peer} is `{version}` — resolving via npm `latest` instead"
                );
                "latest".to_string()
            } else {
                version
            };
            println!("  Pinning {peer}@{resolved} (matching local)");
            deps.push((peer.to_string(), resolved));
        }
    }

    write_package_json(tmp_dir, &deps)?;

    println!("Installing {} packages from npm...", deps.len());
    let t_install = std::time::Instant::now();
    run_npm_install(
        &["install", "--no-audit", "--no-fund", "--ignore-scripts"],
        tmp_dir,
    )
    .await?;
    let install_elapsed = t_install.elapsed();

    // 3. Extract each installed package's .d.ts via the parcel3 driver.
    //    Entries point at the tmp install's node_modules; transformer-ts-doc
    //    resolves cross-package types from there, while its plugin + the
    //    parcel3 binary resolve from the toolchain root's node_modules.
    //    check_build_freshness = false: published tarballs are immutable.
    let nm_dir = tmp_dir.join("node_modules");
    let entries: Vec<PackageEntry> = published
        .iter()
        .map(|p| PackageEntry {
            name: p.name.clone(),
            dir: nm_dir.join(&p.name),
            private: false,
        })
        .collect();

    let t_extract = std::time::Instant::now();
    extract_packages(
        &entries,
        &ExtractOpts::new(toolchain_root, opts.output_dir.clone())
            .with_config(&cfg)
            .allowing_failures(opts.allow_failures),
    )
    .await?;
    let extract_elapsed = t_extract.elapsed();

    println!(
        "\nPublished API extracted to {}",
        opts.output_dir.display()
    );
    if opts.timing {
        println!(
            "Timing: discover={:.2}s install={:.2}s extract={:.2}s total={:.2}s",
            discover_elapsed.as_secs_f64(),
            install_elapsed.as_secs_f64(),
            extract_elapsed.as_secs_f64(),
            t_total.elapsed().as_secs_f64(),
        );
    }
    Ok(())
}
