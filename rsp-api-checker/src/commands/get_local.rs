//! `get-local-api` command: extracts the type API from the local build's
//! `.d.ts` files. Assumes the build has already been run.

use std::path::PathBuf;

use anyhow::{Context, Result};

use crate::extract::{discover_packages_fs, extract_packages, ExtractOpts, PackageEntry};
use crate::workspaces::discover_workspaces;

#[derive(Debug)]
pub struct GetLocalOpts {
    /// Root of the monorepo.
    pub repo_root: PathBuf,
    /// Where to write the extracted API files.
    pub output_dir: PathBuf,
    /// Print per-phase timing breakdown on completion.
    pub timing: bool,
}

pub async fn execute(opts: GetLocalOpts) -> Result<()> {
    let t_total = std::time::Instant::now();
    let packages_dir = opts.repo_root.join("packages");
    if !packages_dir.exists() {
        anyhow::bail!(
            "packages/ directory not found at {}",
            packages_dir.display()
        );
    }

    // Verify that at least some .d.ts files exist
    let has_dts = has_declaration_files(&packages_dir);
    if !has_dts {
        anyhow::bail!(
            "No .d.ts files found under {}/*/dist/. \
             Run your build first (e.g. `yarn build`) to generate type declarations.",
            packages_dir.display()
        );
    }

    // Clean output directory
    if opts.output_dir.exists() {
        std::fs::remove_dir_all(&opts.output_dir)
            .context("removing existing output directory")?;
    }

    std::fs::create_dir_all(&opts.output_dir)
        .context("creating output directory")?;

    // Prefer yarn's workspace list (honors the repo's workspaces globs +
    // private flag); fall back to a filesystem walk when yarn is unavailable.
    let t_discover = std::time::Instant::now();
    let entries: Vec<PackageEntry> = match discover_workspaces(&opts.repo_root).await? {
        Some(workspaces) => {
            println!("Using yarn workspaces list: {} public packages", workspaces.len());
            workspaces
                .into_iter()
                .map(|w| PackageEntry { name: w.name, dir: w.location, private: false })
                .collect()
        }
        None => {
            println!("yarn workspaces list unavailable — using filesystem walk");
            discover_packages_fs(&packages_dir)
        }
    };
    let discover_elapsed = t_discover.elapsed();

    // check_build_freshness = true: fail loudly if any package's src/ is newer
    // than its dist/types/ — a stale build would silently drop new props.
    let t_extract = std::time::Instant::now();
    extract_packages(
        &entries,
        &ExtractOpts {
            repo_root: opts.repo_root.clone(),
            output_dir: opts.output_dir.clone(),
            check_build_freshness: true,
            allow_empty: false,
        },
    )
    .await?;
    let extract_elapsed = t_extract.elapsed();

    println!("\nLocal API extracted to {}", opts.output_dir.display());
    if opts.timing {
        println!(
            "Timing: discover={:.2}s extract={:.2}s total={:.2}s",
            discover_elapsed.as_secs_f64(),
            extract_elapsed.as_secs_f64(),
            t_total.elapsed().as_secs_f64(),
        );
    }
    Ok(())
}

/// Check if any `.d.ts` files exist under packages/*/dist/.
fn has_declaration_files(packages_dir: &std::path::Path) -> bool {
    let pattern = packages_dir
        .join("**")
        .join("dist")
        .join("**")
        .join("*.d.ts");
    glob::glob(&pattern.to_string_lossy())
        .map(|mut g| g.next().is_some())
        .unwrap_or(false)
}
