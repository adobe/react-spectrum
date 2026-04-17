//! Helpers for setting up temporary workspaces and running subprocesses.

use std::path::{Path, PathBuf};
use std::process::Stdio;

use anyhow::{bail, Context, Result};
use tokio::process::Command;

/// Run a command, inheriting stdio. Fails if exit code is non-zero.
pub async fn run(cmd: &str, args: &[&str], cwd: &Path) -> Result<()> {
    println!("  $ {} {}", cmd, args.join(" "));
    let status = Command::new(cmd)
        .args(args)
        .current_dir(cwd)
        .stdin(Stdio::null())
        .status()
        .await
        .context(format!("failed to spawn `{cmd}`"))?;

    if !status.success() {
        bail!("`{cmd} {}` exited with {status}", args.join(" "));
    }
    Ok(())
}

/// Run a command and capture stdout.
pub async fn run_capture(cmd: &str, args: &[&str], cwd: &Path) -> Result<String> {
    let output = Command::new(cmd)
        .args(args)
        .current_dir(cwd)
        .stdin(Stdio::null())
        .stderr(Stdio::inherit())
        .output()
        .await
        .context(format!("failed to spawn `{cmd}`"))?;

    if !output.status.success() {
        bail!(
            "`{cmd} {}` exited with {}",
            args.join(" "),
            output.status
        );
    }
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

/// Resolve the path to the ts-extractor script, looking in several locations.
pub fn find_extractor_script() -> Result<PathBuf> {
    // 1. Next to the binary
    let exe = std::env::current_exe()?;
    let exe_dir = exe.parent().unwrap();
    let candidates = [
        exe_dir.join("ts-extractor").join("extract-api.ts"),
        exe_dir
            .join("..")
            .join("ts-extractor")
            .join("extract-api.ts"),
        // When running from the project directory
        PathBuf::from("ts-extractor").join("extract-api.ts"),
    ];

    for candidate in &candidates {
        if candidate.exists() {
            return Ok(candidate.canonicalize()?);
        }
    }

    bail!(
        "Could not find ts-extractor/extract-api.ts. \
         Looked in: {}",
        candidates
            .iter()
            .map(|p| p.display().to_string())
            .collect::<Vec<_>>()
            .join(", ")
    );
}

/// Run the TypeScript API extractor on a packages directory.
pub async fn run_extractor(packages_dir: &Path, output_dir: &Path, check_build_freshness: bool) -> Result<()> {
    let script = find_extractor_script()?;
    let script_dir = script.parent().unwrap();

    // Resolve to absolute paths so they work regardless of subprocess cwd
    let abs_packages = std::fs::canonicalize(packages_dir)
        .context(format!("resolving packages dir: {}", packages_dir.display()))?;
    let abs_output = std::env::current_dir()?.join(output_dir);
    std::fs::create_dir_all(&abs_output)
        .context(format!("creating output dir: {}", abs_output.display()))?;
    let abs_output = std::fs::canonicalize(&abs_output)?;

    // Ensure ts-extractor dependencies are installed
    let node_modules = script_dir.join("node_modules");
    if !node_modules.exists() {
        println!("Installing ts-extractor dependencies...");
        run("npm", &["install", "--no-audit", "--no-fund"], script_dir).await?;
    }

    println!("Running API extractor...");
    let mut extractor_args: Vec<&str> = vec![
        "tsx",
        script.to_str().unwrap(),
        "--packages-dir",
        abs_packages.to_str().unwrap(),
        "--output-dir",
        abs_output.to_str().unwrap(),
    ];
    // Only meaningful against the local workspace — published tarballs are
    // immutable, so mtimes there don't represent "out of date".
    if check_build_freshness {
        extractor_args.push("--check-build-freshness");
    }
    run("npx", &extractor_args, script_dir).await?;

    Ok(())
}

/// Write a minimal package.json for npm install.
pub fn write_package_json(dir: &Path, deps: &[(String, String)]) -> Result<()> {
    let mut pkg = serde_json::json!({
        "name": "rsp-api-check-workspace",
        "version": "0.0.0",
        "private": true,
        "dependencies": {}
    });

    let dep_obj = pkg.get_mut("dependencies").unwrap().as_object_mut().unwrap();
    for (name, version) in deps {
        dep_obj.insert(name.clone(), serde_json::Value::String(version.clone()));
    }

    std::fs::write(
        dir.join("package.json"),
        serde_json::to_string_pretty(&pkg)?,
    )?;
    Ok(())
}
