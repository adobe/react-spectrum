//! Helpers for setting up temporary workspaces and running subprocesses.

use std::path::Path;
use std::process::Stdio;

use anyhow::{bail, Context, Result};
use tokio::process::Command;

/// Run a command, inheriting stdio. Fails if exit code is non-zero.
///
/// For the long-running, chatty subprocesses (`git fetch`, `yarn install`,
/// `yarn build`, …) where the user wants to see live output rather than a
/// captured blob after the fact.
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

/// [`run`] for a configured argv (e.g. `RepoConfig::install`), where the
/// program and its arguments arrive as one owned list rather than a
/// compile-time `&[&str]`.
pub async fn run_argv(argv: &[String], cwd: &Path) -> Result<()> {
    let Some((cmd, args)) = argv.split_first() else {
        bail!("empty command \u{2014} check `install`/`build` in your tsdiff.json");
    };
    let args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    run(cmd, &args, cwd).await
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
        "name": "tsdiff-workspace",
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
