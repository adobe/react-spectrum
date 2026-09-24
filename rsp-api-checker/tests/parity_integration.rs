//! End-to-end parity tests: legacy-shaped `api.json` vs `.d.ts`-shaped `api.json`.
//!
//! The old Node extractor read `.tsx` source, so it could see a component's
//! declaration directly. The Rust pipeline reads emitted `.d.ts`, where the
//! same component is spelled as a `ForwardRefExoticComponent<…>` application or
//! a plain function, props arrive behind entries in the `links` table, and
//! React utility types survive as unresolvable identifiers.
//!
//! Every test here drives the real entry points — `discover_pairs` (which loads
//! and normalizes both sides) then `diff_package` / `format_output` — with the
//! *same* public API spelled both ways, and asserts the report comes back
//! clean. If normalization, link resolution, or rendering regresses, the
//! spellings stop agreeing and these fail.
//!
//! The fixtures are minimized from real generator output, not invented.

use rsp_api_check::differ::{diff_package, discover_pairs, format_output};
use std::fs;
use tempfile::TempDir;

/// Write a `<base|branch>/<pkg>/dist/api.json` pair and load it through the
/// real discovery path so both sides get normalized exactly as in production.
fn diff_spellings(pkg_name: &str, legacy_json: &str, dts_json: &str) -> Vec<(String, String)> {
    let dir = TempDir::new().unwrap();
    let slug = pkg_name.replace('/', "-").replace('@', "");

    for (side, api_json) in [("base", legacy_json), ("branch", dts_json)] {
        let pkg_dir = dir.path().join(side).join(&slug);
        fs::create_dir_all(pkg_dir.join("dist")).unwrap();
        fs::write(
            pkg_dir.join("package.json"),
            format!(r#"{{"name":"{pkg_name}"}}"#),
        )
        .unwrap();
        fs::write(pkg_dir.join("dist").join("api.json"), api_json).unwrap();
    }

    let pairs = discover_pairs(&dir.path().join("base"), &dir.path().join("branch"))
        .expect("both fixture sides must load");
    assert_eq!(pairs.len(), 1, "expected exactly one package pair");

    let pair = &pairs[0];
    diff_package(&pair.package_name, &pair.base, &pair.branch, true)
        .diffs
        .into_iter()
        .map(|d| (d.qualified_name, d.diff_text))
        .collect()
}

fn assert_no_diff(pkg: &str, legacy_json: &str, dts_json: &str) {
    let diffs = diff_spellings(pkg, legacy_json, dts_json);
    assert!(
        diffs.is_empty(),
        "the two spellings should describe the same API, but got:\n{}",
        diffs
            .iter()
            .map(|(n, t)| format!("{n}\n{t}"))
            .collect::<Vec<_>>()
            .join("\n")
    );
}

const EMPTY_API: &str = r#"{"exports": {}, "links": {}}"#;

/// Diff a spelling against an empty package so the report has to spell out
/// everything the extractor found for it.
///
/// Without this, an `assert_no_diff` could pass vacuously: if a shape stopped
/// resolving entirely, both sides would collapse to nothing and still compare
/// equal. Asserting the props actually reach the report rules that out.
fn assert_reports_props(pkg: &str, api_json: &str, export: &str, expected_props: &[&str]) {
    let diffs = diff_spellings(pkg, EMPTY_API, api_json);
    let (_, text) = diffs
        .iter()
        .find(|(name, _)| name == &format!("{pkg}:{export}"))
        .unwrap_or_else(|| panic!("{export} missing from the report: {diffs:?}"));

    assert!(
        !text.contains("UNTYPED"),
        "{export} lost its type entirely:\n{text}"
    );
    for prop in expected_props {
        assert!(
            text.contains(prop),
            "{export} should report `{prop}`, got:\n{text}"
        );
    }
}

/// Legacy read the component straight from source.
fn legacy_component(name: &str, props_name: &str, props: &str) -> String {
    format!(
        r#"{{
          "exports": {{
            "{name}": {{
              "type": "component",
              "name": "{name}",
              "props": {{
                "type": "interface",
                "name": "{props_name}",
                "extends": [],
                "typeParameters": [],
                "properties": {props}
              }}
            }}
          }},
          "links": {{}}
        }}"#
    )
}

const PROPS_BODY: &str = r#"{
  "isDisabled": {"type":"property","name":"isDisabled","value":{"type":"boolean"},"optional":true},
  "children": {"type":"property","name":"children","value":{"type":"identifier","name":"ReactNode"},"optional":true}
}"#;

// ───────────────────────── component spellings ─────────────────────────

#[test]
fn forward_ref_component_matches_the_legacy_component_spelling() {
    // `.d.ts` spells a forwardRef component as
    // `ForwardRefExoticComponent<Props & RefAttributes<T>>`, with the props
    // interface living in the `links` table.
    let dts = format!(
        r#"{{
          "exports": {{
            "Button": {{
              "type": "application",
              "base": {{"type":"identifier","name":"ForwardRefExoticComponent"}},
              "typeParameters": [{{
                "type": "intersection",
                "types": [
                  {{"type":"link","id":"pkg.d.ts:ButtonProps"}},
                  {{"type":"application",
                    "base":{{"type":"identifier","name":"React.RefAttributes"}},
                    "typeParameters":[{{"type":"identifier","name":"HTMLButtonElement"}}]}}
                ]
              }}]
            }}
          }},
          "links": {{
            "pkg.d.ts:ButtonProps": {{
              "type": "interface",
              "id": "pkg.d.ts:ButtonProps",
              "name": "ButtonProps",
              "extends": [],
              "typeParameters": [],
              "properties": {PROPS_BODY}
            }}
          }}
        }}"#
    );

    // Both spellings must actually carry the props, not both be empty.
    assert_reports_props(
        "@test/button",
        &dts,
        "Button",
        &["isDisabled?: boolean", "children?: ReactNode"],
    );
    assert_no_diff(
        "@test/button",
        &legacy_component("Button", "ButtonProps", PROPS_BODY),
        &dts,
    );
}

#[test]
fn plain_function_component_matches_the_legacy_component_spelling() {
    // Minimized from the real `react-aria-components:Breadcrumb` output: `tsc`
    // erases the forwardRef wrapper and leaves a one-parameter function.
    let dts = format!(
        r#"{{
          "exports": {{
            "Breadcrumb": {{
              "type": "function",
              "name": "Breadcrumb",
              "typeParameters": [],
              "parameters": [{{
                "type": "parameter",
                "name": "props",
                "optional": false,
                "rest": false,
                "value": {{
                  "type": "intersection",
                  "types": [
                    {{"type":"link","id":"pkg.d.ts:BreadcrumbProps"}},
                    {{"type":"application",
                      "base":{{"type":"identifier","name":"React.RefAttributes"}},
                      "typeParameters":[{{"type":"identifier","name":"HTMLLIElement"}}]}}
                  ]
                }}
              }}],
              "return": {{
                "type":"union",
                "elements":[
                  {{"type":"identifier","name":"React.ReactElement"}},
                  {{"type":"null"}}
                ]
              }}
            }}
          }},
          "links": {{
            "pkg.d.ts:BreadcrumbProps": {{
              "type": "interface",
              "id": "pkg.d.ts:BreadcrumbProps",
              "name": "BreadcrumbProps",
              "extends": [],
              "typeParameters": [],
              "properties": {PROPS_BODY}
            }}
          }}
        }}"#
    );

    assert_reports_props(
        "react-aria-components",
        &dts,
        "Breadcrumb",
        &["isDisabled?: boolean", "children?: ReactNode"],
    );
    assert_no_diff(
        "react-aria-components",
        &legacy_component("Breadcrumb", "BreadcrumbProps", PROPS_BODY),
        &dts,
    );
}

#[test]
fn props_wrapped_in_props_without_ref_are_still_reported() {
    // `@react-spectrum/card:Card` is
    // `ForwardRefExoticComponent<ItemProps<P> & PropsWithoutRef<P> & RefAttributes<T>>`.
    // `PropsWithoutRef` resolves to a bare identifier, so if it is not peeled
    // every prop of `P` silently disappears from the report.
    let dts = format!(
        r#"{{
          "exports": {{
            "Card": {{
              "type": "application",
              "base": {{"type":"identifier","name":"ForwardRefExoticComponent"}},
              "typeParameters": [{{
                "type": "intersection",
                "types": [
                  {{"type":"application",
                    "base":{{"type":"identifier","name":"PropsWithoutRef"}},
                    "typeParameters":[{{"type":"link","id":"pkg.d.ts:CardProps"}}]}},
                  {{"type":"application",
                    "base":{{"type":"identifier","name":"React.RefAttributes"}},
                    "typeParameters":[{{"type":"identifier","name":"HTMLDivElement"}}]}}
                ]
              }}]
            }}
          }},
          "links": {{
            "pkg.d.ts:CardProps": {{
              "type": "interface",
              "id": "pkg.d.ts:CardProps",
              "name": "CardProps",
              "extends": [],
              "typeParameters": [],
              "properties": {PROPS_BODY}
            }}
          }}
        }}"#
    );

    // The assertion that matters: the wrapped props survive at all.
    assert_reports_props(
        "@test/card",
        &dts,
        "Card",
        &["isDisabled?: boolean", "children?: ReactNode"],
    );
    assert_no_diff(
        "@test/card",
        &legacy_component("Card", "CardProps", PROPS_BODY),
        &dts,
    );
}

// ───────────────────────── resilience of the loader ─────────────────────────

#[test]
fn an_export_with_no_type_tag_does_not_discard_the_rest_of_the_package() {
    // `@react-stately/datepicker` emits `SegmentType` as a bare `{"name":…}`
    // with no `type` key. This used to abort the whole comparison with
    // `missing field 'type'`, so every other export in the package went
    // unchecked — a silent hole rather than a loud failure.
    let base = r#"{
      "exports": {
        "SegmentType": {"name": "SegmentType"},
        "Widget": {
          "type":"interface","name":"Widget","extends":[],"typeParameters":[],
          "properties":{"a":{"type":"property","name":"a","value":{"type":"boolean"},"optional":true}}
        }
      },
      "links": {}
    }"#;
    let branch = r#"{
      "exports": {
        "SegmentType": {"name": "SegmentType"},
        "Widget": {
          "type":"interface","name":"Widget","extends":[],"typeParameters":[],
          "properties":{
            "a":{"type":"property","name":"a","value":{"type":"boolean"},"optional":true},
            "b":{"type":"property","name":"b","value":{"type":"string"},"optional":true}
          }
        }
      },
      "links": {}
    }"#;

    let diffs = diff_spellings("@react-stately/datepicker", base, branch);
    let names: Vec<&str> = diffs.iter().map(|(n, _)| n.as_str()).collect();
    assert_eq!(
        names,
        vec!["@react-stately/datepicker:Widget"],
        "the untagged export must not mask its siblings"
    );
    assert!(diffs[0].1.contains("b?:"), "got {}", diffs[0].1);
}

#[test]
fn a_method_without_a_name_does_not_discard_the_rest_of_the_package() {
    // Computed keys such as `[Symbol.iterator]()` come through with no `name`.
    let with_iterator = |extra: &str| {
        format!(
            r#"{{
              "exports": {{
                "BaseCollection": {{
                  "type":"interface","name":"BaseCollection","extends":[],"typeParameters":[],
                  "properties":{{
                    "[Symbol.iterator]":{{"type":"method","value":{{"type":"function","parameters":[],"return":{{"type":"void"}}}}}}{extra}
                  }}
                }}
              }},
              "links": {{}}
            }}"#
        )
    };

    let diffs = diff_spellings(
        "@react-aria/collections",
        &with_iterator(""),
        &with_iterator(
            r#","size":{"type":"property","name":"size","value":{"type":"number"},"optional":false}"#,
        ),
    );
    assert_eq!(diffs.len(), 1, "expected the added `size` to be the only diff");
    assert!(diffs[0].1.contains("size:"), "got {}", diffs[0].1);
}

// ───────────────────────── value exports ─────────────────────────

#[test]
fn an_object_literal_export_reports_its_members_instead_of_untyped() {
    // `@react-spectrum/s2:ToastQueue` is `export const ToastQueue = {…}`, which
    // arrives as a bare object literal rather than an interface.
    let base = r#"{
      "exports": {
        "ToastQueue": {
          "type":"object",
          "properties":{
            "positive":{"type":"property","name":"positive","value":{"type":"string"},"optional":false}
          }
        }
      },
      "links": {}
    }"#;
    let branch = r#"{
      "exports": {
        "ToastQueue": {
          "type":"object",
          "properties":{
            "positive":{"type":"property","name":"positive","value":{"type":"string"},"optional":false},
            "negative":{"type":"property","name":"negative","value":{"type":"string"},"optional":false}
          }
        }
      },
      "links": {}
    }"#;

    let diffs = diff_spellings("@react-spectrum/s2", base, branch);
    assert_eq!(diffs.len(), 1);
    assert!(
        !diffs[0].1.contains("UNTYPED"),
        "object exports must be flattened, got {}",
        diffs[0].1
    );
    assert!(diffs[0].1.contains("negative:"), "got {}", diffs[0].1);
}

#[test]
fn a_const_typed_by_identifier_reports_its_type_instead_of_untyped() {
    // `@react-stately/form:VALID_VALIDITY_STATE` is
    // `declare const x: ValidityState` — the member names are not in the
    // `.d.ts`, but collapsing the whole export to UNTYPED would also hide a
    // later change of its type.
    let base = r#"{
      "exports": {"VALID_VALIDITY_STATE": {"type":"identifier","name":"ValidityState"}},
      "links": {}
    }"#;
    let branch = r#"{
      "exports": {"VALID_VALIDITY_STATE": {"type":"identifier","name":"ValidityStateV2"}},
      "links": {}
    }"#;

    let diffs = diff_spellings("@react-stately/form", base, branch);
    assert_eq!(diffs.len(), 1, "a changed type must be reported");
    assert!(
        !diffs[0].1.contains("UNTYPED"),
        "expected the type name, got {}",
        diffs[0].1
    );
    assert!(diffs[0].1.contains("ValidityStateV2"), "got {}", diffs[0].1);
}

// ───────────────────────── report stability ─────────────────────────

#[test]
fn reordering_properties_in_api_json_is_not_reported_as_a_change() {
    // Export order follows whatever order the extractor walked the file, so a
    // pure reshuffle must not show up as an API change.
    let iface = |props: &str| {
        format!(
            r#"{{
              "exports": {{
                "Props": {{
                  "type":"interface","name":"Props","extends":[],"typeParameters":[],
                  "properties": {{{props}}}
                }}
              }},
              "links": {{}}
            }}"#
        )
    };
    let a = r#""alpha":{"type":"property","name":"alpha","value":{"type":"string"},"optional":true},
               "beta":{"type":"property","name":"beta","value":{"type":"number"},"optional":true},
               "gamma":{"type":"property","name":"gamma","value":{"type":"boolean"},"optional":true}"#;
    let shuffled = r#""gamma":{"type":"property","name":"gamma","value":{"type":"boolean"},"optional":true},
               "alpha":{"type":"property","name":"alpha","value":{"type":"string"},"optional":true},
               "beta":{"type":"property","name":"beta","value":{"type":"number"},"optional":true}"#;

    assert_no_diff("@test/order", &iface(a), &iface(shuffled));

    // ...but a real rename is still caught, so the sort is not hiding changes.
    let renamed = shuffled.replace("beta", "delta");
    let diffs = diff_spellings("@test/order", &iface(a), &iface(&renamed));
    assert_eq!(diffs.len(), 1, "a renamed property must be reported");
    assert!(diffs[0].1.contains("delta"), "got {}", diffs[0].1);
}

#[test]
fn generic_arguments_are_preserved_rather_than_erased() {
    // Legacy frequently erased type arguments to `{}` / `any`. Losing them
    // would make `Iterable<T>` and `Iterable<SomethingElse>` compare equal.
    let iface = |arg: &str| {
        format!(
            r#"{{
              "exports": {{
                "ListProps": {{
                  "type":"interface","name":"ListProps","extends":[],
                  "typeParameters":[{{"type":"identifier","name":"T"}}],
                  "properties": {{
                    "items": {{
                      "type":"property","name":"items","optional":true,
                      "value":{{"type":"application",
                               "base":{{"type":"identifier","name":"Iterable"}},
                               "typeParameters":[{{"type":"identifier","name":"{arg}"}}]}}
                    }}
                  }}
                }}
              }},
              "links": {{}}
            }}"#
        )
    };

    assert_no_diff("@test/generics", &iface("T"), &iface("T"));

    let diffs = diff_spellings("@test/generics", &iface("T"), &iface("U"));
    assert_eq!(diffs.len(), 1, "a changed type argument must be reported");
    assert!(diffs[0].1.contains("Iterable<U>"), "got {}", diffs[0].1);
}

// ───────────────────────── the report itself ─────────────────────────

#[test]
fn a_genuinely_added_prop_is_reported_and_rendered() {
    // Guards the whole suite: if normalization ever flattened everything to
    // UNTYPED, the "no diff" tests above would pass vacuously. A real addition
    // must still reach the rendered report.
    let dir = TempDir::new().unwrap();
    for (side, props) in [
        ("base", PROPS_BODY.to_string()),
        (
            "branch",
            PROPS_BODY.replace(
                "\"isDisabled\":",
                "\"isFoo\":{\"type\":\"property\",\"name\":\"isFoo\",\"value\":{\"type\":\"boolean\"},\"optional\":true},\n  \"isDisabled\":",
            ),
        ),
    ] {
        let pkg_dir = dir.path().join(side).join("react-aria-components");
        fs::create_dir_all(pkg_dir.join("dist")).unwrap();
        fs::write(
            pkg_dir.join("package.json"),
            r#"{"name":"react-aria-components"}"#,
        )
        .unwrap();
        fs::write(
            pkg_dir.join("dist").join("api.json"),
            legacy_component("Button", "ButtonProps", &props),
        )
        .unwrap();
    }

    let pairs = discover_pairs(&dir.path().join("base"), &dir.path().join("branch")).unwrap();
    let pkg_diff = diff_package(&pairs[0].package_name, &pairs[0].base, &pairs[0].branch, true);

    assert_eq!(pkg_diff.diffs.len(), 1, "expected one changed export");
    assert_eq!(
        pkg_diff.diffs[0].qualified_name,
        "react-aria-components:Button"
    );

    let report = format_output(&[pkg_diff], true);
    assert!(
        report.contains("react-aria-components"),
        "report should name the package:\n{report}"
    );
    assert!(
        report.contains("isFoo?: boolean"),
        "report should show the added prop:\n{report}"
    );
    assert!(
        report.contains("+  isFoo"),
        "the added prop should carry a + marker:\n{report}"
    );
}

#[test]
fn comparing_a_package_against_itself_reports_nothing() {
    // Every shape in one fixture, compared to itself: the differ must be a
    // no-op so real runs only surface genuine changes.
    let json = format!(
        r#"{{
          "exports": {{
            "Untagged": {{"name":"Untagged"}},
            "Const": {{"type":"identifier","name":"ValidityState"}},
            "Literal": {{"type":"object","properties":{{
              "a":{{"type":"property","name":"a","value":{{"type":"string"}},"optional":false}}
            }}}},
            "Button": {{
              "type":"application",
              "base":{{"type":"identifier","name":"ForwardRefExoticComponent"}},
              "typeParameters":[{{"type":"intersection","types":[
                {{"type":"link","id":"pkg.d.ts:ButtonProps"}},
                {{"type":"application",
                  "base":{{"type":"identifier","name":"React.RefAttributes"}},
                  "typeParameters":[{{"type":"identifier","name":"HTMLButtonElement"}}]}}
              ]}}]
            }}
          }},
          "links": {{
            "pkg.d.ts:ButtonProps": {{
              "type":"interface","id":"pkg.d.ts:ButtonProps","name":"ButtonProps",
              "extends":[],"typeParameters":[],"properties": {PROPS_BODY}
            }}
          }}
        }}"#
    );

    assert_no_diff("@test/self", &json, &json);
}

#[test]
fn a_component_whose_props_link_is_missing_degrades_instead_of_crashing() {
    // Cross-package props sometimes land outside the package's own `links`
    // table. That must not panic or abort the package — and it must look
    // visibly different from a resolved component, which is what makes the
    // `assert_reports_props` checks above meaningful.
    let dangling = r#"{
      "exports": {
        "Button": {
          "type":"application",
          "base":{"type":"identifier","name":"ForwardRefExoticComponent"},
          "typeParameters":[{"type":"intersection","types":[
            {"type":"link","id":"somewhere/else.d.ts:ButtonProps"},
            {"type":"application",
             "base":{"type":"identifier","name":"React.RefAttributes"},
             "typeParameters":[{"type":"identifier","name":"HTMLButtonElement"}]}
          ]}]
        }
      },
      "links": {}
    }"#;

    let diffs = diff_spellings("@test/dangling", EMPTY_API, dangling);
    let (_, text) = diffs
        .iter()
        .find(|(n, _)| n == "@test/dangling:Button")
        .expect("the export must still be reported");

    // The contrast: a resolved component lists its props, this one cannot.
    assert!(
        !text.contains("isDisabled"),
        "nothing should be invented for an unresolvable link:\n{text}"
    );
    assert!(
        text.contains("Button"),
        "the export should still be named:\n{text}"
    );
}

#[test]
fn swapping_two_type_parameters_is_reported_as_a_change() {
    // Type parameter position is part of the API: `AsyncListOptions<T, C>` and
    // `AsyncListOptions<C, T>` are different types to every caller passing
    // explicit type arguments. Rendering them in sorted order printed the
    // wrong signature *and* made the swap invisible to the diff.
    let iface = |first: &str, second: &str| {
        format!(
            r#"{{
              "exports": {{
                "AsyncListOptions": {{
                  "type":"interface","name":"AsyncListOptions","extends":[],
                  "typeParameters":[
                    {{"type":"identifier","name":"{first}"}},
                    {{"type":"identifier","name":"{second}"}}],
                  "properties":{{
                    "load":{{"type":"property","name":"load","value":{{"type":"identifier","name":"{first}"}},"optional":true}}
                  }}
                }}
              }},
              "links": {{}}
            }}"#
        )
    };

    // Declaration order is preserved, not alphabetised.
    let diffs = diff_spellings("@react-stately/data", EMPTY_API, &iface("T", "C"));
    assert!(
        diffs[0].1.contains("<T, C>"),
        "type parameters must keep declaration order, got:\n{}",
        diffs[0].1
    );

    // And a swap is a reported change rather than a silent one.
    let swapped = diff_spellings("@react-stately/data", &iface("T", "C"), &iface("C", "T"));
    assert_eq!(
        swapped.len(),
        1,
        "reordering type parameters is a breaking change and must be reported"
    );
    assert!(
        swapped[0].1.contains("<C, T>"),
        "got:\n{}",
        swapped[0].1
    );
}
