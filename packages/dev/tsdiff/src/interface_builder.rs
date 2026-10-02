//! Reconstructs a simplified interface representation from the raw [`ApiJson`]
//! exports. This is the Rust equivalent of `rebuildInterfaces()` in compareAPIs.js.

use indexmap::IndexMap;
use serde_json::Value as JsonValue;

use crate::api_json::{ApiJson, TypeNode};
use crate::type_renderer::{render_type, RenderContext};

/// A single property in a rebuilt interface.
#[derive(Debug, Clone)]
pub struct PropertyData {
    pub optional: bool,
    pub default_val: Option<String>,
    pub value: String,
}

/// A rebuilt interface/function/component export.
#[derive(Debug, Clone)]
pub enum RebuiltExport {
    /// A structured interface with named properties.
    Interface {
        type_params: Option<String>,
        extends: Option<String>,
        properties: IndexMap<String, PropertyData>,
    },
    /// An untyped or unrecognized export.
    Untyped,
}

/// Rebuild all exports from an [`ApiJson`] into displayable interfaces.
///
/// Returns a map from export name → rebuilt representation, plus populates
/// the `ctx.dependencies` graph.
pub fn rebuild_interfaces(
    json: &ApiJson,
    ctx: &mut RenderContext,
) -> IndexMap<String, RebuiltExport> {
    let mut result = IndexMap::new();

    for (key, item) in &json.exports {
        ctx.current_export = key.clone();

        let rebuilt = rebuild_single(key, item, &json.links, ctx);
        let name = export_name(key, item);
        result.insert(name, rebuilt);
    }

    result
}

/// Extract the display name for an export.
fn export_name(key: &str, node: &TypeNode) -> String {
    match node {
        TypeNode::Component { name: Some(n), .. }
        | TypeNode::Function { name: Some(n), .. }
        | TypeNode::Interface { name: Some(n), .. }
        | TypeNode::Alias { name: Some(n), .. } => n.clone(),
        _ => key.to_string(),
    }
}

/// Follow a `link` node to the declaration it names.
///
/// The legacy extractor bundled the whole program, so a component's `props`
/// arrived as a fully inlined `interface` node. `transformer-ts-doc` instead
/// emits a `link` plus a top-level `links` table, so resolving here restores
/// the shape the rest of this module expects.
///
/// A generic component (`Breadcrumbs<T>`) arrives as
/// `application(link(BreadcrumbsProps), [T])`; legacy inlined the interface
/// and left `T` symbolic, so the type arguments are simply dropped.
///
/// Only used for component props: links elsewhere intentionally keep
/// rendering as their bare name, which is what legacy did too.
fn resolve_props<'a>(
    node: &'a TypeNode,
    links: &'a IndexMap<String, TypeNode>,
) -> Option<&'a TypeNode> {
    let id = match node {
        TypeNode::Link { id: Some(id) } => id,
        TypeNode::Application { base, .. } => match base.as_ref() {
            TypeNode::Link { id: Some(id) } => id,
            _ => return None,
        },
        _ => return None,
    };
    links.get(id)
}

/// Flatten a component's `props` type into `out`, following links, aliases and
/// intersections. Returns `false` when the shape carried no properties we
/// could resolve, so the caller can fall back to rendering it as a single
/// entry (what legacy did for props it could not see into).
fn collect_component_props(
    node: &TypeNode,
    links: &IndexMap<String, TypeNode>,
    out: &mut IndexMap<String, PropertyData>,
    ctx: &mut RenderContext,
    depth: usize,
) -> bool {
    // Links can legitimately chain (alias → alias); bound the walk so a
    // self-referential table can't hang the differ.
    if depth > 8 {
        return false;
    }

    match node {
        TypeNode::Interface {
            properties: iface_props,
            ..
        } => {
            collect_properties(iface_props, out, ctx);
            true
        }
        TypeNode::Object {
            properties: Some(obj_props),
            ..
        } => {
            collect_properties(obj_props, out, ctx);
            true
        }
        TypeNode::Alias { value, .. } => {
            collect_component_props(value, links, out, ctx, depth + 1)
        }
        // `Props & StyleProps`: legacy inlined every member.
        TypeNode::Intersection { types } => {
            let mut any = false;
            for member in types {
                any |= collect_component_props(member, links, out, ctx, depth + 1);
            }
            any
        }
        TypeNode::Link { .. } | TypeNode::Application { .. } => {
            // `PropsWithoutRef<X>` only strips `ref`, which is rendered from the
            // component's ref type instead. Its base is a plain identifier, so
            // `resolve_props` cannot follow it — unwrap to `X` first, otherwise
            // every prop of the wrapped type is silently dropped.
            if let Some(inner) = unwrap_props_helper(node) {
                return collect_component_props(inner, links, out, ctx, depth + 1);
            }
            match resolve_props(node, links) {
                Some(target) => collect_component_props(target, links, out, ctx, depth + 1),
                None => false,
            }
        }
        _ => false,
    }
}

/// `PropsWithoutRef<X>` / `PropsWithChildren<X>` -> `X`.
///
/// These are React utility types whose base is an unresolvable identifier, so
/// they have to be peeled before prop collection.
fn unwrap_props_helper(node: &TypeNode) -> Option<&TypeNode> {
    let TypeNode::Application {
        base,
        type_parameters,
    } = node
    else {
        return None;
    };
    let TypeNode::Identifier { name } = base.as_ref() else {
        return None;
    };
    let short = name.rsplit('.').next().unwrap_or(name);
    if !matches!(short, "PropsWithoutRef" | "PropsWithChildren") {
        return None;
    }
    type_parameters.first()
}

fn rebuild_single(
    key: &str,
    item: &TypeNode,
    links: &IndexMap<String, TypeNode>,
    ctx: &mut RenderContext,
) -> RebuiltExport {
    match item {
        TypeNode::Component {
            name,
            props,
            type_parameters,
            ..
        } => {
            let mut properties = IndexMap::new();
            let display_name = name.as_deref().unwrap_or(key);

            if let Some(props_node) = props.as_deref() {
                if !collect_component_props(props_node, links, &mut properties, ctx, 0) {
                    // Props we can't see into (e.g. a link into a package that
                    // isn't part of this extraction) render as a single entry,
                    // matching the legacy output for the same situation.
                    if matches!(
                        props_node,
                        TypeNode::Link { .. } | TypeNode::Identifier { .. }
                    ) {
                        let val = render_type(props_node, ctx);
                        properties.insert(
                            display_name.to_string(),
                            PropertyData {
                                optional: false,
                                default_val: None,
                                value: val,
                            },
                        );
                    }
                }
            }

            let type_params = format_type_params(type_parameters, ctx);
            let extends = extract_extends(props.as_deref(), ctx);

            RebuiltExport::Interface {
                type_params,
                extends,
                properties,
            }
        }

        TypeNode::Function {
            parameters,
            return_type,
            type_parameters,
            ..
        } => {
            let mut properties = IndexMap::new();

            for (_, param) in parameters.iter_ordered() {
                if let TypeNode::Parameter {
                    name: param_name,
                    value,
                    optional,
                    ..
                } = param
                {
                    let name = param_name.as_deref().unwrap_or("arg");
                    if is_private(param) {
                        continue;
                    }
                    properties.insert(
                        name.to_string(),
                        PropertyData {
                            optional: *optional,
                            default_val: None,
                            value: render_type(value, ctx),
                        },
                    );
                }
            }

            if let Some(ret) = return_type {
                properties.insert(
                    "returnVal".to_string(),
                    PropertyData {
                        optional: false,
                        default_val: None,
                        value: render_type(ret, ctx),
                    },
                );
            } else {
                properties.insert(
                    "returnVal".to_string(),
                    PropertyData {
                        optional: false,
                        default_val: None,
                        value: "undefined".into(),
                    },
                );
            }

            RebuiltExport::Interface {
                type_params: format_type_params(type_parameters, ctx),
                extends: None,
                properties,
            }
        }

        TypeNode::Interface {
            properties: iface_props,
            type_parameters,
            extends,
            ..
        } => {
            let mut properties = IndexMap::new();
            collect_sorted_properties(iface_props, &mut properties, ctx);

            let extends_str = if extends.is_empty() {
                None
            } else {
                let parts: Vec<String> = extends
                    .iter()
                    .map(|e| render_type(e, ctx))
                    .collect();
                Some(format!("extends {}", parts.join(", ")))
            };

            RebuiltExport::Interface {
                type_params: format_type_params(type_parameters, ctx),
                extends: extends_str,
                properties,
            }
        }

        TypeNode::Alias {
            value,
            type_parameters,
            name,
            ..
        } => {
            // If the alias resolves to an interface-like shape, rebuild it
            match value.as_ref() {
                TypeNode::Interface {
                    properties: iface_props,
                    type_parameters: inner_tp,
                    extends,
                    ..
                } => {
                    let mut properties = IndexMap::new();
                    collect_sorted_properties(iface_props, &mut properties, ctx);

                    let tp = if !type_parameters.is_empty() {
                        format_type_params(type_parameters, ctx)
                    } else {
                        format_type_params(inner_tp, ctx)
                    };

                    let extends_str = if extends.is_empty() {
                        None
                    } else {
                        let parts: Vec<String> = extends
                            .iter()
                            .map(|e| render_type(e, ctx))
                            .collect();
                        Some(format!("extends {}", parts.join(", ")))
                    };

                    RebuiltExport::Interface {
                        type_params: tp,
                        extends: extends_str,
                        properties,
                    }
                }
                _ => {
                    let val = render_type(value, ctx);
                    let mut properties = IndexMap::new();
                    properties.insert(
                        name.as_deref().unwrap_or(key).to_string(),
                        PropertyData {
                            optional: false,
                            default_val: None,
                            value: val,
                        },
                    );
                    RebuiltExport::Interface {
                        type_params: format_type_params(type_parameters, ctx),
                        extends: None,
                        properties,
                    }
                }
            }
        }

        TypeNode::Link { id } => {
            // Type alias that's just a link - render as a simple value
            if let Some(id_str) = id {
                let name = id_str.rsplit(':').next().unwrap_or(id_str);
                let mut properties = IndexMap::new();
                properties.insert(
                    name.to_string(),
                    PropertyData {
                        optional: false,
                        default_val: None,
                        value: render_type(item, ctx),
                    },
                );
                RebuiltExport::Interface {
                    type_params: None,
                    extends: None,
                    properties,
                }
            } else {
                RebuiltExport::Untyped
            }
        }

        // `export const X = {...}` arrives as a bare object literal type. Flatten it
        // the same way an interface is flattened so its members are comparable.
        TypeNode::Object {
            properties: Some(obj_props),
            ..
        } => {
            let mut properties = IndexMap::new();
            collect_sorted_properties(obj_props, &mut properties, ctx);
            RebuiltExport::Interface {
                type_params: None,
                extends: None,
                properties,
            }
        }

        TypeNode::Unknown => RebuiltExport::Untyped,

        // Anything else still carries a renderable type (unions of overloads, aliases
        // to lib types, tuples, ...). Emitting it as a single entry keeps the value in
        // the comparison instead of collapsing the export to UNTYPED.
        other => {
            let rendered = render_type(other, ctx);
            if rendered.is_empty() || rendered == "unknown" {
                return RebuiltExport::Untyped;
            }
            let mut properties = IndexMap::new();
            properties.insert(
                key.to_string(),
                PropertyData {
                    optional: false,
                    default_val: None,
                    value: rendered,
                },
            );
            RebuiltExport::Interface {
                type_params: None,
                extends: None,
                properties,
            }
        }
    }
}

fn collect_properties(
    props: &IndexMap<String, TypeNode>,
    out: &mut IndexMap<String, PropertyData>,
    ctx: &mut RenderContext,
) {
    // Sort by key so diff output is stable no matter what order the TS
    // compiler emitted properties in. Property ordering out of the compiler
    // depends on resolution order, which depends on entry-file order — so
    // two otherwise-identical api.jsons can reorder keys between runs.
    let mut sorted: Vec<_> = props.iter().collect();
    sorted.sort_by(|(a, _), (b, _)| a.cmp(b));
    for (_, prop) in sorted {
        add_property(prop, out, ctx);
    }
}

fn collect_sorted_properties(
    props: &IndexMap<String, TypeNode>,
    out: &mut IndexMap<String, PropertyData>,
    ctx: &mut RenderContext,
) {
    collect_properties(props, out, ctx);
}

fn add_property(prop: &TypeNode, out: &mut IndexMap<String, PropertyData>, ctx: &mut RenderContext) {
    match prop {
        TypeNode::Property {
            name,
            value,
            optional,
            default,
            access,
            ..
        } => {
            if is_access_private(access.as_deref()) {
                return;
            }
            // Set depth to 2 to match property indentation ("  ") so inline objects nest correctly
            let saved_depth = ctx.depth;
            ctx.depth = 2;
            let rendered = render_type(value, ctx);
            ctx.depth = saved_depth;
            out.insert(
                name.clone(),
                PropertyData {
                    optional: *optional,
                    default_val: format_json_default(default),
                    value: rendered,
                },
            );
        }
        TypeNode::Method {
            name,
            value,
            optional,
            default,
            access,
            ..
        } => {
            if is_access_private(access.as_deref()) {
                return;
            }
            let saved_depth = ctx.depth;
            ctx.depth = 2;
            let rendered = render_type(value, ctx);
            ctx.depth = saved_depth;
            out.insert(
                name.clone(),
                PropertyData {
                    optional: *optional,
                    default_val: format_json_default(default),
                    value: rendered,
                },
            );
        }
        _ => {}
    }
}

fn is_private(node: &TypeNode) -> bool {
    match node {
        TypeNode::Property { access, .. }
        | TypeNode::Method { access, .. } => is_access_private(access.as_deref()),
        _ => false,
    }
}

fn is_access_private(access: Option<&str>) -> bool {
    matches!(access, Some("private") | Some("protected"))
}

fn format_json_default(val: &Option<JsonValue>) -> Option<String> {
    match val {
        None | Some(JsonValue::Null) => None,
        Some(JsonValue::String(s)) => Some(s.clone()),
        Some(v) => Some(v.to_string()),
    }
}

fn format_type_params(params: &[TypeNode], ctx: &mut RenderContext) -> Option<String> {
    if params.is_empty() {
        return None;
    }
    // Declaration order, NOT sorted. Type parameter position is part of the
    // API: `AsyncListOptions<T, C>` and `AsyncListOptions<C, T>` are different
    // types to every caller that passes explicit type arguments. Sorting here
    // both printed the wrong signature and hid a reordering — a breaking
    // change — from the diff entirely.
    let rendered: Vec<String> = params.iter().map(|p| render_type(p, ctx)).collect();
    Some(format!("<{}>", rendered.join(", ")))
}

fn extract_extends(props: Option<&TypeNode>, ctx: &mut RenderContext) -> Option<String> {
    match props {
        Some(TypeNode::Interface { extends, .. }) if !extends.is_empty() => {
            let parts: Vec<String> = extends.iter().map(|e| render_type(e, ctx)).collect();
            let mut sorted = parts;
            sorted.sort();
            Some(format!("extends {}", sorted.join(", ")))
        }
        _ => None,
    }
}

// ── Formatting for diff output ──────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::api_json::{ApiJson, ParameterMap, TypeNode};
    use crate::type_renderer::RenderContext;
    use indexmap::IndexMap;

    fn make_property(name: &str, optional: bool, access: Option<&str>, value: TypeNode) -> TypeNode {
        TypeNode::Property {
            name: name.into(),
            index_type: None,
            value: Box::new(value),
            optional,
            description: None,
            access: access.map(str::to_string),
            default: None,
        }
    }

    fn make_iface(props: Vec<(&str, TypeNode)>) -> TypeNode {
        let mut map = IndexMap::new();
        for (name, ty) in props {
            map.insert(name.into(), make_property(name, false, None, ty));
        }
        TypeNode::Interface {
            id: None,
            name: Some("MyInterface".into()),
            properties: map,
            type_parameters: vec![],
            extends: vec![],
            description: None,
            access: None,
        }
    }

    fn rebuild(node: TypeNode) -> (String, RebuiltExport) {
        let mut exports = IndexMap::new();
        exports.insert("TheExport".into(), node);
        let json = ApiJson { exports, links: IndexMap::new() };
        let mut ctx = RenderContext::new();
        let mut result = rebuild_interfaces(&json, &mut ctx);
        result.pop().unwrap()
    }

    // ── Interface ─────────────────────────────────────────────────────────

    #[test]
    fn test_interface_properties_sorted_alphabetically() {
        let node = make_iface(vec![
            ("zebra", TypeNode::String { value: None }),
            ("alpha", TypeNode::Number { value: None }),
            ("middle", TypeNode::Boolean { value: None }),
        ]);
        let (_, rebuilt) = rebuild(node);
        if let RebuiltExport::Interface { properties, .. } = rebuilt {
            let keys: Vec<&str> = properties.keys().map(String::as_str).collect();
            assert_eq!(keys, ["alpha", "middle", "zebra"]);
        } else {
            panic!("expected Interface");
        }
    }

    #[test]
    fn test_interface_filters_private_properties() {
        let mut props = IndexMap::new();
        props.insert("pub".into(), make_property("pub", false, None, TypeNode::String { value: None }));
        props.insert("sec".into(), make_property("sec", false, Some("private"), TypeNode::String { value: None }));
        props.insert("pro".into(), make_property("pro", false, Some("protected"), TypeNode::String { value: None }));

        let node = TypeNode::Interface {
            id: None,
            name: None,
            properties: props,
            type_parameters: vec![],
            extends: vec![],
            description: None,
            access: None,
        };
        let (_, rebuilt) = rebuild(node);
        if let RebuiltExport::Interface { properties, .. } = rebuilt {
            assert!(properties.contains_key("pub"));
            assert!(!properties.contains_key("sec"));
            assert!(!properties.contains_key("pro"));
        }
    }

    #[test]
    fn test_interface_with_external_extends() {
        let node = TypeNode::Interface {
            id: None,
            name: None,
            properties: IndexMap::new(),
            type_parameters: vec![],
            extends: vec![TypeNode::Identifier { name: "HTMLAttributes".into() }],
            description: None,
            access: None,
        };
        let (_, rebuilt) = rebuild(node);
        if let RebuiltExport::Interface { extends, .. } = rebuilt {
            assert_eq!(extends.as_deref(), Some("extends HTMLAttributes"));
        }
    }

    // ── Component ─────────────────────────────────────────────────────────

    #[test]
    fn test_component_extracts_inline_props() {
        let mut prop_map = IndexMap::new();
        prop_map.insert("label".into(), make_property("label", false, None, TypeNode::String { value: None }));

        let node = TypeNode::Component {
            id: None,
            name: Some("Button".into()),
            props: Some(Box::new(TypeNode::Interface {
                id: None,
                name: None,
                properties: prop_map,
                type_parameters: vec![],
                extends: vec![],
                description: None,
                access: None,
            })),
            type_parameters: vec![],
            ref_type: None,
            description: None,
            access: None,
        };
        let (_, rebuilt) = rebuild(node);
        if let RebuiltExport::Interface { properties, .. } = rebuilt {
            assert!(properties.contains_key("label"));
        }
    }

    // ── Function ──────────────────────────────────────────────────────────

    #[test]
    fn test_function_parameters_plus_return_val() {
        let mut params = IndexMap::new();
        params.insert(
            "input".into(),
            TypeNode::Parameter {
                name: Some("input".into()),
                value: Box::new(TypeNode::String { value: None }),
                optional: false,
                rest: false,
            },
        );
        let node = TypeNode::Function {
            id: None,
            name: Some("myFn".into()),
            parameters: ParameterMap::Map(params),
            return_type: Some(Box::new(TypeNode::Boolean { value: None })),
            type_parameters: vec![],
            description: None,
            access: None,
        };
        let (_, rebuilt) = rebuild(node);
        if let RebuiltExport::Interface { properties, .. } = rebuilt {
            assert!(properties.contains_key("input"));
            assert!(properties.contains_key("returnVal"));
            assert_eq!(properties["returnVal"].value, "boolean");
        }
    }

    #[test]
    fn test_function_without_return_type_gets_undefined() {
        let node = TypeNode::Function {
            id: None,
            name: None,
            parameters: ParameterMap::Map(IndexMap::new()),
            return_type: None,
            type_parameters: vec![],
            description: None,
            access: None,
        };
        let (_, rebuilt) = rebuild(node);
        if let RebuiltExport::Interface { properties, .. } = rebuilt {
            assert_eq!(properties["returnVal"].value, "undefined");
        }
    }

    // ── Alias ─────────────────────────────────────────────────────────────

    #[test]
    fn test_alias_wrapping_interface_is_structured() {
        let mut inner_props = IndexMap::new();
        inner_props.insert("x".into(), make_property("x", false, None, TypeNode::Number { value: None }));

        let node = TypeNode::Alias {
            id: None,
            name: Some("MyAlias".into()),
            value: Box::new(TypeNode::Interface {
                id: None,
                name: None,
                properties: inner_props,
                type_parameters: vec![],
                extends: vec![],
                description: None,
                access: None,
            }),
            type_parameters: vec![],
            description: None,
            access: None,
        };
        let (_, rebuilt) = rebuild(node);
        if let RebuiltExport::Interface { properties, .. } = rebuilt {
            assert!(properties.contains_key("x"));
        }
    }

    #[test]
    fn test_alias_wrapping_primitive_is_interface_with_name_key() {
        let node = TypeNode::Alias {
            id: None,
            name: Some("MyAlias".into()),
            value: Box::new(TypeNode::String { value: None }),
            type_parameters: vec![],
            description: None,
            access: None,
        };
        let (_, rebuilt) = rebuild(node);
        if let RebuiltExport::Interface { properties, .. } = rebuilt {
            // key should be the alias name
            assert!(properties.contains_key("MyAlias"));
            assert_eq!(properties["MyAlias"].value, "string");
        }
    }

    // ── format_prop ────────────────────────────────────────────────────────

    #[test]
    fn test_format_prop_required_no_default() {
        let prop = PropertyData { optional: false, default_val: None, value: "string".into() };
        assert_eq!(format_prop("name", &prop), "  name: string");
    }

    #[test]
    fn test_format_prop_optional_no_default() {
        let prop = PropertyData { optional: true, default_val: None, value: "number".into() };
        assert_eq!(format_prop("count", &prop), "  count?: number");
    }

    #[test]
    fn test_format_prop_with_default() {
        let prop = PropertyData {
            optional: true,
            default_val: Some("42".into()),
            value: "number".into(),
        };
        assert_eq!(format_prop("count", &prop), "  count?: number = 42");
    }

    // ── format_interface ──────────────────────────────────────────────────

    #[test]
    fn test_format_interface_basic() {
        let mut properties = IndexMap::new();
        properties.insert("foo".into(), PropertyData { optional: true, default_val: None, value: "string".into() });
        let export = RebuiltExport::Interface { type_params: None, extends: None, properties };
        let out = format_interface("MyInterface", &export);
        assert!(out.starts_with("MyInterface {"));
        assert!(out.contains("foo?: string"));
        assert!(out.ends_with("}\n"));
    }

    #[test]
    fn test_format_interface_with_type_params_and_extends() {
        let export = RebuiltExport::Interface {
            type_params: Some("<T>".into()),
            extends: Some("extends Base".into()),
            properties: IndexMap::new(),
        };
        let out = format_interface("MyInterface", &export);
        assert!(out.starts_with("MyInterface <T> extends Base {"));
    }

    #[test]
    fn test_format_interface_untyped() {
        let out = format_interface("Mystery", &RebuiltExport::Untyped);
        assert!(out.contains("UNTYPED"));
        assert!(out.contains("Mystery"));
    }

    #[test]
    fn test_format_interface_sorts_properties() {
        let mut properties = IndexMap::new();
        for name in ["zeta", "alpha", "middle"] {
            properties.insert(
                name.to_string(),
                PropertyData {
                    optional: false,
                    default_val: None,
                    value: "string".into(),
                },
            );
        }
        let out = format_interface(
            "Unsorted",
            &RebuiltExport::Interface {
                type_params: None,
                extends: None,
                properties,
            },
        );
        let order: Vec<&str> = out
            .lines()
            .filter_map(|l| l.strip_prefix("  "))
            .filter_map(|l| l.split(&['?', ':'][..]).next())
            .collect();
        assert_eq!(order, vec!["alpha", "middle", "zeta"]);
    }

    #[test]
    fn test_reordering_properties_is_not_a_diff() {
        let build = |names: [&str; 3]| {
            let mut properties = IndexMap::new();
            for n in names {
                properties.insert(
                    n.to_string(),
                    PropertyData {
                        optional: false,
                        default_val: None,
                        value: "number".into(),
                    },
                );
            }
            format_interface(
                "Same",
                &RebuiltExport::Interface {
                    type_params: None,
                    extends: None,
                    properties,
                },
            )
        };
        assert_eq!(build(["a", "b", "c"]), build(["c", "a", "b"]));
    }

    #[test]
    fn test_props_without_ref_is_unwrapped_when_collecting_props() {
        // `@react-spectrum/card:Card` is
        // `ForwardRefExoticComponent<ItemProps<P> & PropsWithoutRef<P> & RefAttributes<T>>`.
        // `PropsWithoutRef`'s base is a bare identifier, so without unwrapping it
        // every prop of `P` is dropped.
        let mut props = IndexMap::new();
        props.insert(
            "isQuiet".to_string(),
            TypeNode::Property {
                name: "isQuiet".into(),
                value: Box::new(TypeNode::Boolean { value: None }),
                optional: true,
                default: None,
                access: None,
                index_type: None,
                description: None,
            },
        );
        let target = TypeNode::Interface {
            id: Some("pkg:SpectrumCardProps".into()),
            name: Some("SpectrumCardProps".into()),
            extends: vec![],
            properties: props,
            type_parameters: vec![],
            description: None,
            access: None,
        };
        let mut links = IndexMap::new();
        links.insert("pkg:SpectrumCardProps".to_string(), target);

        let node = TypeNode::Application {
            base: Box::new(TypeNode::Identifier {
                name: "PropsWithoutRef".into(),
            }),
            type_parameters: vec![TypeNode::Link {
                id: Some("pkg:SpectrumCardProps".into()),
            }],
        };

        let mut out = IndexMap::new();
        let mut ctx = RenderContext::new();
        let collected = collect_component_props(&node, &links, &mut out, &mut ctx, 0);
        assert!(collected, "PropsWithoutRef<P> should resolve to P");
        assert!(out.contains_key("isQuiet"), "got {out:?}");
    }

    #[test]
    fn test_object_export_is_flattened() {
        // `export const ToastQueue = {...}` arrives as a bare object literal.
        let mut props = IndexMap::new();
        props.insert(
            "info".to_string(),
            TypeNode::Property {
                name: "info".into(),
                value: Box::new(TypeNode::String { value: None }),
                optional: false,
                default: None,
                access: None,
                index_type: None,
                description: None,
            },
        );
        let node = TypeNode::Object {
            properties: Some(props),
            exact: false,
        };
        let links = IndexMap::new();
        let mut ctx = RenderContext::new();
        let out = rebuild_single("ToastQueue", &node, &links, &mut ctx);
        match out {
            RebuiltExport::Interface { ref properties, .. } => {
                assert!(properties.contains_key("info"), "got {properties:?}");
            }
            other => panic!("expected flattened interface, got {other:?}"),
        }
    }

    #[test]
    fn test_unhandled_node_renders_value_instead_of_untyped() {
        // A top-level export whose type is an identifier we cannot resolve should
        // still report the type name rather than collapsing to UNTYPED.
        let node = TypeNode::Identifier {
            name: "ValidityState".into(),
        };
        let links = IndexMap::new();
        let mut ctx = RenderContext::new();
        let out = rebuild_single("VALID_VALIDITY_STATE", &node, &links, &mut ctx);
        let rendered = format_interface("VALID_VALIDITY_STATE", &out);
        assert!(!rendered.contains("UNTYPED"), "got {rendered}");
        assert!(rendered.contains("ValidityState"), "got {rendered}");
    }

    #[test]
    fn test_unknown_node_stays_untyped() {
        let links = IndexMap::new();
        let mut ctx = RenderContext::new();
        let out = rebuild_single("Mystery", &TypeNode::Unknown, &links, &mut ctx);
        assert!(matches!(out, RebuiltExport::Untyped));
    }
}

/// Format a single property as a display line.
pub fn format_prop(name: &str, prop: &PropertyData) -> String {
    let opt = if prop.optional { "?" } else { "" };
    let def = match &prop.default_val {
        Some(d) => format!(" = {d}"),
        None => String::new(),
    };
    format!("  {name}{opt}: {}{def}", prop.value)
}

/// Format an entire interface for diffing. The format is:
/// ```text
/// Name <TypeParams> extends Foo {
///
///   propA?: string
///   propB: number = 42
/// }
/// ```
pub fn format_interface(name: &str, export: &RebuiltExport) -> String {
    match export {
        RebuiltExport::Interface {
            type_params,
            extends,
            properties,
        } => {
            let mut header = name.to_string();
            if let Some(tp) = type_params {
                header.push(' ');
                header.push_str(tp);
            }
            if let Some(ext) = extends {
                header.push(' ');
                header.push_str(ext);
            }
            // Extra blank line after header so interface names always diff together
            header.push_str(" {\n\n");

            // Sort by name so that merely reordering members in the source does not
            // register as an API change.
            let mut entries: Vec<(&String, &PropertyData)> = properties.iter().collect();
            entries.sort_by(|a, b| a.0.cmp(b.0));
            let props: Vec<String> = entries
                .into_iter()
                .map(|(k, v)| format_prop(k, v))
                .collect();
            format!("{header}{}\n}}\n", props.join("\n"))
        }
        RebuiltExport::Untyped => {
            format!("{name} {{\n\n  UNTYPED\n}}\n")
        }
    }
}
