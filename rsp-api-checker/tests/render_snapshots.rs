//! Snapshot coverage for `api.json` -> rendered-interface.
//!
//! The rendered text in `tests/snapshots/render.snap` is exactly what the
//! differ compares, so any change in how a shape renders shows up as a review
//! diff on that file rather than as a silent behaviour change in a real run.
//!
//! Each case goes through the real ingress (`ApiJson::load`, which applies
//! component normalization) and the real rendering path.
//!
//! Adding a case is one row in `CASES`. To re-record after an intentional
//! change:
//!
//! ```text
//! UPDATE_SNAPSHOTS=1 cargo test --test render_snapshots
//! ```
//!
//! Single-variant rendering (`union`, `keyof`, `mapped`, …) is already unit
//! tested in `type_renderer`; these cases deliberately cover *composition* —
//! how shapes behave nested inside a real export, through the whole pipeline.

use rsp_api_check::api_json::ApiJson;
use rsp_api_check::interface_builder::{format_interface, rebuild_interfaces};
use rsp_api_check::type_renderer::RenderContext;
use std::fmt::Write as _;
use tempfile::TempDir;

const SNAPSHOT_PATH: &str = "tests/snapshots/render.snap";

/// `(case name, api.json)`. Keep names stable — they are the snapshot keys.
const CASES: &[(&str, &str)] = &[
    // ── property-line composition ──────────────────────────────────────
    (
        "optional-required-and-default",
        r#"{
          "exports": {"Props": {"type":"interface","name":"Props","extends":[],"typeParameters":[],
            "properties": {
              "required":  {"type":"property","name":"required","value":{"type":"string"},"optional":false},
              "optional":  {"type":"property","name":"optional","value":{"type":"string"},"optional":true},
              "withDefault":{"type":"property","name":"withDefault","value":{"type":"number"},"optional":true,"default":"42"},
              "falseDefault":{"type":"property","name":"falseDefault","value":{"type":"boolean"},"optional":true,"default":"false"}
            }}},
          "links": {}
        }"#,
    ),
    (
        "private-and-protected-members-are-dropped",
        r#"{
          "exports": {"Props": {"type":"interface","name":"Props","extends":[],"typeParameters":[],
            "properties": {
              "publicProp":   {"type":"property","name":"publicProp","value":{"type":"string"},"optional":false},
              "privateProp":  {"type":"property","name":"privateProp","value":{"type":"string"},"optional":false,"access":"private"},
              "protectedProp":{"type":"property","name":"protectedProp","value":{"type":"string"},"optional":false,"access":"protected"}
            }}},
          "links": {}
        }"#,
    ),
    (
        "unusual-property-names",
        r#"{
          "exports": {"Props": {"type":"interface","name":"Props","extends":[],"typeParameters":[],
            "properties": {
              "aria-label": {"type":"property","name":"aria-label","value":{"type":"string"},"optional":true},
              "0":          {"type":"property","name":"0","value":{"type":"string"},"optional":true},
              "with space": {"type":"property","name":"with space","value":{"type":"string"},"optional":true},
              "$dollar":    {"type":"property","name":"$dollar","value":{"type":"string"},"optional":true},
              "UPPER":      {"type":"property","name":"UPPER","value":{"type":"string"},"optional":true}
            }}},
          "links": {}
        }"#,
    ),
    (
        "index-signature-interface",
        // `@react-spectrum/utils:baseStyleProps` — the `.d.ts` widens the
        // object to an index signature, so the individual keys are gone.
        r#"{
          "exports": {"baseStyleProps": {"type":"interface","name":"baseStyleProps","extends":[],"typeParameters":[],
            "properties": {
              "key": {"type":"property","name":"key","optional":false,
                "indexType":{"type":"string"},
                "value":{"type":"tuple","elements":[
                  {"type":"identifier","name":"StyleName"},
                  {"type":"identifier","name":"StyleHandler"}]}}
            }}},
          "links": {}
        }"#,
    ),
    (
        "method-vs-function-valued-property",
        r#"{
          "exports": {"Api": {"type":"interface","name":"Api","extends":[],"typeParameters":[],
            "properties": {
              "asMethod": {"type":"method","name":"asMethod","value":{"type":"function",
                "parameters":[{"type":"parameter","name":"x","value":{"type":"number"},"optional":false,"rest":false}],
                "return":{"type":"void"}}},
              "asProperty": {"type":"property","name":"asProperty","optional":false,"value":{"type":"function",
                "parameters":[{"type":"parameter","name":"x","value":{"type":"number"},"optional":false,"rest":false}],
                "return":{"type":"void"}}}
            }}},
          "links": {}
        }"#,
    ),
    (
        "parameter-modifiers-optional-and-rest",
        r#"{
          "exports": {"fn": {"type":"function","name":"fn","typeParameters":[],
            "parameters":[
              {"type":"parameter","name":"required","value":{"type":"string"},"optional":false,"rest":false},
              {"type":"parameter","name":"opt","value":{"type":"number"},"optional":true,"rest":false},
              {"type":"parameter","name":"rest","value":{"type":"array","elementType":{"type":"string"}},"optional":false,"rest":true}
            ],
            "return":{"type":"void"}}},
          "links": {}
        }"#,
    ),

    // ── degenerate shapes ──────────────────────────────────────────────
    (
        "empty-interface",
        r#"{"exports":{"Empty":{"type":"interface","name":"Empty","extends":[],"typeParameters":[],"properties":{}}},"links":{}}"#,
    ),
    (
        "interface-with-only-private-members",
        r#"{
          "exports": {"AllPrivate": {"type":"interface","name":"AllPrivate","extends":[],"typeParameters":[],
            "properties":{"secret":{"type":"property","name":"secret","value":{"type":"string"},"optional":false,"access":"private"}}}},
          "links": {}
        }"#,
    ),
    (
        "empty-union-and-intersection",
        r#"{
          "exports": {"Props": {"type":"interface","name":"Props","extends":[],"typeParameters":[],
            "properties":{
              "emptyUnion":{"type":"property","name":"emptyUnion","optional":true,"value":{"type":"union","elements":[]}},
              "emptyIntersection":{"type":"property","name":"emptyIntersection","optional":true,"value":{"type":"intersection","types":[]}},
              "emptyTuple":{"type":"property","name":"emptyTuple","optional":true,"value":{"type":"tuple","elements":[]}}
            }}},
          "links": {}
        }"#,
    ),
    (
        "object-with-null-properties",
        r#"{"exports":{"Opaque":{"type":"object","properties":null}},"links":{}}"#,
    ),

    // ── extends ────────────────────────────────────────────────────────
    (
        "multiple-extends-with-type-arguments",
        r#"{
          "exports": {"Props": {"type":"interface","name":"Props",
            "typeParameters":[{"type":"identifier","name":"T"}],
            "extends":[
              {"type":"identifier","name":"AriaLabelingProps"},
              {"type":"application","base":{"type":"identifier","name":"CollectionBase"},
               "typeParameters":[{"type":"identifier","name":"T"}]}],
            "properties":{"id":{"type":"property","name":"id","value":{"type":"string"},"optional":true}}}},
          "links": {}
        }"#,
    ),

    // ── generics ───────────────────────────────────────────────────────
    (
        "deeply-nested-generics",
        r#"{
          "exports": {"Props": {"type":"interface","name":"Props",
            "typeParameters":[{"type":"identifier","name":"T"}],"extends":[],
            "properties":{
              "nested":{"type":"property","name":"nested","optional":true,
                "value":{"type":"application","base":{"type":"identifier","name":"Map"},
                  "typeParameters":[
                    {"type":"identifier","name":"string"},
                    {"type":"application","base":{"type":"identifier","name":"Array"},
                     "typeParameters":[{"type":"application","base":{"type":"identifier","name":"Node"},
                       "typeParameters":[{"type":"identifier","name":"T"}]}]}]}}
            }}},
          "links": {}
        }"#,
    ),
    (
        "type-parameters-with-constraint-and-default",
        r#"{
          "exports": {"Props": {"type":"interface","name":"Props","extends":[],
            "typeParameters":[
              {"type":"typeParameter","name":"T","constraint":{"type":"identifier","name":"object"}},
              {"type":"typeParameter","name":"E","default":{"type":"string","value":"div"}}],
            "properties":{"a":{"type":"property","name":"a","value":{"type":"identifier","name":"T"},"optional":true}}}},
          "links": {}
        }"#,
    ),

    // ── overloads / unions of callables ────────────────────────────────
    (
        "overloaded-function-export",
        // `@react-aria/ssr:useSSRSafeId` arrives as a union of two functions.
        r#"{
          "exports": {"useSSRSafeId": {"type":"union","elements":[
            {"type":"function","name":"modern","typeParameters":[],
             "parameters":[{"type":"parameter","name":"defaultId","value":{"type":"string"},"optional":true,"rest":false}],
             "return":{"type":"string"}},
            {"type":"function","name":"legacy","typeParameters":[],
             "parameters":[],"return":{"type":"string"}}]}},
          "links": {}
        }"#,
    ),

    // ── links ──────────────────────────────────────────────────────────
    (
        "alias-chain-through-links",
        r#"{
          "exports": {"Button": {"type":"application",
            "base":{"type":"identifier","name":"ForwardRefExoticComponent"},
            "typeParameters":[{"type":"intersection","types":[
              {"type":"link","id":"a.d.ts:AliasOne"},
              {"type":"application","base":{"type":"identifier","name":"React.RefAttributes"},
               "typeParameters":[{"type":"identifier","name":"HTMLButtonElement"}]}]}]}},
          "links": {
            "a.d.ts:AliasOne": {"type":"alias","name":"AliasOne","typeParameters":[],
              "value":{"type":"link","id":"a.d.ts:AliasTwo"}},
            "a.d.ts:AliasTwo": {"type":"interface","id":"a.d.ts:AliasTwo","name":"RealProps",
              "extends":[],"typeParameters":[],
              "properties":{"isDisabled":{"type":"property","name":"isDisabled","value":{"type":"boolean"},"optional":true}}}
          }
        }"#,
    ),
    (
        "cyclic-props-link-terminates",
        // A -> B -> A. The recursion is depth-bounded; this pins that a cycle
        // produces output rather than hanging or overflowing the stack.
        r#"{
          "exports": {"Cyclic": {"type":"application",
            "base":{"type":"identifier","name":"ForwardRefExoticComponent"},
            "typeParameters":[{"type":"intersection","types":[
              {"type":"link","id":"a.d.ts:A"},
              {"type":"application","base":{"type":"identifier","name":"React.RefAttributes"},
               "typeParameters":[{"type":"identifier","name":"HTMLDivElement"}]}]}]}},
          "links": {
            "a.d.ts:A": {"type":"interface","id":"a.d.ts:A","name":"A","typeParameters":[],
              "extends":[],
              "properties":{"toB":{"type":"property","name":"toB","optional":true,"value":{"type":"link","id":"a.d.ts:B"}}}},
            "a.d.ts:B": {"type":"interface","id":"a.d.ts:B","name":"B","typeParameters":[],
              "extends":[],
              "properties":{"toA":{"type":"property","name":"toA","optional":true,"value":{"type":"link","id":"a.d.ts:A"}}}}
          }
        }"#,
    ),
    (
        "self-referential-interface",
        r#"{
          "exports": {"Node": {"type":"interface","id":"a.d.ts:Node","name":"Node","extends":[],"typeParameters":[],
            "properties":{
              "clone":{"type":"method","name":"clone","value":{"type":"function","parameters":[],"return":{"type":"this"}}},
              "parent":{"type":"property","name":"parent","optional":true,"value":{"type":"link","id":"a.d.ts:Node"}}
            }}},
          "links": {}
        }"#,
    ),
    (
        "dangling-link-is-not-invented",
        r#"{
          "exports": {"Props": {"type":"interface","name":"Props","extends":[],"typeParameters":[],
            "properties":{"missing":{"type":"property","name":"missing","optional":true,
              "value":{"type":"link","id":"nowhere.d.ts:Gone"}}}}},
          "links": {}
        }"#,
    ),

    // ── component detection boundaries ─────────────────────────────────
    (
        "component-with-no-props-only-ref",
        r#"{
          "exports": {"Divider": {"type":"application",
            "base":{"type":"identifier","name":"ForwardRefExoticComponent"},
            "typeParameters":[{"type":"application","base":{"type":"identifier","name":"React.RefAttributes"},
              "typeParameters":[{"type":"identifier","name":"HTMLHRElement"}]}]}},
          "links": {}
        }"#,
    ),
    (
        "component-with-generic-props-application",
        r#"{
          "exports": {"ListBox": {"type":"application",
            "base":{"type":"identifier","name":"ForwardRefExoticComponent"},
            "typeParameters":[{"type":"intersection","types":[
              {"type":"application","base":{"type":"link","id":"a.d.ts:ListBoxProps"},
               "typeParameters":[{"type":"identifier","name":"T"}]},
              {"type":"application","base":{"type":"identifier","name":"React.RefAttributes"},
               "typeParameters":[{"type":"identifier","name":"HTMLDivElement"}]}]}]}},
          "links": {
            "a.d.ts:ListBoxProps": {"type":"interface","id":"a.d.ts:ListBoxProps","name":"ListBoxProps",
              "extends":[],"typeParameters":[{"type":"identifier","name":"T"}],
              "properties":{"items":{"type":"property","name":"items","optional":true,
                "value":{"type":"application","base":{"type":"identifier","name":"Iterable"},
                  "typeParameters":[{"type":"identifier","name":"T"}]}}}}
          }
        }"#,
    ),
    (
        "non-components-keep-their-function-shape",
        // Hooks, factories and multi-parameter functions must not be rewritten
        // into components by the PascalCase heuristic.
        r#"{
          "exports": {
            "useThing": {"type":"function","name":"useThing","typeParameters":[],
              "parameters":[{"type":"parameter","name":"props","value":{"type":"identifier","name":"P"},"optional":false,"rest":false}],
              "return":{"type":"identifier","name":"ThingState"}},
            "TwoParams": {"type":"function","name":"TwoParams","typeParameters":[],
              "parameters":[
                {"type":"parameter","name":"a","value":{"type":"identifier","name":"A"},"optional":false,"rest":false},
                {"type":"parameter","name":"b","value":{"type":"identifier","name":"B"},"optional":false,"rest":false}],
              "return":{"type":"void"}},
            "NoParams": {"type":"function","name":"NoParams","typeParameters":[],
              "parameters":[],"return":{"type":"void"}}
          },
          "links": {}
        }"#,
    ),
    (
        "unstable-prefixed-component",
        r#"{
          "exports": {"UNSTABLE_Thing": {"type":"function","name":"UNSTABLE_Thing","typeParameters":[],
            "parameters":[{"type":"parameter","name":"props","optional":false,"rest":false,
              "value":{"type":"link","id":"a.d.ts:ThingProps"}}],
            "return":{"type":"identifier","name":"React.ReactElement"}}},
          "links": {
            "a.d.ts:ThingProps": {"type":"interface","id":"a.d.ts:ThingProps","name":"ThingProps",
              "extends":[],"typeParameters":[],
              "properties":{"isOpen":{"type":"property","name":"isOpen","value":{"type":"boolean"},"optional":true}}}
          }
        }"#,
    ),

    // ── value exports ──────────────────────────────────────────────────
    (
        "primitive-and-literal-const-exports",
        r#"{
          "exports": {
            "aString":  {"type":"string"},
            "aLiteral": {"type":"string","value":"focus-ring"},
            "aNumber":  {"type":"number","value":2},
            "aBoolean": {"type":"boolean"},
            "aSymbol":  {"type":"symbol"},
            "anArray":  {"type":"array","elementType":{"type":"string"}}
          },
          "links": {}
        }"#,
    ),
    (
        "nested-object-literal-export",
        r#"{
          "exports": {"focusRing": {"type":"object","properties":{
            "outlineStyle":{"type":"property","name":"outlineStyle","optional":false,
              "value":{"type":"object","properties":{
                "default":{"type":"property","name":"default","optional":false,"value":{"type":"string","value":"none"}},
                "isFocusVisible":{"type":"property","name":"isFocusVisible","optional":false,"value":{"type":"string","value":"solid"}}}}},
            "outlineWidth":{"type":"property","name":"outlineWidth","optional":false,"value":{"type":"number","value":2}}
          }}},
          "links": {}
        }"#,
    ),
    (
        "untagged-export-among-healthy-siblings",
        r#"{
          "exports": {
            "SegmentType": {"name":"SegmentType"},
            "Healthy": {"type":"interface","name":"Healthy","extends":[],"typeParameters":[],
              "properties":{"a":{"type":"property","name":"a","value":{"type":"string"},"optional":true}}}
          },
          "links": {}
        }"#,
    ),
];

fn render_case(api_json: &str) -> String {
    let dir = TempDir::new().unwrap();
    let path = dir.path().join("api.json");
    std::fs::write(&path, api_json).unwrap();

    // Real ingress: applies component normalization, tolerates novel nodes.
    let json = ApiJson::load(&path).expect("fixture must load");
    let mut ctx = RenderContext::new();
    let interfaces = rebuild_interfaces(&json, &mut ctx);

    // Sorted so the snapshot does not depend on map iteration order.
    let mut names: Vec<&String> = interfaces.keys().collect();
    names.sort();

    let mut out = String::new();
    for name in names {
        let _ = writeln!(out, "{}", format_interface(name, &interfaces[name]).trim_end());
    }
    if out.is_empty() {
        out.push_str("<no exports>\n");
    }
    out
}

fn build_snapshot() -> String {
    let mut out = String::from(
        "# Rendered api.json snapshots.\n\
         # Regenerate with: UPDATE_SNAPSHOTS=1 cargo test --test render_snapshots\n",
    );
    for (name, api_json) in CASES {
        let _ = write!(out, "\n=== {name} ===\n{}", render_case(api_json));
    }
    out
}

#[test]
fn rendered_output_matches_snapshot() {
    let actual = build_snapshot();
    let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(SNAPSHOT_PATH);

    if std::env::var_os("UPDATE_SNAPSHOTS").is_some() {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(&path, &actual).unwrap();
        eprintln!("wrote {}", path.display());
        return;
    }

    let expected = std::fs::read_to_string(&path).unwrap_or_else(|_| {
        panic!(
            "missing {SNAPSHOT_PATH}; record it with \
             `UPDATE_SNAPSHOTS=1 cargo test --test render_snapshots`"
        )
    });

    if actual != expected {
        // Show only the changed cases; the whole file is too noisy to read.
        let mut report = String::new();
        for (name, _) in CASES {
            let marker = format!("=== {name} ===");
            let pick = |s: &str| {
                s.split(&marker)
                    .nth(1)
                    .map(|rest| rest.split("\n=== ").next().unwrap_or("").to_string())
            };
            let (a, e) = (pick(&actual), pick(&expected));
            if a != e {
                let _ = write!(
                    report,
                    "\n--- {name}\nexpected:{}\nactual:{}\n",
                    e.unwrap_or_else(|| " <absent>".into()),
                    a.unwrap_or_else(|| " <absent>".into())
                );
            }
        }
        panic!(
            "rendered output changed.\n{report}\n\
             If this is intentional, re-record with \
             `UPDATE_SNAPSHOTS=1 cargo test --test render_snapshots` and review the diff."
        );
    }
}

/// A snapshot that silently covered nothing would still "pass", so pin the
/// shape of the suite itself.
#[test]
fn every_case_renders_something_and_names_are_unique() {
    let mut seen = std::collections::BTreeSet::new();
    for (name, api_json) in CASES {
        assert!(seen.insert(*name), "duplicate snapshot case name: {name}");
        let rendered = render_case(api_json);
        assert!(
            !rendered.trim().is_empty(),
            "case `{name}` rendered nothing at all"
        );
    }
    assert!(
        CASES.len() >= 25,
        "expected a broad case table, found {}",
        CASES.len()
    );
}
