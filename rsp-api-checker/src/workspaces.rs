//! Discover the set of public workspace packages by asking yarn. Preferred
//! over walking the filesystem because yarn's output honors the root
//! `package.json#workspaces` globs and the `private: true` flag — no
//! hard-coded depth limit or skip list required.
//!
//! Falls back gracefully when yarn isn't available (e.g. CI environments
//! without yarn installed, or test fixtures): callers should treat `None`
//! as "use the fs-walk fallback".

use std::path::{Path, PathBuf};
use std::process::Stdio;

use anyhow::Result;
use tokio::process::Command;

#[derive(Debug, Clone)]
pub struct Workspace {
    /// Package name as declared in its `package.json` (e.g. `@react-aria/button`).
    pub name: String,
    /// Absolute path to the workspace directory.
    pub location: PathBuf,
}

/// Run `yarn workspaces list --json --no-private` in `repo_root` and parse the
/// newline-delimited JSON output. Returns `Ok(None)` when yarn is not
/// installed or the command fails — the caller should then fall back to an
/// fs-walk.
///
/// We pass `--no-private` so we don't have to filter by `private: true` after
/// the fact. Yarn excludes the monorepo root itself from the list.
pub async fn discover_workspaces(repo_root: &Path) -> Result<Option<Vec<Workspace>>> {
    let output = Command::new("yarn")
        .args(["workspaces", "list", "--json", "--no-private"])
        .current_dir(repo_root)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    let output = match output {
        Ok(o) => o,
        // yarn not on PATH — not an error, just signal fallback.
        Err(_) => return Ok(None),
    };

    if !output.status.success() {
        return Ok(None);
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut workspaces = Vec::new();
    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let v: serde_json::Value = match serde_json::from_str(line) {
            Ok(v) => v,
            Err(_) => continue,
        };
        let name = match v.get("name").and_then(|n| n.as_str()) {
            Some(n) => n.to_string(),
            None => continue,
        };
        let loc = match v.get("location").and_then(|l| l.as_str()) {
            Some(l) => l.to_string(),
            None => continue,
        };
        // Skip the root workspace itself (yarn reports location "." when the
        // root is listed as a member of itself on older setups).
        if loc == "." {
            continue;
        }
        workspaces.push(Workspace {
            name,
            location: repo_root.join(loc),
        });
    }

    Ok(Some(workspaces))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_missing_yarn_returns_none_or_unsuccessful() {
        // If yarn is not available in PATH or the dir has no yarn project,
        // the function must return Ok(None) — never bail.
        let dir = TempDir::new().unwrap();
        // Write a minimal non-yarn package.json so the command can at least cd in.
        fs::write(dir.path().join("package.json"), r#"{"name":"test","private":true}"#).unwrap();

        let result = discover_workspaces(dir.path()).await.unwrap();
        // Either yarn isn't installed (None) or yarn fails on this non-workspace
        // project (also None). Both are acceptable — we just must not panic.
        assert!(result.is_none() || result.as_ref().is_some_and(|v| v.is_empty()));
    }
}
