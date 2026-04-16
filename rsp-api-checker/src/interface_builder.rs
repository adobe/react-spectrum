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

        let rebuilt = rebuild_single(key, item, ctx);
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

fn rebuild_single(key: &str, item: &TypeNode, ctx: &mut RenderContext) -> RebuiltExport {
    match item {
        TypeNode::Component {
            name,
            props,
            type_parameters,
            ..
        } => {
            let mut properties = IndexMap::new();
            let display_name = name.as_deref().unwrap_or(key);

            if let Some(props_node) = props {
                match props_node.as_ref() {
                    TypeNode::Interface {
                        properties: iface_props,
                        ..
                    } => {
                        collect_properties(iface_props, &mut properties, ctx);
                    }
                    TypeNode::Link { .. } | TypeNode::Identifier { .. } => {
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
                    TypeNode::Object {
                        properties: Some(obj_props),
                        ..
                    } => {
                        collect_properties(obj_props, &mut properties, ctx);
                    }
                    _ => {}
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

        // Identifiers with no type info
        TypeNode::Identifier { .. } => RebuiltExport::Untyped,

        _ => RebuiltExport::Untyped,
    }
}

fn collect_properties(
    props: &IndexMap<String, TypeNode>,
    out: &mut IndexMap<String, PropertyData>,
    ctx: &mut RenderContext,
) {
    for (_, prop) in props {
        add_property(prop, out, ctx);
    }
}

fn collect_sorted_properties(
    props: &IndexMap<String, TypeNode>,
    out: &mut IndexMap<String, PropertyData>,
    ctx: &mut RenderContext,
) {
    let mut sorted: Vec<_> = props.iter().collect();
    sorted.sort_by(|(a, _), (b, _)| a.cmp(b));
    for (_, prop) in sorted {
        add_property(prop, out, ctx);
    }
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
    let rendered: Vec<String> = params.iter().map(|p| render_type(p, ctx)).collect();
    // Sort for stable output
    let mut sorted = rendered;
    sorted.sort();
    Some(format!("<{}>", sorted.join(", ")))
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

            let props: Vec<String> = properties
                .iter()
                .map(|(k, v)| format_prop(k, v))
                .collect();
            format!("{header}{}\n}}\n", props.join("\n"))
        }
        RebuiltExport::Untyped => {
            format!("{name} {{\n\n  UNTYPED\n}}\n")
        }
    }
}
