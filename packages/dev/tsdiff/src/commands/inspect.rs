//! `inspect` command: print what the tool resolved for a repo without
//! extracting anything.
//!
//! This is the bring-up aid for pointing the checker at an unfamiliar repo:
//! it answers "which packages did you find, do they declare types, are those
//! types built, and is the parcel toolchain available?" in one read-only
//! pass, before committing to a long extraction.

use std::path::PathBuf;

use anyhow::Result;
use serde::Serialize;

use crate::config::RepoConfig;
use crate::extract::{resolve_types_entry_or_convention, ts_doc_available};
use crate::workspaces::discover;

#[derive(Debug)]
pub struct InspectOpts {
    pub repo_root: PathBuf,
    pub config: Option<PathBuf>,
    pub toolchain_root: Option<PathBuf>,
    /// Include `private: true` packages in the listing.
    pub include_private: bool,
    /// Emit JSON instead of the human-readable table.
    pub json: bool,
}

#[derive(Serialize)]
struct InspectReport {
    repo_root: String,
    toolchain_root: String,
    ts_doc_available: bool,
    config: RepoConfig,
    packages: Vec<PackageInfo>,
    summary: Summary,
}

#[derive(Serialize)]
struct PackageInfo {
    name: String,
    location: String,
    private: bool,
    /// Declarations entry, relative to the package directory.
    types_entry: Option<String>,
    /// `false` when the entry was inferred from `source` rather than declared.
    types_declared: bool,
    /// Whether that entry exists on disk (i.e. the package is built).
    types_built: bool,
}

#[derive(Serialize)]
struct Summary {
    total: usize,
    with_types_entry: usize,
    built: usize,
}

pub async fn execute(opts: InspectOpts) -> Result<()> {
    let repo_root = std::fs::canonicalize(&opts.repo_root).unwrap_or_else(|_| opts.repo_root.clone());
    let cfg = RepoConfig::load(&repo_root, opts.config.as_deref())?;
    let toolchain_root = opts.toolchain_root.clone().unwrap_or_else(|| repo_root.clone());

    let packages: Vec<PackageInfo> = discover(&cfg, opts.include_private)
        .await?
        .into_iter()
        .map(|w| {
            let entry = std::fs::read_to_string(w.location.join("package.json"))
                .ok()
                .and_then(|txt| serde_json::from_str::<serde_json::Value>(&txt).ok())
                .and_then(|v| {
                    resolve_types_entry_or_convention(&v, &w.location, &cfg.types_from_source)
                });
            let (types_entry, types_declared, types_built) = match entry {
                Some(e) => {
                    let built = w.location.join(&e.rel).exists();
                    (Some(e.rel), e.declared, built)
                }
                None => (None, false, false),
            };
            PackageInfo {
                name: w.name,
                location: w
                    .location
                    .strip_prefix(&repo_root)
                    .unwrap_or(w.location.as_path())
                    .display()
                    .to_string(),
                private: w.private,
                types_entry,
                types_declared,
                types_built,
            }
        })
        .collect();

    let summary = Summary {
        total: packages.len(),
        with_types_entry: packages.iter().filter(|p| p.types_entry.is_some()).count(),
        built: packages.iter().filter(|p| p.types_built).count(),
    };

    let report = InspectReport {
        repo_root: repo_root.display().to_string(),
        toolchain_root: toolchain_root.display().to_string(),
        ts_doc_available: ts_doc_available(&toolchain_root),
        config: cfg,
        packages,
        summary,
    };

    if opts.json {
        println!("{}", serde_json::to_string_pretty(&report)?);
        return Ok(());
    }

    println!("Repo root:       {}", report.repo_root);
    println!("Toolchain root:  {}", report.toolchain_root);
    println!(
        "parcel3 + @parcel/transformer-ts-doc: {}",
        if report.ts_doc_available {
            "available"
        } else {
            "MISSING — install the toolchain, or pass --toolchain-root pointing at a repo that has it"
        }
    );
    println!("{}", report.config.describe());
    println!(
        "Install: {} | build: {}",
        report.config.install.join(" "),
        report.config.build.join(" ")
    );
    println!();

    if report.packages.is_empty() {
        println!(
            "No packages found. Set `workspaces` in tsdiff.json at the repo root \
             if this repo's layout isn't declared in package.json."
        );
        return Ok(());
    }

    println!("{:<44} {:<8} {}", "PACKAGE", "BUILT", "TYPES ENTRY");
    for p in &report.packages {
        let built = if p.types_entry.is_none() {
            "n/a"
        } else if p.types_built {
            "yes"
        } else {
            "NO"
        };
        let entry = match (&p.types_entry, p.types_declared) {
            (Some(rel), true) => rel.clone(),
            (Some(rel), false) => format!("{rel} (inferred)"),
            (None, _) => "— no types entry —".to_string(),
        };
        let name = if p.private {
            format!("{} (private)", p.name)
        } else {
            p.name.clone()
        };
        println!("{name:<44} {built:<8} {entry}");
    }

    println!();
    println!(
        "{} packages, {} with a types entry, {} built.",
        report.summary.total, report.summary.with_types_entry, report.summary.built
    );
    if report.summary.built < report.summary.with_types_entry {
        println!(
            "Run `{}` to build the rest before `get-local-api`.",
            report.config.build.join(" ")
        );
    }

    Ok(())
}
