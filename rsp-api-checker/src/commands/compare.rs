//! `compare` command: reads two directories of `api.json` files and produces
//! a human-readable diff of all API changes.

use std::path::PathBuf;

use anyhow::Result;

use crate::differ::{diff_package, discover_pairs, format_output, PackageDiff};

#[derive(Debug)]
pub struct CompareOpts {
    /// Directory containing the "base" (published / main) API files.
    pub base_dir: PathBuf,
    /// Directory containing the "branch" (local / PR) API files.
    pub branch_dir: PathBuf,
    /// Only diff this package (optional filter).
    pub package_filter: Option<String>,
    /// Only diff this interface (optional filter).
    pub interface_filter: Option<String>,
    /// Output GitHub-compatible markdown.
    pub is_ci: bool,
    /// Print extra debug info.
    pub verbose: bool,
    /// Output as JSON instead of text.
    pub json: bool,
    /// Print per-phase timing breakdown on completion.
    pub timing: bool,
}

pub async fn execute(opts: CompareOpts) -> Result<()> {
    let t_total = std::time::Instant::now();
    if !opts.base_dir.exists() {
        anyhow::bail!(
            "Base API directory not found: {}. \
             Run `get-published-api` or `get-local-api` first.",
            opts.base_dir.display()
        );
    }
    if !opts.branch_dir.exists() {
        anyhow::bail!(
            "Branch API directory not found: {}. \
             Run `get-local-api` first.",
            opts.branch_dir.display()
        );
    }

    let t_discover = std::time::Instant::now();
    let pairs = discover_pairs(&opts.base_dir, &opts.branch_dir)?;
    if pairs.is_empty() {
        println!("No API files found to compare.");
        return Ok(());
    }
    let discover_elapsed = t_discover.elapsed();

    if opts.verbose {
        println!("Found {} package pairs to compare", pairs.len());
    }

    let mut all_diffs: Vec<PackageDiff> = Vec::new();

    let t_diff = std::time::Instant::now();
    for pair in pairs {
        if let Some(ref filter) = opts.package_filter {
            if !pair.package_name.contains(filter.as_str()) {
                continue;
            }
        }

        if opts.verbose {
            println!("Diffing {}...", pair.package_name);
        }

        let mut pkg_diff = diff_package(
            &pair.package_name,
            &pair.base,
            &pair.branch,
            opts.is_ci,
        );

        // Apply interface filter
        if let Some(ref iface_filter) = opts.interface_filter {
            pkg_diff.diffs.retain(|d| {
                d.qualified_name
                    .rsplit(':')
                    .next()
                    .map(|n| n == iface_filter.as_str())
                    .unwrap_or(false)
            });
        }

        all_diffs.push(pkg_diff);
    }
    let diff_elapsed = t_diff.elapsed();

    let t_format = std::time::Instant::now();
    if opts.json {
        print_json(&all_diffs)?;
    } else {
        let output = format_output(&all_diffs, opts.is_ci);
        if output.is_empty() {
            println!("No API changes detected.");
        } else {
            print!("{output}");
        }
    }
    let format_elapsed = t_format.elapsed();

    if opts.timing {
        eprintln!(
            "Timing: discover={:.2}s diff={:.2}s format={:.2}s total={:.2}s",
            discover_elapsed.as_secs_f64(),
            diff_elapsed.as_secs_f64(),
            format_elapsed.as_secs_f64(),
            t_total.elapsed().as_secs_f64(),
        );
    }

    Ok(())
}

fn print_json(diffs: &[PackageDiff]) -> Result<()> {
    let mut output = Vec::new();
    for pkg in diffs {
        for diff in &pkg.diffs {
            output.push(serde_json::json!({
                "package": pkg.package_name,
                "export": diff.qualified_name,
                "changedBy": diff.changed_by,
                "affects": diff.affects,
            }));
        }
    }
    println!("{}", serde_json::to_string_pretty(&output)?);
    Ok(())
}
