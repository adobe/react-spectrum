//! tsdiff: TypeScript API comparison tool for JS/TS monorepos.
//!
//! Compares the public TypeScript API surface of a repo's packages between
//! two points — published npm, a built git ref, or the local build — and
//! produces a human-readable diff.
//!
//! Repo-agnostic: workspace layout, package manager, install/build commands
//! and declarations conventions are all resolved per repo (see `config.rs`),
//! with an optional `tsdiff.json` at the repo root to override the defaults.
//!
//! # Commands
//!
//! - `inspect` — Show the resolved config and discovered packages for a repo
//! - `get-published-api` — Download published packages from npm, extract `.d.ts` API
//! - `get-local-api` — Extract API from a local build's `.d.ts` files
//! - `get-ref-api` — Build an arbitrary git ref's API into a snapshot directory
//! - `compare` — Diff two API snapshots and show changes

use tsdiff::commands;
use std::path::PathBuf;

use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(
    name = "tsdiff",
    about = "TypeScript API comparison tool for JS/TS monorepos",
    version
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Show what the tool resolves for a repo: config, package manager,
    /// discovered packages, and whether their declarations are built.
    ///
    /// Read-only and fast — run this first when pointing the tool at a repo
    /// for the first time.
    #[command(name = "inspect")]
    Inspect {
        /// Root of the repo to inspect.
        #[arg(long, default_value = ".")]
        repo_root: PathBuf,

        /// Explicit config file (defaults to `tsdiff.json` at the repo root).
        #[arg(long)]
        config: Option<PathBuf>,

        /// Repo supplying the parcel3 toolchain (defaults to `--repo-root`).
        #[arg(long)]
        toolchain_root: Option<PathBuf>,

        /// Include `private: true` packages in the listing.
        #[arg(long)]
        include_private: bool,

        /// Output as JSON instead of a table.
        #[arg(long)]
        json: bool,
    },

    /// Download latest published packages from npm and extract their type API.
    ///
    /// This fetches each public package at its `latest` tag, then runs the
    /// TypeScript extractor on the `.d.ts` files to produce api.json files.
    #[command(name = "get-published-api")]
    GetPublishedApi {
        /// Root of the repo (used to discover package names).
        #[arg(long, default_value = ".")]
        repo_root: PathBuf,

        /// Output directory for the extracted API files.
        #[arg(long, short, default_value = "dist/base-api")]
        output: PathBuf,

        /// Explicit config file (defaults to `tsdiff.json` at the repo root).
        #[arg(long)]
        config: Option<PathBuf>,

        /// Repo supplying the parcel3 toolchain (defaults to `--repo-root`).
        #[arg(long)]
        toolchain_root: Option<PathBuf>,

        /// Max concurrent npm registry HTTP requests.
        #[arg(long, default_value_t = 20)]
        concurrency: usize,

        /// npm dist-tag to install (e.g. "latest", "nightly").
        #[arg(long, default_value = "latest")]
        tag: String,

        /// Report packages that fail to extract and carry on, instead of
        /// aborting. The failures are listed at the end; those packages are
        /// absent from the output, so a diff cannot see changes in them.
        #[arg(long)]
        allow_failures: bool,

        /// Print a per-phase timing breakdown when the command finishes.
        #[arg(long)]
        timing: bool,
    },

    /// Extract the type API from a local build's `.d.ts` files.
    ///
    /// Assumes you've already run your build (e.g. `yarn build`). The tool
    /// reads `.d.ts` entry points from each package's `package.json` and
    /// produces api.json files.
    #[command(name = "get-local-api")]
    GetLocalApi {
        /// Root of the repo.
        #[arg(long, default_value = ".")]
        repo_root: PathBuf,

        /// Output directory for the extracted API files.
        #[arg(long, short, default_value = "dist/branch-api")]
        output: PathBuf,

        /// Explicit config file (defaults to `tsdiff.json` at the repo root).
        #[arg(long)]
        config: Option<PathBuf>,

        /// Repo supplying the parcel3 toolchain (defaults to `--repo-root`).
        #[arg(long)]
        toolchain_root: Option<PathBuf>,

        /// Report packages that fail to extract and carry on, instead of
        /// aborting. The failures are listed at the end; those packages are
        /// absent from the output, so a diff cannot see changes in them.
        #[arg(long)]
        allow_failures: bool,

        /// Print a per-phase timing breakdown when the command finishes.
        #[arg(long)]
        timing: bool,
    },

    /// Build an arbitrary git ref's API into a snapshot directory.
    ///
    /// Snapshots the ref's tracked files via `git archive` (a pure read of
    /// the object store — the working tree, root `node_modules`, and `.git`
    /// are never touched), builds it in an isolated temp directory with its
    /// own configured install + build, then extracts its type API the
    /// same way `get-local-api` does. Lets you `compare` your branch against
    /// a *built* ref instead of against published npm.
    #[command(name = "get-ref-api")]
    GetRefApi {
        /// Root of the repo (source of the git ref).
        #[arg(long, default_value = ".")]
        repo_root: PathBuf,

        /// Output directory for the extracted API files.
        #[arg(long, short, default_value = "dist/base-api")]
        output: PathBuf,

        /// Explicit config file. Defaults to the `tsdiff.json` inside the
        /// snapshot, so a ref is built with its own configuration.
        #[arg(long)]
        config: Option<PathBuf>,

        /// Repo supplying the parcel3 toolchain (defaults to the snapshot).
        #[arg(long)]
        toolchain_root: Option<PathBuf>,

        /// Git ref (branch, tag, or SHA) to build.
        #[arg(long = "ref", default_value = "main")]
        git_ref: String,

        /// Run `git fetch` first, so e.g. `--ref origin/main` is truly latest.
        /// Off by default; the only thing this flag is allowed to touch is
        /// `.git`, and only remote-tracking refs.
        #[arg(long)]
        fetch: bool,

        /// Keep the temp build directory instead of removing it when the
        /// command finishes. Useful for debugging a failed build.
        #[arg(long)]
        keep: bool,

        /// Report packages that fail to extract and carry on, instead of
        /// aborting. The failures are listed at the end; those packages are
        /// absent from the output, so a diff cannot see changes in them.
        #[arg(long)]
        allow_failures: bool,
    },

    /// Collect environment + per-package state so CI and local runs can be
    /// diffed to pinpoint cross-package TS resolution failures.
    ///
    /// Reports tool versions, git state, each package's types-entry presence
    /// and mtimes, and where workspace dep symlinks resolve. Write it as a
    /// CI artifact and compare against a local run when the CI diff
    /// disagrees with local.
    #[command(name = "env-report")]
    EnvReport {
        /// Root of the repo.
        #[arg(long, default_value = ".")]
        repo_root: PathBuf,

        /// Explicit config file (defaults to `tsdiff.json` at the repo root).
        #[arg(long)]
        config: Option<PathBuf>,

        /// Write the report here. If omitted, dumps JSON to stdout.
        #[arg(long, short)]
        output: Option<PathBuf>,
    },

    /// Compare two API snapshots and output a diff.
    ///
    /// By default, compares `dist/base-api` (published) against
    /// `dist/branch-api` (local). The output format looks like TypeScript
    /// interfaces with +/- diff markers.
    #[command(name = "compare")]
    Compare {
        /// Directory containing the base (published) API files.
        #[arg(long, default_value = "dist/base-api")]
        base_api_dir: PathBuf,

        /// Directory containing the branch (local) API files.
        #[arg(long, default_value = "dist/branch-api")]
        branch_api_dir: PathBuf,

        /// Only compare a specific package (substring match).
        #[arg(long)]
        package: Option<String>,

        /// Only compare a specific interface name.
        // `long = "interface"` is the documented flag (README) and the original
        // intent; the bare `#[arg(long)]` had derived `--interface-filter` from
        // the field name, while `name = "interface"` only set the value-name
        // placeholder (not the flag) — so `--interface` never actually worked.
        // Keep `--interface-filter` as a hidden alias so the accidental flag
        // that did work doesn't break for anyone relying on it.
        #[arg(long = "interface", alias = "interface-filter", value_name = "interface")]
        interface_filter: Option<String>,

        /// Output GitHub-flavored markdown (for CI comments).
        #[arg(long)]
        ci: bool,

        /// Print extra debug information.
        #[arg(long, short)]
        verbose: bool,

        /// Output as JSON instead of text.
        #[arg(long)]
        json: bool,

        /// Print a per-phase timing breakdown when the command finishes.
        #[arg(long)]
        timing: bool,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Inspect {
            repo_root,
            config,
            toolchain_root,
            include_private,
            json,
        } => {
            commands::inspect::execute(commands::inspect::InspectOpts {
                repo_root,
                config,
                toolchain_root,
                include_private,
                json,
            })
            .await?;
        }

        Commands::GetPublishedApi {
            repo_root,
            output,
            config,
            toolchain_root,
            concurrency,
            tag,
            allow_failures,
            timing,
        } => {
            commands::get_published::execute(commands::get_published::GetPublishedOpts {
                repo_root,
                output_dir: output,
                config,
                toolchain_root,
                concurrency,
                tag,
                allow_failures,
                timing,
            })
            .await?;
        }

        Commands::GetLocalApi {
            repo_root,
            output,
            config,
            toolchain_root,
            allow_failures,
            timing,
        } => {
            commands::get_local::execute(commands::get_local::GetLocalOpts {
                repo_root,
                output_dir: output,
                config,
                toolchain_root,
                allow_failures,
                timing,
            })
            .await?;
        }

        Commands::GetRefApi {
            repo_root,
            output,
            config,
            toolchain_root,
            git_ref,
            fetch,
            keep,
            allow_failures,
        } => {
            commands::get_ref::execute(commands::get_ref::GetRefOpts {
                repo_root,
                output_dir: output,
                config,
                toolchain_root,
                git_ref,
                fetch,
                keep,
                allow_failures,
            })
            .await?;
        }

        Commands::EnvReport { repo_root, config, output } => {
            commands::env_report::execute(commands::env_report::EnvReportOpts {
                repo_root,
                config,
                output,
            })
            .await?;
        }

        Commands::Compare {
            base_api_dir,
            branch_api_dir,
            package,
            interface_filter,
            ci,
            verbose,
            json,
            timing,
        } => {
            commands::compare::execute(commands::compare::CompareOpts {
                base_dir: base_api_dir,
                branch_dir: branch_api_dir,
                package_filter: package,
                interface_filter,
                is_ci: ci,
                verbose,
                json,
                timing,
            })
            .await?;
        }
    }

    Ok(())
}
