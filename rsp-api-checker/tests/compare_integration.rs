use rsp_api_check::differ::{diff_package, discover_pairs, format_output};
use std::fs;
use tempfile::TempDir;

const BASE_API_JSON: &str = r#"{
  "exports": {
    "@test/button:ButtonProps": {
      "type": "interface",
      "name": "ButtonProps",
      "properties": {
        "isDisabled": {
          "type": "property",
          "name": "isDisabled",
          "value": {"type": "boolean"},
          "optional": true
        }
      },
      "typeParameters": [],
      "extends": []
    }
  },
  "links": {}
}"#;

const BRANCH_API_JSON: &str = r#"{
  "exports": {
    "@test/button:ButtonProps": {
      "type": "interface",
      "name": "ButtonProps",
      "properties": {
        "isDisabled": {
          "type": "property",
          "name": "isDisabled",
          "value": {"type": "boolean"},
          "optional": true
        },
        "onPress": {
          "type": "property",
          "name": "onPress",
          "value": {
            "type": "function",
            "parameters": [],
            "return": {"type": "void"}
          },
          "optional": true
        }
      },
      "typeParameters": [],
      "extends": []
    }
  },
  "links": {}
}"#;

/// Build a temporary fixture directory pair:
///   base/<pkg>/package.json + base/<pkg>/dist/api.json
///   branch/<pkg>/package.json + branch/<pkg>/dist/api.json
///
/// Returns the TempDir (kept alive for the test's lifetime) plus the base and
/// branch paths.
fn make_fixture_dirs(
    pkg_name: &str,
    base_json: &str,
    branch_json: &str,
) -> (TempDir, std::path::PathBuf, std::path::PathBuf) {
    let dir = TempDir::new().unwrap();

    let pkg_slug = pkg_name.replace('/', "-").replace('@', "");

    for (subdir, api_json) in [("base", base_json), ("branch", branch_json)] {
        let pkg_dir = dir.path().join(subdir).join(&pkg_slug);
        fs::create_dir_all(pkg_dir.join("dist")).unwrap();
        fs::write(pkg_dir.join("package.json"), format!(r#"{{"name":"{pkg_name}"}}"#)).unwrap();
        fs::write(pkg_dir.join("dist").join("api.json"), api_json).unwrap();
    }

    let base = dir.path().join("base");
    let branch = dir.path().join("branch");
    (dir, base, branch)
}

#[test]
fn discover_pairs_finds_both_fixture_packages() {
    let (_dir, base, branch) = make_fixture_dirs("@test/button", BASE_API_JSON, BRANCH_API_JSON);
    let pairs = discover_pairs(&base, &branch).unwrap();
    assert_eq!(pairs.len(), 1, "expected exactly one package pair");
    assert_eq!(pairs[0].package_name, "@test/button");
}

#[test]
fn compare_fixtures_detects_added_property() {
    let (_dir, base, branch) = make_fixture_dirs("@test/button", BASE_API_JSON, BRANCH_API_JSON);
    let pairs = discover_pairs(&base, &branch).unwrap();

    let pair = &pairs[0];
    let pkg_diff = diff_package(&pair.package_name, &pair.base, &pair.branch, true);

    assert_eq!(pkg_diff.diffs.len(), 1, "expected exactly one changed export");
    let diff = &pkg_diff.diffs[0];
    assert_eq!(diff.qualified_name, "@test/button:ButtonProps");
    assert!(diff.diff_text.contains("onPress?:"), "expected onPress in diff output");
    assert!(diff.diff_text.contains('+'), "expected + marker for new property");
}

#[test]
fn compare_fixtures_shows_no_diff_for_unchanged_property() {
    let (_dir, base, branch) = make_fixture_dirs("@test/button", BASE_API_JSON, BRANCH_API_JSON);
    let pairs = discover_pairs(&base, &branch).unwrap();

    let pair = &pairs[0];
    let pkg_diff = diff_package(&pair.package_name, &pair.base, &pair.branch, true);

    assert_eq!(pkg_diff.diffs.len(), 1);
    let diff_text = &pkg_diff.diffs[0].diff_text;
    assert!(!diff_text.contains("-isDisabled"), "unchanged property should not be marked deleted");
    assert!(!diff_text.contains("+isDisabled"), "unchanged property should not be marked added");
}

#[test]
fn compare_identical_json_produces_no_diffs() {
    let (_dir, base, branch) = make_fixture_dirs("@test/button", BASE_API_JSON, BASE_API_JSON);
    let pairs = discover_pairs(&base, &branch).unwrap();

    let pair = &pairs[0];
    let pkg_diff = diff_package(&pair.package_name, &pair.base, &pair.branch, true);
    assert!(pkg_diff.diffs.is_empty(), "identical API should yield no diffs");
}

#[test]
fn format_output_contains_package_name_in_header() {
    let (_dir, base, branch) = make_fixture_dirs("@test/button", BASE_API_JSON, BRANCH_API_JSON);
    let pairs = discover_pairs(&base, &branch).unwrap();

    let pair = &pairs[0];
    let pkg_diff = diff_package(&pair.package_name, &pair.base, &pair.branch, true);
    let output = format_output(&[pkg_diff], true);

    assert!(output.contains("### @test/button"), "output should contain the package header");
    assert!(output.contains("#### @test/button:ButtonProps"), "output should contain the export header");
}
