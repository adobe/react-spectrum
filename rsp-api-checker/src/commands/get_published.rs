//! `get-published-api` command: downloads the latest published versions of all
//! packages from npm and extracts their type API from `.d.ts` files.

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use tempfile::TempDir;

use crate::npm::get_published_packages;
use crate::workspace::{run, run_extractor, write_package_json};

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
}

/// Read the installed version of a package from `node_modules/<pkg>/package.json`.
/// Returns `None` if not installed or unreadable.
fn local_installed_version(repo_root: &Path, package_name: &str) -> Option<String> {
    let pkg_json = repo_root
        .join("node_modules")
        .join(package_name)
        .join("package.json");
    let contents = std::fs::read_to_string(&pkg_json).ok()?;
    let parsed: serde_json::Value = serde_json::from_str(&contents).ok()?;
    parsed["version"].as_str().map(|s| s.to_string())
}

pub async fn execute(opts: GetPublishedOpts) -> Result<()> {
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

    // 1. Query npm to find all published packages
    let published = get_published_packages(&packages_dir, opts.concurrency, &opts.tag).await?;
    if published.is_empty() {
        anyhow::bail!("No published packages found");
    }

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
    // external type definition changes between versions.
    for peer in ["react", "react-dom", "@types/react", "@types/react-dom"] {
        if !deps.iter().any(|(n, _)| n == peer) {
            let version = local_installed_version(&opts.repo_root, peer)
                .unwrap_or_else(|| "latest".to_string());
            if version != "latest" {
                println!("  Pinning {peer}@{version} (matching local)");
            }
            deps.push((peer.to_string(), version));
        }
    }

    write_package_json(tmp_dir, &deps)?;

    println!("Installing {} packages from npm...", deps.len());
    run("npm", &["install", "--no-audit", "--no-fund", "--ignore-scripts"], tmp_dir).await?;

    // 3. Run the TypeScript extractor on the installed packages
    //    The extractor looks for package.json files with `types` entries
    //    under the given directory. npm installs into node_modules/.
    let nm_dir = tmp_dir.join("node_modules");
    run_extractor(&nm_dir, &opts.output_dir).await?;

    println!(
        "\nPublished API extracted to {}",
        opts.output_dir.display()
    );
    Ok(())
}
