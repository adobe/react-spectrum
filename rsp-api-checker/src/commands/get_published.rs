//! `get-published-api` command: downloads the latest published versions of all
//! packages from npm and extracts their type API from `.d.ts` files.

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use tempfile::TempDir;

use crate::npm::get_published_packages;
use crate::workspace::{run_extractor, run_npm_install, write_package_json};
use crate::workspaces::discover_workspaces;

#[derive(Debug)]
pub struct GetPublishedOpts {
    /// Root of the monorepo (to discover which packages exist).
    pub repo_root: PathBuf,
    /// Where to write the extracted API files.
    pub output_dir: PathBuf,
    /// Max concurrent npm registry requests.
    pub concurrency: usize,
    /// npm dist-tag to install (e.g. "latest", "nightly").
    pub tag: String,
    /// Print per-phase timing breakdown on completion.
    pub timing: bool,
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
    let packages_dir = opts.repo_root.join("packages");
    if !packages_dir.exists() {
        anyhow::bail!(
            "packages/ directory not found at {}",
            packages_dir.display()
        );
    }

    // Clean output directory
    if opts.output_dir.exists() {
        std::fs::remove_dir_all(&opts.output_dir)
            .context("removing existing output directory")?;
    }

    // 1. Discover workspace package names — ask yarn first (respects the
    //    repo's workspaces globs and private flag), fall back to fs-walk when
    //    yarn isn't installed.
    let t_discover = std::time::Instant::now();
    let preresolved_names = match discover_workspaces(&opts.repo_root).await? {
        Some(workspaces) => {
            println!(
                "Using yarn workspaces list: {} public packages",
                workspaces.len()
            );
            Some(workspaces.into_iter().map(|w| w.name).collect())
        }
        None => {
            println!("yarn workspaces list unavailable — falling back to filesystem walk");
            None
        }
    };

    // 2. Query npm to find all published packages
    let published =
        get_published_packages(&packages_dir, opts.concurrency, &opts.tag, preresolved_names)
            .await?;
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

    // React types are needed so the TS checker can resolve JSX.Element, ReactNode, etc.
    // Pin to the SAME versions the local repo uses to avoid false diffs from
    // external type definition changes between versions. Failing loudly here
    // beats silently installing "latest" — a React types change between runs
    // would look like our API changed.
    for peer in ["react", "react-dom", "@types/react", "@types/react-dom"] {
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

    // 3. Run the TypeScript extractor on the installed packages
    //    The extractor looks for package.json files with `types` entries
    //    under the given directory. npm installs into node_modules/.
    let nm_dir = tmp_dir.join("node_modules");
    // check_build_freshness = false: published tarballs are immutable, so
    // their src/ vs dist/types/ mtime relationship doesn't mean the build
    // is stale — it's whatever npm chose to include.
    //
    // No workspaces_file: the tmp node_modules isn't a yarn workspace — it's
    // whatever npm installed. Fall back to the extractor's fs-walk.
    let t_extract = std::time::Instant::now();
    run_extractor(&nm_dir, &opts.output_dir, false, None).await?;
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
