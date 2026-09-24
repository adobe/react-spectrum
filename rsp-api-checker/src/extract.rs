//! Drives Parcel 3's `@parcel/transformer-ts-doc` to extract per-package
//! `api.json`, replacing the old Node `ts-extractor`.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::process::Stdio;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PackageEntry {
    pub name: String,
    pub dir: PathBuf,
    pub private: bool,
}

/// True when a package lives under `packages/dev/` (a `packages` path component
/// immediately followed by `dev`). Dev tooling (docs, codemods, mcp, …) isn't
/// part of the public API surface, so the checker excludes it from extraction
/// on both the local and published sides. This matches the `dev` skip the
/// fs-walk discovery has always had; the yarn-workspaces path needs it too
/// because `yarn workspaces list --no-private` still returns non-private dev
/// packages (e.g. `@react-aria/mcp`).
pub fn is_dev_package_location(path: &Path) -> bool {
    let comps: Vec<_> = path.components().map(|c| c.as_os_str()).collect();
    comps.windows(2).any(|w| w[0] == "packages" && w[1] == "dev")
}

use anyhow::{bail, Context, Result};
use serde_json::Value;
use tokio::process::Command;

use crate::api_json::{ApiJson, TypeNode};

const NON_TYPES_ENV_KEYS: &[&str] = &["react-native", "node-addons", "worker", "browser", "deno", "bun"];

fn is_dts(s: &str) -> bool {
    s.ends_with(".d.ts") || s.ends_with(".d.mts") || s.ends_with(".d.cts")
}

/// Recursively resolve a `.d.ts` path from a `types`/`exports` value.
/// Order: `types` (always wins), then `import`, `require`, `default`, then any
/// remaining non-environment key, then environment keys as a last resort.
fn resolve_types_value(value: &Value) -> Option<String> {
    match value {
        Value::String(s) => is_dts(s).then(|| s.clone()),
        Value::Array(items) => items.iter().find_map(resolve_types_value),
        Value::Object(map) => {
            if let Some(v) = map.get("types") {
                if let Some(r) = resolve_types_value(v) {
                    return Some(r);
                }
            }
            for key in ["import", "require", "default"] {
                if let Some(v) = map.get(key) {
                    if let Some(r) = resolve_types_value(v) {
                        return Some(r);
                    }
                }
            }
            for (key, v) in map {
                if matches!(key.as_str(), "types" | "import" | "require" | "default") {
                    continue;
                }
                if NON_TYPES_ENV_KEYS.contains(&key.as_str()) {
                    continue;
                }
                if let Some(r) = resolve_types_value(v) {
                    return Some(r);
                }
            }
            for (key, v) in map {
                if NON_TYPES_ENV_KEYS.contains(&key.as_str()) {
                    if let Some(r) = resolve_types_value(v) {
                        return Some(r);
                    }
                }
            }
            None
        }
        _ => None,
    }
}

/// Resolve the `.d.ts` entry from a package.json: prefer `exports["."]`, then
/// the top-level `types`/`typings` fields.
pub fn resolve_types_entry(pkg_json: &Value) -> Option<String> {
    if let Some(dot) = pkg_json.get("exports").and_then(|e| e.get(".")) {
        if let Some(r) = resolve_types_value(dot) {
            return Some(r);
        }
    }
    for key in ["types", "typings"] {
        if let Some(v) = pkg_json.get(key) {
            if let Some(r) = resolve_types_value(v) {
                return Some(r);
            }
        }
    }
    None
}

/// A package's declarations entry, and whether the package actually declared it.
pub struct TypesEntry {
    pub rel: String,
    /// `false` when the path was inferred from `source` rather than read from a
    /// `types`/`typings`/`exports` field.
    pub declared: bool,
}

/// [`resolve_types_entry`], falling back to this repo's conventional output path
/// for packages that ship declarations without advertising them.
///
/// A few published packages (e.g. `@react-spectrum/style-macro-s1`) declare only
/// `source` and rely on consumers compiling from it, so they never gained a
/// `types` field — but the build still emits declarations to `dist/types/`.
/// Inferring that path keeps them in the API surface instead of dropping them.
pub fn resolve_types_entry_or_convention(pkg_json: &Value) -> Option<TypesEntry> {
    if let Some(rel) = resolve_types_entry(pkg_json) {
        return Some(TypesEntry {
            rel,
            declared: true,
        });
    }
    types_entry_from_source(pkg_json).map(|rel| TypesEntry {
        rel,
        declared: false,
    })
}

/// `src/index.ts` -> `dist/types/src/index.d.ts`, matching how this repo emits
/// declarations for every package that does declare a `types` entry.
fn types_entry_from_source(pkg_json: &Value) -> Option<String> {
    let source = pkg_json.get("source")?.as_str()?;
    let rel = source.trim_start_matches("./");
    let stem = rel
        .strip_suffix(".tsx")
        .or_else(|| rel.strip_suffix(".ts"))?;
    Some(format!("dist/types/{stem}.d.ts"))
}

fn is_ts_source(s: &str) -> bool {
    if is_dts(s) {
        return false;
    }
    s.ends_with(".ts") || s.ends_with(".tsx") || s.ends_with(".mts") || s.ends_with(".cts")
}

fn resolve_source_value(value: &Value) -> Option<String> {
    match value {
        Value::String(s) => is_ts_source(s).then(|| s.clone()),
        Value::Array(items) => items.iter().find_map(resolve_source_value),
        Value::Object(map) => ["source", "import", "default", "require"]
            .iter()
            .find_map(|k| map.get(*k).and_then(resolve_source_value)),
        _ => None,
    }
}

/// Resolve a `.ts`/`.tsx` source entry (used for the build-freshness check).
pub fn resolve_source_entry(pkg_json: &Value) -> Option<String> {
    if let Some(v) = pkg_json.get("source") {
        if let Some(r) = resolve_source_value(v) {
            return Some(r);
        }
    }
    pkg_json
        .get("exports")
        .and_then(|e| e.get("."))
        .and_then(resolve_source_value)
}

/// Fallback discovery when `yarn workspaces list` is unavailable: glob for
/// `package.json` under `packages_dir`, skipping node_modules/.git and any
/// `private: true` package.
pub fn discover_packages_fs(packages_dir: &Path) -> Vec<PackageEntry> {
    let mut out = Vec::new();
    let pattern = packages_dir.join("**").join("package.json");
    let Ok(paths) = glob::glob(&pattern.to_string_lossy()) else {
        return out;
    };
    for path in paths.flatten() {
        let s = path.to_string_lossy();
        if s.contains("/node_modules/") || s.contains("/.git/") {
            continue;
        }
        if is_dev_package_location(&path) {
            continue;
        }
        let Ok(txt) = std::fs::read_to_string(&path) else {
            continue;
        };
        let Ok(v) = serde_json::from_str::<Value>(&txt) else {
            continue;
        };
        let private = v.get("private").and_then(|b| b.as_bool()).unwrap_or(false);
        if private {
            continue;
        }
        if let Some(name) = v.get("name").and_then(|n| n.as_str()) {
            if let Some(dir) = path.parent() {
                out.push(PackageEntry {
                    name: name.to_string(),
                    dir: dir.to_path_buf(),
                    private,
                });
            }
        }
    }
    out.sort_by(|a, b| a.name.cmp(&b.name));
    out
}

const PARCELRC: &str = r#"{
  "extends": "@parcel/config-default",
  "transformers": { "docs:*": ["@parcel/transformer-ts-doc"] }
}
"#;

/// Absolute path to the repo's parcel3 binary (never rely on PATH — node is via mise).
pub fn parcel_bin(repo_root: &Path) -> PathBuf {
    repo_root.join("node_modules").join(".bin").join("parcel3")
}

/// True when the parcel3 binary and the transformer-ts-doc plugin are installed.
pub fn ts_doc_available(repo_root: &Path) -> bool {
    parcel_bin(repo_root).exists()
        && repo_root
            .join("node_modules")
            .join("@parcel")
            .join("transformer-ts-doc")
            .exists()
}

/// Ensure `work_dir` has a `node_modules` symlink to the repo's node_modules
/// (so `@parcel/config-default` + `@parcel/transformer-ts-doc` resolve) and a
/// `.parcelrc`.
fn ensure_work_dir(repo_root: &Path, work_dir: &Path) -> Result<()> {
    std::fs::create_dir_all(work_dir).context("creating parcel work dir")?;
    let nm = work_dir.join("node_modules");
    if !nm.exists() {
        #[cfg(unix)]
        std::os::unix::fs::symlink(repo_root.join("node_modules"), &nm)
            .context("symlinking node_modules into parcel work dir")?;
        #[cfg(not(unix))]
        bail!("windows is not supported for the parcel3 extractor work dir");
    }
    std::fs::write(work_dir.join(".parcelrc"), PARCELRC).context("writing .parcelrc")?;
    Ok(())
}

/// Prepended to a rewritten `.d.ts` so the `React` namespace resolves.
const REACT_NAMESPACE_IMPORT: &str = "import type * as React from 'react';\n";

/// Rewrite `import("react").Foo` type queries into `React.Foo`.
///
/// `@parcel/transformer-ts-doc` cannot resolve an `import("...")` type query
/// and emits a bare `{"type":"any"}` for the whole declaration, destroying
/// every prop of the 67 Spectrum 2 components that `tsc` spells this way.
///
/// `tsc` only reaches for `import("react")` when the source file has no
/// `React` binding in scope — files that do `import React, {forwardRef} from
/// 'react'` already get the `React.ForwardRefExoticComponent` spelling, which
/// the transformer resolves correctly. Reintroducing the namespace import
/// therefore just restores the form the transformer already understands.
///
/// Returns `None` when the file needs no rewriting, so the caller can symlink
/// it untouched.
fn rewrite_react_import_types(source: &str) -> Option<String> {
    if !source.contains("import(\"react\")") && !source.contains("import('react')") {
        return None;
    }
    // Never shadow a `React` the file already binds. No emitted declaration in
    // this repo does both, but a rewrite that collided would be a silent
    // miscompile rather than a missing prop, so bail instead.
    if source.contains("import React") || source.contains(" as React") {
        return None;
    }
    let body = source
        .replace("import(\"react\")", "React")
        .replace("import('react')", "React");
    Some(format!("{REACT_NAMESPACE_IMPORT}{body}"))
}

/// Every `.d.ts` under `root`, paired with its rewritten content when
/// [`rewrite_react_import_types`] applies.
///
/// *All* declaration files are collected, not just the ones needing a rewrite:
/// a symlinked `.d.ts` resolves its relative imports against its real path, so
/// leaving one as a symlink would hop straight back out of the mirror and pull
/// in the un-rewritten siblings.
fn collect_dts(root: &Path) -> Vec<(PathBuf, Option<String>)> {
    let pattern = root.join("**").join("*.d.ts");
    let Ok(paths) = glob::glob(&pattern.to_string_lossy()) else {
        return Vec::new();
    };
    paths
        .flatten()
        .filter(|p| !p.components().any(|c| c.as_os_str() == "node_modules"))
        .filter_map(|p| {
            let source = std::fs::read_to_string(&p).ok()?;
            let rewritten = rewrite_react_import_types(&source);
            Some((p, rewritten))
        })
        .collect()
}

/// Build a shadow copy of `src` at `dst` in which every `.d.ts` is a real file
/// — rewritten where [`rewrite_react_import_types`] applies, copied verbatim
/// otherwise — and *everything else is symlinked*.
///
/// Only the directories on the path to a declaration file become real; any
/// subtree without one is symlinked whole. A package therefore costs a handful
/// of inodes plus its (small) `.d.ts` tree rather than a full copy.
fn mirror_with_rewrites(src: &Path, dst: &Path, dts: &[(PathBuf, Option<String>)]) -> Result<()> {
    // Every directory between `src` and a declaration file has to be real.
    let mut materialize: HashSet<PathBuf> = HashSet::new();
    for (file, _) in dts {
        let mut cur = file.parent();
        while let Some(dir) = cur {
            if !dir.starts_with(src) {
                break;
            }
            if !materialize.insert(dir.to_path_buf()) {
                break;
            }
            if dir == src {
                break;
            }
            cur = dir.parent();
        }
    }
    let contents: HashMap<&Path, Option<&str>> = dts
        .iter()
        .map(|(p, r)| (p.as_path(), r.as_deref()))
        .collect();
    mirror_dir(src, dst, &materialize, &contents)
}

fn mirror_dir(
    src: &Path,
    dst: &Path,
    materialize: &HashSet<PathBuf>,
    dts: &HashMap<&Path, Option<&str>>,
) -> Result<()> {
    std::fs::create_dir_all(dst)
        .with_context(|| format!("creating mirror dir {}", dst.display()))?;
    for entry in
        std::fs::read_dir(src).with_context(|| format!("reading {}", src.display()))?
    {
        let entry = entry?;
        let from = entry.path();
        let to = dst.join(entry.file_name());
        if std::fs::symlink_metadata(&to).is_ok() {
            continue;
        }
        let is_dir = entry.file_type()?.is_dir();
        if is_dir {
            if materialize.contains(&from) {
                mirror_dir(&from, &to, materialize, dts)?;
                continue;
            }
        } else if let Some(rewritten) = dts.get(from.as_path()) {
            match rewritten {
                Some(text) => std::fs::write(&to, text)
                    .with_context(|| format!("writing rewritten {}", to.display()))?,
                None => {
                    std::fs::copy(&from, &to)
                        .with_context(|| format!("copying {} into the mirror", from.display()))?;
                }
            }
            continue;
        }
        #[cfg(unix)]
        std::os::unix::fs::symlink(&from, &to)
            .with_context(|| format!("symlinking {} into the mirror", from.display()))?;
        #[cfg(not(unix))]
        bail!("windows is not supported for the parcel3 extractor work dir");
    }
    Ok(())
}

/// The package root `dts_abs` belongs to: the nearest ancestor with a
/// `package.json`. Falls back to the `.d.ts`'s own directory (test fixtures
/// are bare directories with no manifest).
fn package_root_of(dts_abs: &Path) -> PathBuf {
    let dir = dts_abs.parent().unwrap_or(dts_abs);
    let mut cur = Some(dir);
    while let Some(d) = cur {
        if d.join("package.json").is_file() {
            return d.to_path_buf();
        }
        cur = d.parent();
    }
    dir.to_path_buf()
}

/// Run transformer-ts-doc on a single `.d.ts`, returning its `{exports,links}`
/// JSON. `stem` names the throwaway entry + dist dir; pass a per-package-unique
/// slug so serial builds don't collide.
pub async fn run_ts_doc(
    repo_root: &Path,
    work_dir: &Path,
    dts_abs: &Path,
    stem: &str,
) -> Result<String> {
    // Resolve to absolute, canonical paths up front. A relative `repo_root`
    // (e.g. the CLI's `--repo-root .` or CI's `--repo-root ..`) would otherwise
    // produce relative symlink *targets* that resolve against the work dir and
    // loop back on themselves (ELOOP), and a relative `parcel3` binary path
    // would resolve against the spawn cwd (the work dir), where it doesn't exist.
    let repo_root = std::fs::canonicalize(repo_root)
        .with_context(|| format!("resolving repo root {}", repo_root.display()))?;
    let dts_abs = std::fs::canonicalize(dts_abs)
        .with_context(|| format!("resolving .d.ts path {}", dts_abs.display()))?;
    // Absolutize the work dir too. parcel runs with its cwd set to `work_dir`,
    // so relative `--config` / `--dist-dir` / entry paths (which happen when the
    // caller passes a relative `--output`) would resolve against that cwd and
    // double up (e.g. `dist/branch-api/.parcel-work/dist/branch-api/...`), after
    // which the Rust side can't find the emitted dist dir. It may not exist yet,
    // so we can't canonicalize — just join onto the cwd when relative.
    let work_dir_abs = if work_dir.is_absolute() {
        work_dir.to_path_buf()
    } else {
        std::env::current_dir()
            .context("resolving current dir for the parcel work dir")?
            .join(work_dir)
    };
    let work_dir = work_dir_abs.as_path();

    ensure_work_dir(&repo_root, work_dir)?;

    let dts_dir = dts_abs
        .parent()
        .with_context(|| format!("{} has no parent directory", dts_abs.display()))?;
    let dts_name = dts_abs
        .file_name()
        .with_context(|| format!("{} has no file name", dts_abs.display()))?;

    // Parcel's resolver treats an absolute path after a named-pipeline prefix
    // (`docs:/abs/path`) as project-root-relative rather than filesystem-
    // absolute, so it never finds the real file (confirmed by spawning
    // parcel3 directly: `docs:/abs/path` resolves against a synthetic
    // `<projectRoot>/index` parent instead of `/`). Symlinking the `.d.ts`'s
    // own directory into the work dir and using a *relative* specifier
    // resolves correctly instead — including the `.d.ts`'s own relative
    // imports (e.g. `./events`), which still resolve against its real
    // sibling files through the symlink.
    let src_dir_name = format!("{stem}-src");
    let src_link = work_dir.join(&src_dir_name);

    // `tsc` writes `import("react").Foo` whenever the source file had no
    // `React` binding, and transformer-ts-doc collapses that whole declaration
    // to `any`. Stage a shadow tree with those queries rewritten (see
    // `mirror_with_rewrites`); when a package has nothing to rewrite we keep
    // the cheaper plain symlink.
    let pkg_root = package_root_of(&dts_abs);
    let dts_tree = collect_dts(&pkg_root);
    let needs_rewrite = dts_tree.iter().any(|(_, r)| r.is_some());
    let dts_dir = if !needs_rewrite {
        dts_dir.to_path_buf()
    } else {
        let mirror = work_dir.join(format!("{stem}-mirror"));
        let _ = std::fs::remove_dir_all(&mirror);
        mirror_with_rewrites(&pkg_root, &mirror, &dts_tree)?;
        // The entry `.d.ts` sits at the same spot inside the mirror.
        mirror.join(
            dts_dir
                .strip_prefix(&pkg_root)
                .unwrap_or_else(|_| Path::new("")),
        )
    };
    let dts_dir = dts_dir.as_path();

    // Reuse the existing symlink only if it still points at this call's
    // `dts_dir` — a stale link (same `stem`, different `dts_abs`) would
    // otherwise silently extract the wrong `.d.ts`.
    let existing_target = std::fs::read_link(&src_link).ok();
    if existing_target.as_deref() != Some(dts_dir) {
        if existing_target.is_some() {
            std::fs::remove_file(&src_link).context("removing stale .d.ts source dir symlink")?;
        }
        #[cfg(unix)]
        std::os::unix::fs::symlink(dts_dir, &src_link)
            .context("symlinking .d.ts source dir into parcel work dir")?;
        #[cfg(not(unix))]
        bail!("windows is not supported for the parcel3 extractor work dir");
    }

    let entry = work_dir.join(format!("{stem}.mjs"));
    let dist = work_dir.join(format!("{stem}-dist"));
    // Best-effort: clear any dist dir left over from a previous build with
    // this stem, so the "read the single .json" scan below can never pick
    // up a stale content-hashed artifact alongside the fresh one.
    let _ = std::fs::remove_dir_all(&dist);
    // Referencing `docs` keeps the transformer asset from being tree-shaken.
    std::fs::write(
        &entry,
        format!(
            "import docs from 'docs:./{src_dir_name}/{}';\nglobalThis.__docs = docs;\n",
            dts_name.to_string_lossy()
        ),
    )
    .context("writing parcel entry")?;

    let parcelrc = work_dir.join(".parcelrc");
    let output = Command::new(parcel_bin(&repo_root))
        .arg("build")
        .arg("--config")
        .arg(&parcelrc)
        .arg("--dist-dir")
        .arg(&dist)
        .arg(&entry)
        .current_dir(work_dir)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .await
        .context("spawning parcel3")?;

    if !output.status.success() {
        bail!(
            "parcel3 ts-doc build failed for {}:\n{}",
            dts_abs.display(),
            String::from_utf8_lossy(&output.stderr)
        );
    }

    // transformer-ts-doc emits exactly one `.json` artifact into the dist dir.
    let mut json_path = None;
    for entry in std::fs::read_dir(&dist)
        .with_context(|| format!("reading parcel dist dir {}", dist.display()))?
    {
        let p = entry?.path();
        if p.extension().and_then(|e| e.to_str()) == Some("json") {
            json_path = Some(p);
            break;
        }
    }
    let json_path = json_path
        .with_context(|| format!("transformer-ts-doc emitted no JSON for {}", dts_abs.display()))?;
    std::fs::read_to_string(&json_path).context("reading emitted api json")
}

#[derive(Debug, Clone)]
pub struct ExtractOpts {
    pub repo_root: PathBuf,
    pub output_dir: PathBuf,
    /// Fail if any package's `src/` is newer than its `.d.ts` (local only).
    pub check_build_freshness: bool,
    /// Succeed on an empty package set instead of erroring.
    pub allow_empty: bool,
}

fn slug(name: &str) -> String {
    name.replace(['/', '@'], "_")
}

/// Count top-level exports and how many resolved to a bare `any` — the
/// signature of broken cross-package type resolution.
fn count_top_level_any(api: &ApiJson) -> (usize, usize) {
    let total = api.exports.len();
    let any = api
        .exports
        .values()
        .filter(|n| matches!(n, TypeNode::Any))
        .count();
    (total, any)
}

/// If any `.ts`/`.tsx` (non-`.d.ts`) file under `<pkg_dir>/src` is newer than
/// the built `types` entry, return that source path (the build is stale).
fn stale_source(pkg_dir: &Path, types_abs: &Path) -> Result<Option<PathBuf>> {
    let types_mtime = std::fs::metadata(types_abs)
        .and_then(|m| m.modified())
        .with_context(|| format!("reading mtime of {}", types_abs.display()))?;
    let mut newest: Option<(std::time::SystemTime, PathBuf)> = None;
    for pat in ["src/**/*.ts", "src/**/*.tsx"] {
        let glob_pat = pkg_dir.join(pat);
        let Ok(paths) = glob::glob(&glob_pat.to_string_lossy()) else {
            continue;
        };
        for p in paths.flatten() {
            if is_dts(&p.to_string_lossy()) {
                continue;
            }
            let m = std::fs::metadata(&p)
                .and_then(|m| m.modified())
                .with_context(|| format!("reading mtime of {}", p.display()))?;
            if newest.as_ref().is_none_or(|(nm, _)| m > *nm) {
                newest = Some((m, p));
            }
        }
    }
    match newest {
        Some((m, p)) if m > types_mtime => Ok(Some(p)),
        _ => Ok(None),
    }
}

/// Extract `api.json` for every package into the `compare`-compatible tree:
/// `<output_dir>/<name>/dist/api.json` + `<output_dir>/<name>/package.json`.
pub async fn extract_packages(entries: &[PackageEntry], opts: &ExtractOpts) -> Result<()> {
    if entries.is_empty() {
        if opts.allow_empty {
            println!("No packages discovered (allow_empty set) — nothing to extract.");
            return Ok(());
        }
        bail!("No packages discovered. Check the packages dir / discovery, or pass allow_empty.");
    }
    if !ts_doc_available(&opts.repo_root) {
        bail!(
            "parcel3 or @parcel/transformer-ts-doc not found under {}. Run `yarn install` at the repo root.",
            opts.repo_root.join("node_modules").display()
        );
    }

    let work_dir = opts.output_dir.join(".parcel-work");

    // Run the extraction in an inner async block so `?`/`bail!` below only
    // return *from this block*, not the function — letting the work_dir
    // cleanup below run unconditionally, on every early-return path too.
    let result: Result<()> = async {
        let mut total_exports = 0usize;
        let mut total_any = 0usize;

        for entry in entries {
            let pkg_json_path = entry.dir.join("package.json");
            let pkg_json: Value = serde_json::from_str(
                &std::fs::read_to_string(&pkg_json_path)
                    .with_context(|| format!("reading {}", pkg_json_path.display()))?,
            )
            .with_context(|| format!("parsing {}", pkg_json_path.display()))?;

            let Some(types_entry) = resolve_types_entry_or_convention(&pkg_json) else {
                eprintln!("  skip {} (no types entry)", entry.name);
                continue;
            };
            let types_rel = types_entry.rel;
            let types_abs = entry.dir.join(&types_rel);
            if !types_abs.exists() {
                if opts.check_build_freshness && types_entry.declared {
                    bail!(
                        "Build incomplete for {}: declared types entry {} is missing. Run `yarn build` before extracting.",
                        entry.name, types_abs.display()
                    );
                }
                eprintln!("  skip {} (types entry missing: {})", entry.name, types_abs.display());
                continue;
            }

            if opts.check_build_freshness {
                if let Some(src) = stale_source(&entry.dir, &types_abs)? {
                    bail!(
                        "Build is stale for {}: {} is newer than {}. Run `yarn build` before extracting.",
                        entry.name, src.display(), types_abs.display()
                    );
                }
            }

            let json = run_ts_doc(&opts.repo_root, &work_dir, &types_abs, &slug(&entry.name))
                .await
                .with_context(|| format!("extracting {}", entry.name))?;

            // Validate + health-count via our own model (also exercises the
            // Unknown fallback rather than hard-failing on novel nodes).
            let api: ApiJson = serde_json::from_str(&json)
                .with_context(|| format!("parsing extracted api.json for {}", entry.name))?;
            let (n, any) = count_top_level_any(&api);
            total_exports += n;
            total_any += any;

            let out_base = opts.output_dir.join(&entry.name);
            std::fs::create_dir_all(out_base.join("dist"))
                .with_context(|| format!("writing output for {}", entry.name))?;
            std::fs::write(out_base.join("dist").join("api.json"), &json)
                .with_context(|| format!("writing output for {}", entry.name))?;
            std::fs::write(
                out_base.join("package.json"),
                serde_json::to_string_pretty(&serde_json::json!({
                    "name": entry.name,
                    "private": entry.private,
                }))?,
            )
            .with_context(|| format!("writing output for {}", entry.name))?;
            println!("  ✓ {}", entry.name);
        }

        if total_exports > 0 {
            let ratio = total_any as f64 / total_exports as f64;
            if ratio > 0.5 {
                bail!(
                    "{total_any}/{total_exports} ({:.1}%) of top-level exports resolved to 'any'. \
                     Type resolution is broken — ensure @types/react is installed so component prop \
                     types resolve.",
                    ratio * 100.0
                );
            }
        }

        Ok(())
    }
    .await;

    let _ = std::fs::remove_dir_all(&work_dir);
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn resolve_types_prefers_types_key() {
        let pkg = json!({
            "exports": { ".": { "types": "./dist/types/index.d.ts", "import": "./dist/index.mjs" } }
        });
        assert_eq!(resolve_types_entry(&pkg).as_deref(), Some("./dist/types/index.d.ts"));
    }

    #[test]
    fn resolve_types_falls_back_to_top_level_types_field() {
        let pkg = json!({ "types": "dist/types/src/index.d.ts" });
        assert_eq!(resolve_types_entry(&pkg).as_deref(), Some("dist/types/src/index.d.ts"));
    }

    #[test]
    fn resolve_types_rejects_react_native_condition() {
        let pkg = json!({
            "exports": { ".": { "react-native": "./rn.d.ts", "default": "./dist/index.d.ts" } }
        });
        assert_eq!(resolve_types_entry(&pkg).as_deref(), Some("./dist/index.d.ts"));
    }

    #[test]
    fn resolve_source_returns_ts_not_dts() {
        let pkg = json!({ "source": "src/index.ts", "types": "dist/index.d.ts" });
        assert_eq!(resolve_source_entry(&pkg).as_deref(), Some("src/index.ts"));
    }

    #[test]
    fn discover_packages_fs_skips_private_and_node_modules() {
        let dir = tempfile::TempDir::new().unwrap();
        let root = dir.path();
        // public package
        std::fs::create_dir_all(root.join("@scope/pub")).unwrap();
        std::fs::write(root.join("@scope/pub/package.json"), r#"{"name":"@scope/pub"}"#).unwrap();
        // private package
        std::fs::create_dir_all(root.join("dev/tool")).unwrap();
        std::fs::write(root.join("dev/tool/package.json"), r#"{"name":"dev-tool","private":true}"#).unwrap();
        // node_modules noise
        std::fs::create_dir_all(root.join("@scope/pub/node_modules/dep")).unwrap();
        std::fs::write(root.join("@scope/pub/node_modules/dep/package.json"), r#"{"name":"dep"}"#).unwrap();
        // non-private dev package under packages/dev/ — must be excluded by location
        std::fs::create_dir_all(root.join("packages/dev/mcp")).unwrap();
        std::fs::write(root.join("packages/dev/mcp/package.json"), r#"{"name":"@react-aria/mcp"}"#).unwrap();

        let found = discover_packages_fs(root);
        let names: Vec<_> = found.iter().map(|p| p.name.as_str()).collect();
        assert_eq!(names, vec!["@scope/pub"]);
    }

    #[test]
    fn is_dev_package_location_matches_packages_dev() {
        use std::path::Path;
        assert!(is_dev_package_location(Path::new("packages/dev/mcp/react-aria")));
        assert!(is_dev_package_location(Path::new("/abs/repo/packages/dev/s2-docs")));
        assert!(is_dev_package_location(Path::new(
            "/abs/repo/packages/dev/mcp/react-aria/package.json"
        )));
        // not under packages/dev/
        assert!(!is_dev_package_location(Path::new("packages/@react-aria/button")));
        assert!(!is_dev_package_location(Path::new("/abs/repo/packages/react-aria-components")));
        // a `dev` dir not directly under `packages` doesn't count
        assert!(!is_dev_package_location(Path::new("packages/@scope/dev/thing")));
    }

    #[test]
    fn types_entry_falls_back_to_conventional_output_for_source_only_packages() {
        // `@react-spectrum/style-macro-s1` ships declarations but never declares them.
        let pkg = serde_json::json!({"name": "x", "source": "src/index.ts"});
        assert_eq!(resolve_types_entry(&pkg), None);
        let entry = resolve_types_entry_or_convention(&pkg).expect("should infer from source");
        assert_eq!(entry.rel, "dist/types/src/index.d.ts");
        assert!(!entry.declared);
    }

    #[test]
    fn declared_types_entry_wins_over_the_source_convention() {
        let pkg = serde_json::json!({
            "name": "x",
            "source": "src/index.ts",
            "types": "./dist/types/custom.d.ts"
        });
        let entry = resolve_types_entry_or_convention(&pkg).unwrap();
        assert_eq!(entry.rel, "./dist/types/custom.d.ts");
        assert!(entry.declared);
    }

    #[test]
    fn packages_without_types_or_source_are_still_skipped() {
        let pkg = serde_json::json!({"name": "x", "main": "dist/main.js"});
        assert!(resolve_types_entry_or_convention(&pkg).is_none());
    }

    #[test]
    fn rewrite_react_import_types_prepends_namespace_and_substitutes() {
        let out = rewrite_react_import_types(
            "export declare const A: import(\"react\").ForwardRefExoticComponent<P>;\n",
        )
        .expect("a file containing an import(\"react\") query must be rewritten");
        assert!(out.starts_with(REACT_NAMESPACE_IMPORT), "got {out}");
        assert!(!out.contains("import(\"react\")"), "got {out}");
        assert!(out.contains("React.ForwardRefExoticComponent<P>"), "got {out}");
    }

    #[test]
    fn rewrite_react_import_types_handles_single_quotes() {
        let out = rewrite_react_import_types("declare const A: import('react').FC;\n").unwrap();
        assert!(out.contains("React.FC"), "got {out}");
    }

    #[test]
    fn rewrite_react_import_types_skips_files_without_the_query() {
        assert!(rewrite_react_import_types("export interface P { a?: number }\n").is_none());
        assert!(rewrite_react_import_types("import(\"./local\").Thing;\n").is_none());
    }

    #[test]
    fn rewrite_react_import_types_refuses_to_shadow_an_existing_react_binding() {
        // Rewriting these would shadow the file's own `React`, which is a silent
        // miscompile rather than a missing prop.
        assert!(rewrite_react_import_types(
            "import React from 'react';\ndeclare const A: import(\"react\").FC;\n"
        )
        .is_none());
        assert!(rewrite_react_import_types(
            "import * as React from 'react';\ndeclare const A: import(\"react\").FC;\n"
        )
        .is_none());
    }
}
