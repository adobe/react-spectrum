//! Diff engine: compares two rebuilt interface sets and produces human-readable output.

use std::collections::HashSet;
use std::path::Path;

use colored::*;
use indexmap::IndexMap;
use similar::{ChangeTag, TextDiff};

use crate::api_json::ApiJson;
use crate::interface_builder::{format_interface, rebuild_interfaces};
use crate::type_renderer::{
    follow_dependencies, follow_inverted_dependencies, invert_dependencies, RenderContext,
};

/// A single interface diff result.
#[derive(Debug)]
pub struct InterfaceDiff {
    /// Fully qualified name: `/@scope/package:ExportName`
    pub qualified_name: String,
    /// The formatted diff text (with +/- lines).
    pub diff_text: String,
    /// Other exports whose changes caused this one to change.
    pub changed_by: Vec<String>,
    /// Exports that are affected by this one changing.
    pub affects: Vec<String>,
}

/// Result of diffing one package pair.
pub struct PackageDiff {
    /// Display name like `@react-aria/button`
    pub package_name: String,
    pub diffs: Vec<InterfaceDiff>,
}

/// Compare a base api.json against a branch api.json for a single package.
pub fn diff_package(
    package_name: &str,
    base_json: &ApiJson,
    branch_json: &ApiJson,
    is_ci: bool,
) -> PackageDiff {
    let mut base_ctx = RenderContext::new();
    let mut branch_ctx = RenderContext::new();

    let base_interfaces = rebuild_interfaces(base_json, &mut base_ctx);
    let branch_interfaces = rebuild_interfaces(branch_json, &mut branch_ctx);

    // Union of all interface names, sorted alphabetically so diff output is
    // stable regardless of the order the TS compiler walked the exports.
    // (Compiler order depends on the entry-file array in `ts.createProgram`,
    // which is stable across runs but not guaranteed — and adding/removing an
    // export or re-ordering entry files would otherwise reshuffle the whole
    // output.)
    let all_names: Vec<String> = {
        let mut names: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();
        for k in base_interfaces.keys() {
            names.insert(k.clone());
        }
        for k in branch_interfaces.keys() {
            names.insert(k.clone());
        }
        names.into_iter().collect()
    };

    // Build combined dependency graph
    let mut all_deps = base_ctx.dependencies;
    for (k, v) in branch_ctx.dependencies {
        all_deps.entry(k).or_default().extend(v);
    }

    // First pass: find all changed exports
    let mut all_changed = HashSet::new();
    let mut raw_diffs: Vec<(String, String, String)> = Vec::new(); // (qualified, diff_text, base_text)

    for name in &all_names {
        let qualified = format!("{package_name}:{name}");

        let base_formatted = base_interfaces
            .get(name)
            .map(|e| format_interface(name, e))
            .unwrap_or_default();
        let branch_formatted = branch_interfaces
            .get(name)
            .map(|e| format_interface(name, e))
            .unwrap_or_default();

        if base_formatted == branch_formatted {
            raw_diffs.push((qualified, String::new(), base_formatted));
            continue;
        }

        let diff_text = compute_diff(&base_formatted, &branch_formatted, is_ci);

        if !diff_text.is_empty() {
            all_changed.insert(qualified.clone());
        }
        raw_diffs.push((qualified, diff_text, base_formatted));
    }

    // Second pass: annotate with dependency info
    let inverted = invert_dependencies(&all_deps);
    let mut diffs = Vec::new();

    for (qualified, diff_text, _) in raw_diffs {
        if diff_text.is_empty() {
            continue;
        }
        let changed_by = follow_dependencies(&qualified, &all_deps, &all_changed);
        let affects = follow_inverted_dependencies(&qualified, &inverted);

        diffs.push(InterfaceDiff {
            qualified_name: qualified,
            diff_text,
            changed_by,
            affects,
        });
    }

    PackageDiff {
        package_name: package_name.to_string(),
        diffs,
    }
}

/// How many unchanged lines to preserve on each side of a change.
const DIFF_CONTEXT: usize = 2;

/// Compute a colored/marked diff between two formatted interface strings.
///
/// Unchanged lines that are far from any change are collapsed to `...` so the
/// output stays readable for large interfaces. The first line (interface header)
/// and last line (closing `}`) are always shown so the output is self-contained.
fn compute_diff(base: &str, branch: &str, is_ci: bool) -> String {
    let text_diff = TextDiff::from_lines(base, branch);

    let has_changes = text_diff
        .iter_all_changes()
        .any(|c| c.tag() != ChangeTag::Equal);

    if !has_changes {
        return String::new();
    }

    // Collect all (tag, formatted_line) pairs, dropping blank Equal lines
    // (the blank line inserted between the interface header and its properties).
    let all_lines: Vec<(ChangeTag, String)> = text_diff
        .iter_all_changes()
        .filter_map(|change| {
            let line = change.to_string_lossy();
            let line = line.trim_end_matches('\n');
            if line.is_empty() && change.tag() == ChangeTag::Equal {
                return None;
            }
            let formatted = match change.tag() {
                ChangeTag::Delete => {
                    if is_ci {
                        format!("-{line}")
                    } else {
                        format!("-{line}").red().to_string()
                    }
                }
                ChangeTag::Insert => {
                    if is_ci {
                        format!("+{line}")
                    } else {
                        format!("+{line}").green().to_string()
                    }
                }
                ChangeTag::Equal => format!(" {line}"),
            };
            Some((change.tag(), formatted))
        })
        .collect();

    let n = all_lines.len();
    if n == 0 {
        return String::new();
    }

    // Decide which lines to keep: every changed line, DIFF_CONTEXT lines around
    // it, plus always the first (interface header) and last (closing brace).
    let mut keep = vec![false; n];
    keep[0] = true;
    keep[n - 1] = true;
    for i in 0..n {
        if all_lines[i].0 != ChangeTag::Equal {
            let lo = i.saturating_sub(DIFF_CONTEXT);
            let hi = (i + DIFF_CONTEXT + 1).min(n);
            for j in lo..hi {
                keep[j] = true;
            }
        }
    }

    // Emit kept lines; collapse each contiguous run of omitted lines to "   ...".
    let mut result_lines: Vec<String> = Vec::new();
    let mut in_gap = false;
    for i in 0..n {
        if keep[i] {
            in_gap = false;
            result_lines.push(all_lines[i].1.clone());
        } else if !in_gap {
            result_lines.push("   ...".to_string());
            in_gap = true;
        }
    }

    if is_ci {
        format!("```diff\n{}\n```", result_lines.join("\n"))
    } else {
        result_lines.join("\n")
    }
}

// ── High-level comparison across all packages ───────────────────────────────

/// A paired set of api.json files for one package.
pub struct ApiPair {
    pub package_name: String,
    pub base: ApiJson,
    pub branch: ApiJson,
}

/// Discover and pair api.json files from two directories.
pub fn discover_pairs(base_dir: &Path, branch_dir: &Path) -> anyhow::Result<Vec<ApiPair>> {
    let base_apis = find_api_jsons(base_dir)?;
    let branch_apis = find_api_jsons(branch_dir)?;

    let mut pairs = Vec::new();
    let mut matched_branch: HashSet<String> = HashSet::new();

    // Match base → branch
    for (name, base_path) in &base_apis {
        if let Some(branch_path) = branch_apis.get(name) {
            matched_branch.insert(name.clone());
            pairs.push(ApiPair {
                package_name: name.clone(),
                base: ApiJson::load(base_path)?,
                branch: ApiJson::load(branch_path)?,
            });
        } else {
            // Package removed in branch
            pairs.push(ApiPair {
                package_name: name.clone(),
                base: ApiJson::load(base_path)?,
                branch: ApiJson::default(),
            });
        }
    }

    // New packages in branch
    for (name, branch_path) in &branch_apis {
        if !matched_branch.contains(name) {
            // Check if it's a private package
            let pkg_json_path = branch_path
                .parent()
                .and_then(|p| p.parent())
                .map(|p| p.join("package.json"));
            let is_private = pkg_json_path
                .as_ref()
                .and_then(|p| std::fs::read_to_string(p).ok())
                .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok())
                .and_then(|v| v.get("private")?.as_bool())
                .unwrap_or(false);

            if !is_private {
                pairs.push(ApiPair {
                    package_name: name.clone(),
                    base: ApiJson::default(),
                    branch: ApiJson::load(branch_path)?,
                });
            }
        }
    }

    pairs.sort_by(|a, b| a.package_name.cmp(&b.package_name));
    Ok(pairs)
}

/// Find all api.json files under a directory, keyed by package name.
pub(crate) fn find_api_jsons(dir: &Path) -> anyhow::Result<IndexMap<String, std::path::PathBuf>> {
    let mut result = IndexMap::new();
    let pattern = dir.join("**").join("dist").join("api.json");
    let pattern_str = pattern.to_string_lossy();

    for entry in glob::glob(&pattern_str)? {
        let path = entry?;
        // Find the package.json next to the dist/ directory
        let pkg_dir = path.parent().and_then(|p| p.parent());
        if let Some(pkg_dir) = pkg_dir {
            let pkg_json = pkg_dir.join("package.json");
            if let Ok(contents) = std::fs::read_to_string(&pkg_json) {
                if let Ok(v) = serde_json::from_str::<serde_json::Value>(&contents) {
                    if let Some(name) = v.get("name").and_then(|n| n.as_str()) {
                        result.insert(name.to_string(), path);
                    }
                }
            }
        }
    }

    Ok(result)
}

// ── Output formatting ───────────────────────────────────────────────────────

/// Format the full comparison output.
pub fn format_output(package_diffs: &[PackageDiff], is_ci: bool) -> String {
    let mut sections = Vec::new();

    for pkg in package_diffs {
        if pkg.diffs.is_empty() {
            continue;
        }

        let mut changes = Vec::new();
        for diff in &pkg.diffs {
            let mut section = String::new();
            section.push_str(&format!("\n#### {}\n", diff.qualified_name));

            if !diff.changed_by.is_empty() {
                section.push_str("changed by:\n");
                for dep in &diff.changed_by {
                    section.push_str(&format!(" - {dep}\n"));
                }
                section.push('\n');
            }

            // Remove extra blank lines from the diff for readability
            let cleaned: String = diff
                .diff_text
                .lines()
                .filter(|l| !l.trim().is_empty() || l.starts_with("```"))
                .collect::<Vec<_>>()
                .join("\n");
            section.push_str(&cleaned);

            if !diff.affects.is_empty() {
                if is_ci {
                    section.push_str("\n<details>\n  <summary>it changed</summary>\n   <ul>\n");
                    for affected in &diff.affects {
                        section.push_str(&format!("     <li>{affected}</li>\n"));
                    }
                    section.push_str("   </ul>\n</details>\n");
                } else {
                    section.push_str("\nit changed:\n");
                    for affected in &diff.affects {
                        section.push_str(&format!(" - {affected}\n"));
                    }
                }
            }

            changes.push(section);
        }

        if !changes.is_empty() {
            let header = format!("\n### {}\n", pkg.package_name);
            let body = changes.join("\n");
            sections.push(format!("{header}{body}\n-----------------------------------\n"));
        }
    }

    sections.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::api_json::{ApiJson, ParameterMap, TypeNode};
    use indexmap::IndexMap;

    fn prop_node(name: &str, optional: bool, value: TypeNode) -> TypeNode {
        TypeNode::Property {
            name: name.into(),
            index_type: None,
            value: Box::new(value),
            optional,
            description: None,
            access: None,
            default: None,
        }
    }

    /// Build an Interface node. Pass `iface_name = None` to let the map key
    /// become the display name (used for new/removed export tests).
    fn iface_with_props(props: Vec<(&str, bool, TypeNode)>) -> TypeNode {
        iface_named(Some("ButtonProps"), props)
    }

    fn iface_named(iface_name: Option<&str>, props: Vec<(&str, bool, TypeNode)>) -> TypeNode {
        let mut map = IndexMap::new();
        for (n, opt, ty) in props {
            map.insert(n.into(), prop_node(n, opt, ty));
        }
        TypeNode::Interface {
            id: None,
            name: iface_name.map(str::to_string),
            properties: map,
            type_parameters: vec![],
            extends: vec![],
            description: None,
            access: None,
        }
    }

    fn api(key: &str, node: TypeNode) -> ApiJson {
        let mut exports = IndexMap::new();
        exports.insert(key.into(), node);
        ApiJson { exports, links: IndexMap::new() }
    }

    fn void_fn() -> TypeNode {
        TypeNode::Function {
            id: None,
            name: None,
            parameters: ParameterMap::Map(IndexMap::new()),
            return_type: Some(Box::new(TypeNode::Void)),
            type_parameters: vec![],
            description: None,
            access: None,
        }
    }

    // ── diff_package ───────────────────────────────────────────────────────

    #[test]
    fn test_identical_apis_produce_no_diffs() {
        let node = iface_with_props(vec![("isDisabled", true, TypeNode::Boolean { value: None })]);
        let base = api("@pkg:ButtonProps", node.clone());
        let branch = api("@pkg:ButtonProps", node);
        let result = diff_package("@pkg", &base, &branch, true);
        assert!(result.diffs.is_empty(), "expected no diffs for identical APIs");
    }

    #[test]
    fn test_added_property_shows_plus_line() {
        let base = api(
            "@pkg:ButtonProps",
            iface_with_props(vec![("isDisabled", true, TypeNode::Boolean { value: None })]),
        );
        let branch = api(
            "@pkg:ButtonProps",
            iface_with_props(vec![
                ("isDisabled", true, TypeNode::Boolean { value: None }),
                ("onPress", true, void_fn()),
            ]),
        );
        let result = diff_package("@pkg", &base, &branch, true);
        assert_eq!(result.diffs.len(), 1);
        assert!(result.diffs[0].diff_text.contains("onPress?:"), "expected onPress in diff");
        assert!(result.diffs[0].diff_text.contains('+'), "expected + marker for addition");
    }

    #[test]
    fn test_removed_property_shows_minus_line() {
        let base = api(
            "@pkg:ButtonProps",
            iface_with_props(vec![
                ("isDisabled", true, TypeNode::Boolean { value: None }),
                ("onPress", true, void_fn()),
            ]),
        );
        let branch = api(
            "@pkg:ButtonProps",
            iface_with_props(vec![("isDisabled", true, TypeNode::Boolean { value: None })]),
        );
        let result = diff_package("@pkg", &base, &branch, true);
        assert_eq!(result.diffs.len(), 1);
        assert!(result.diffs[0].diff_text.contains("onPress?:"), "expected onPress in diff");
        assert!(result.diffs[0].diff_text.contains('-'), "expected - marker for removal");
    }

    #[test]
    fn test_changed_type_shows_both_old_and_new() {
        let base = api(
            "@pkg:Props",
            iface_with_props(vec![("value", false, TypeNode::String { value: None })]),
        );
        let branch = api(
            "@pkg:Props",
            iface_with_props(vec![("value", false, TypeNode::Number { value: None })]),
        );
        let result = diff_package("@pkg", &base, &branch, true);
        assert_eq!(result.diffs.len(), 1);
        let text = &result.diffs[0].diff_text;
        assert!(text.contains("-  value: string"), "expected old type removed");
        assert!(text.contains("+  value: number"), "expected new type added");
    }

    #[test]
    fn test_new_export_in_branch_shows_as_added() {
        let base = ApiJson::default();
        // Use name: None so export_name() uses the map key "NewExport"
        let branch = api(
            "@pkg:NewExport",
            iface_named(None, vec![("label", false, TypeNode::String { value: None })]),
        );
        let result = diff_package("@pkg", &base, &branch, true);
        assert_eq!(result.diffs.len(), 1);
        assert!(result.diffs[0].diff_text.contains('+'));
        assert!(result.diffs[0].qualified_name.contains("NewExport"));
    }

    #[test]
    fn test_reordered_exports_produce_no_diff() {
        // Two api.jsons identical except export order must not diff.
        let mut base_exports = IndexMap::new();
        base_exports.insert(
            "AProps".into(),
            iface_named(Some("AProps"), vec![("a", false, TypeNode::String { value: None })]),
        );
        base_exports.insert(
            "ZProps".into(),
            iface_named(Some("ZProps"), vec![("z", false, TypeNode::Number { value: None })]),
        );
        let base = ApiJson { exports: base_exports, links: IndexMap::new() };

        let mut branch_exports = IndexMap::new();
        branch_exports.insert(
            "ZProps".into(),
            iface_named(Some("ZProps"), vec![("z", false, TypeNode::Number { value: None })]),
        );
        branch_exports.insert(
            "AProps".into(),
            iface_named(Some("AProps"), vec![("a", false, TypeNode::String { value: None })]),
        );
        let branch = ApiJson { exports: branch_exports, links: IndexMap::new() };

        let result = diff_package("@pkg", &base, &branch, true);
        assert!(
            result.diffs.is_empty(),
            "expected no diffs when only export order differs, got: {:?}",
            result.diffs.iter().map(|d| &d.qualified_name).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_reordered_properties_produce_no_diff() {
        // An interface with the same properties in different orders must not diff.
        let base = api(
            "@pkg:Props",
            iface_named(
                Some("Props"),
                vec![
                    ("zulu", false, TypeNode::String { value: None }),
                    ("alpha", false, TypeNode::Number { value: None }),
                ],
            ),
        );
        let branch = api(
            "@pkg:Props",
            iface_named(
                Some("Props"),
                vec![
                    ("alpha", false, TypeNode::Number { value: None }),
                    ("zulu", false, TypeNode::String { value: None }),
                ],
            ),
        );
        let result = diff_package("@pkg", &base, &branch, true);
        assert!(
            result.diffs.is_empty(),
            "expected no diffs when only property order differs"
        );
    }

    #[test]
    fn test_removed_export_in_branch_shows_as_deleted() {
        // Use name: None so export_name() uses the map key "OldExport"
        let base = api(
            "@pkg:OldExport",
            iface_named(None, vec![("label", false, TypeNode::String { value: None })]),
        );
        let branch = ApiJson::default();
        let result = diff_package("@pkg", &base, &branch, true);
        assert_eq!(result.diffs.len(), 1);
        assert!(result.diffs[0].diff_text.contains('-'));
        assert!(result.diffs[0].qualified_name.contains("OldExport"));
    }

    #[test]
    fn test_ci_mode_wraps_in_code_fence() {
        let base = api(
            "@pkg:Props",
            iface_with_props(vec![("x", false, TypeNode::String { value: None })]),
        );
        let branch = api(
            "@pkg:Props",
            iface_with_props(vec![("x", false, TypeNode::Number { value: None })]),
        );
        let result = diff_package("@pkg", &base, &branch, true);
        let text = &result.diffs[0].diff_text;
        assert!(text.starts_with("```diff\n"), "CI output should start with code fence");
        assert!(text.ends_with("```"), "CI output should end with code fence");
    }

    #[test]
    fn test_large_interface_elides_unchanged_middle() {
        // Build an interface with many props where only one in the middle changes.
        let mut base_props: Vec<(&str, bool, TypeNode)> = Vec::new();
        let mut branch_props: Vec<(&str, bool, TypeNode)> = Vec::new();
        for i in 0..10_u32 {
            let name = Box::leak(format!("prop{i}").into_boxed_str()) as &str;
            base_props.push((name, true, TypeNode::String { value: None }));
            // Change prop5 from string to number
            let ty = if i == 5 { TypeNode::Number { value: None } } else { TypeNode::String { value: None } };
            branch_props.push((name, true, ty));
        }
        let base = api("@pkg:BigProps", iface_with_props(base_props));
        let branch = api("@pkg:BigProps", iface_with_props(branch_props));
        let result = diff_package("@pkg", &base, &branch, false);
        let text = &result.diffs[0].diff_text;

        // Changed line must be present
        assert!(text.contains("-  prop5?: string"), "expected removal of prop5 string");
        assert!(text.contains("+  prop5?: number"), "expected addition of prop5 number");

        // Distant unchanged lines must be collapsed
        assert!(text.contains("..."), "expected ellipsis for collapsed context");
        assert!(!text.contains("prop0"), "prop0 is far from the change and should be elided");
        assert!(!text.contains("prop9"), "prop9 is far from the change and should be elided");

        // First and last lines of the interface must always be present.
        // iface_with_props hard-codes the internal name as "ButtonProps".
        let lines: Vec<&str> = text.lines().collect();
        assert!(lines.first().unwrap().contains("ButtonProps {"), "first line must be the interface header");
        assert_eq!(lines.last().unwrap().trim(), "}", "last line must be the closing brace");
    }

    #[test]
    fn test_non_ci_mode_no_code_fence() {
        let base = api(
            "@pkg:Props",
            iface_with_props(vec![("x", false, TypeNode::String { value: None })]),
        );
        let branch = api(
            "@pkg:Props",
            iface_with_props(vec![("x", false, TypeNode::Number { value: None })]),
        );
        let result = diff_package("@pkg", &base, &branch, false);
        let text = &result.diffs[0].diff_text;
        assert!(!text.contains("```diff"), "non-CI output should not have markdown fences");
    }

    // ── format_output ──────────────────────────────────────────────────────

    #[test]
    fn test_format_output_empty_diffs_produces_empty_string() {
        let pkg = PackageDiff { package_name: "@pkg".into(), diffs: vec![] };
        assert!(format_output(&[pkg], false).is_empty());
    }

    #[test]
    fn test_format_output_includes_package_and_export_headers() {
        let diff = InterfaceDiff {
            qualified_name: "@pkg:Props".into(),
            diff_text: "```diff\n-old\n+new\n```".into(),
            changed_by: vec![],
            affects: vec![],
        };
        let pkg = PackageDiff { package_name: "@pkg".into(), diffs: vec![diff] };
        let out = format_output(&[pkg], true);
        assert!(out.contains("### @pkg"), "missing package header");
        assert!(out.contains("#### @pkg:Props"), "missing export header");
    }

    #[test]
    fn test_format_output_ci_affects_renders_html_details() {
        let diff = InterfaceDiff {
            qualified_name: "@pkg:Props".into(),
            diff_text: "```diff\n-old\n+new\n```".into(),
            changed_by: vec![],
            affects: vec!["@pkg:OtherProps".into()],
        };
        let pkg = PackageDiff { package_name: "@pkg".into(), diffs: vec![diff] };
        let out = format_output(&[pkg], true);
        assert!(out.contains("<details>"), "CI affects should use <details>");
        assert!(out.contains("@pkg:OtherProps"));
    }

    #[test]
    fn test_format_output_non_ci_affects_renders_plain_text() {
        let diff = InterfaceDiff {
            qualified_name: "@pkg:Props".into(),
            diff_text: "-old\n+new".into(),
            changed_by: vec![],
            affects: vec!["@pkg:OtherProps".into()],
        };
        let pkg = PackageDiff { package_name: "@pkg".into(), diffs: vec![diff] };
        let out = format_output(&[pkg], false);
        assert!(out.contains("it changed:"), "non-CI affects should use plain text");
        assert!(!out.contains("<details>"), "non-CI should not use HTML");
    }
}
