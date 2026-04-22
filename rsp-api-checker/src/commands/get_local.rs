//! `get-local-api` command: extracts the type API from the local build's
//! `.d.ts` files. Assumes the build has already been run.

use std::path::PathBuf;

use anyhow::{Context, Result};

use crate::workspace::run_extractor;
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

    // Ask yarn for the authoritative set of workspace packages and pass the
    // list through to the extractor. This avoids the extractor's fragile
    // depth-4 fs-walk, which silently drops any package published outside the
    // assumed layout. Fall back to fs-walk (workspaces_file = None) when yarn
    // isn't available.
    std::fs::create_dir_all(&opts.output_dir)
        .context("creating output directory")?;
    let t_discover = std::time::Instant::now();
    let workspaces_file = match discover_workspaces(&opts.repo_root).await? {
        Some(workspaces) => {
            println!(
                "Using yarn workspaces list: {} public packages",
                workspaces.len()
            );
            let path = opts.output_dir.join(".workspaces.json");
            let json: Vec<serde_json::Value> = workspaces
                .iter()
                .map(|w| {
                    serde_json::json!({
                        "name": w.name,
                        "location": w.location.to_string_lossy(),
                    })
                })
                .collect();
            std::fs::write(&path, serde_json::to_string(&json)?)
                .context("writing workspaces file")?;
            Some(path)
        }
        None => {
            println!("yarn workspaces list unavailable — using extractor fs walk");
            None
        }
    };
    let discover_elapsed = t_discover.elapsed();

    // Run the TypeScript extractor directly on the local packages.
    // Pass `check_build_freshness = true` so we fail loudly if any package's
    // src/ is newer than its dist/types/ — that means `yarn build` is overdue
    // and the diff would silently drop newly-added props.
    let t_extract = std::time::Instant::now();
    run_extractor(
        &packages_dir,
        &opts.output_dir,
        true,
        workspaces_file.as_deref(),
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
