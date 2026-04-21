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

/// Run `npm install …`, capturing stderr. On failure, parse the output for
/// 404 / ETARGET entries so we can tell the user *which* package(s) npm could
/// not resolve — not just "the whole thing exploded".
pub async fn run_npm_install(args: &[&str], cwd: &Path) -> Result<()> {
    println!("  $ npm {}", args.join(" "));
    let output = Command::new("npm")
        .args(args)
        .current_dir(cwd)
        .stdin(Stdio::null())
        .stdout(Stdio::inherit())
        .stderr(Stdio::piped())
        .output()
        .await
        .context("failed to spawn `npm`")?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    // Forward the raw stderr so the user still sees npm's own message.
    eprint!("{stderr}");

    let unresolved = extract_unresolved_packages(&stderr);
    if !unresolved.is_empty() {
        eprintln!();
        eprintln!("npm could not resolve the following package{}:", if unresolved.len() == 1 { "" } else { "s" });
        for pkg in &unresolved {
            eprintln!("  • {pkg}");
        }
        eprintln!();
        eprintln!(
            "This usually means the package isn't published under the requested \
             dist-tag. Retry with `--tag next` or check `npm view <pkg> dist-tags` \
             for the available tags."
        );
    }

    bail!("`npm {}` exited with {}", args.join(" "), output.status);
}

/// Parse npm's stderr for 404 / ETARGET / ENOVERSIONS entries. npm emits
/// messages like `npm error 404 'react-aria@latest' is not in this registry.`
/// or `npm ERR! code ETARGET` followed by a line naming the package. We keep
/// the extraction permissive — missing an entry is better than listing the
/// wrong one.
fn extract_unresolved_packages(stderr: &str) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for line in stderr.lines() {
        // 404 lines: `npm error 404  '@scope/name@latest' is not in this registry`
        // or the older `npm ERR! 404 Not Found - GET https://.../name`.
        if line.contains("404") {
            if let Some(pkg) = extract_quoted_pkg_spec(line) {
                if !out.contains(&pkg) {
                    out.push(pkg);
                }
                continue;
            }
        }
        // ETARGET / ENOVERSIONS: npm prints `No matching version found for name@spec.`
        if line.contains("No matching version found for ") {
            if let Some(idx) = line.find("No matching version found for ") {
                let rest = &line[idx + "No matching version found for ".len()..];
                let pkg = rest
                    .trim_end_matches('.')
                    .trim_end_matches(' ')
                    .to_string();
                if !pkg.is_empty() && !out.contains(&pkg) {
                    out.push(pkg);
                }
            }
        }
    }
    out
}

/// Extract the first `'...'` or `"..."` quoted package spec from a line.
fn extract_quoted_pkg_spec(line: &str) -> Option<String> {
    for quote in ['\'', '"'] {
        if let Some(start) = line.find(quote) {
            if let Some(end) = line[start + 1..].find(quote) {
                let spec = &line[start + 1..start + 1 + end];
                // Heuristic: must look like a package spec (contains @ or is a bare name)
                if !spec.is_empty() && !spec.contains(' ') {
                    return Some(spec.to_string());
                }
            }
        }
    }
    None
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
///
/// When `workspaces_file` is `Some`, its path is passed through as
/// `--workspaces-file` so the extractor uses the yarn-supplied list instead
/// of doing its own fs-walk.
pub async fn run_extractor(
    packages_dir: &Path,
    output_dir: &Path,
    check_build_freshness: bool,
    workspaces_file: Option<&Path>,
) -> Result<()> {
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
    let abs_packages_str = abs_packages.to_str().unwrap().to_string();
    let abs_output_str = abs_output.to_str().unwrap().to_string();
    let workspaces_str = workspaces_file.map(|p| p.to_string_lossy().into_owned());

    let mut extractor_args: Vec<&str> = vec![
        "tsx",
        script.to_str().unwrap(),
        "--packages-dir",
        &abs_packages_str,
        "--output-dir",
        &abs_output_str,
    ];
    // Only meaningful against the local workspace — published tarballs are
    // immutable, so mtimes there don't represent "out of date".
    if check_build_freshness {
        extractor_args.push("--check-build-freshness");
    }
    if let Some(ws) = &workspaces_str {
        extractor_args.push("--workspaces-file");
        extractor_args.push(ws);
    }
    run("npx", &extractor_args, script_dir).await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_404_quoted_package_specs() {
        let stderr = "\
npm error code E404
npm error 404 Not Found - GET https://registry.npmjs.org/@react-aria%2fmissing - Not found
npm error 404
npm error 404  '@react-aria/missing@latest' is not in this registry.
";
        let pkgs = extract_unresolved_packages(stderr);
        assert!(
            pkgs.contains(&"@react-aria/missing@latest".to_string()),
            "expected @react-aria/missing@latest in {pkgs:?}"
        );
    }

    #[test]
    fn extracts_etarget_no_matching_version() {
        let stderr = "\
npm error code ETARGET
npm error notarget No matching version found for @scope/pkg@next.
";
        let pkgs = extract_unresolved_packages(stderr);
        assert!(
            pkgs.contains(&"@scope/pkg@next".to_string()),
            "expected @scope/pkg@next in {pkgs:?}"
        );
    }

    #[test]
    fn deduplicates_repeated_mentions() {
        let stderr = "\
npm error 404  'a@latest' is not in this registry.
npm error 404  'a@latest' is not in this registry.
";
        let pkgs = extract_unresolved_packages(stderr);
        assert_eq!(pkgs, vec!["a@latest".to_string()]);
    }

    #[test]
    fn returns_empty_when_no_patterns_match() {
        let stderr = "npm warn deprecated foo@1\nsomething went wrong\n";
        assert!(extract_unresolved_packages(stderr).is_empty());
    }
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
