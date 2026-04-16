//! Query the npm registry to discover published packages and their latest versions.

use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result};
use futures::stream::{self, StreamExt};
use serde::Deserialize;

#[derive(Debug, Clone)]
pub struct PublishedPackage {
    pub name: String,
    pub version: String,
}

#[derive(Deserialize)]
struct NpmRegistryResponse {
    #[serde(default, rename = "dist-tags")]
    dist_tags: HashMap<String, String>,
    #[serde(default)]
    versions: HashMap<String, serde_json::Value>,
}

/// Query the npm registry for a single package. Returns `None` if the package
/// is not published or doesn't have the requested tag.
async fn check_published(
    client: &reqwest::Client,
    name: &str,
    tag: &str,
) -> Result<Option<PublishedPackage>> {
    let url = format!("https://registry.npmjs.org/{}", name.replace('/', "%2f"));
    let resp = client
        .get(&url)
        .header("Accept", "application/json")
        .send()
        .await;

    let resp = match resp {
        Ok(r) => r,
        Err(_) => return Ok(None),
    };

    if !resp.status().is_success() {
        return Ok(None);
    }

    let body: NpmRegistryResponse = match resp.json().await {
        Ok(b) => b,
        Err(_) => return Ok(None),
    };

    // Check if the requested tag exists
    let version = if let Some(v) = body.dist_tags.get(tag) {
        v.clone()
    } else if tag == "nightly" {
        // Fallback: if "nightly" tag doesn't exist, try "latest"
        match body.dist_tags.get("latest") {
            Some(v) => v.clone(),
            None => return Ok(None),
        }
    } else {
        return Ok(None);
    };

    // For "latest" tag, skip packages that only have nightly versions
    if tag == "latest" {
        let has_stable = body.versions.keys().any(|v| !v.contains("nightly"));
        if !has_stable {
            return Ok(None);
        }
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

    // ── NpmRegistryResponse deserialization ────────────────────────────────

    #[test]
    fn test_registry_response_parses_dist_tags() {
        let json = r#"{
            "dist-tags": {"latest":"1.2.3","nightly":"2.0.0-nightly.1"},
            "versions":{"1.2.3":{},"1.1.0":{}}
        }"#;
        let resp: NpmRegistryResponse = serde_json::from_str(json).unwrap();
        assert_eq!(resp.dist_tags.get("latest").unwrap(), "1.2.3");
        assert_eq!(resp.dist_tags.get("nightly").unwrap(), "2.0.0-nightly.1");
        assert_eq!(resp.versions.len(), 2);
    }

    #[test]
    fn test_registry_response_stable_version_check() {
        let json = r#"{"versions":{"2.0.0-nightly.1":{}}}"#;
        let resp: NpmRegistryResponse = serde_json::from_str(json).unwrap();
        let has_stable = resp.versions.keys().any(|v| !v.contains("nightly"));
        assert!(!has_stable, "nightly-only package should have no stable version");
    }

    #[test]
    fn test_registry_response_mixed_versions_has_stable() {
        let json = r#"{"versions":{"1.0.0":{},"2.0.0-nightly.1":{}}}"#;
        let resp: NpmRegistryResponse = serde_json::from_str(json).unwrap();
        let has_stable = resp.versions.keys().any(|v| !v.contains("nightly"));
        assert!(has_stable);
    }

    #[test]
    fn test_registry_response_empty_defaults() {
        let resp: NpmRegistryResponse = serde_json::from_str(r#"{}"#).unwrap();
        assert!(resp.dist_tags.is_empty());
        assert!(resp.versions.is_empty());
    }
}
