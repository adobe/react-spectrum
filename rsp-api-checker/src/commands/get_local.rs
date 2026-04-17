//! `get-local-api` command: extracts the type API from the local build's
//! `.d.ts` files. Assumes the build has already been run.

use std::path::PathBuf;

use anyhow::{Context, Result};

use crate::workspace::run_extractor;

#[derive(Debug)]
pub struct GetLocalOpts {
    /// Root of the monorepo.
    pub repo_root: PathBuf,
    /// Where to write the extracted API files.
    pub output_dir: PathBuf,
}

pub async fn execute(opts: GetLocalOpts) -> Result<()> {
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

    // Run the TypeScript extractor directly on the local packages.
    // Pass `check_build_freshness = true` so we fail loudly if any package's
    // src/ is newer than its dist/types/ — that means `yarn build` is overdue
    // and the diff would silently drop newly-added props.
    run_extractor(&packages_dir, &opts.output_dir, true).await?;

    println!("\nLocal API extracted to {}", opts.output_dir.display());
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
