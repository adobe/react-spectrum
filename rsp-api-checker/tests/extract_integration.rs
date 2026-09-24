use rsp_api_check::differ::{diff_package, discover_pairs};
use rsp_api_check::extract::{extract_packages, run_ts_doc, ts_doc_available, ExtractOpts, PackageEntry};
use std::path::PathBuf;
use tempfile::TempDir;

fn repo_root() -> PathBuf {
    // crate dir is rsp-api-checker/; repo root is its parent.
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).parent().unwrap().to_path_buf()
}

#[tokio::test]
async fn run_ts_doc_extracts_dts_with_cross_file_link() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        eprintln!("skipping: parcel3 / @parcel/transformer-ts-doc not installed");
        return;
    }

    // Fixture package with a cross-file import.
    let fixture = TempDir::new().unwrap();
    std::fs::write(
        fixture.path().join("events.d.ts"),
        "export interface PressEvent { x: number; y: number; }\n",
    ).unwrap();
    std::fs::write(
        fixture.path().join("button.d.ts"),
        "import {PressEvent} from './events';\n\
         export interface ButtonProps {\n\
           variant?: 'primary' | 'secondary';\n\
           onPress?: (e: PressEvent) => void;\n\
         }\n",
    ).unwrap();

    let work = TempDir::new().unwrap();
    let json = run_ts_doc(&root, work.path(), &fixture.path().join("button.d.ts"), "button")
        .await
        .expect("run_ts_doc failed");

    let v: serde_json::Value = serde_json::from_str(&json).unwrap();
    let props = &v["exports"]["ButtonProps"];
    assert_eq!(props["type"], "interface");
    assert_eq!(props["properties"]["variant"]["value"]["type"], "union");
    // The cross-file PressEvent reference resolves to a link ending in ":PressEvent".
    let link_id = props["properties"]["onPress"]["value"]["parameters"][0]["value"]["id"]
        .as_str()
        .unwrap_or("");
    assert!(link_id.ends_with(":PressEvent"), "unexpected link id: {link_id}");

    // And it deserializes into our model without hitting the Unknown fallback.
    let _api: rsp_api_check::api_json::ApiJson = serde_json::from_str(&json).unwrap();
}

fn write_pkg(root: &std::path::Path, name: &str, dts: &str) -> PackageEntry {
    let dir = root.join(name);
    std::fs::create_dir_all(dir.join("dist/types")).unwrap();
    std::fs::write(dir.join("package.json"),
        format!(r#"{{"name":"{name}","types":"dist/types/index.d.ts"}}"#)).unwrap();
    std::fs::write(dir.join("dist/types/index.d.ts"), dts).unwrap();
    PackageEntry { name: name.to_string(), dir, private: false }
}

#[tokio::test]
async fn extract_packages_writes_compare_layout_and_self_diffs_clean() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        eprintln!("skipping: parcel3 not installed");
        return;
    }
    let pkgs_tmp = TempDir::new().unwrap();
    let entries = vec![
        write_pkg(pkgs_tmp.path(), "@fix/button",
            "export interface ButtonProps { isDisabled?: boolean; }\n"),
        write_pkg(pkgs_tmp.path(), "@fix/toggle",
            "export interface ToggleProps { isSelected?: boolean; }\n"),
    ];

    let out = TempDir::new().unwrap();
    extract_packages(&entries, &ExtractOpts {
        repo_root: root.clone(),
        output_dir: out.path().to_path_buf(),
        check_build_freshness: false,
        allow_empty: false,
    }).await.expect("extract_packages failed");

    // Layout: <out>/<name>/dist/api.json + <out>/<name>/package.json
    assert!(out.path().join("@fix/button/dist/api.json").exists());
    assert!(out.path().join("@fix/button/package.json").exists());

    // Extract-vs-itself must diff clean through the real differ.
    let pairs = discover_pairs(out.path(), out.path()).unwrap();
    assert_eq!(pairs.len(), 2);
    for p in &pairs {
        let d = diff_package(&p.package_name, &p.base, &p.branch, true);
        assert!(d.diffs.is_empty(), "self-diff for {} should be empty", p.package_name);
    }
}

#[tokio::test]
async fn extract_packages_errors_on_empty_unless_allowed() {
    let root = repo_root();
    let out = TempDir::new().unwrap();
    let opts = ExtractOpts {
        repo_root: root, output_dir: out.path().to_path_buf(),
        check_build_freshness: false, allow_empty: false,
    };
    assert!(extract_packages(&[], &opts).await.is_err());
    let opts_ok = ExtractOpts { allow_empty: true, ..opts };
    assert!(extract_packages(&[], &opts_ok).await.is_ok());
}

/// A declared-but-missing types entry is a legitimate skip normally (the
/// package may simply not be built yet), but under `check_build_freshness`
/// it's the most severe form of "build overdue" — it must bail loudly
/// instead of silently dropping the package from both sides of the diff.
#[tokio::test]
async fn extract_packages_freshness_bails_on_missing_declared_types() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        eprintln!("skipping: parcel3 not installed");
        return;
    }

    let pkgs_tmp = TempDir::new().unwrap();
    let dir = pkgs_tmp.path().join("@fix/incomplete");
    std::fs::create_dir_all(&dir).unwrap();
    std::fs::write(
        dir.join("package.json"),
        r#"{"name":"@fix/incomplete","types":"dist/types/index.d.ts"}"#,
    )
    .unwrap();
    // Deliberately do NOT write dist/types/index.d.ts: the types entry is
    // declared in package.json, but the build never produced the file.
    let entries = vec![PackageEntry { name: "@fix/incomplete".to_string(), dir, private: false }];

    let out = TempDir::new().unwrap();
    let result = extract_packages(
        &entries,
        &ExtractOpts {
            repo_root: root,
            output_dir: out.path().to_path_buf(),
            check_build_freshness: true,
            allow_empty: false,
        },
    )
    .await;

    let err = result.expect_err(
        "expected extract_packages to bail on a missing declared types entry under freshness checking",
    );
    assert!(err.to_string().contains("Build incomplete"), "unexpected error message: {err}");
}

/// Hermetic regression test for the open risk flagged in Task 6: `get-published-api`
/// points `PackageEntry::dir` at a tmp install's `node_modules/<name>` (NOT the repo's
/// node_modules). `run_ts_doc` symlinks each package's `.d.ts` directory into its parcel
/// work dir and references it via a relative `docs:` specifier — whether a *bare*
/// cross-package import (`import {X} from '@scope/other'`) still resolves from the real
/// install root (rather than failing, or silently resolving against the repo's own
/// node_modules) depends on whether parcel's resolver follows the symlink's realpath.
///
/// We build two packages that exist ONLY inside a throwaway install root — their names
/// are absent from the repo's node_modules — so any successful resolution of `@fix/dep`
/// from inside `@fix/main` can only have come from the install root itself.
#[tokio::test]
async fn extract_published_style_cross_package_resolves() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        eprintln!("skipping: parcel3 / @parcel/transformer-ts-doc not installed");
        return;
    }

    // Simulate a published-tarball install root: a node_modules/ containing two
    // packages, one importing a type from the other via a bare specifier.
    let install = TempDir::new().unwrap();
    let nm = install.path().join("node_modules");

    let dep_dir = nm.join("@fix/dep");
    std::fs::create_dir_all(&dep_dir).unwrap();
    std::fs::write(
        dep_dir.join("package.json"),
        r#"{"name":"@fix/dep","types":"index.d.ts"}"#,
    )
    .unwrap();
    std::fs::write(
        dep_dir.join("index.d.ts"),
        "export interface DepType { x: number; y: number; }\n",
    )
    .unwrap();

    let main_dir = nm.join("@fix/main");
    std::fs::create_dir_all(&main_dir).unwrap();
    std::fs::write(
        main_dir.join("package.json"),
        r#"{"name":"@fix/main","types":"index.d.ts"}"#,
    )
    .unwrap();
    std::fs::write(
        main_dir.join("index.d.ts"),
        "import {DepType} from '@fix/dep';\nexport interface MainProps { dep: DepType; label: string; }\n",
    )
    .unwrap();

    let entries = vec![
        PackageEntry { name: "@fix/dep".to_string(), dir: dep_dir, private: false },
        PackageEntry { name: "@fix/main".to_string(), dir: main_dir, private: false },
    ];

    let out = TempDir::new().unwrap();
    let result = extract_packages(
        &entries,
        &ExtractOpts {
            repo_root: root,
            output_dir: out.path().to_path_buf(),
            check_build_freshness: false,
            allow_empty: false,
        },
    )
    .await;
    assert!(
        result.is_ok(),
        "extract_packages failed on a published-style install layout \
         (this is the cross-package resolution risk Task 6 flagged):\n{:?}",
        result.err()
    );

    let dep_api = out.path().join("@fix/dep/dist/api.json");
    let main_api = out.path().join("@fix/main/dist/api.json");
    assert!(dep_api.exists(), "missing {}", dep_api.display());
    assert!(main_api.exists(), "missing {}", main_api.display());

    // Both packages must also self-diff clean through the real differ.
    let pairs = discover_pairs(out.path(), out.path()).unwrap();
    assert_eq!(pairs.len(), 2);
    for p in &pairs {
        let d = diff_package(&p.package_name, &p.base, &p.branch, true);
        assert!(d.diffs.is_empty(), "self-diff for {} should be empty", p.package_name);
    }

    // The crux of the test: did `MainProps.dep` actually resolve `DepType` from the
    // install root, or did it come back unresolved?
    let main_json = std::fs::read_to_string(&main_api).unwrap();
    let v: serde_json::Value = serde_json::from_str(&main_json).unwrap();
    let dep_value = &v["exports"]["MainProps"]["properties"]["dep"]["value"];
    let dep_value_str = serde_json::to_string_pretty(dep_value).unwrap();
    println!("MainProps.dep value node:\n{dep_value_str}");

    let type_field = dep_value.get("type").and_then(|t| t.as_str()).unwrap_or("<missing>");
    let mentions_dep_type = dep_value_str.contains("DepType");
    let has_x_and_y_props = dep_value
        .get("properties")
        .map(|p| p.get("x").is_some() && p.get("y").is_some())
        .unwrap_or(false);

    assert!(
        type_field != "any",
        "cross-package resolution from the install root is BROKEN: MainProps.dep \
         resolved to `any` instead of DepType.\nvalue node:\n{dep_value_str}\n\n\
         full @fix/main api.json:\n{main_json}"
    );
    assert!(
        mentions_dep_type || has_x_and_y_props,
        "MainProps.dep did not reference or inline DepType (expected a link/reference/\
         identifier mentioning \"DepType\", or an inlined interface/object with x/y).\n\
         value node:\n{dep_value_str}\n\nfull @fix/main api.json:\n{main_json}"
    );
}

/// Regression: the CLI passes RELATIVE paths — `--repo-root .` (CI uses `..`)
/// and a relative `--output` (default `dist/branch-api`). Both must be made
/// absolute internally, or two distinct failures appear:
///   1. a relative repo root makes the work-dir `node_modules` symlink target
///      relative, so it resolves against the work dir and loops on itself
///      (ELOOP: "Too many levels of symbolic links");
///   2. a relative output/work dir makes parcel — which runs with cwd = work
///      dir — resolve `--dist-dir`/`--config`/entry against that cwd and double
///      the path (`.../.parcel-work/dist/branch-api/.parcel-work/...`), after
///      which the Rust side can't find the emitted dist dir.
/// This drives the real `extract_packages` path with both relative, exactly as
/// the CLI does. The test process runs from the crate dir, so `..` is the repo
/// root; the throwaway output lives under the gitignored `target/` dir.
#[tokio::test]
async fn extract_packages_works_with_relative_cli_paths() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        eprintln!("skipping: parcel3 / @parcel/transformer-ts-doc not installed");
        return;
    }

    let pkgs = TempDir::new().unwrap();
    let entry = write_pkg(
        pkgs.path(),
        "@fix/relthing",
        "export interface RelThing { a: number; }\n",
    );

    let rel_out = std::path::PathBuf::from("target/reltest-extract-out");
    let _ = std::fs::remove_dir_all(&rel_out);
    let result = extract_packages(
        &[entry],
        &ExtractOpts {
            repo_root: std::path::PathBuf::from(".."),
            output_dir: rel_out.clone(),
            check_build_freshness: false,
            allow_empty: false,
        },
    )
    .await;

    let produced = rel_out.join("@fix/relthing/dist/api.json");
    let produced_exists = produced.exists();
    let _ = std::fs::remove_dir_all(&rel_out); // clean up regardless of outcome

    result.expect("extract_packages must work with a relative repo_root + output_dir");
    assert!(produced_exists, "expected api.json at {}", produced.display());
}


/// `@parcel/transformer-ts-doc` cannot resolve an `import("react").Foo` type
/// query and erases the whole declaration to `any`, which silently drops every
/// prop of the components `tsc` spells that way. `run_ts_doc` works around it
/// by staging a mirror in which those queries are rewritten to `React.Foo`
/// behind a namespace import.
///
/// This pins that workaround: both spellings must come back as real component
/// types, never `any`.
#[tokio::test]
async fn import_type_queries_survive_extraction() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        return;
    }

    // Must live inside the repo so that `react` resolves from node_modules.
    let fixture = TempDir::new_in(&root).unwrap();
    std::fs::write(
        fixture.path().join("package.json"),
        r#"{"name":"import-query-fixture"}"#,
    )
    .unwrap();

    let decl = |ty: &str, name: &str| {
        format!(
            "export interface P {{ a?: number }}\n\
             export declare const {name}: {ty}.ForwardRefExoticComponent<P & {ty}.RefAttributes<HTMLDivElement>>;\n"
        )
    };

    std::fs::write(
        fixture.path().join("erased.d.ts"),
        decl("import(\"react\")", "Erased"),
    )
    .unwrap();
    std::fs::write(
        fixture.path().join("rewritten.d.ts"),
        format!(
            "import type * as React from 'react';\n{}",
            decl("React", "Rewritten")
        ),
    )
    .unwrap();

    let work = TempDir::new().unwrap();
    let export_of = |file: &str, name: &str| {
        let path = fixture.path().join(format!("{file}.d.ts"));
        let root = root.clone();
        let work = work.path().to_path_buf();
        let name = name.to_string();
        async move {
            let json = run_ts_doc(&root, &work, &path, &name).await.unwrap();
            let v: serde_json::Value = serde_json::from_str(&json).unwrap();
            v["exports"][&name].clone()
        }
    };

    for (file, name) in [("erased", "Erased"), ("rewritten", "Rewritten")] {
        let node = export_of(file, name).await;
        assert_ne!(
            node["type"], "any",
            "{file}.d.ts was erased to `any` by the transformer: {node}"
        );
        assert!(
            serde_json::to_string(&node)
                .unwrap()
                .contains("ForwardRefExoticComponent"),
            "{file}.d.ts lost its component type: {node}"
        );
    }
}

/// The full pipeline for the shape that used to fail silently:
/// `.d.ts` -> `import("react")` rewrite -> transformer -> `api.json` ->
/// component normalization -> rendered diff.
///
/// `tsc` spells a forwardRef component this way whenever the source file has
/// no `React` binding in scope. The transformer erases the type query to
/// `any`, which dropped every prop of the affected components from the report
/// without any error — the extract still "succeeded". This asserts the props
/// make it all the way to the diff text.
#[tokio::test]
async fn forward_ref_component_props_survive_from_dts_to_diff_output() {
    let root = repo_root();
    if !ts_doc_available(&root) {
        eprintln!("skipping: parcel3 not installed");
        return;
    }

    let component_dts = |extra_prop: &str| {
        format!(
            "export interface ButtonProps {{ isDisabled?: boolean; {extra_prop} }}\n\
             export declare const Button: import(\"react\").ForwardRefExoticComponent<\
             ButtonProps & import(\"react\").RefAttributes<HTMLButtonElement>>;\n"
        )
    };

    // Extract the same package twice: once as-is, once with an added prop.
    let mut out_dirs = Vec::new();
    let mut pkg_tmps = Vec::new();
    for dts in [component_dts(""), component_dts("isFoo?: boolean;")] {
        let pkgs_tmp = TempDir::new().unwrap();
        let entries = vec![write_pkg(pkgs_tmp.path(), "@fix/button", &dts)];
        let out = TempDir::new().unwrap();
        extract_packages(
            &entries,
            &ExtractOpts {
                repo_root: root.clone(),
                output_dir: out.path().to_path_buf(),
                check_build_freshness: false,
                allow_empty: false,
            },
        )
        .await
        .expect("extract_packages failed");
        out_dirs.push(out);
        pkg_tmps.push(pkgs_tmp);
    }

    // The emitted api.json must not have collapsed the component to `any`.
    let api_json =
        std::fs::read_to_string(out_dirs[0].path().join("@fix/button/dist/api.json")).unwrap();
    let parsed: serde_json::Value = serde_json::from_str(&api_json).unwrap();
    assert_ne!(
        parsed["exports"]["Button"]["type"], "any",
        "the import() type query was erased: {api_json}"
    );

    let pairs = discover_pairs(out_dirs[0].path(), out_dirs[1].path()).unwrap();
    assert_eq!(pairs.len(), 1);
    let diff = diff_package(&pairs[0].package_name, &pairs[0].base, &pairs[0].branch, true);

    let button = diff
        .diffs
        .iter()
        .find(|d| d.qualified_name == "@fix/button:Button")
        .unwrap_or_else(|| {
            panic!(
                "Button missing from the report: {:?}",
                diff.diffs.iter().map(|d| &d.qualified_name).collect::<Vec<_>>()
            )
        });

    assert!(
        !button.diff_text.contains("UNTYPED"),
        "Button lost its type:\n{}",
        button.diff_text
    );
    assert!(
        button.diff_text.contains("isFoo"),
        "the added prop should reach the diff:\n{}",
        button.diff_text
    );
    // The untouched prop proves props were really collected, not just the one
    // that changed.
    assert!(
        button.diff_text.contains("isDisabled"),
        "existing props should be rendered as context:\n{}",
        button.diff_text
    );
}
