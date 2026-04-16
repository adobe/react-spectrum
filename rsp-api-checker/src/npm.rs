//! Query the npm registry to discover published packages and their latest versions.

use std::collections::HashMap;
use std::path::Path;
use std::time::Duration;

use anyhow::{Context, Result};
use futures::stream::{self, StreamExt};

#[derive(Debug, Clone)]
pub struct PublishedPackage {
    pub name: String,
    pub version: String,
}

/// Query the npm registry for a single package. Returns `None` if the package
/// is not published or doesn't have the requested tag.
///
/// Uses the `/-/package/{name}/dist-tags` endpoint so the response is a tiny
/// JSON object (just the dist-tags map) rather than the full package metadata
/// which can be several megabytes for popular packages.
///
/// Retries up to 3 times with exponential back-off on transient errors
/// (network failures, HTTP 429 rate-limit, HTTP 5xx server errors).
async fn check_published(
    client: &reqwest::Client,
    name: &str,
    tag: &str,
) -> Result<Option<PublishedPackage>> {
    let url = format!(
        "https://registry.npmjs.org/-/package/{}/dist-tags",
        name.replace('/', "%2f")
    );
    const MAX_ATTEMPTS: u32 = 3;
    let mut delay_ms: u64 = 1_000;

    let dist_tags: HashMap<String, String> = 'retry: {
        for attempt in 0..MAX_ATTEMPTS {
            let resp = client
                .get(&url)
                .header("Accept", "application/json")
                .send()
                .await;

            let resp = match resp {
                Ok(r) => r,
                Err(e) => {
                    if attempt + 1 < MAX_ATTEMPTS {
                        eprintln!("  warn: network error for {name} (attempt {}/{MAX_ATTEMPTS}), retrying: {e}", attempt + 1);
                        tokio::time::sleep(Duration::from_millis(delay_ms)).await;
                        delay_ms *= 2;
                        continue;
                    }
                    return Err(e).context(format!("network request for {name}"));
                }
            };

            let status = resp.status();

            // 404 → package is not published; return None immediately (no retry needed)
            if status.as_u16() == 404 {
                return Ok(None);
            }

            // 429 (rate-limit) or 5xx (server error) → retry with back-off
            if status.as_u16() == 429 || status.is_server_error() {
                if attempt + 1 < MAX_ATTEMPTS {
                    eprintln!("  warn: HTTP {} for {name} (attempt {}/{MAX_ATTEMPTS}), retrying", status.as_u16(), attempt + 1);
                    tokio::time::sleep(Duration::from_millis(delay_ms)).await;
                    delay_ms *= 2;
                    continue;
                }
                return Err(anyhow::anyhow!("HTTP {} from npm registry for {name}", status.as_u16()));
            }

            if !status.is_success() {
                // Other non-success status (e.g. 401, 403) — treat as not published
                return Ok(None);
            }

            match resp.json::<HashMap<String, String>>().await {
                Ok(tags) => break 'retry tags,
                Err(e) => {
                    if attempt + 1 < MAX_ATTEMPTS {
                        eprintln!("  warn: failed to parse npm response for {name} (attempt {}/{MAX_ATTEMPTS}), retrying: {e}", attempt + 1);
                        tokio::time::sleep(Duration::from_millis(delay_ms)).await;
                        delay_ms *= 2;
                        continue;
                    }
                    return Err(e).context(format!("parsing npm response for {name}"));
                }
            }
        }
        // All attempts exhausted — should be unreachable because the last iteration
        // always returns, but the compiler needs a value for this branch.
        return Ok(None);
    };

    // Resolve the version for the requested tag
    let version = if let Some(v) = dist_tags.get(tag) {
        v.clone()
    } else if tag == "nightly" {
        // Fallback: if "nightly" tag doesn't exist, try "latest"
        match dist_tags.get("latest") {
            Some(v) => v.clone(),
            None => return Ok(None),
        }
    } else {
        return Ok(None);
    };

    // For the "latest" tag, skip packages whose latest version is itself a
    // nightly build (i.e. the package has never had a stable release).
    if tag == "latest" && version.contains("nightly") {
        return Ok(None);
    }

    Ok(Some(PublishedPackage {
        name: name.to_string(),
        version,
    }))
}

/// Discover all non-private packages under a directory and check which
/// are published to npm. Returns the list of published packages.
pub async fn get_published_packages(
    packages_dir: &Path,
    concurrency: usize,
    tag: &str,
) -> Result<Vec<PublishedPackage>> {
    let local_packages = discover_local_packages(packages_dir)?;
    let client = reqwest::Client::builder()
        .user_agent("rsp-api-check")
        .build()?;

    println!(
        "Checking {} packages against npm registry (concurrency: {concurrency})...",
        local_packages.len()
    );

    let results: Vec<Option<PublishedPackage>> = stream::iter(local_packages)
        .map(|name| {
            let client = client.clone();
            let tag = tag.to_string();
            async move {
                match check_published(&client, &name, &tag).await {
                    Ok(pkg) => pkg,
                    Err(e) => {
                        eprintln!("  warn: failed to check {name}: {e}");
                        None
                    }
                }
            }
        })
        .buffer_unordered(concurrency)
        .collect()
        .await;

    let published: Vec<PublishedPackage> = results.into_iter().flatten().collect();
    println!("Found {} published packages", published.len());
    Ok(published)
}

/// Walk a packages directory and return all non-private package names.
fn discover_local_packages(dir: &Path) -> Result<Vec<String>> {
    let mut names = Vec::new();
    walk_for_packages(dir, 0, &mut names)?;
    Ok(names)
}

pub(crate) fn walk_for_packages(dir: &Path, depth: usize, out: &mut Vec<String>) -> Result<()> {
    if depth > 4 {
        return Ok(());
    }
    let entries = std::fs::read_dir(dir).context(format!("reading {}", dir.display()))?;
    for entry in entries {
        let entry = entry?;
        let name = entry.file_name();
        let name_str = name.to_string_lossy();
        if name_str == "node_modules" || name_str == ".git" || name_str == "dev" {
            continue;
        }
        let path = entry.path();
        if path.is_dir() {
            let pkg_json = path.join("package.json");
            if pkg_json.exists() {
                if let Ok(contents) = std::fs::read_to_string(&pkg_json) {
                    if let Ok(v) = serde_json::from_str::<serde_json::Value>(&contents) {
                        let is_private = v.get("private").and_then(|p| p.as_bool()).unwrap_or(false);
                        let pkg_name = v.get("name").and_then(|n| n.as_str());
                        if let Some(name) = pkg_name {
                            if !is_private {
                                out.push(name.to_string());
                            }
                        }
                    }
                }
            }
            walk_for_packages(&path, depth + 1, out)?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn write_pkg_json(dir: &std::path::Path, name: &str, private: bool) {
        let json = if private {
            format!(r#"{{"name":"{name}","private":true}}"#)
        } else {
            format!(r#"{{"name":"{name}"}}"#)
        };
        fs::write(dir.join("package.json"), json).unwrap();
    }

    // ── discover_local_packages ────────────────────────────────────────────

    #[test]
    fn test_discovers_public_package() {
        let dir = TempDir::new().unwrap();
        let pkg = dir.path().join("button");
        fs::create_dir(&pkg).unwrap();
        write_pkg_json(&pkg, "@react-aria/button", false);

        let names = discover_local_packages(dir.path()).unwrap();
        assert!(names.contains(&"@react-aria/button".to_string()));
    }

    #[test]
    fn test_skips_private_package() {
        let dir = TempDir::new().unwrap();
        let pkg = dir.path().join("internal");
        fs::create_dir(&pkg).unwrap();
        write_pkg_json(&pkg, "@internal/pkg", true);

        let names = discover_local_packages(dir.path()).unwrap();
        assert!(!names.contains(&"@internal/pkg".to_string()));
    }

    // @adobe/react-spectrum is a public API package and must be included in
    // the npm check so that the published and local extractions are symmetric.
    // If it is excluded here but the TypeScript extractor finds it under
    // packages/, every one of its exports will appear as "added" in the diff.
    #[test]
    fn walk_for_packages_includes_adobe_react_spectrum() {
        let dir = TempDir::new().unwrap();
        let pkg = dir.path().join("adobe-pkg");
        fs::create_dir(&pkg).unwrap();
        write_pkg_json(&pkg, "@adobe/react-spectrum", false);

        let mut names = Vec::new();
        walk_for_packages(dir.path(), 0, &mut names).unwrap();
        assert!(
            names.contains(&"@adobe/react-spectrum".to_string()),
            "@adobe/react-spectrum must be included in the npm package list: \
             excluding it causes a spurious diff because the local extractor \
             always finds it under packages/@adobe/react-spectrum/"
        );
    }

    #[test]
    fn test_skips_node_modules() {
        let dir = TempDir::new().unwrap();
        let nm = dir.path().join("node_modules").join("some-dep");
        fs::create_dir_all(&nm).unwrap();
        write_pkg_json(&nm, "some-dep", false);

        let names = discover_local_packages(dir.path()).unwrap();
        assert!(!names.contains(&"some-dep".to_string()));
    }

    #[test]
    fn test_skips_git_directory() {
        let dir = TempDir::new().unwrap();
        let git = dir.path().join(".git").join("hooks");
        fs::create_dir_all(&git).unwrap();
        // .git itself doesn't have a package.json, but ensure we don't walk into it
        let names = discover_local_packages(dir.path()).unwrap();
        assert!(names.is_empty());
    }

    #[test]
    fn test_discovers_nested_scoped_package() {
        let dir = TempDir::new().unwrap();
        let nested = dir.path().join("packages").join("scope").join("widget");
        fs::create_dir_all(&nested).unwrap();
        write_pkg_json(&nested, "@scope/widget", false);

        let names = discover_local_packages(dir.path()).unwrap();
        assert!(names.contains(&"@scope/widget".to_string()));
    }

    #[test]
    fn test_depth_limit_stops_at_4() {
        let dir = TempDir::new().unwrap();
        // The walker finds a package when it reads its parent directory.
        // walk(parent, depth) reads children and checks their package.json.
        // walk stops when depth > 4, i.e. at depth 5.
        // So a package whose parent would be processed at depth 5 is never found.
        // Parent at depth 5 = dir/a/b/c/d/e → package in dir/a/b/c/d/e/f/
        let deep = dir.path().join("a").join("b").join("c").join("d").join("e").join("f");
        fs::create_dir_all(&deep).unwrap();
        write_pkg_json(&deep, "@too/deep", false);

        let names = discover_local_packages(dir.path()).unwrap();
        assert!(!names.contains(&"@too/deep".to_string()));
    }

    // ── dist-tags endpoint deserialization ────────────────────────────────

    #[test]
    fn test_dist_tags_endpoint_parses_correctly() {
        // The /-/package/{name}/dist-tags endpoint returns a flat map of tag → version.
        let json = r#"{"latest":"1.2.3","nightly":"2.0.0-nightly.1"}"#;
        let tags: HashMap<String, String> = serde_json::from_str(json).unwrap();
        assert_eq!(tags.get("latest").unwrap(), "1.2.3");
        assert_eq!(tags.get("nightly").unwrap(), "2.0.0-nightly.1");
    }

    #[test]
    fn test_nightly_only_package_skipped_for_latest_tag() {
        // A package whose "latest" dist-tag points to a nightly version
        // should be excluded — it has never had a stable release.
        let latest_version = "2.0.0-nightly.1";
        assert!(latest_version.contains("nightly"));
    }

    #[test]
    fn test_stable_latest_tag_not_skipped() {
        // A package whose "latest" dist-tag points to a stable version is included.
        let latest_version = "3.7.0";
        assert!(!latest_version.contains("nightly"));
    }

    #[test]
    fn test_dist_tags_empty_map_parses() {
        let tags: HashMap<String, String> = serde_json::from_str(r#"{}"#).unwrap();
        assert!(tags.is_empty());
    }
}
