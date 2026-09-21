//! `get-ref-api` command: builds an arbitrary git ref's API into a snapshot
//! directory (default `dist/base-api`), so a user can `compare` their local
//! branch against a *built* ref instead of against published npm.
//!
//! Mechanism: snapshot the ref's tracked files with `git archive` + `tar` —
//! a pure read of the object store (no worktree, no clone) that never
//! touches the working tree or `.git` — then run `yarn install` + `yarn
//! build` inside that throwaway copy, then extract via the same
//! `crate::extract::extract_packages` pipeline `get-local-api` uses.
//!
//! Hard constraint: the ONLY write to the user's repo is the api.json tree
//! into `output_dir`. Nothing here touches the working tree, root
//! `node_modules`, tracked files, or git state — except `--fetch`, which is
//! opt-in and only ever updates remote-tracking refs.

use std::path::{Path, PathBuf};
use std::process::Stdio;

use anyhow::{bail, Context, Result};
use tempfile::{NamedTempFile, TempDir};

use crate::extract::{discover_packages_fs, extract_packages, ExtractOpts, PackageEntry};
use crate::workspace::{run, run_capture};
use crate::workspaces::discover_workspaces;

#[derive(Debug)]
pub struct GetRefOpts {
    /// Root of the monorepo (the git repo the ref is snapshotted from).
    pub repo_root: PathBuf,
    /// Where to write the extracted API files.
    pub output_dir: PathBuf,
    /// Git ref (branch, tag, or SHA) to build.
    pub git_ref: String,
    /// Run `git fetch` first, so e.g. `--ref origin/main` is truly latest.
    /// Off by default — the only thing allowed to touch `.git`, and only
    /// remote-tracking refs.
    pub fetch: bool,
    /// Keep the temp build directory instead of removing it when the
    /// command finishes. Useful for debugging a failed build.
    pub keep: bool,
}

pub async fn execute(opts: GetRefOpts) -> Result<()> {
    let repo_root = std::fs::canonicalize(&opts.repo_root)
        .with_context(|| format!("resolving repo root {}", opts.repo_root.display()))?;

    if opts.fetch {
        println!("Fetching remote refs (git fetch --quiet)...");
        // Non-fatal: the user may be offline, or `--ref` may already resolve
        // locally. Bailing here would defeat the point of `--fetch` being
        // opt-in, so just warn and continue with whatever refs we have.
        if let Err(e) = run("git", &["fetch", "--quiet"], &repo_root).await {
            eprintln!("warning: `git fetch` failed, continuing with local refs: {e}");
        }
    }

    verify_ref(&repo_root, &opts.git_ref).await?;

    let tmp = TempDir::new().context("creating temp directory")?;
    let tmp_path = tmp.path().to_path_buf();

    // Run the real work in an inner block so the `--keep` handling below
    // always runs — on success AND on an early `?` return — mirroring
    // `extract_packages`'s work_dir cleanup pattern in `extract.rs`.
    let result: Result<()> = async {
        println!("Snapshotting `{}` into {}", opts.git_ref, tmp_path.display());
        snapshot_ref(&repo_root, &opts.git_ref, &tmp_path)?;

        // Clean output directory first (mirrors get_local/get_published):
        // extract_packages recreates it.
        if opts.output_dir.exists() {
            std::fs::remove_dir_all(&opts.output_dir)
                .context("removing existing output directory")?;
        }

        println!("Installing dependencies (yarn install --no-immutable)...");
        run("yarn", &["install", "--no-immutable"], &tmp_path).await?;

        println!("Building `{}` (yarn build)...", opts.git_ref);
        run("yarn", &["build"], &tmp_path).await?;

        // Prefer yarn's workspace list (honors the ref's workspaces globs +
        // private flag); fall back to a filesystem walk when yarn is
        // unavailable. Both already exclude packages/dev/**.
        let entries: Vec<PackageEntry> = match discover_workspaces(&tmp_path).await? {
            Some(workspaces) => {
                println!(
                    "Using yarn workspaces list: {} public packages",
                    workspaces.len()
                );
                workspaces
                    .into_iter()
                    .map(|w| PackageEntry { name: w.name, dir: w.location, private: false })
                    .collect()
            }
            None => {
                println!("yarn workspaces list unavailable — using filesystem walk");
                discover_packages_fs(&tmp_path.join("packages"))
            }
        };

        // check_build_freshness = false: an archived snapshot is immutable,
        // so its src-vs-dist mtimes are meaningless.
        extract_packages(
            &entries,
            &ExtractOpts {
                repo_root: tmp_path.clone(),
                output_dir: opts.output_dir.clone(),
                check_build_freshness: false,
                allow_empty: false,
            },
        )
        .await?;

        println!(
            "\n`{}` API extracted to {}",
            opts.git_ref,
            opts.output_dir.display()
        );
        Ok(())
    }
    .await;

    if opts.keep {
        let kept = tmp.keep();
        println!("Kept temp build dir at {}", kept.display());
    }
    // else: `tmp` drops here, removing the temp dir.

    result
}

/// Verify that `git_ref` resolves to a real commit, without touching the
/// working tree. Runs before we spend time creating a temp dir and
/// snapshotting, so a typo'd `--ref` fails fast with a clear message.
async fn verify_ref(repo_root: &Path, git_ref: &str) -> Result<()> {
    let spec = format!("{git_ref}^{{commit}}");
    run_capture("git", &["rev-parse", "--verify", "--quiet", &spec], repo_root)
        .await
        .with_context(|| format!("unknown git ref `{git_ref}`"))?;
    Ok(())
}

/// Snapshot a git ref's tracked files into `dest` via `git archive` + `tar`.
///
/// A pure read of the object store: no worktree, no clone, and it never
/// touches the working tree or `.git` beyond the read itself.
pub fn snapshot_ref(repo_root: &Path, git_ref: &str, dest: &Path) -> Result<()> {
    std::fs::create_dir_all(dest)
        .with_context(|| format!("creating snapshot destination {}", dest.display()))?;

    // Write the archive to a private tempfile — auto-deleted on drop, even on
    // an early return below — rather than piping `git archive | tar`, which
    // keeps both subprocess calls plain argv invocations with no shell.
    let tar_file =
        NamedTempFile::new().context("creating temp file for git archive")?;

    let archive = std::process::Command::new("git")
        .current_dir(repo_root)
        .arg("archive")
        .arg("--format=tar")
        .arg("-o")
        .arg(tar_file.path())
        .arg(git_ref)
        .stdin(Stdio::null())
        .output()
        .with_context(|| format!("failed to spawn `git archive` for ref `{git_ref}`"))?;
    if !archive.status.success() {
        bail!(
            "unknown git ref `{git_ref}` (git archive failed):\n{}",
            String::from_utf8_lossy(&archive.stderr).trim()
        );
    }

    let tar = std::process::Command::new("tar")
        .arg("-xf")
        .arg(tar_file.path())
        .arg("-C")
        .arg(dest)
        .stdin(Stdio::null())
        .output()
        .context("failed to spawn `tar`")?;
    if !tar.status.success() {
        bail!(
            "failed to extract snapshot of `{git_ref}` into {}:\n{}",
            dest.display(),
            String::from_utf8_lossy(&tar.stderr).trim()
        );
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn git_available() -> bool {
        std::process::Command::new("git")
            .arg("--version")
            .stdin(Stdio::null())
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    /// crate dir is rsp-api-checker/; the react-spectrum repo root is its parent.
    fn repo_root() -> PathBuf {
        Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap().to_path_buf()
    }

    #[test]
    fn snapshot_ref_archives_head_into_dest() {
        if !git_available() {
            eprintln!("skipping: git not available");
            return;
        }
        let root = repo_root();
        let dest = TempDir::new().unwrap();

        snapshot_ref(&root, "HEAD", dest.path()).expect("snapshot_ref failed on HEAD");

        assert!(
            dest.path().join("package.json").exists(),
            "missing package.json in snapshot at {}",
            dest.path().display()
        );
        assert!(
            dest.path().join("rsp-api-checker").join("Cargo.toml").exists(),
            "missing rsp-api-checker/Cargo.toml in snapshot at {}",
            dest.path().display()
        );
    }

    #[test]
    fn snapshot_ref_errors_on_bogus_ref() {
        if !git_available() {
            eprintln!("skipping: git not available");
            return;
        }
        let root = repo_root();
        let dest = TempDir::new().unwrap();
        let bogus = "definitely-not-a-real-ref-xyz123";

        let err = snapshot_ref(&root, bogus, dest.path())
            .expect_err("expected snapshot_ref to fail on a bogus ref");
        assert!(
            err.to_string().contains(bogus),
            "expected error to mention the bogus ref, got: {err}"
        );
    }

    /// `execute` must validate the ref *before* touching `output_dir` — the
    /// hard constraint is that the only write to the user's repo is the
    /// api.json tree, and that should never happen for a `--ref` that
    /// doesn't even exist. Fast: bails before any yarn install/build.
    #[tokio::test]
    async fn execute_errors_early_on_bogus_ref_without_touching_output_dir() {
        if !git_available() {
            eprintln!("skipping: git not available");
            return;
        }
        let root = repo_root();
        let out = TempDir::new().unwrap();
        let output_dir = out.path().join("should-not-be-created");
        let bogus = "definitely-not-a-real-ref-xyz123".to_string();

        let result = execute(GetRefOpts {
            repo_root: root,
            output_dir: output_dir.clone(),
            git_ref: bogus.clone(),
            fetch: false,
            keep: false,
        })
        .await;

        let err = result.expect_err("expected execute to fail on a bogus ref");
        assert!(
            err.to_string().contains(&bogus),
            "expected error to mention the bogus ref, got: {err}"
        );
        assert!(
            !output_dir.exists(),
            "execute must not create output_dir before validating the ref"
        );
    }
}
