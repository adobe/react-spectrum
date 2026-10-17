//! Discover the workspace packages that make up a repo's public API surface.
//!
//! Package-manager agnostic: the workspace globs come from [`RepoConfig`]
//! (which derives them from the repo's own `package.json#workspaces` or
//! `pnpm-workspace.yaml`), so this works for yarn, npm, pnpm and bun
//! workspaces alike — and for a single-package repo, where the "workspace"
//! is just the repo root.
//!
//! When the repo uses yarn we still *ask yarn* for the locations, because
//! yarn resolves its own globs more faithfully than a plain filesystem walk
//! can. Either way the `package.json` of each candidate is read directly for
//! `name`/`private`, so the two paths agree on what they report.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;

use anyhow::{Context, Result};
use tokio::process::Command;

use crate::config::{is_excluded, RepoConfig};

#[derive(Debug, Clone)]
pub struct Workspace {
    /// Package name as declared in its `package.json` (e.g. `@react-aria/button`).
    pub name: String,
    /// Absolute path to the workspace directory.
    pub location: PathBuf,
    /// `private: true` in its `package.json`. Private packages are not
    /// published, so they're excluded from the API surface but still
    /// interesting to `env-report`.
    pub private: bool,
}

/// Discover the repo's workspace packages.
///
/// `include_private` keeps `private: true` packages in the result — used by
/// `env-report`, which needs to reason about every linked workspace, not just
/// the publishable ones.
pub async fn discover(cfg: &RepoConfig, include_private: bool) -> Result<Vec<Workspace>> {
    let root = cfg.repo_root.canonicalize().unwrap_or_else(|_| cfg.repo_root.clone());

    let dirs = match yarn_locations(&root, cfg).await {
        Some(dirs) => dirs,
        None => glob_locations(&root, cfg),
    };

    let excludes = cfg.exclude_patterns();
    // Keyed by name so two globs matching the same directory (a very common
    // case: `packages/*` and `packages/*/*`) can't yield duplicates, and
    // sorted so output ordering is stable across runs and platforms.
    let mut found: BTreeMap<String, Workspace> = BTreeMap::new();

    for dir in dirs {
        let rel = dir.strip_prefix(&root).unwrap_or(dir.as_path());
        // An empty `rel` is the repo root itself, which `glob_locations` only
        // yields when `.` was declared as a workspace.
        if !rel.as_os_str().is_empty() && is_excluded(rel, &excludes) {
            continue;
        }

        let manifest = dir.join("package.json");
        let txt = match std::fs::read_to_string(&manifest) {
            Ok(t) => t,
            Err(_) => continue,
        };
        let v: serde_json::Value = match serde_json::from_str(&txt) {
            Ok(v) => v,
            Err(e) => {
                eprintln!("  warn: skipping {}: {e}", manifest.display());
                continue;
            }
        };
        let name = match v.get("name").and_then(|n| n.as_str()) {
            Some(n) => n.to_string(),
            None => continue,
        };
        let private = v.get("private").and_then(|p| p.as_bool()).unwrap_or(false);
        if private && !include_private {
            continue;
        }
        found.insert(
            name.clone(),
            Workspace {
                name,
                location: dir,
                private,
            },
        );
    }

    Ok(found.into_values().collect())
}

/// Ask yarn for its workspace locations. Returns `None` for any repo that
/// isn't a yarn workspace, or when yarn isn't on PATH — the caller then globs.
///
/// Note we no longer pass `--no-private`: privateness is read from each
/// manifest so that `include_private` is decided in one place.
async fn yarn_locations(root: &Path, cfg: &RepoConfig) -> Option<Vec<PathBuf>> {
    if cfg.package_manager != crate::config::PackageManager::Yarn {
        return None;
    }

    let output = Command::new("yarn")
        .args(["workspaces", "list", "--json"])
        .current_dir(root)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut dirs = Vec::new();
    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let v: serde_json::Value = match serde_json::from_str(line) {
            Ok(v) => v,
            Err(_) => continue,
        };
        let Some(loc) = v.get("location").and_then(|l| l.as_str()) else {
            continue;
        };
        // Yarn reports the monorepo root as ".". It's the workspace container,
        // not a publishable package.
        if loc == "." {
            continue;
        }
        dirs.push(root.join(loc));
    }

    // An empty list means "not a workspace project" rather than "no packages";
    // fall through to globbing so single-package repos still work.
    if dirs.is_empty() {
        None
    } else {
        Some(dirs)
    }
}

/// Expand the configured workspace globs against the filesystem, looking for
/// directories that contain a `package.json`.
fn glob_locations(root: &Path, cfg: &RepoConfig) -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    for pattern in &cfg.workspaces {
        // `.` means the repo root is itself the package.
        if pattern == "." || pattern.is_empty() {
            if root.join("package.json").is_file() {
                dirs.push(root.to_path_buf());
            }
            continue;
        }

        // Normalising through `components()` drops any `./` segments, which
        // would otherwise leak into the `strip_prefix` result and break
        // exclusion matching.
        let joined: PathBuf = root.join(pattern).components().collect();
        let manifest_glob = joined.join("package.json");
        let entries = match glob::glob(&manifest_glob.to_string_lossy()) {
            Ok(entries) => entries,
            Err(e) => {
                eprintln!("  warn: ignoring invalid workspace glob `{pattern}`: {e}");
                continue;
            }
        };
        for entry in entries.flatten() {
            let Some(dir) = entry.parent() else { continue };
            if dir
                .components()
                .any(|c| matches!(c.as_os_str().to_str(), Some("node_modules") | Some(".git")))
            {
                continue;
            }
            dirs.push(dir.to_path_buf());
        }
    }
    dirs
}

/// Convenience wrapper: just the names of the publishable packages.
pub async fn discover_names(cfg: &RepoConfig) -> Result<Vec<String>> {
    Ok(discover(cfg, false)
        .await
        .context("discovering workspace packages")?
        .into_iter()
        .map(|w| w.name)
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn write_pkg(dir: &Path, json: &str) {
        fs::create_dir_all(dir).unwrap();
        fs::write(dir.join("package.json"), json).unwrap();
    }

    /// Build a repo shaped like react-spectrum: scoped packages two levels
    /// deep, an unscoped package one level deep, a private one, and a dev
    /// tooling subtree that should be excluded by config.
    fn fixture() -> TempDir {
        let dir = TempDir::new().unwrap();
        let root = dir.path();
        write_pkg(
            root,
            r#"{"name":"root","private":true,"workspaces":["packages/*","packages/@*/*","packages/dev/*"]}"#,
        );
        write_pkg(
            &root.join("packages/@react-aria/button"),
            r#"{"name":"@react-aria/button"}"#,
        );
        write_pkg(
            &root.join("packages/@react-spectrum/s2"),
            r#"{"name":"@react-spectrum/s2"}"#,
        );
        write_pkg(
            &root.join("packages/react-aria-components"),
            r#"{"name":"react-aria-components"}"#,
        );
        write_pkg(
            &root.join("packages/@internal/secret"),
            r#"{"name":"@internal/secret","private":true}"#,
        );
        write_pkg(&root.join("packages/dev/docs"), r#"{"name":"@dev/docs"}"#);
        dir
    }

    #[tokio::test]
    async fn discovers_packages_at_every_configured_depth() {
        let dir = fixture();
        fs::write(
            dir.path().join("tsdiff.json"),
            r#"{"exclude":["packages/dev/**"]}"#,
        )
        .unwrap();
        let cfg = RepoConfig::load(dir.path(), None).unwrap();

        let names: Vec<String> = discover(&cfg, false)
            .await
            .unwrap()
            .into_iter()
            .map(|w| w.name)
            .collect();

        assert_eq!(
            names,
            vec![
                "@react-aria/button".to_string(),
                "@react-spectrum/s2".to_string(),
                "react-aria-components".to_string(),
            ]
        );
    }

    #[tokio::test]
    async fn private_packages_are_opt_in() {
        let dir = fixture();
        fs::write(
            dir.path().join("tsdiff.json"),
            r#"{"exclude":["packages/dev/**"]}"#,
        )
        .unwrap();
        let cfg = RepoConfig::load(dir.path(), None).unwrap();

        let public = discover(&cfg, false).await.unwrap();
        assert!(!public.iter().any(|w| w.name == "@internal/secret"));

        let all = discover(&cfg, true).await.unwrap();
        let secret = all.iter().find(|w| w.name == "@internal/secret").unwrap();
        assert!(secret.private);
        // The root is private and is not a declared workspace member.
        assert!(!all.iter().any(|w| w.name == "root"));
    }

    #[tokio::test]
    async fn excluded_subtrees_are_dropped() {
        let dir = fixture();
        fs::write(
            dir.path().join("tsdiff.json"),
            r#"{"exclude":["packages/dev/**"]}"#,
        )
        .unwrap();
        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        let all = discover(&cfg, true).await.unwrap();
        assert!(!all.iter().any(|w| w.name == "@dev/docs"));
    }

    #[tokio::test]
    async fn without_an_exclusion_dev_packages_are_kept() {
        // Guards against re-introducing a hard-coded `packages/dev` skip:
        // the exclusion must come from config, not from the code.
        let dir = fixture();
        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        let all = discover(&cfg, true).await.unwrap();
        assert!(all.iter().any(|w| w.name == "@dev/docs"));
    }

    #[tokio::test]
    async fn a_single_package_repo_discovers_its_root() {
        let dir = TempDir::new().unwrap();
        write_pkg(dir.path(), r#"{"name":"solo","version":"1.0.0"}"#);
        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        assert_eq!(cfg.workspaces, vec![".".to_string()]);

        let names: Vec<String> = discover(&cfg, false)
            .await
            .unwrap()
            .into_iter()
            .map(|w| w.name)
            .collect();
        assert_eq!(names, vec!["solo".to_string()]);
    }

    #[tokio::test]
    async fn node_modules_are_never_treated_as_workspaces() {
        let dir = TempDir::new().unwrap();
        write_pkg(
            dir.path(),
            r#"{"name":"root","private":true,"workspaces":["packages/*"]}"#,
        );
        write_pkg(&dir.path().join("packages/a"), r#"{"name":"a"}"#);
        write_pkg(
            &dir.path().join("packages/a/node_modules/dep"),
            r#"{"name":"dep"}"#,
        );
        // A glob that would otherwise reach into node_modules.
        fs::write(
            dir.path().join("tsdiff.json"),
            r#"{"workspaces":["packages/*","packages/*/node_modules/*"]}"#,
        )
        .unwrap();

        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        let names: Vec<String> = discover(&cfg, true)
            .await
            .unwrap()
            .into_iter()
            .map(|w| w.name)
            .collect();
        assert_eq!(names, vec!["a".to_string()]);
    }

    #[tokio::test]
    async fn overlapping_globs_do_not_duplicate_packages() {
        let dir = TempDir::new().unwrap();
        write_pkg(dir.path(), r#"{"name":"root","private":true}"#);
        write_pkg(&dir.path().join("packages/a"), r#"{"name":"a"}"#);
        fs::write(
            dir.path().join("tsdiff.json"),
            r#"{"workspaces":["packages/*","packages/a","./packages/*"]}"#,
        )
        .unwrap();

        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        assert_eq!(discover(&cfg, true).await.unwrap().len(), 1);
    }

    #[tokio::test]
    async fn negated_workspace_entries_act_as_exclusions() {
        let dir = fixture();
        fs::write(
            dir.path().join("tsdiff.json"),
            r#"{"workspaces":["packages/*","packages/@*/*","packages/dev/*","!packages/dev/**"]}"#,
        )
        .unwrap();
        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        let all = discover(&cfg, true).await.unwrap();
        assert!(!all.iter().any(|w| w.name == "@dev/docs"));
        assert!(all.iter().any(|w| w.name == "@react-aria/button"));
    }

    #[tokio::test]
    async fn discovery_never_bails_on_a_non_workspace_repo() {
        // Regression guard for the old yarn-only path, which had to special
        // case "yarn missing" and "not a yarn project".
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("package.json"), r#"{"name":"test","private":true}"#).unwrap();
        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        let result = discover(&cfg, false).await.unwrap();
        assert!(result.is_empty());
    }

    #[tokio::test]
    async fn malformed_manifests_are_skipped_not_fatal() {
        let dir = TempDir::new().unwrap();
        write_pkg(dir.path(), r#"{"name":"root","private":true,"workspaces":["packages/*"]}"#);
        write_pkg(&dir.path().join("packages/good"), r#"{"name":"good"}"#);
        fs::create_dir_all(dir.path().join("packages/bad")).unwrap();
        fs::write(dir.path().join("packages/bad/package.json"), "{not json").unwrap();

        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        let names: Vec<String> = discover(&cfg, true)
            .await
            .unwrap()
            .into_iter()
            .map(|w| w.name)
            .collect();
        assert_eq!(names, vec!["good".to_string()]);
    }
}
