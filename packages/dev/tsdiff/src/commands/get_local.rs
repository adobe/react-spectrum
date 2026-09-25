//! `get-local-api` command: extracts the type API from the local build's
//! `.d.ts` files. Assumes the build has already been run.

use std::path::PathBuf;

use anyhow::{Context, Result};

use crate::config::RepoConfig;
use crate::extract::{extract_packages, resolve_toolchain_root, resolve_types_entry_or_convention, ExtractOpts, PackageEntry};
use crate::workspaces::discover;

#[derive(Debug)]
pub struct GetLocalOpts {
    /// Root of the repo to extract.
    pub repo_root: PathBuf,
    /// Where to write the extracted API files.
    pub output_dir: PathBuf,
    /// Explicit config file, overriding the `tsdiff.json` probe at the root.
    pub config: Option<PathBuf>,
    /// Repo supplying the parcel3 toolchain. Defaults to `repo_root`; point
    /// it at a repo that has `@parcel/transformer-ts-doc` installed when the
    /// target repo doesn't.
    pub toolchain_root: Option<PathBuf>,
    /// Print per-phase timing breakdown on completion.
    pub timing: bool,
    /// Report packages that fail to extract and continue, rather than
    /// aborting the run.
    pub allow_failures: bool,
}

pub async fn execute(opts: GetLocalOpts) -> Result<()> {
    let t_total = std::time::Instant::now();
    let cfg = RepoConfig::load(&opts.repo_root, opts.config.as_deref())?;
    println!("{}", cfg.describe());

    let toolchain_root =
        resolve_toolchain_root(opts.toolchain_root.as_deref(), &opts.repo_root);

    let t_discover = std::time::Instant::now();
    let entries: Vec<PackageEntry> = discover(&cfg, false)
        .await?
        .into_iter()
        .map(|w| PackageEntry {
            name: w.name,
            dir: w.location,
            private: w.private,
        })
        .collect();
    let discover_elapsed = t_discover.elapsed();
    println!("Discovered {} public packages", entries.len());

    if entries.is_empty() {
        anyhow::bail!(
            "No workspace packages found under {}. Check the `workspaces` globs \
             (currently [{}]) — set them explicitly in tsdiff.json if this repo \
             has an unusual layout.",
            opts.repo_root.display(),
            cfg.workspaces.join(", ")
        );
    }

    // Fail early with a build hint rather than letting every package fall
    // through extract_packages' per-package "types entry missing" path.
    if !any_types_entry_built(&entries, &cfg) {
        anyhow::bail!(
            "No built declarations found for any of the {} discovered packages. \
             Run the build first (e.g. `{}`) to generate type declarations.",
            entries.len(),
            cfg.build.join(" ")
        );
    }

    if opts.output_dir.exists() {
        std::fs::remove_dir_all(&opts.output_dir)
            .context("removing existing output directory")?;
    }
    std::fs::create_dir_all(&opts.output_dir).context("creating output directory")?;

    // check_build_freshness = true: fail loudly if any package's sources are
    // newer than its declarations — a stale build would silently drop new props.
    let t_extract = std::time::Instant::now();
    extract_packages(
        &entries,
        &ExtractOpts {
            check_build_freshness: true,
            ..ExtractOpts::new(toolchain_root, opts.output_dir.clone())
                .with_config(&cfg)
                .allowing_failures(opts.allow_failures)
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

/// True when at least one discovered package has its declarations entry on
/// disk — i.e. the repo looks built.
fn any_types_entry_built(entries: &[PackageEntry], cfg: &RepoConfig) -> bool {
    entries.iter().any(|entry| {
        let Ok(txt) = std::fs::read_to_string(entry.dir.join("package.json")) else {
            return false;
        };
        let Ok(v) = serde_json::from_str::<serde_json::Value>(&txt) else {
            return false;
        };
        resolve_types_entry_or_convention(&v, &entry.dir, &cfg.types_from_source)
            .is_some_and(|e| entry.dir.join(&e.rel).exists())
    })
}
