# Parcel 3 `transformer-ts-doc` Extractor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Node TypeScript extractor (`rsp-api-checker/ts-extractor/extract-api.ts`) with a Rust driver that runs Parcel 3's `@parcel/transformer-ts-doc` binary to produce the per-package `api.json`, so the checker no longer depends on Node/tsc/tsx.

**Architecture:** Each `get-*-api` command discovers packages, then a new Rust module (`src/extract.rs`) drives the repo's `parcel3` binary over each package's `.d.ts` entry through a `docs:* → @parcel/transformer-ts-doc` pipeline, capturing the emitted `{ exports, links }` JSON and writing it into the existing `<output>/<pkg-name>/dist/api.json` + `<output>/<pkg-name>/package.json` layout. `compare`, the differ, the renderer, and the `api.json` schema are unchanged — the schema already *is* transformer-ts-doc's model.

**Tech Stack:** Rust (clap, serde/serde_json, tokio, glob, anyhow — all already in `Cargo.toml`; no new crates), the `@parcel/parcel3` native binary + `@parcel/transformer-ts-doc` plugin (already in the repo's `node_modules`).

## Global Constraints

- **Commits require explicit confirmation.** Per the repo owner's standing rule, do NOT run `git commit` or push without their explicit go-ahead. The commit steps below are checkpoints: pause and ask before running each one.
- **Working directory:** all `cargo`/test commands run from `rsp-api-checker/` (the crate root). Paths in this plan are relative to that unless prefixed with `../` (the react-spectrum repo root).
- **No new Cargo dependencies.** Use `glob` for filesystem walks (already a dep), not `walkdir`.
- **`.d.ts` on both sides.** Local and published extraction both feed `.d.ts` to transformer-ts-doc (never source), preserving apples-to-apples diffs.
- **One parcel3 build per package** to start; batching is an explicit non-goal here.
- **Node/mise:** the machine runs node/yarn via mise, so a bare `parcel3` isn't on `PATH`. The driver always invokes the binary by absolute path (`<repo_root>/node_modules/.bin/parcel3`); never rely on `PATH`.

## File Structure

- **Create:** `src/extract.rs` — the extraction driver: package-entry model, `.d.ts`/source resolution, fs-walk fallback discovery, the parcel3 invocation, and the per-package orchestration + guards.
- **Create:** `tests/extract_integration.rs` — integration tests that run the real `parcel3` binary (gated on availability).
- **Modify:** `src/api_json.rs` — add `Reference` + `Unknown` (`#[serde(other)]`) variants to `TypeNode`.
- **Modify:** `src/type_renderer.rs` — render the two new variants.
- **Modify:** `src/lib.rs` — add `pub mod extract;`.
- **Modify:** `src/commands/get_local.rs`, `src/commands/get_published.rs` — call `extract::extract_packages` instead of `workspace::run_extractor`.
- **Modify:** `src/workspace.rs` — delete `run`, `find_extractor_script`, `run_extractor`; fix imports.
- **Delete:** the entire `ts-extractor/` directory.
- **Modify:** `README.md`, `AUDIT.md`, `../.circleci/config.yml` — docs + CI.

---

### Task 1: Extend `TypeNode` for full transformer-ts-doc coverage

transformer-ts-doc can emit a `reference` node (`{type:'reference', local, imported, specifier}`) that the current `TypeNode` enum doesn't model, and we want unknown future node types to degrade gracefully instead of failing an entire package's deserialization.

**Files:**
- Modify: `src/api_json.rs` (enum `TypeNode`, ~line 110-117 and the tests module)
- Modify: `src/type_renderer.rs` (the `render_type` match, after the `TypeNode::Link` arm ~line 235)
- Test: `src/api_json.rs` (tests module), `src/type_renderer.rs` (tests module)

**Interfaces:**
- Produces: `TypeNode::Reference { local: Option<String>, imported: Option<String>, specifier: Option<String> }` and `TypeNode::Unknown` (unit, `#[serde(other)]`).

- [ ] **Step 1: Write the failing deserialization tests**

In `src/api_json.rs`, inside `mod tests`, add:

```rust
#[test]
fn parses_reference_node() {
    let node = parse_node(r#"{"type":"reference","local":"Foo","imported":"Foo","specifier":"@scope/pkg"}"#);
    match node {
        TypeNode::Reference { local, imported, specifier } => {
            assert_eq!(local.as_deref(), Some("Foo"));
            assert_eq!(imported.as_deref(), Some("Foo"));
            assert_eq!(specifier.as_deref(), Some("@scope/pkg"));
        }
        other => panic!("expected Reference, got {other:?}"),
    }
}

#[test]
fn unknown_node_type_falls_back_to_unknown() {
    let node = parse_node(r#"{"type":"someFutureNode","foo":123}"#);
    assert!(matches!(node, TypeNode::Unknown), "expected Unknown, got {node:?}");
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cargo test --lib api_json::tests::parses_reference_node api_json::tests::unknown_node_type_falls_back_to_unknown`
Expected: FAIL to compile — `no variant named Reference` / `no variant named Unknown`.

- [ ] **Step 3: Add the variants**

In `src/api_json.rs`, in `enum TypeNode`, immediately after the `Link { id: Option<String> }` variant (~line 116), add:

```rust
    Reference {
        #[serde(default)]
        local: Option<String>,
        #[serde(default)]
        imported: Option<String>,
        #[serde(default)]
        specifier: Option<String>,
    },

    /// Any node type not otherwise modelled. `#[serde(other)]` makes an
    /// unrecognized `"type"` deserialize here instead of failing the whole
    /// package, so a future transformer-ts-doc node degrades gracefully.
    #[serde(other)]
    Unknown,
```

- [ ] **Step 4: Run the deserialization tests to verify they pass**

Run: `cargo test --lib api_json::tests::parses_reference_node api_json::tests::unknown_node_type_falls_back_to_unknown`
Expected: FAIL to compile — `render_type` match in `src/type_renderer.rs` is now non-exhaustive (`Reference` and `Unknown` not covered). This is expected; proceed to Step 5.

- [ ] **Step 5: Add render arms**

In `src/type_renderer.rs`, in `render_type`, immediately after the `TypeNode::Link { id } => { ... }` arm (ends ~line 235), add:

```rust
        TypeNode::Reference {
            local,
            imported,
            specifier,
        } => local
            .clone()
            .or_else(|| imported.clone())
            .or_else(|| specifier.clone())
            .unwrap_or_else(|| "unknown".into()),

        TypeNode::Unknown => "unknown".into(),
```

- [ ] **Step 6: Write the render test**

In `src/type_renderer.rs`, inside `mod tests`, add:

```rust
#[test]
fn renders_reference_by_local_name() {
    let node = TypeNode::Reference {
        local: Some("Foo".into()),
        imported: Some("Bar".into()),
        specifier: Some("@scope/pkg".into()),
    };
    assert_eq!(render(&node), "Foo");
}
```

(`render` is the existing test helper in that module; if it is named differently, match the neighbouring render tests around line 632.)

- [ ] **Step 7: Run the full crate test suite**

Run: `cargo test`
Expected: PASS (all existing tests plus the three new ones).

- [ ] **Step 8: Commit** *(pause for confirmation first — see Global Constraints)*

```bash
git add src/api_json.rs src/type_renderer.rs
git commit -m "feat(api-checker): model transformer-ts-doc reference node + unknown fallback"
```

---

### Task 2: Pure helpers in `src/extract.rs` — `.d.ts`/source resolution + fs-walk discovery

Port the `types`-field and `source`-field resolvers from `ts-extractor/utils.ts` to Rust, plus a filesystem-walk fallback for discovering packages when yarn is unavailable. All pure/deterministic and unit-tested; no parcel yet.

**Files:**
- Create: `src/extract.rs`
- Modify: `src/lib.rs` (add `pub mod extract;`)
- Test: `src/extract.rs` (tests module)

**Interfaces:**
- Produces:
  - `pub struct PackageEntry { pub name: String, pub dir: PathBuf, pub private: bool }`
  - `pub fn resolve_types_entry(pkg_json: &serde_json::Value) -> Option<String>` — returns a package-relative `.d.ts` path.
  - `pub fn resolve_source_entry(pkg_json: &serde_json::Value) -> Option<String>` — returns a package-relative `.ts`/`.tsx` path.
  - `pub fn discover_packages_fs(packages_dir: &Path) -> Vec<PackageEntry>`

- [ ] **Step 1: Register the module**

In `src/lib.rs`, add after `pub mod differ;`:

```rust
pub mod extract;
```

- [ ] **Step 2: Write the failing unit tests**

Create `src/extract.rs` with only:

```rust
//! Drives Parcel 3's `@parcel/transformer-ts-doc` to extract per-package
//! `api.json`, replacing the old Node `ts-extractor`.

use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PackageEntry {
    pub name: String,
    pub dir: PathBuf,
    pub private: bool,
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

        let found = discover_packages_fs(root);
        let names: Vec<_> = found.iter().map(|p| p.name.as_str()).collect();
        assert_eq!(names, vec!["@scope/pub"]);
    }
}
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cargo test --lib extract::tests`
Expected: FAIL to compile — `resolve_types_entry`, `resolve_source_entry`, `discover_packages_fs` not found.

- [ ] **Step 4: Implement the helpers**

In `src/extract.rs`, above the `#[cfg(test)]` module, add:

```rust
use serde_json::Value;

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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cargo test --lib extract::tests`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit** *(pause for confirmation first)*

```bash
git add src/lib.rs src/extract.rs
git commit -m "feat(api-checker): add .d.ts/source resolvers + fs-walk discovery"
```

---

### Task 3: `run_ts_doc` — drive parcel3 over one `.d.ts`

The core reuse: invoke the repo's `parcel3` binary with a `docs:* → @parcel/transformer-ts-doc` config over a single `.d.ts`, and read back the emitted `{ exports, links }` JSON. Proven manually in the design spike.

**Files:**
- Modify: `src/extract.rs` (add the invocation functions)
- Create: `tests/extract_integration.rs`

**Interfaces:**
- Produces:
  - `pub fn parcel_bin(repo_root: &Path) -> PathBuf` → `<repo_root>/node_modules/.bin/parcel3`
  - `pub fn ts_doc_available(repo_root: &Path) -> bool`
  - `pub async fn run_ts_doc(repo_root: &Path, work_dir: &Path, dts_abs: &Path, stem: &str) -> anyhow::Result<String>` → the raw `{exports,links}` JSON.

- [ ] **Step 1: Write the failing integration test**

Create `tests/extract_integration.rs`:

```rust
use rsp_api_check::extract::{run_ts_doc, ts_doc_available};
use std::path::PathBuf;
use tempfile::TempDir;

fn repo_root() -> PathBuf {
    // crate dir is rsp-api-checker/; repo root is its parent.
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).parent().unwrap().to_path_buf()
}

#[tokio::test]
async fn run_ts_doc_extracts_dts_with_cross_file_link() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        eprintln!("skipping: parcel3 / @parcel/transformer-ts-doc not installed");
        return;
    }

    // Fixture package with a cross-file import.
    let fixture = TempDir::new().unwrap();
    std::fs::write(
        fixture.path().join("events.d.ts"),
        "export interface PressEvent { x: number; y: number; }\n",
    ).unwrap();
    std::fs::write(
        fixture.path().join("button.d.ts"),
        "import {PressEvent} from './events';\n\
         export interface ButtonProps {\n\
           variant?: 'primary' | 'secondary';\n\
           onPress?: (e: PressEvent) => void;\n\
         }\n",
    ).unwrap();

    let work = TempDir::new().unwrap();
    let json = run_ts_doc(&root, work.path(), &fixture.path().join("button.d.ts"), "button")
        .await
        .expect("run_ts_doc failed");

    let v: serde_json::Value = serde_json::from_str(&json).unwrap();
    let props = &v["exports"]["ButtonProps"];
    assert_eq!(props["type"], "interface");
    assert_eq!(props["properties"]["variant"]["value"]["type"], "union");
    // The cross-file PressEvent reference resolves to a link ending in ":PressEvent".
    let link_id = props["properties"]["onPress"]["value"]["parameters"][0]["value"]["id"]
        .as_str()
        .unwrap_or("");
    assert!(link_id.ends_with(":PressEvent"), "unexpected link id: {link_id}");

    // And it deserializes into our model without hitting the Unknown fallback.
    let _api: rsp_api_check::api_json::ApiJson = serde_json::from_str(&json).unwrap();
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test --test extract_integration`
Expected: FAIL to compile — `run_ts_doc` / `ts_doc_available` not found.

- [ ] **Step 3: Implement the parcel3 invocation**

In `src/extract.rs`, add these imports at the top (merge with existing `use` lines):

```rust
use std::process::Stdio;

use anyhow::{bail, Context, Result};
use tokio::process::Command;
```

Then add:

```rust
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

/// Run transformer-ts-doc on a single `.d.ts`, returning its `{exports,links}`
/// JSON. `stem` names the throwaway entry + dist dir; pass a per-package-unique
/// slug so serial builds don't collide.
pub async fn run_ts_doc(
    repo_root: &Path,
    work_dir: &Path,
    dts_abs: &Path,
    stem: &str,
) -> Result<String> {
    ensure_work_dir(repo_root, work_dir)?;

    let entry = work_dir.join(format!("{stem}.mjs"));
    let dist = work_dir.join(format!("{stem}-dist"));
    // Referencing `docs` keeps the transformer asset from being tree-shaken.
    std::fs::write(
        &entry,
        format!(
            "import docs from 'docs:{}';\nglobalThis.__docs = docs;\n",
            dts_abs.display()
        ),
    )
    .context("writing parcel entry")?;

    let parcelrc = work_dir.join(".parcelrc");
    let output = Command::new(parcel_bin(repo_root))
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
    for entry in std::fs::read_dir(&dist).context("reading parcel dist dir")? {
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
```

- [ ] **Step 4: Run the integration test to verify it passes**

Run: `cargo test --test extract_integration`
Expected: PASS (the machine has parcel3 installed; if not, the test prints "skipping" and passes).

- [ ] **Step 5: Commit** *(pause for confirmation first)*

```bash
git add src/extract.rs tests/extract_integration.rs
git commit -m "feat(api-checker): drive parcel3 transformer-ts-doc over a single .d.ts"
```

---

### Task 4: `extract_packages` — orchestrate all packages into the compare layout

Loop the package set, run `run_ts_doc` per package, write the `<output>/<name>/dist/api.json` + `<output>/<name>/package.json` tree `compare` expects, and port the guards (zero-package, `any`-ratio, build-freshness).

**Files:**
- Modify: `src/extract.rs` (add `ExtractOpts`, `extract_packages`, `stale_source`, `count_top_level_any`, `slug`)
- Modify: `tests/extract_integration.rs` (add an orchestration test)

**Interfaces:**
- Consumes: `PackageEntry`, `resolve_types_entry`, `resolve_source_entry`, `run_ts_doc`, `ts_doc_available` (Tasks 2–3); `crate::api_json::{ApiJson, TypeNode}` (Task 1).
- Produces:
  - `pub struct ExtractOpts { pub repo_root: PathBuf, pub output_dir: PathBuf, pub check_build_freshness: bool, pub allow_empty: bool }`
  - `pub async fn extract_packages(entries: &[PackageEntry], opts: &ExtractOpts) -> anyhow::Result<()>`

- [ ] **Step 1: Write the failing orchestration test**

In `tests/extract_integration.rs`, add:

```rust
use rsp_api_check::extract::{extract_packages, ExtractOpts, PackageEntry};
use rsp_api_check::differ::{diff_package, discover_pairs};

fn write_pkg(root: &std::path::Path, name: &str, dts: &str) -> PackageEntry {
    let dir = root.join(name);
    std::fs::create_dir_all(dir.join("dist/types")).unwrap();
    std::fs::write(dir.join("package.json"),
        format!(r#"{{"name":"{name}","types":"dist/types/index.d.ts"}}"#)).unwrap();
    std::fs::write(dir.join("dist/types/index.d.ts"), dts).unwrap();
    PackageEntry { name: name.to_string(), dir, private: false }
}

#[tokio::test]
async fn extract_packages_writes_compare_layout_and_self_diffs_clean() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        eprintln!("skipping: parcel3 not installed");
        return;
    }
    let pkgs_tmp = TempDir::new().unwrap();
    let entries = vec![
        write_pkg(pkgs_tmp.path(), "@fix/button",
            "export interface ButtonProps { isDisabled?: boolean; }\n"),
        write_pkg(pkgs_tmp.path(), "@fix/toggle",
            "export interface ToggleProps { isSelected?: boolean; }\n"),
    ];

    let out = TempDir::new().unwrap();
    extract_packages(&entries, &ExtractOpts {
        repo_root: root.clone(),
        output_dir: out.path().to_path_buf(),
        check_build_freshness: false,
        allow_empty: false,
    }).await.expect("extract_packages failed");

    // Layout: <out>/<name>/dist/api.json + <out>/<name>/package.json
    assert!(out.path().join("@fix/button/dist/api.json").exists());
    assert!(out.path().join("@fix/button/package.json").exists());

    // Extract-vs-itself must diff clean through the real differ.
    let pairs = discover_pairs(out.path(), out.path()).unwrap();
    assert_eq!(pairs.len(), 2);
    for p in &pairs {
        let d = diff_package(&p.package_name, &p.base, &p.branch, true);
        assert!(d.diffs.is_empty(), "self-diff for {} should be empty", p.package_name);
    }
}

#[tokio::test]
async fn extract_packages_errors_on_empty_unless_allowed() {
    let root = repo_root();
    let out = TempDir::new().unwrap();
    let opts = ExtractOpts {
        repo_root: root, output_dir: out.path().to_path_buf(),
        check_build_freshness: false, allow_empty: false,
    };
    assert!(extract_packages(&[], &opts).await.is_err());
    let opts_ok = ExtractOpts { allow_empty: true, ..opts };
    assert!(extract_packages(&[], &opts_ok).await.is_ok());
}
```

Note: `ExtractOpts` needs `#[derive(Clone)]` for the `..opts` spread in the second test.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cargo test --test extract_integration`
Expected: FAIL to compile — `extract_packages`, `ExtractOpts` not found.

- [ ] **Step 3: Implement the orchestrator**

In `src/extract.rs`, add (the `use crate::api_json::...` goes with the other imports):

```rust
use crate::api_json::{ApiJson, TypeNode};

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
    let types_mtime = std::fs::metadata(types_abs)?.modified()?;
    let mut newest: Option<(std::time::SystemTime, PathBuf)> = None;
    for pat in ["src/**/*.ts", "src/**/*.tsx"] {
        let glob_pat = pkg_dir.join(pat);
        let Ok(paths) = glob::glob(&glob_pat.to_string_lossy()) else {
            continue;
        };
        for p in paths.flatten() {
            if p.to_string_lossy().ends_with(".d.ts") {
                continue;
            }
            let m = std::fs::metadata(&p)?.modified()?;
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
    let mut total_exports = 0usize;
    let mut total_any = 0usize;

    for entry in entries {
        let pkg_json_path = entry.dir.join("package.json");
        let pkg_json: Value = serde_json::from_str(
            &std::fs::read_to_string(&pkg_json_path)
                .with_context(|| format!("reading {}", pkg_json_path.display()))?,
        )
        .with_context(|| format!("parsing {}", pkg_json_path.display()))?;

        let Some(types_rel) = resolve_types_entry(&pkg_json) else {
            eprintln!("  skip {} (no types entry)", entry.name);
            continue;
        };
        let types_abs = entry.dir.join(&types_rel);
        if !types_abs.exists() {
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
        std::fs::create_dir_all(out_base.join("dist"))?;
        std::fs::write(out_base.join("dist").join("api.json"), &json)?;
        std::fs::write(
            out_base.join("package.json"),
            serde_json::to_string_pretty(&serde_json::json!({
                "name": entry.name,
                "private": entry.private,
            }))?,
        )?;
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

    let _ = std::fs::remove_dir_all(&work_dir);
    Ok(())
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cargo test --test extract_integration`
Expected: PASS (3 tests: the Task 3 test plus these two).

- [ ] **Step 5: Commit** *(pause for confirmation first)*

```bash
git add src/extract.rs tests/extract_integration.rs
git commit -m "feat(api-checker): orchestrate per-package parcel3 extraction into compare layout"
```

---

### Task 5: Wire `get-local-api` to the driver

Replace the `run_extractor` call with discovery → `extract_packages`. Keep the `.d.ts`-present precheck and timing.

**Files:**
- Modify: `src/commands/get_local.rs`

**Interfaces:**
- Consumes: `extract::{extract_packages, discover_packages_fs, ExtractOpts, PackageEntry}`, `workspaces::discover_workspaces`.

- [ ] **Step 1: Replace imports**

In `src/commands/get_local.rs`, replace:

```rust
use crate::workspace::run_extractor;
use crate::workspaces::discover_workspaces;
```

with:

```rust
use crate::extract::{discover_packages_fs, extract_packages, ExtractOpts, PackageEntry};
use crate::workspaces::discover_workspaces;
```

- [ ] **Step 2: Replace the discovery + extraction block**

In `execute`, replace everything from `// Ask yarn for the authoritative set...` (the `std::fs::create_dir_all(&opts.output_dir)` + `.workspaces.json` block) through the `run_extractor(...).await?;` call (roughly lines 47–94) with:

```rust
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
```

Leave the surrounding `packages_dir`/`has_declaration_files` checks, the final `println!`, and the timing block unchanged.

- [ ] **Step 3: Build and run the crate tests**

Run: `cargo build && cargo test`
Expected: PASS; no unused-import warnings for `get_local.rs`.

- [ ] **Step 4: Smoke-test against the repo (optional but recommended)**

If the repo has a build (`../packages/**/dist/types/**/*.d.ts` present), run:

```bash
cargo run --release -- get-local-api --repo-root .. --output ../dist/branch-api
```

Expected: `✓ <package>` lines and `Local API extracted to ../dist/branch-api`, with `../dist/branch-api/<name>/dist/api.json` files present.

- [ ] **Step 5: Commit** *(pause for confirmation first)*

```bash
git add src/commands/get_local.rs
git commit -m "feat(api-checker): extract local api via parcel3 driver"
```

---

### Task 6: Wire `get-published-api` to the driver

Replace `run_extractor(&nm_dir, ...)` with building `PackageEntry`s from the installed tarballs and calling `extract_packages`.

**Files:**
- Modify: `src/commands/get_published.rs`

**Interfaces:**
- Consumes: `extract::{extract_packages, ExtractOpts, PackageEntry}`.

- [ ] **Step 1: Replace imports**

In `src/commands/get_published.rs`, replace:

```rust
use crate::workspace::{run_extractor, run_npm_install, write_package_json};
```

with:

```rust
use crate::extract::{extract_packages, ExtractOpts, PackageEntry};
use crate::workspace::{run_npm_install, write_package_json};
```

- [ ] **Step 2: Replace the extractor call**

In `execute`, replace the block from `// 3. Run the TypeScript extractor on the installed packages` through `run_extractor(&nm_dir, &opts.output_dir, false, None).await?;` (roughly lines 180–191) with:

```rust
    // 3. Extract each installed package's .d.ts via the parcel3 driver.
    //    Entries point at the tmp install's node_modules; transformer-ts-doc
    //    resolves cross-package types from there, while its plugin + the
    //    parcel3 binary resolve from the repo's node_modules (via repo_root).
    //    check_build_freshness = false: published tarballs are immutable.
    let nm_dir = tmp_dir.join("node_modules");
    let entries: Vec<PackageEntry> = published
        .iter()
        .map(|p| PackageEntry {
            name: p.name.clone(),
            dir: nm_dir.join(&p.name),
            private: false,
        })
        .collect();

    let t_extract = std::time::Instant::now();
    extract_packages(
        &entries,
        &ExtractOpts {
            repo_root: opts.repo_root.clone(),
            output_dir: opts.output_dir.clone(),
            check_build_freshness: false,
            allow_empty: false,
        },
    )
    .await?;
    let extract_elapsed = t_extract.elapsed();
```

(`published` is the `Vec` returned by `get_published_packages` earlier in the function; `.name` is its package-name field, already used above when building `deps`.)

- [ ] **Step 3: Build and run the crate tests**

Run: `cargo build && cargo test`
Expected: PASS; no unused-import warnings.

- [ ] **Step 4: Commit** *(pause for confirmation first)*

```bash
git add src/commands/get_published.rs
git commit -m "feat(api-checker): extract published api via parcel3 driver"
```

---

### Task 7: Remove the Node extractor and dead code

With both commands migrated, delete `ts-extractor/` and the now-unused workspace helpers.

**Files:**
- Delete: `ts-extractor/` (entire directory)
- Modify: `src/workspace.rs`

- [ ] **Step 1: Delete the Node extractor**

```bash
git rm -r ts-extractor
```

(If not tracking with git yet, `rm -rf ts-extractor`.)

- [ ] **Step 2: Remove dead functions from `src/workspace.rs`**

Delete these three functions entirely: `run` (the inherit-stdio runner, ~lines 9–24), `find_extractor_script` (~lines 139–169), and `run_extractor` (~lines 171–225). Keep `run_npm_install`, `extract_unresolved_packages`, `extract_quoted_pkg_spec`, `run_capture`, `write_package_json`, and the existing `#[cfg(test)] mod tests`.

- [ ] **Step 3: Fix imports in `src/workspace.rs`**

The file header is:

```rust
use std::path::{Path, PathBuf};
use std::process::Stdio;

use anyhow::{bail, Context, Result};
use tokio::process::Command;
```

After removing the functions, `PathBuf` is no longer used (the survivors take `&Path`). Change the first line to:

```rust
use std::path::Path;
```

- [ ] **Step 4: Build and verify no references remain**

Run: `cargo build 2>&1 | grep -i "run_extractor\|find_extractor_script" || echo "clean"`
Expected: `clean`, and the build succeeds with no unused-import/dead-code warnings.

- [ ] **Step 5: Run the full suite**

Run: `cargo test`
Expected: PASS.

- [ ] **Step 6: Commit** *(pause for confirmation first)*

```bash
git add -A
git commit -m "chore(api-checker): remove Node ts-extractor and dead workspace helpers"
```

---

### Task 8: Update docs and CI

**Files:**
- Modify: `README.md`
- Modify: `AUDIT.md`
- Modify: `../.circleci/config.yml`

- [ ] **Step 1: Update `README.md` prerequisites**

Replace the `## Prerequisites` list with:

```markdown
## Prerequisites

- **Rust** (1.75+) — to build the CLI
- **The repo's `node_modules`** — the extractor invokes the `parcel3` binary and
  the `@parcel/transformer-ts-doc` plugin from `<repo-root>/node_modules`, so run
  `yarn install` at the monorepo root first. **No Node/tsc/tsx is used directly.**
- **npm** — only for the published-API workflow (installing published tarballs).
```

- [ ] **Step 2: Rewrite the extractor section in `README.md`**

Replace the `## TypeScript Extractor` section (and the "reads `.d.ts` … via the TS compiler API in `ts-extractor/extract-api.ts`" sentence in the Architecture note) with:

```markdown
## Type extraction (Parcel 3)

Type extraction reuses Parcel 3's Rust `@parcel/transformer-ts-doc` plugin — the
same extractor that powers the repo's Storybook control args and s2-docs. For
each package the tool feeds the package's `.d.ts` entry through a
`docs:* → @parcel/transformer-ts-doc` pipeline (via the `parcel3` binary) and
captures the emitted `{ exports, links }` JSON as that package's `api.json`.

This works for published tarballs that ship only `.d.ts` (e.g.
`react-aria-components`) and requires no Node/TypeScript of our own.
```

- [ ] **Step 3: Update the "Differences" table in `README.md`**

Change the "Local/Published API extraction" and "Type rendering" rows so the "New" column reads "Parcel 3 `transformer-ts-doc` (Rust) on `.d.ts`" instead of referencing a TS-compiler extractor. Remove any row implying a Node extractor remains.

- [ ] **Step 4: Note the change in `AUDIT.md`**

Add near the top of `AUDIT.md`, under the `## Summary`:

```markdown
> **Update (2026-09):** The Node `ts-extractor` has been replaced by the Parcel 3
> `@parcel/transformer-ts-doc` binary (see
> `docs/2026-09-21-parcel3-transformer-extractor-design.md`). Audit items that
> referenced `extract-api.ts`/`utils.ts` line numbers (A1, B2, B3, C2, C5, D1–D3)
> now apply to `src/extract.rs` or are obsolete.
```

- [ ] **Step 5: Remove the ts-extractor install steps from CI**

In `../.circleci/config.yml`, delete both occurrences of this run step (they appear around lines 430–431 and 524–525):

```yaml
      - run:
          name: install ts-extractor dependencies
          command: cd rsp-api-checker/ts-extractor && npm ci
```

The `parcel3` binary + `@parcel/transformer-ts-doc` come from the repo's existing `yarn install` in those jobs; no replacement step is needed. Do not remove the `cargo build` / `get-local-api` / `get-published-api` / `compare` / `env-report` steps.

- [ ] **Step 6: Sanity-check CI YAML**

Run: `cd .. && yarn --silent js-yaml .circleci/config.yml >/dev/null && echo "yaml ok"` (or any available YAML linter).
Expected: `yaml ok` (no parse error). If no YAML tool is available, visually confirm indentation of the surrounding steps is intact.

- [ ] **Step 7: Commit** *(pause for confirmation first)*

```bash
git add README.md AUDIT.md ../.circleci/config.yml
git commit -m "docs(api-checker): document parcel3 extractor; drop ts-extractor from CI"
```

---

## Self-Review

**Spec coverage:**
- Extraction driver (spec §Components/1) → Tasks 3–4.
- Checker-owned `.parcelrc` (spec §Components/2) → Task 3 (`PARCELRC`).
- Model-compatibility `reference` + fallback (spec §Components/3) → Task 1.
- Local/published wiring, both `.d.ts` (spec §Wiring) → Tasks 5–6.
- Guards: freshness/allow-empty/zero-package/any-ratio (spec §Components/1) → Task 4 (+ Task 5 sets `check_build_freshness: true`).
- Delete `ts-extractor/` (spec §Deletions) → Task 7.
- Docs & CI (spec §Docs & CI) → Task 8.
- Tests: driver integration, model coverage, existing suite green (spec §Testing) → Tasks 1–4 tests; the Task 4 `ApiJson` parse doubles as model-coverage over whatever nodes real `.d.ts` produce, and the existing differ tests stay green throughout.

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every run step shows the command and expected result.

**Type consistency:** `PackageEntry { name, dir, private }`, `ExtractOpts { repo_root, output_dir, check_build_freshness, allow_empty }`, `run_ts_doc(repo_root, work_dir, dts_abs, stem)`, `extract_packages(entries, opts)`, and `resolve_types_entry(pkg_json) -> Option<String>` are used identically across Tasks 2–6. `ExtractOpts` derives `Clone` (needed by the Task 4 `..opts` test and the `.clone()` calls in Tasks 5–6). The two new `TypeNode` variants from Task 1 are rendered in Task 1 and parsed in Task 4.

**Open items carried from the spec (validate during execution, not blockers):**
- Whether a `docs:`-prefixed path can be a parcel3 *entry* directly (dropping the `entry.mjs` wrapper) — a possible simplification to try after Task 3 is green; the wrapper approach is what's specified because it's proven.
- Confirm published-flow plugin/type resolution on a real run (Task 6 Step 3 build + a manual `get-published-api` smoke run if network is available).
