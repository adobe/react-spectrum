//! `env-report` command: captures environment + per-package state so we can
//! diff CI vs local runs and pinpoint cross-package TS resolution failures.
//!
//! This never modifies anything — purely read-only inspection. The output is
//! meant to be persisted as a CI artifact and diffed against a local run.

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use serde::Serialize;

use crate::workspace::run_capture;

#[derive(Debug)]
pub struct EnvReportOpts {
    /// Root of the monorepo.
    pub repo_root: PathBuf,
    /// Where to write the JSON report. If None, stdout only.
    pub output: Option<PathBuf>,
}

#[derive(Serialize)]
struct EnvReport {
    /// ISO-8601 timestamp when the report was generated.
    generated_at: String,
    /// Tool versions collected via `<tool> --version` subprocesses.
    tools: ToolVersions,
    /// git state of the repo_root.
    git: GitInfo,
    /// Per-package state: does its d.ts exist, mtimes, symlink resolution.
    packages: Vec<PackageState>,
    /// Aggregate counts across all packages.
    summary: Summary,
}

#[derive(Serialize, Default)]
struct ToolVersions {
    node: Option<String>,
    npm: Option<String>,
    yarn: Option<String>,
    tsc: Option<String>,
    tsx: Option<String>,
    rustc: Option<String>,
    os: Option<String>,
}

#[derive(Serialize, Default)]
struct GitInfo {
    head_sha: Option<String>,
    branch: Option<String>,
    /// Number of modified / untracked / staged files by `git status --porcelain`.
    working_tree_changes: usize,
    /// When `working_tree_changes > 0`, the first ~20 lines of porcelain output
    /// so CI runs on PR branches show roughly what's dirty.
    working_tree_sample: Vec<String>,
}

#[derive(Serialize)]
struct PackageState {
    name: String,
    /// Path relative to repo_root.
    dir: String,
    private: bool,
    has_types_entry: bool,
    /// The `types` / `typings` / `exports["."]["types"]` path if declared.
    types_entry: Option<String>,
    /// Whether the types entry actually exists on disk.
    types_entry_exists: bool,
    /// mtime (unix seconds) of the types entry file, if it exists.
    types_entry_mtime: Option<u64>,
    /// Newest mtime (unix seconds) among .ts/.tsx source files under src/.
    newest_source_mtime: Option<u64>,
    /// True when source is newer than the types entry — local build is stale.
    source_newer_than_types: bool,
    /// For each workspace dep listed in this package.json, where does
    /// `realpath(this_pkg/node_modules/<dep>)` actually resolve to? A missing
    /// entry means the dep isn't reachable from this package at all.
    workspace_dep_resolution: Vec<WorkspaceDepResolution>,
    /// Every `.d.ts` file under `dist/types/`, sorted by relative path. Lets
    /// us diff CI vs local to spot subpath types that weren't built/persisted
    /// (e.g. `react-aria/useButton` resolving empty because
    /// `dist/types/exports/useButton.d.ts` is missing). `None` when the
    /// package has no `dist/types/` directory.
    dist_types_files: Option<Vec<DistTypesFile>>,
}

#[derive(Serialize)]
struct DistTypesFile {
    /// Path relative to the package dir, e.g. `dist/types/exports/useButton.d.ts`.
    path: String,
    /// Size in bytes. Trivially empty files (re-exports only) are still
    /// meaningful — `0` would indicate an emit failure.
    size: u64,
    /// mtime in unix seconds. Matches `types_entry_mtime` for files built in
    /// the same emit pass.
    mtime: u64,
}

#[derive(Serialize)]
struct WorkspaceDepResolution {
    dep_name: String,
    /// The path we looked up: `<pkg>/node_modules/<dep>`.
    lookup_path: String,
    /// What realpath resolved to. None if the path doesn't exist.
    resolved_to: Option<String>,
    /// True when resolved_to points somewhere under `packages/` (i.e. this is
    /// a workspace symlink, not a separately-installed copy).
    is_workspace_symlink: bool,
    /// True when the resolved package has a types entry file on disk.
    resolved_types_exist: Option<bool>,
}

#[derive(Serialize)]
struct Summary {
    total_packages: usize,
    public_packages: usize,
    packages_with_types_entry: usize,
    packages_with_types_on_disk: usize,
    packages_with_stale_types: usize,
    /// Sum of workspace deps across all packages that failed to resolve.
    unresolved_workspace_deps: usize,
    /// Total `.d.ts` files found across every package's `dist/types/` tree.
    /// A large CI-vs-local delta here is a smoking gun for partial builds /
    /// partial workspace persistence.
    total_dist_types_files: usize,
    /// Number of packages that declare a `types` entry but whose `dist/types/`
    /// directory is absent.
    packages_missing_dist_types_dir: usize,
}

pub async fn execute(opts: EnvReportOpts) -> Result<()> {
    let repo_root = std::fs::canonicalize(&opts.repo_root)
        .context(format!("resolving repo root: {}", opts.repo_root.display()))?;
    let packages_dir = repo_root.join("packages");
    if !packages_dir.exists() {
        anyhow::bail!(
            "packages/ directory not found at {}",
            packages_dir.display()
        );
    }

    println!("Collecting environment report from {}", repo_root.display());

    let tools = collect_tool_versions(&repo_root).await;
    let git = collect_git_info(&repo_root).await;
    let packages = collect_package_states(&repo_root, &packages_dir)?;
    let summary = summarize(&packages);

    let report = EnvReport {
        generated_at: chrono_like_now(),
        tools,
        git,
        packages,
        summary,
    };

    // Pretty-printed to stdout so it shows up in CI logs even without the artifact.
    let json = serde_json::to_string_pretty(&report)?;
    println!("\n===== env-report =====");
    println!("{}", short_summary(&report));
    println!("======================\n");

    if let Some(output_path) = opts.output {
        if let Some(parent) = output_path.parent() {
            if !parent.as_os_str().is_empty() {
                std::fs::create_dir_all(parent)
                    .context(format!("creating {}", parent.display()))?;
            }
        }
        std::fs::write(&output_path, &json)
            .context(format!("writing {}", output_path.display()))?;
        println!("env-report written to {}", output_path.display());
    } else {
        // Dump full JSON to stdout too so `| tee` captures it.
        println!("{}", json);
    }

    Ok(())
}

fn short_summary(r: &EnvReport) -> String {
    let t = &r.tools;
    let g = &r.git;
    let s = &r.summary;
    format!(
        "node={}  yarn={}  tsc={}  rustc={}\n\
         git HEAD={}  branch={}  dirty files={}\n\
         packages: {} total, {} public, {} with types entry, {} with types on disk, \
         {} stale, {} unresolved workspace deps\n\
         dist/types: {} files across all packages, {} packages declare types but have no dist/types/ dir",
        t.node.as_deref().unwrap_or("?"),
        t.yarn.as_deref().unwrap_or("?"),
        t.tsc.as_deref().unwrap_or("?"),
        t.rustc.as_deref().unwrap_or("?"),
        g.head_sha.as_deref().unwrap_or("?"),
        g.branch.as_deref().unwrap_or("?"),
        g.working_tree_changes,
        s.total_packages,
        s.public_packages,
        s.packages_with_types_entry,
        s.packages_with_types_on_disk,
        s.packages_with_stale_types,
        s.unresolved_workspace_deps,
        s.total_dist_types_files,
        s.packages_missing_dist_types_dir,
    )
}

async fn collect_tool_versions(repo_root: &Path) -> ToolVersions {
    let mut v = ToolVersions::default();
    v.node = first_line(run_capture("node", &["--version"], repo_root).await.ok());
    v.npm = first_line(run_capture("npm", &["--version"], repo_root).await.ok());
    v.yarn = first_line(run_capture("yarn", &["--version"], repo_root).await.ok());
    v.tsc = first_line(
        run_capture("npx", &["--no-install", "tsc", "--version"], repo_root)
            .await
            .ok(),
    );
    v.tsx = first_line(
        run_capture("npx", &["--no-install", "tsx", "--version"], repo_root)
            .await
            .ok(),
    );
    v.rustc = first_line(run_capture("rustc", &["--version"], repo_root).await.ok());
    v.os = Some(format!("{} {}", std::env::consts::OS, std::env::consts::ARCH));
    v
}

fn first_line(s: Option<String>) -> Option<String> {
    s.and_then(|t| t.lines().next().map(|l| l.trim().to_string()))
        .filter(|s| !s.is_empty())
}

async fn collect_git_info(repo_root: &Path) -> GitInfo {
    let mut g = GitInfo::default();
    g.head_sha = first_line(run_capture("git", &["rev-parse", "HEAD"], repo_root).await.ok());
    g.branch = first_line(
        run_capture("git", &["rev-parse", "--abbrev-ref", "HEAD"], repo_root)
            .await
            .ok(),
    );
    if let Ok(porcelain) = run_capture("git", &["status", "--porcelain"], repo_root).await {
        let lines: Vec<&str> = porcelain.lines().collect();
        g.working_tree_changes = lines.len();
        g.working_tree_sample = lines.iter().take(20).map(|l| l.to_string()).collect();
    }
    g
}

fn collect_package_states(repo_root: &Path, packages_dir: &Path) -> Result<Vec<PackageState>> {
    let mut states = Vec::new();
    let mut names = Vec::new();
    // Reuse the shared walker so the package set matches what the extractor sees.
    crate::npm::walk_for_package_dirs(packages_dir, 0, &mut names)?;
    for pkg_dir in names {
        if let Ok(state) = inspect_package(repo_root, &pkg_dir) {
            states.push(state);
        }
    }
    Ok(states)
}

fn inspect_package(repo_root: &Path, pkg_dir: &Path) -> Result<PackageState> {
    let pkg_json_path = pkg_dir.join("package.json");
    let contents = std::fs::read_to_string(&pkg_json_path)
        .context(format!("reading {}", pkg_json_path.display()))?;
    let pkg: serde_json::Value = serde_json::from_str(&contents)?;
    let name = pkg
        .get("name")
        .and_then(|v| v.as_str())
        .unwrap_or("<unnamed>")
        .to_string();
    let private = pkg.get("private").and_then(|v| v.as_bool()).unwrap_or(false);

    let types_entry = resolve_types_entry(&pkg);
    let (types_entry_exists, types_entry_mtime) = match &types_entry {
        Some(rel) => {
            let abs = pkg_dir.join(rel);
            match std::fs::metadata(&abs) {
                Ok(m) => (true, Some(mtime_secs(&m))),
                Err(_) => (false, None),
            }
        }
        None => (false, None),
    };

    let newest_source_mtime = newest_src_mtime(pkg_dir);
    let source_newer_than_types = match (newest_source_mtime, types_entry_mtime) {
        (Some(s), Some(t)) => s > t,
        _ => false,
    };

    let workspace_dep_resolution = inspect_workspace_deps(&pkg, pkg_dir, repo_root);
    let dist_types_files = collect_dist_types_files(pkg_dir);

    let rel_dir = pkg_dir
        .strip_prefix(repo_root)
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|_| pkg_dir.display().to_string());

    Ok(PackageState {
        name,
        dir: rel_dir,
        private,
        has_types_entry: types_entry.is_some(),
        types_entry,
        types_entry_exists,
        types_entry_mtime,
        newest_source_mtime,
        source_newer_than_types,
        workspace_dep_resolution,
        dist_types_files,
    })
}

/// Enumerate every `.d.ts` file under `<pkg_dir>/dist/types/`, sorted by
/// relative path. Returns `None` if `dist/types/` doesn't exist — distinguishes
/// "no types built at all" from "empty types tree".
fn collect_dist_types_files(pkg_dir: &Path) -> Option<Vec<DistTypesFile>> {
    let dist_types = pkg_dir.join("dist").join("types");
    if !dist_types.exists() {
        return None;
    }
    let mut files = Vec::new();
    fn walk(root: &Path, cur: &Path, out: &mut Vec<DistTypesFile>, depth: usize) {
        if depth > 10 {
            return;
        }
        let Ok(entries) = std::fs::read_dir(cur) else {
            return;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            match entry.file_type() {
                Ok(ft) if ft.is_dir() => walk(root, &path, out, depth + 1),
                Ok(ft) if ft.is_file() => {
                    if path.extension().and_then(|s| s.to_str()) == Some("ts")
                        && path
                            .to_string_lossy()
                            .ends_with(".d.ts")
                    {
                        if let Ok(meta) = entry.metadata() {
                            let rel = path
                                .strip_prefix(root)
                                .map(|p| p.to_string_lossy().to_string())
                                .unwrap_or_else(|_| path.display().to_string());
                            out.push(DistTypesFile {
                                path: rel,
                                size: meta.len(),
                                mtime: mtime_secs(&meta),
                            });
                        }
                    }
                }
                _ => {}
            }
        }
    }
    walk(pkg_dir, &dist_types, &mut files, 0);
    // Sort so CI vs local diffs cleanly.
    files.sort_by(|a, b| a.path.cmp(&b.path));
    Some(files)
}

fn mtime_secs(m: &std::fs::Metadata) -> u64 {
    m.modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

/// Mirror of the TS `resolveTypesField` — we need the same answer the
/// extractor would get. Kept intentionally simple: walk nested objects/arrays
/// looking for a string ending in `.d.ts`.
fn resolve_types_entry(pkg: &serde_json::Value) -> Option<String> {
    // Prefer `exports["."]["types"]`, then `types`, then `typings`.
    if let Some(v) = pkg.pointer("/exports/./types") {
        if let Some(s) = walk_for_dts(v) {
            return Some(s);
        }
    }
    if let Some(v) = pkg.pointer("/exports/.") {
        if let Some(s) = walk_for_dts(v) {
            return Some(s);
        }
    }
    if let Some(v) = pkg.get("types").or_else(|| pkg.get("typings")) {
        if let Some(s) = walk_for_dts(v) {
            return Some(s);
        }
    }
    None
}

fn walk_for_dts(v: &serde_json::Value) -> Option<String> {
    match v {
        serde_json::Value::String(s) if s.ends_with(".d.ts") => Some(s.clone()),
        serde_json::Value::Array(arr) => arr.iter().find_map(walk_for_dts),
        serde_json::Value::Object(map) => map.values().find_map(walk_for_dts),
        _ => None,
    }
}

fn newest_src_mtime(pkg_dir: &Path) -> Option<u64> {
    let src = pkg_dir.join("src");
    if !src.exists() {
        return None;
    }
    let mut newest: Option<u64> = None;
    fn walk(dir: &Path, newest: &mut Option<u64>, depth: usize) {
        if depth > 6 {
            return;
        }
        let Ok(entries) = std::fs::read_dir(dir) else {
            return;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            let name = entry.file_name();
            let name_str = name.to_string_lossy();
            if name_str == "node_modules" || name_str == ".git" || name_str == "dist" {
                continue;
            }
            match entry.file_type() {
                Ok(ft) if ft.is_dir() => walk(&path, newest, depth + 1),
                Ok(ft) if ft.is_file() => {
                    let lossy = path.to_string_lossy();
                    let is_src = lossy.ends_with(".ts") || lossy.ends_with(".tsx");
                    if is_src {
                        if let Ok(m) = entry.metadata() {
                            let t = mtime_secs(&m);
                            if newest.map_or(true, |n| t > n) {
                                *newest = Some(t);
                            }
                        }
                    }
                }
                _ => {}
            }
        }
    }
    walk(&src, &mut newest, 0);
    newest
}

fn inspect_workspace_deps(
    pkg: &serde_json::Value,
    pkg_dir: &Path,
    repo_root: &Path,
) -> Vec<WorkspaceDepResolution> {
    let mut out = Vec::new();
    let packages_root = repo_root.join("packages");
    for field in ["dependencies", "peerDependencies"] {
        let Some(deps) = pkg.get(field).and_then(|v| v.as_object()) else {
            continue;
        };
        for (dep_name, _version) in deps {
            // We only care about deps that *could* be workspace deps — i.e.
            // under the scopes we publish. Keep this in sync with `is_our_package`.
            if !is_our_scope(dep_name) {
                continue;
            }
            // Node-style upward resolution: walk up from pkg_dir looking for
            // node_modules/<dep>. Yarn workspaces hoist to the root's
            // node_modules, so a package-local lookup would spuriously miss
            // everything.
            let (lookup_path, resolved) = resolve_node_style(pkg_dir, dep_name);
            let is_workspace_symlink = resolved
                .as_ref()
                .and_then(|p| {
                    std::fs::canonicalize(&packages_root)
                        .ok()
                        .map(|r| p.starts_with(&r))
                })
                .unwrap_or(false);
            let resolved_types_exist = resolved.as_ref().and_then(|r| {
                let pkg_json = r.join("package.json");
                let contents = std::fs::read_to_string(&pkg_json).ok()?;
                let parsed: serde_json::Value = serde_json::from_str(&contents).ok()?;
                let types_rel = resolve_types_entry(&parsed)?;
                Some(r.join(types_rel).exists())
            });
            out.push(WorkspaceDepResolution {
                dep_name: dep_name.clone(),
                lookup_path,
                resolved_to: resolved.map(|p| p.display().to_string()),
                is_workspace_symlink,
                resolved_types_exist,
            });
        }
    }
    out
}

/// Node-style resolution: starting at `start_dir`, walk up the tree looking
/// for `node_modules/<dep>/package.json`. Returns (the path we used for the
/// lookup_path field, the canonicalized resolution if found).
fn resolve_node_style(start_dir: &Path, dep_name: &str) -> (String, Option<std::path::PathBuf>) {
    let first = start_dir.join("node_modules").join(dep_name);
    let mut cur = start_dir;
    loop {
        let candidate = cur.join("node_modules").join(dep_name);
        if candidate.join("package.json").exists() {
            if let Ok(real) = std::fs::canonicalize(&candidate) {
                return (first.display().to_string(), Some(real));
            }
        }
        match cur.parent() {
            Some(p) => cur = p,
            None => return (first.display().to_string(), None),
        }
    }
}

fn is_our_scope(name: &str) -> bool {
    name.starts_with("@react-spectrum/")
        || name.starts_with("@react-aria/")
        || name.starts_with("@react-stately/")
        || name.starts_with("@react-types/")
        || name.starts_with("@internationalized/")
        || name.starts_with("@adobe/react-spectrum")
        || name == "react-aria"
        || name == "react-aria-components"
        || name == "react-stately"
}

fn summarize(packages: &[PackageState]) -> Summary {
    let total_packages = packages.len();
    let public_packages = packages.iter().filter(|p| !p.private).count();
    let packages_with_types_entry = packages.iter().filter(|p| p.has_types_entry).count();
    let packages_with_types_on_disk =
        packages.iter().filter(|p| p.types_entry_exists).count();
    let packages_with_stale_types = packages.iter().filter(|p| p.source_newer_than_types).count();
    let unresolved_workspace_deps = packages
        .iter()
        .flat_map(|p| p.workspace_dep_resolution.iter())
        .filter(|d| d.resolved_to.is_none())
        .count();
    let total_dist_types_files = packages
        .iter()
        .filter_map(|p| p.dist_types_files.as_ref().map(|v| v.len()))
        .sum();
    // A package that explicitly points its `types` entry inside `dist/types/`
    // but has no `dist/types/` directory at all is the most suspicious case —
    // its subpath imports will silently resolve to empty types. We skip
    // packages whose types live elsewhere (e.g. `@react-types/*` ship raw .ts
    // via `src/`) and stub package.json files with no name.
    let packages_missing_dist_types_dir = packages
        .iter()
        .filter(|p| {
            p.name != "<unnamed>"
                && p.types_entry
                    .as_deref()
                    .map(|t| t.contains("dist/types/"))
                    .unwrap_or(false)
                && p.dist_types_files.is_none()
        })
        .count();
    Summary {
        total_packages,
        public_packages,
        packages_with_types_entry,
        packages_with_types_on_disk,
        packages_with_stale_types,
        unresolved_workspace_deps,
        total_dist_types_files,
        packages_missing_dist_types_dir,
    }
}

fn chrono_like_now() -> String {
    // Avoid pulling in `chrono` just for a timestamp. Unix seconds is enough.
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("unix:{secs}")
}
