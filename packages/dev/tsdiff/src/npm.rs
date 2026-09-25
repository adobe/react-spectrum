//! Query the npm registry to discover published packages and their latest versions.

use std::collections::HashMap;
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

/// Check which of `names` are published to npm under `tag`, and at which
/// version. Returns only the packages that are published.
///
/// The caller supplies the names: [`crate::workspaces::discover`] is the
/// single, config-driven source of truth for a repo's package set, so this
/// module no longer walks the filesystem itself.
pub async fn get_published_packages(
    names: Vec<String>,
    concurrency: usize,
    tag: &str,
) -> Result<Vec<PublishedPackage>> {
    let local_packages = names;
    let client = reqwest::Client::builder()
        .user_agent("tsdiff")
        .build()?;

    println!(
        "Checking {} packages against npm registry (concurrency: {concurrency})...",
        local_packages.len()
    );

    let results: Vec<(String, Option<PublishedPackage>)> = stream::iter(local_packages)
        .map(|name| {
            let client = client.clone();
            let tag = tag.to_string();
            async move {
                let name_for_log = name.clone();
                let pkg = match check_published(&client, &name, &tag).await {
                    Ok(pkg) => pkg,
                    Err(e) => {
                        eprintln!("  warn: failed to check {name}: {e}");
                        None
                    }
                };
                (name_for_log, pkg)
            }
        })
        .buffer_unordered(concurrency)
        .collect()
        .await;

    let mut published = Vec::new();
    let mut dropped = Vec::new();
    for (name, pkg) in results {
        match pkg {
            Some(p) => published.push(p),
            None => dropped.push(name),
        }
    }

    // Surface dropped packages loudly so "package missing from diff" doesn't
    // silently hide behind a registry lookup miss.
    if !dropped.is_empty() {
        eprintln!(
            "  warn: {} package{} not published under tag `{tag}` — excluded from diff:",
            dropped.len(),
            if dropped.len() == 1 { "" } else { "s" }
        );
        for name in &dropped {
            eprintln!("    • {name}");
        }
        if tag != "latest" {
            eprintln!("    (consider retrying with --tag latest if these packages only have stable releases)");
        }
    }

    println!("Found {} published packages", published.len());
    Ok(published)
}

#[cfg(test)]
mod tests {
    use super::*;

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
