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

use anyhow::{bail, Context, Result};
use serde_json::Value;
use tokio::process::Command;

use crate::api_json::{ApiJson, TypeNode};
use crate::config::{render_template, RepoConfig};

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

/// [`resolve_types_entry`], falling back to the repo's conventional output
/// path for packages that ship declarations without advertising them.
///
/// Some published packages (e.g. `@react-spectrum/style-macro-s1`) declare
/// only `source` and rely on consumers compiling from it, so they never
/// gained a `types` field — but the build still emits declarations. Inferring
/// that path keeps them in the API surface instead of dropping them.
///
/// `templates` comes from `RepoConfig::types_from_source`, so each repo
/// describes where its own build puts declarations. The first template whose
/// file actually exists wins; when none do we still return the first
/// candidate so the caller can report a useful "types entry missing: <path>".
pub fn resolve_types_entry_or_convention(
    pkg_json: &Value,
    pkg_dir: &Path,
    templates: &[String],
) -> Option<TypesEntry> {
    if let Some(rel) = resolve_types_entry(pkg_json) {
        return Some(TypesEntry {
            rel,
            declared: true,
        });
    }
    let candidates = types_entry_candidates(pkg_json, templates);
    let chosen = candidates
        .iter()
        .find(|rel| pkg_dir.join(rel).exists())
        .or_else(|| candidates.first())?;
    Some(TypesEntry {
        rel: chosen.clone(),
        declared: false,
    })
}

/// Render every configured template against the package's `source` stem:
/// `src/index.ts` + `dist/types/{stem}.d.ts` -> `dist/types/src/index.d.ts`.
fn types_entry_candidates(pkg_json: &Value, templates: &[String]) -> Vec<String> {
    let Some(source) = pkg_json.get("source").and_then(|s| s.as_str()) else {
        return Vec::new();
    };
    let rel = source.trim_start_matches("./");
    let Some(stem) = rel
        .strip_suffix(".tsx")
        .or_else(|| rel.strip_suffix(".ts"))
        .or_else(|| rel.strip_suffix(".mts"))
        .or_else(|| rel.strip_suffix(".cts"))
    else {
        return Vec::new();
    };
    templates.iter().map(|t| render_template(t, stem)).collect()
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

const PARCELRC: &str = r#"{
  "extends": "@parcel/config-default",
  "transformers": { "docs:*": ["@parcel/transformer-ts-doc"] }
}
"#;


/// Absolute path to the toolchain root's parcel3 binary (never rely on PATH
/// — node is often provided by a version manager such as mise).
pub fn parcel_bin(toolchain_root: &Path) -> PathBuf {
    toolchain_root.join("node_modules").join(".bin").join("parcel3")
}

/// True when the parcel3 binary and the transformer-ts-doc plugin are
/// installed under `toolchain_root`.
pub fn ts_doc_available(toolchain_root: &Path) -> bool {
    parcel_bin(toolchain_root).exists()
        && toolchain_root
            .join("node_modules")
            .join("@parcel")
            .join("transformer-ts-doc")
            .exists()
}

/// Environment variable the npm launcher (`bin/tsdiff`) uses to point the
/// binary at the Parcel toolchain installed alongside it.
pub const TOOLCHAIN_ROOT_ENV: &str = "TSDIFF_TOOLCHAIN_ROOT";

/// Decide which root supplies parcel3 and its plugins.
///
/// The repo being diffed wins over the launcher's toolchain whenever it has one
/// of its own: react-spectrum builds with Parcel and `get-ref-api` installs a
/// full toolchain inside each snapshot, and using that keeps a run
/// self-contained rather than reaching back into whatever happened to launch
/// it. Repos with no Parcel of their own — the reason `--toolchain-root` exists
/// — fall through to the launcher's copy and need no flag at all.
///
/// Falling back to `default_root` when nothing is usable is deliberate: the
/// caller then hits the existing "has no node_modules/@parcel" error naming the
/// repo they asked about, rather than one naming a path they never mentioned.
pub fn resolve_toolchain_root(explicit: Option<&Path>, default_root: &Path) -> PathBuf {
    if let Some(explicit) = explicit {
        return explicit.to_path_buf();
    }
    if ts_doc_available(default_root) {
        return default_root.to_path_buf();
    }
    if let Some(from_env) = std::env::var_os(TOOLCHAIN_ROOT_ENV) {
        let candidate = PathBuf::from(from_env);
        if ts_doc_available(&candidate) {
            return candidate;
        }
    }
    default_root.to_path_buf()
}

/// Ensure `work_dir` has a `node_modules` providing both halves of what the
/// extractor needs, plus a `.parcelrc`.
///
/// Two different resolutions happen against this one directory:
///
/// * Parcel resolves its own plugins (`@parcel/config-default`,
///   `@parcel/transformer-ts-doc`) — these live in the **toolchain** repo.
/// * The emitted `.d.ts` resolves its own imports (`react`, and whatever the
///   package depends on) — these live in the **target** repo.
///
/// When the two roots are the same repo (the common case) a single symlink
/// satisfies both and we keep that cheap path. When they differ we materialise
/// a real directory that symlinks each of the target's top-level entries and
/// then overlays the toolchain's `@parcel`, so the target's types still
/// resolve while Parcel can still find its transformer.
fn ensure_work_dir(toolchain_root: &Path, repo_root: &Path, work_dir: &Path) -> Result<()> {
    std::fs::create_dir_all(work_dir).context("creating parcel work dir")?;
    let nm = work_dir.join("node_modules");
    let same_repo = match (
        std::fs::canonicalize(toolchain_root),
        std::fs::canonicalize(repo_root),
    ) {
        (Ok(a), Ok(b)) => a == b,
        _ => toolchain_root == repo_root,
    };

    if !nm.exists() {
        #[cfg(not(unix))]
        bail!("windows is not supported for the parcel3 extractor work dir");
        #[cfg(unix)]
        if same_repo {
            std::os::unix::fs::symlink(toolchain_root.join("node_modules"), &nm)
                .context("symlinking node_modules into parcel work dir")?;
        } else {
            link_merged_node_modules(toolchain_root, repo_root, &nm)?;
        }
    }
    std::fs::write(work_dir.join(".parcelrc"), PARCELRC).context("writing .parcelrc")?;
    Ok(())
}

/// Build `nm` as a real directory of symlinks: every top-level entry of the
/// target repo's `node_modules`, with the toolchain's `@parcel` overlaid.
///
/// Scoped directories (`@foo`) are linked whole, except `@parcel` which the
/// toolchain must win; if the target also ships `@parcel` we merge the two
/// scopes entry-by-entry so the target's own parcel plugins survive.
#[cfg(unix)]
fn link_merged_node_modules(toolchain_root: &Path, repo_root: &Path, nm: &Path) -> Result<()> {
    use std::os::unix::fs::symlink;

    let target_nm = repo_root.join("node_modules");
    let toolchain_nm = toolchain_root.join("node_modules");
    if !toolchain_nm.join("@parcel").exists() {
        bail!(
            "toolchain root {} has no node_modules/@parcel — run its install first",
            toolchain_root.display()
        );
    }
    std::fs::create_dir_all(nm).context("creating merged node_modules")?;

    if target_nm.is_dir() {
        for entry in std::fs::read_dir(&target_nm).context("reading target node_modules")? {
            let entry = entry?;
            let name = entry.file_name();
            if name == "@parcel" {
                continue;
            }
            let _ = symlink(entry.path(), nm.join(&name));
        }
    }

    // Overlay the toolchain's @parcel, merging rather than replacing when the
    // target has one of its own.
    let scope = nm.join("@parcel");
    std::fs::create_dir_all(&scope).context("creating @parcel scope")?;
    for (src, _from_toolchain) in [(target_nm.join("@parcel"), false), (toolchain_nm.join("@parcel"), true)] {
        if !src.is_dir() {
            continue;
        }
        for entry in std::fs::read_dir(&src)? {
            let entry = entry?;
            let dest = scope.join(entry.file_name());
            let _ = std::fs::remove_file(&dest);
            let _ = symlink(entry.path(), dest);
        }
    }
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
///
/// `toolchain_root` supplies parcel3 and its plugins; `repo_root` is the repo
/// whose `.d.ts` is being read and whose `node_modules` its imports resolve
/// against. They are the same directory unless `--toolchain-root` was passed.
pub async fn run_ts_doc(
    toolchain_root: &Path,
    repo_root: &Path,
    work_dir: &Path,
    dts_abs: &Path,
    stem: &str,
) -> Result<String> {
    // Resolve to absolute, canonical paths up front. A relative `toolchain_root`
    // (e.g. the CLI's `--repo-root .` or CI's `--repo-root ..`) would otherwise
    // produce relative symlink *targets* that resolve against the work dir and
    // loop back on themselves (ELOOP), and a relative `parcel3` binary path
    // would resolve against the spawn cwd (the work dir), where it doesn't exist.
    let toolchain_root = std::fs::canonicalize(toolchain_root)
        .with_context(|| format!("resolving toolchain root {}", toolchain_root.display()))?;
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

    ensure_work_dir(&toolchain_root, &repo_root, work_dir)?;

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
    let output = Command::new(parcel_bin(&toolchain_root))
        .arg("build")
        .arg("--config")
        .arg(&parcelrc)
        .arg("--dist-dir")
        .arg(&dist)
        .arg(&entry)
        .current_dir(work_dir)
        // `transformer-ts-doc` walks the type graph recursively in native
        // code. This helps the threads Rust itself spawns; a declaration that
        // recurses deeply enough can still abort the process ("has overflowed
        // its stack") on a thread whose size we can't reach from here, which
        // is why callers need to tolerate a package failing outright.
        .env("RUST_MIN_STACK", "134217728")
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
    /// Repo supplying the parcel3 binary and `@parcel/transformer-ts-doc`.
    /// Usually the repo being extracted, but it can be a separate checkout
    /// when the target repo doesn't install the Parcel toolchain itself.
    pub toolchain_root: PathBuf,
    /// Repo whose `.d.ts` files are being read, and whose `node_modules` their
    /// imports resolve against. Equal to `toolchain_root` unless the caller
    /// borrowed a toolchain from another checkout.
    pub repo_root: PathBuf,
    pub output_dir: PathBuf,
    /// Fail if any package's sources are newer than its `.d.ts` (local only).
    pub check_build_freshness: bool,
    /// Succeed on an empty package set instead of erroring.
    pub allow_empty: bool,
    /// Keep going when an individual package fails to extract, reporting them
    /// all at the end instead of aborting on the first. Off by default: in a
    /// repo whose packages are known to work, a failure is a real regression
    /// and should stop the run. Turn it on for a repo where some package
    /// reliably defeats the transformer, so the other N-1 still diff.
    pub allow_failures: bool,
    /// Templates for inferring a declarations entry, from `RepoConfig`.
    pub types_from_source: Vec<String>,
    /// Globs of the sources whose mtimes decide build staleness.
    pub source_globs: Vec<String>,
    /// Command shown in "run the build first" errors, e.g. `yarn build`.
    pub build_hint: String,
}

impl ExtractOpts {
    /// The two required paths plus repo-neutral defaults. Callers override
    /// the rest with struct-update syntax, so adding a field here doesn't
    /// churn every call site.
    pub fn new(toolchain_root: PathBuf, output_dir: PathBuf) -> ExtractOpts {
        ExtractOpts {
            repo_root: toolchain_root.clone(),
            toolchain_root,
            output_dir,
            check_build_freshness: false,
            allow_empty: false,
            allow_failures: false,
            types_from_source: crate::config::default_types_from_source(),
            source_globs: crate::config::default_source_globs(),
            build_hint: "the repo's build".to_string(),
        }
    }

    /// Adopt a specific repo's conventions.
    pub fn with_config(mut self, cfg: &RepoConfig) -> ExtractOpts {
        self.repo_root = cfg.repo_root.clone();
        self.types_from_source = cfg.types_from_source.clone();
        self.source_globs = cfg.source_globs.clone();
        self.build_hint = cfg.build.join(" ");
        self.allow_failures = cfg.allow_failures;
        self
    }

    /// Force failure tolerance on, for a CLI `--allow-failures` that has to
    /// win over a config file that omits (and therefore disables) it. Never
    /// turns it back off, so a repo that declares the need keeps it.
    pub fn allowing_failures(mut self, yes: bool) -> ExtractOpts {
        self.allow_failures |= yes;
        self
    }
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

/// If any non-`.d.ts` file matching `source_globs` under `pkg_dir` is newer
/// than the built `types` entry, return that source path (the build is stale).
fn stale_source(
    pkg_dir: &Path,
    types_abs: &Path,
    source_globs: &[String],
) -> Result<Option<PathBuf>> {
    let types_mtime = std::fs::metadata(types_abs)
        .and_then(|m| m.modified())
        .with_context(|| format!("reading mtime of {}", types_abs.display()))?;
    let mut newest: Option<(std::time::SystemTime, PathBuf)> = None;
    for pat in source_globs {
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
        bail!(
            "No packages discovered. Check the `workspaces` globs for this repo \
             (set them in tsdiff.json if its layout is unusual), or pass allow_empty."
        );
    }
    if !ts_doc_available(&opts.toolchain_root) {
        bail!(
            "parcel3 or @parcel/transformer-ts-doc not found under {}. Install the \
             repo's dependencies, or pass --toolchain-root pointing at a checkout \
             that has the Parcel toolchain.",
            opts.toolchain_root.join("node_modules").display()
        );
    }

    let work_dir = opts.output_dir.join(".parcel-work");

    // Run the extraction in an inner async block so `?`/`bail!` below only
    // return *from this block*, not the function — letting the work_dir
    // cleanup below run unconditionally, on every early-return path too.
    let result: Result<()> = async {
        let mut total_exports = 0usize;
        let mut total_any = 0usize;
        let mut failures: Vec<String> = Vec::new();

        for entry in entries {
            // One fallible unit per package, so `allow_failures` covers every
            // way a single package can fail — including a missing or stale
            // build output, not just a transformer crash. `Ok(None)` is a
            // deliberate skip (nothing to extract), which is never a failure.
            let extracted = async {
                let pkg_json_path = entry.dir.join("package.json");
                let pkg_json: Value = serde_json::from_str(
                    &std::fs::read_to_string(&pkg_json_path)
                        .with_context(|| format!("reading {}", pkg_json_path.display()))?,
                )
                .with_context(|| format!("parsing {}", pkg_json_path.display()))?;

                let Some(types_entry) = resolve_types_entry_or_convention(
                    &pkg_json,
                    &entry.dir,
                    &opts.types_from_source,
                ) else {
                    eprintln!("  skip {} (no types entry)", entry.name);
                    return Ok(None);
                };
                let types_abs = entry.dir.join(&types_entry.rel);
                if !types_abs.exists() {
                    if opts.check_build_freshness && types_entry.declared {
                        bail!(
                            "Build incomplete for {}: declared types entry {} is missing. Run `{}` before extracting.",
                            entry.name, types_abs.display(), opts.build_hint
                        );
                    }
                    eprintln!(
                        "  skip {} (types entry missing: {})",
                        entry.name,
                        types_abs.display()
                    );
                    return Ok(None);
                }

                if opts.check_build_freshness {
                    if let Some(src) = stale_source(&entry.dir, &types_abs, &opts.source_globs)? {
                        bail!(
                            "Build is stale for {}: {} is newer than {}. Run `{}` before extracting.",
                            entry.name, src.display(), types_abs.display(), opts.build_hint
                        );
                    }
                }

                let json = run_ts_doc(
                    &opts.toolchain_root,
                    &opts.repo_root,
                    &work_dir,
                    &types_abs,
                    &slug(&entry.name),
                )
                .await?;

                // Validate + health-count via our own model (also exercises the
                // Unknown fallback rather than hard-failing on novel nodes).
                let api: ApiJson = serde_json::from_str(&json)
                    .with_context(|| format!("parsing extracted api.json for {}", entry.name))?;
                anyhow::Ok(Some((json, api)))
            }
            .await;

            let (json, api) = match extracted {
                Ok(Some(v)) => v,
                Ok(None) => continue,
                Err(e) if opts.allow_failures => {
                    eprintln!("  ✗ {} — {e:#}", entry.name);
                    failures.push(entry.name.clone());
                    continue;
                }
                Err(e) => return Err(e),
            };

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

        if !failures.is_empty() {
            eprintln!();
            eprintln!(
                "!! {} package(s) failed to extract and are ABSENT from {}:",
                failures.len(),
                opts.output_dir.display()
            );
            for name in &failures {
                eprintln!("!!   {name}");
            }
            eprintln!(
                "!! A diff produced from this directory cannot report changes in those packages."
            );
            eprintln!();
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

    /// Make `root` look like it has a Parcel toolchain installed.
    fn install_fake_toolchain(root: &Path) {
        let nm = root.join("node_modules");
        std::fs::create_dir_all(nm.join(".bin")).unwrap();
        std::fs::write(nm.join(".bin").join("parcel3"), "#!/bin/sh\n").unwrap();
        std::fs::create_dir_all(nm.join("@parcel").join("transformer-ts-doc")).unwrap();
    }

    #[test]
    fn explicit_toolchain_root_outranks_everything() {
        let explicit = tempfile::TempDir::new().unwrap();
        let repo = tempfile::TempDir::new().unwrap();
        install_fake_toolchain(repo.path());

        assert_eq!(
            resolve_toolchain_root(Some(explicit.path()), repo.path()),
            explicit.path()
        );
    }

    #[test]
    fn repo_with_its_own_toolchain_is_preferred_over_the_launcher() {
        // react-spectrum's case: the repo ships Parcel, so a run stays
        // self-contained even though the npm launcher offers its own copy.
        let repo = tempfile::TempDir::new().unwrap();
        install_fake_toolchain(repo.path());
        let launcher = tempfile::TempDir::new().unwrap();
        install_fake_toolchain(launcher.path());

        temp_env_var(TOOLCHAIN_ROOT_ENV, launcher.path().to_str().unwrap(), || {
            assert_eq!(resolve_toolchain_root(None, repo.path()), repo.path());
        });
    }

    #[test]
    fn repo_without_a_toolchain_falls_back_to_the_launcher() {
        // The reason --toolchain-root existed: a repo with no Parcel of its own
        // now needs no flag, because the npm launcher exported its own root.
        let repo = tempfile::TempDir::new().unwrap();
        let launcher = tempfile::TempDir::new().unwrap();
        install_fake_toolchain(launcher.path());

        temp_env_var(TOOLCHAIN_ROOT_ENV, launcher.path().to_str().unwrap(), || {
            assert_eq!(resolve_toolchain_root(None, repo.path()), launcher.path());
        });
    }

    #[test]
    fn unusable_launcher_root_falls_back_to_the_repo() {
        // The later "no node_modules/@parcel" error should name the repo the
        // caller asked about, not a path they never mentioned.
        let repo = tempfile::TempDir::new().unwrap();
        let empty = tempfile::TempDir::new().unwrap();

        temp_env_var(TOOLCHAIN_ROOT_ENV, empty.path().to_str().unwrap(), || {
            assert_eq!(resolve_toolchain_root(None, repo.path()), repo.path());
        });
    }

    /// Set an env var for the duration of `f`, then restore it.
    ///
    /// Cargo runs a crate's tests as threads in one process, so these both leak
    /// into each other and race unless serialised.
    fn temp_env_var(key: &str, value: &str, f: impl FnOnce()) {
        static ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());
        // A panic inside `f` would poison the lock and cascade into the other
        // tests as a second, misleading failure.
        let _guard = ENV_LOCK.lock().unwrap_or_else(|e| e.into_inner());

        let previous = std::env::var_os(key);
        std::env::set_var(key, value);
        f();
        match previous {
            Some(v) => std::env::set_var(key, v),
            None => std::env::remove_var(key),
        }
    }

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
    fn types_entry_falls_back_to_conventional_output_for_source_only_packages() {
        // `@react-spectrum/style-macro-s1` ships declarations but never declares them.
        let pkg = serde_json::json!({"name": "x", "source": "src/index.ts"});
        assert_eq!(resolve_types_entry(&pkg), None);
        let entry = resolve_types_entry_or_convention(
            &pkg,
            std::path::Path::new("/nonexistent"),
            &crate::config::default_types_from_source(),
        )
        .expect("should infer from source");
        assert_eq!(entry.rel, "dist/types/src/index.d.ts");
        assert!(!entry.declared);
    }

    #[test]
    fn types_entry_prefers_the_template_that_exists_on_disk() {
        // A repo that emits declarations next to the bundle rather than into
        // dist/types/ must still be picked up, without any config.
        let dir = tempfile::TempDir::new().unwrap();
        std::fs::create_dir_all(dir.path().join("dist/src")).unwrap();
        std::fs::write(dir.path().join("dist/src/index.d.ts"), "export {};\n").unwrap();

        let pkg = serde_json::json!({"name": "x", "source": "src/index.ts"});
        let entry = resolve_types_entry_or_convention(
            &pkg,
            dir.path(),
            &crate::config::default_types_from_source(),
        )
        .expect("should infer from source");
        assert_eq!(entry.rel, "dist/src/index.d.ts");
        assert!(!entry.declared);
    }

    #[test]
    fn types_entry_honours_a_custom_template() {
        let pkg = serde_json::json!({"name": "x", "source": "src/index.ts"});
        let entry = resolve_types_entry_or_convention(
            &pkg,
            std::path::Path::new("/nonexistent"),
            &["types/{stem}.d.ts".to_string()],
        )
        .expect("should infer from source");
        assert_eq!(entry.rel, "types/src/index.d.ts");
    }

    #[test]
    fn declared_types_entry_wins_over_the_source_convention() {
        let pkg = serde_json::json!({
            "name": "x",
            "source": "src/index.ts",
            "types": "./dist/types/custom.d.ts"
        });
        let entry = resolve_types_entry_or_convention(
            &pkg,
            std::path::Path::new("/nonexistent"),
            &crate::config::default_types_from_source(),
        )
        .unwrap();
        assert_eq!(entry.rel, "./dist/types/custom.d.ts");
        assert!(entry.declared);
    }

    #[test]
    fn packages_without_types_or_source_are_still_skipped() {
        let pkg = serde_json::json!({"name": "x", "main": "dist/main.js"});
        assert!(resolve_types_entry_or_convention(
            &pkg,
            std::path::Path::new("/nonexistent"),
            &crate::config::default_types_from_source(),
        )
        .is_none());
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
