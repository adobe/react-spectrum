//! Renders [`TypeNode`] values into human-readable type strings that look like TypeScript.
//!
//! This is the single source of truth, replacing the triplicated `processType` functions
//! in the original JS codebase.

use std::collections::{HashMap, HashSet};

use crate::api_json::TypeNode;

/// Tracks state while rendering types: dependency links and indentation depth.
pub struct RenderContext {
    /// The fully-qualified name of the export currently being processed
    /// (e.g. `/@react-aria/button:ButtonProps`).
    pub current_export: String,
    /// Maps `exportName → [dependency names]`.
    pub dependencies: HashMap<String, Vec<String>>,
    /// Current indentation depth for nested objects.
    pub(crate) depth: usize,
}

impl RenderContext {
    pub fn new() -> Self {
        Self {
            current_export: String::new(),
            dependencies: HashMap::new(),
            depth: 0,
        }
    }

    /// Record that `current_export` depends on `dep_name`.
    fn add_dependency(&mut self, dep_name: &str) {
        if self.current_export.is_empty() {
            return;
        }
        let deps = self
            .dependencies
            .entry(self.current_export.clone())
            .or_default();
        if !deps.contains(&dep_name.to_string()) {
            deps.push(dep_name.to_string());
        }
    }
}

/// Render a [`TypeNode`] to a display string.
pub fn render_type(node: &TypeNode, ctx: &mut RenderContext) -> String {
    match node {
        // ── Primitives ──────────────────────────────────────────────
        TypeNode::Any => "any".into(),
        TypeNode::Null => "null".into(),
        TypeNode::Undefined => "undefined".into(),
        TypeNode::Void => "void".into(),
        TypeNode::Unknown => "unknown".into(),
        TypeNode::Never => "never".into(),
        TypeNode::This => "this".into(),
        TypeNode::Symbol => "symbol".into(),

        TypeNode::Boolean { .. } => "boolean".into(),
        TypeNode::Number { value: None } => "number".into(),
        TypeNode::Number { value: Some(v) } => v.to_string(),
        TypeNode::String { value: None } => "string".into(),
        TypeNode::String { value: Some(v) } => format!("'{v}'"),

        // ── Composite ───────────────────────────────────────────────
        TypeNode::Union { elements } => elements
            .iter()
            .map(|e| render_type(e, ctx))
            .collect::<Vec<_>>()
            .join(" | "),

        TypeNode::Intersection { types } => {
            let inner = types
                .iter()
                .map(|t| render_type(t, ctx))
                .collect::<Vec<_>>()
                .join(" & ");
            format!("({inner})")
        }

        TypeNode::Array { element_type } => {
            format!("Array<{}>", render_type(element_type, ctx))
        }

        TypeNode::Tuple { elements } => {
            let inner = elements
                .iter()
                .map(|e| render_type(e, ctx))
                .collect::<Vec<_>>()
                .join(", ");
            format!("[{inner}]")
        }

        TypeNode::Object {
            properties: Some(props),
            exact,
        } => {
            let open = if *exact { "{\\" } else { "{" };
            if props.is_empty() {
                return "{}".into();
            }
            let mut lines = Vec::new();
            ctx.depth += 2;
            for (_, prop) in props {
                let indent = " ".repeat(ctx.depth);
                let line = render_property(prop, ctx);
                lines.push(format!("{indent}{line}"));
            }
            ctx.depth -= 2;
            let close_indent = " ".repeat(ctx.depth);
            let close = if *exact { format!("{close_indent}\\}}") } else { format!("{close_indent}}}") };
            format!("{open}\n{}\n{close}", lines.join("\n"))
        }
        TypeNode::Object { properties: None, .. } => "{}".into(),

        // ── Generics / type-level ───────────────────────────────────
        TypeNode::Application {
            base,
            type_parameters,
        } => {
            let base_name = match base.as_ref() {
                TypeNode::Identifier { name } => name.clone(),
                other => render_type(other, ctx),
            };
            let args = type_parameters
                .iter()
                .map(|t| render_type(t, ctx))
                .collect::<Vec<_>>()
                .join(", ");
            format!("{base_name}<{args}>")
        }

        TypeNode::TypeParameter {
            name,
            constraint,
            default,
        } => {
            let mut out = name.clone();
            if let Some(c) = constraint {
                out.push_str(&format!(" extends {}", render_type(c, ctx)));
            }
            if let Some(d) = default {
                out.push_str(&format!(" = {}", render_type(d, ctx)));
            }
            out
        }

        TypeNode::Conditional {
            check_type,
            extends_type,
            true_type,
            false_type,
        } => {
            let sep = match false_type.as_ref() {
                TypeNode::Conditional { .. } => " :\n",
                _ => " : ",
            };
            format!(
                "{} extends {} ? {}{}{}",
                render_type(check_type, ctx),
                render_type(extends_type, ctx),
                render_type(true_type, ctx),
                sep,
                render_type(false_type, ctx),
            )
        }

        TypeNode::IndexedAccess {
            object_type,
            index_type,
        } => {
            format!(
                "{}[{}]",
                render_type(object_type, ctx),
                render_type(index_type, ctx),
            )
        }

        TypeNode::Keyof { keyof } => {
            format!("keyof {}", render_type(keyof, ctx))
        }

        TypeNode::TypeOperator { operator, value } => {
            format!("{operator} {}", render_type(value, ctx))
        }

        TypeNode::Mapped {
            type_parameter,
            type_annotation,
            readonly,
        } => {
            let prefix = match readonly.as_deref() {
                Some("-") => "-readonly",
                _ => "",
            };
            format!(
                "{prefix}{}: {}",
                render_type(type_parameter, ctx),
                render_type(type_annotation, ctx),
            )
        }

        TypeNode::Infer { value } => format!("infer {value}"),

        TypeNode::Template { elements } => {
            let parts: Vec<String> = elements
                .iter()
                .map(|e| match e {
                    TypeNode::String { value: Some(v) } => v.clone(),
                    other => format!("${{{}}}", render_type(other, ctx)),
                })
                .collect();
            format!("`{}`", parts.join(""))
        }

        // ── Named references ────────────────────────────────────────
        TypeNode::Identifier { name } => name.clone(),

        TypeNode::Link { id } => {
            if let Some(id) = id {
                let name = id
                    .rfind(':')
                    .map(|i| &id[i + 1..])
                    .unwrap_or(id)
                    .to_string();
                ctx.add_dependency(&name);
                name
            } else {
                "unknown".into()
            }
        }

        // ── Declarations (appear when flattening) ───────────────────
        TypeNode::Function {
            parameters,
            return_type,
            ..
        } => {
            let params = parameters
                .iter_ordered()
                .iter()
                .map(|(_, p)| render_type(p, ctx))
                .collect::<Vec<_>>()
                .join(", ");
            let ret = return_type
                .as_ref()
                .map(|r| render_type(r, ctx))
                .unwrap_or_else(|| "void".into());
            format!("({params}) => {ret}")
        }

        TypeNode::Parameter { value, .. } => render_type(value, ctx),

        TypeNode::Property { .. } | TypeNode::Method { .. } => {
            // Properties/methods are rendered via render_property
            render_property(node, ctx)
        }

        TypeNode::Interface { .. } | TypeNode::Component { .. } | TypeNode::Alias { .. } => {
            // These are handled at the interface_builder level
            "UNTYPED".into()
        }
    }
}

/// Render a property/method node as a single line: `name?: Type = default`
fn render_property(node: &TypeNode, ctx: &mut RenderContext) -> String {
    match node {
        TypeNode::Property {
            name,
            index_type,
            value,
            optional,
            default,
            ..
        } => {
            let name_part = if let Some(idx) = index_type {
                format!("[{}: {}]", name, render_type(idx, ctx))
            } else {
                name.clone()
            };
            let opt = if *optional { "?" } else { "" };
            let val = render_type(value, ctx);
            let def = format_default(default);
            format!("{name_part}{opt}: {val}{def}")
        }
        TypeNode::Method {
            name,
            value,
            optional,
            default,
            ..
        } => {
            let opt = if *optional { "?" } else { "" };
            let val = render_type(value, ctx);
            let def = format_default(default);
            format!("{name}{opt}: {val}{def}")
        }
        _ => render_type(node, ctx),
    }
}

fn format_default(default: &Option<serde_json::Value>) -> String {
    match default {
        Some(serde_json::Value::Null) => String::new(),
        Some(v) => {
            let s = match v {
                serde_json::Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            format!(" = {s}")
        }
        None => String::new(),
    }
}

/// Follow a chain of dependency names to find which changed dependencies
/// caused this export to change.
pub fn follow_dependencies(
    name: &str,
    deps: &HashMap<String, Vec<String>>,
    all_changed: &HashSet<String>,
) -> Vec<String> {
    let mut visited = HashSet::new();
    let mut result = Vec::new();
    fn visit(
        name: &str,
        deps: &HashMap<String, Vec<String>>,
        all_changed: &HashSet<String>,
        visited: &mut HashSet<String>,
        result: &mut Vec<String>,
    ) {
        if !visited.insert(name.to_string()) {
            return;
        }
        if let Some(dep_names) = deps.get(name) {
            for dep in dep_names {
                if all_changed.contains(dep) {
                    result.push(dep.clone());
                }
                visit(dep, deps, all_changed, visited, result);
            }
        }
    }
    visit(name, deps, all_changed, &mut visited, &mut result);
    result
}

/// Invert the dependency graph: from `A depends on [B, C]` to `B is depended on by [A]`.
pub fn invert_dependencies(
    deps: &HashMap<String, Vec<String>>,
) -> HashMap<String, Vec<String>> {
    let mut inverted: HashMap<String, Vec<String>> = HashMap::new();
    for (key, values) in deps {
        for val in values {
            inverted
                .entry(val.clone())
                .or_default()
                .push(key.clone());
        }
    }
    inverted
}

/// Follow inverted dependencies to find all exports affected by a change.
pub fn follow_inverted_dependencies(
    name: &str,
    inv_deps: &HashMap<String, Vec<String>>,
) -> Vec<String> {
    let mut visited = HashSet::new();
    let mut result = Vec::new();
    fn visit(
        name: &str,
        inv_deps: &HashMap<String, Vec<String>>,
        visited: &mut HashSet<String>,
        result: &mut Vec<String>,
    ) {
        if !visited.insert(name.to_string()) {
            return;
        }
        if let Some(affected) = inv_deps.get(name) {
            for dep in affected {
                result.push(dep.clone());
                visit(dep, inv_deps, visited, result);
            }
        }
    }
    visit(name, inv_deps, &mut visited, &mut result);
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::api_json::{ParameterMap, TypeNode};
    use indexmap::IndexMap;

    fn ctx() -> RenderContext {
        RenderContext::new()
    }

    fn render(node: &TypeNode) -> String {
        render_type(node, &mut ctx())
    }

    // ── Primitives ─────────────────────────────────────────────────────────

    #[test]
    fn test_primitive_unit_variants() {
        assert_eq!(render(&TypeNode::Any), "any");
        assert_eq!(render(&TypeNode::Null), "null");
        assert_eq!(render(&TypeNode::Undefined), "undefined");
        assert_eq!(render(&TypeNode::Void), "void");
        assert_eq!(render(&TypeNode::Unknown), "unknown");
        assert_eq!(render(&TypeNode::Never), "never");
        assert_eq!(render(&TypeNode::This), "this");
        assert_eq!(render(&TypeNode::Symbol), "symbol");
    }

    #[test]
    fn test_boolean_always_renders_as_boolean() {
        assert_eq!(render(&TypeNode::Boolean { value: None }), "boolean");
        assert_eq!(render(&TypeNode::Boolean { value: Some(true) }), "boolean");
        assert_eq!(render(&TypeNode::Boolean { value: Some(false) }), "boolean");
    }

    #[test]
    fn test_string_with_and_without_value() {
        assert_eq!(render(&TypeNode::String { value: None }), "string");
        assert_eq!(render(&TypeNode::String { value: Some("hello".into()) }), "'hello'");
    }

    #[test]
    fn test_number_with_and_without_value() {
        assert_eq!(render(&TypeNode::Number { value: None }), "number");
        assert_eq!(
            render(&TypeNode::Number { value: Some(serde_json::Number::from(42)) }),
            "42"
        );
    }

    // ── Composite ──────────────────────────────────────────────────────────

    #[test]
    fn test_union() {
        let node = TypeNode::Union {
            elements: vec![
                TypeNode::String { value: None },
                TypeNode::Null,
                TypeNode::Undefined,
            ],
        };
        assert_eq!(render(&node), "string | null | undefined");
    }

    #[test]
    fn test_intersection() {
        let node = TypeNode::Intersection {
            types: vec![
                TypeNode::Identifier { name: "A".into() },
                TypeNode::Identifier { name: "B".into() },
            ],
        };
        assert_eq!(render(&node), "(A & B)");
    }

    #[test]
    fn test_array() {
        let node = TypeNode::Array {
            element_type: Box::new(TypeNode::String { value: None }),
        };
        assert_eq!(render(&node), "Array<string>");
    }

    #[test]
    fn test_tuple() {
        let node = TypeNode::Tuple {
            elements: vec![TypeNode::String { value: None }, TypeNode::Number { value: None }],
        };
        assert_eq!(render(&node), "[string, number]");
    }

    #[test]
    fn test_empty_object() {
        assert_eq!(render(&TypeNode::Object { properties: None, exact: false }), "{}");
        assert_eq!(
            render(&TypeNode::Object { properties: Some(IndexMap::new()), exact: false }),
            "{}"
        );
    }

    #[test]
    fn test_object_with_property() {
        let mut props = IndexMap::new();
        props.insert(
            "x".into(),
            TypeNode::Property {
                name: "x".into(),
                index_type: None,
                value: Box::new(TypeNode::Number { value: None }),
                optional: false,
                description: None,
                access: None,
                default: None,
            },
        );
        let node = TypeNode::Object { properties: Some(props), exact: false };
        let result = render(&node);
        assert_eq!(result, "{\n  x: number\n}");
    }

    // ── Generics ───────────────────────────────────────────────────────────

    #[test]
    fn test_application() {
        let node = TypeNode::Application {
            base: Box::new(TypeNode::Identifier { name: "Promise".into() }),
            type_parameters: vec![TypeNode::String { value: None }],
        };
        assert_eq!(render(&node), "Promise<string>");
    }

    #[test]
    fn test_type_parameter_simple() {
        assert_eq!(
            render(&TypeNode::TypeParameter { name: "T".into(), constraint: None, default: None }),
            "T"
        );
    }

    #[test]
    fn test_type_parameter_with_constraint() {
        let node = TypeNode::TypeParameter {
            name: "T".into(),
            constraint: Some(Box::new(TypeNode::String { value: None })),
            default: None,
        };
        assert_eq!(render(&node), "T extends string");
    }

    #[test]
    fn test_type_parameter_with_default() {
        let node = TypeNode::TypeParameter {
            name: "T".into(),
            constraint: None,
            default: Some(Box::new(TypeNode::String { value: None })),
        };
        assert_eq!(render(&node), "T = string");
    }

    #[test]
    fn test_conditional_simple_false_type() {
        let node = TypeNode::Conditional {
            check_type: Box::new(TypeNode::Any),
            extends_type: Box::new(TypeNode::String { value: None }),
            true_type: Box::new(TypeNode::String { value: None }),
            false_type: Box::new(TypeNode::Never),
        };
        assert_eq!(render(&node), "any extends string ? string : never");
    }

    #[test]
    fn test_indexed_access() {
        let node = TypeNode::IndexedAccess {
            object_type: Box::new(TypeNode::Identifier { name: "Props".into() }),
            index_type: Box::new(TypeNode::String { value: Some("key".into()) }),
        };
        assert_eq!(render(&node), "Props['key']");
    }

    #[test]
    fn test_keyof() {
        let node = TypeNode::Keyof {
            keyof: Box::new(TypeNode::Identifier { name: "Props".into() }),
        };
        assert_eq!(render(&node), "keyof Props");
    }

    #[test]
    fn test_type_operator() {
        let node = TypeNode::TypeOperator {
            operator: "readonly".into(),
            value: Box::new(TypeNode::Array { element_type: Box::new(TypeNode::String { value: None }) }),
        };
        assert_eq!(render(&node), "readonly Array<string>");
    }

    #[test]
    fn test_mapped() {
        let node = TypeNode::Mapped {
            type_parameter: Box::new(TypeNode::TypeParameter {
                name: "K".into(),
                constraint: None,
                default: None,
            }),
            type_annotation: Box::new(TypeNode::String { value: None }),
            readonly: None,
        };
        assert_eq!(render(&node), "K: string");
    }

    #[test]
    fn test_infer() {
        assert_eq!(render(&TypeNode::Infer { value: "R".into() }), "infer R");
    }

    #[test]
    fn test_template_with_literal_and_interpolation() {
        let node = TypeNode::Template {
            elements: vec![
                TypeNode::String { value: Some("prefix-".into()) },
                TypeNode::Identifier { name: "T".into() },
                TypeNode::String { value: Some("-suffix".into()) },
            ],
        };
        assert_eq!(render(&node), "`prefix-${T}-suffix`");
    }

    // ── Named references ───────────────────────────────────────────────────

    #[test]
    fn test_identifier() {
        assert_eq!(render(&TypeNode::Identifier { name: "ReactNode".into() }), "ReactNode");
    }

    #[test]
    fn test_link_with_colon_extracts_short_name() {
        let node = TypeNode::Link { id: Some("@react-aria/button:ButtonProps".into()) };
        assert_eq!(render(&node), "ButtonProps");
    }

    #[test]
    fn test_link_without_colon_uses_full_id() {
        let node = TypeNode::Link { id: Some("MyType".into()) };
        assert_eq!(render(&node), "MyType");
    }

    #[test]
    fn test_link_no_id_renders_unknown() {
        assert_eq!(render(&TypeNode::Link { id: None }), "unknown");
    }

    #[test]
    fn test_link_records_dependency_on_current_export() {
        let node = TypeNode::Link { id: Some("@pkg:ButtonProps".into()) };
        let mut ctx = RenderContext::new();
        ctx.current_export = "ComboBoxProps".into();
        render_type(&node, &mut ctx);
        let deps = ctx.dependencies.get("ComboBoxProps").unwrap();
        assert!(deps.contains(&"ButtonProps".to_string()));
    }

    #[test]
    fn test_link_does_not_record_dependency_without_current_export() {
        let node = TypeNode::Link { id: Some("@pkg:ButtonProps".into()) };
        let mut ctx = RenderContext::new();
        render_type(&node, &mut ctx);
        assert!(ctx.dependencies.is_empty());
    }

    #[test]
    fn test_link_deduplicates_dependencies() {
        let node = TypeNode::Link { id: Some("@pkg:ButtonProps".into()) };
        let mut ctx = RenderContext::new();
        ctx.current_export = "A".into();
        render_type(&node, &mut ctx);
        render_type(&node, &mut ctx); // same dep twice
        let deps = ctx.dependencies.get("A").unwrap();
        assert_eq!(deps.iter().filter(|d| *d == "ButtonProps").count(), 1);
    }

    // ── Function / Parameter ───────────────────────────────────────────────

    #[test]
    fn test_function_with_parameters_and_return() {
        let mut params = IndexMap::new();
        params.insert(
            "x".into(),
            TypeNode::Parameter {
                name: Some("x".into()),
                value: Box::new(TypeNode::String { value: None }),
                optional: false,
                rest: false,
            },
        );
        let node = TypeNode::Function {
            id: None,
            name: None,
            parameters: ParameterMap::Map(params),
            return_type: Some(Box::new(TypeNode::Void)),
            type_parameters: vec![],
            description: None,
            access: None,
        };
        assert_eq!(render(&node), "(string) => void");
    }

    #[test]
    fn test_function_no_params_no_return_type_renders_void() {
        let node = TypeNode::Function {
            id: None,
            name: None,
            parameters: ParameterMap::Map(IndexMap::new()),
            return_type: None,
            type_parameters: vec![],
            description: None,
            access: None,
        };
        assert_eq!(render(&node), "() => void");
    }

    #[test]
    fn test_parameter_renders_inner_value() {
        let node = TypeNode::Parameter {
            name: Some("x".into()),
            value: Box::new(TypeNode::Number { value: None }),
            optional: false,
            rest: false,
        };
        assert_eq!(render(&node), "number");
    }

    // ── Dependency graph functions ─────────────────────────────────────────

    #[test]
    fn test_follow_dependencies_direct_match() {
        let mut deps = HashMap::new();
        deps.insert("A".into(), vec!["B".into()]);

        let mut changed = HashSet::new();
        changed.insert("B".into());

        let result = follow_dependencies("A", &deps, &changed);
        assert!(result.contains(&"B".to_string()));
    }

    #[test]
    fn test_follow_dependencies_no_changed_match() {
        let mut deps = HashMap::new();
        deps.insert("A".into(), vec!["B".into()]);

        let changed = HashSet::new(); // nothing changed

        let result = follow_dependencies("A", &deps, &changed);
        assert!(result.is_empty());
    }

    #[test]
    fn test_follow_dependencies_transitive_chain() {
        let mut deps = HashMap::new();
        deps.insert("A".into(), vec!["B".into()]);
        deps.insert("B".into(), vec!["C".into()]);

        let mut changed = HashSet::new();
        changed.insert("C".into());

        let result = follow_dependencies("A", &deps, &changed);
        assert!(result.contains(&"C".to_string()));
    }

    #[test]
    fn test_follow_dependencies_cycle_does_not_loop() {
        let mut deps = HashMap::new();
        deps.insert("A".into(), vec!["B".into()]);
        deps.insert("B".into(), vec!["A".into()]);

        let mut changed = HashSet::new();
        changed.insert("A".into());

        // Should terminate without infinite loop
        let result = follow_dependencies("A", &deps, &changed);
        let _ = result; // just checking it terminates
    }

    #[test]
    fn test_invert_dependencies() {
        let mut deps = HashMap::new();
        deps.insert("A".into(), vec!["B".into(), "C".into()]);
        deps.insert("X".into(), vec!["B".into()]);

        let inv = invert_dependencies(&deps);
        let b_affected = inv.get("B").unwrap();
        assert!(b_affected.contains(&"A".to_string()));
        assert!(b_affected.contains(&"X".to_string()));
        let c_affected = inv.get("C").unwrap();
        assert!(c_affected.contains(&"A".to_string()));
    }

    #[test]
    fn test_follow_inverted_dependencies_transitive() {
        let mut inv = HashMap::new();
        inv.insert("B".into(), vec!["A".into()]);
        inv.insert("A".into(), vec!["Root".into()]);

        let result = follow_inverted_dependencies("B", &inv);
        assert!(result.contains(&"A".to_string()));
        assert!(result.contains(&"Root".to_string()));
    }

    #[test]
    fn test_follow_inverted_dependencies_cycle_terminates() {
        let mut inv = HashMap::new();
        inv.insert("A".into(), vec!["B".into()]);
        inv.insert("B".into(), vec!["A".into()]);

        let result = follow_inverted_dependencies("A", &inv);
        assert!(result.contains(&"B".to_string()));
        // Should terminate, not panic
    }
}
