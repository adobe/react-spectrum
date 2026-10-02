//! Recovers `component` nodes from `.d.ts`-derived API JSON.
//!
//! The legacy `parcel-transformer-docs` ran over **source**, so it could see a
//! JSX return, a `forwardRef()` call, or a `createHideableComponent()` wrapper
//! and emit a dedicated `component` node carrying `props` and `ref`.
//!
//! `@parcel/transformer-ts-doc` runs over the emitted `.d.ts`, where all of
//! that has already been erased by `tsc` into one of two shapes:
//!
//! ```text
//! // 1. `export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>`
//! application(React.ForwardRefExoticComponent, [ intersection[ link(ButtonProps), application(React.RefAttributes, [HTMLButtonElement]) ] ])
//!
//! // 2. `export declare function Breadcrumb(props: BreadcrumbProps & React.RefAttributes<HTMLLIElement>): React.ReactElement | null`
//! function { parameters: [props], return: union[React.ReactElement, null] }
//! ```
//!
//! Without this pass those render as `UNTYPED` and as a
//! `props`/`returnVal` pair respectively, instead of the flattened prop table
//! the legacy extractor produced — which is the single largest source of
//! diff noise when comparing the two extractors.

use crate::api_json::{ApiJson, TypeNode};

/// Rewrite every export that is really a React component into a
/// [`TypeNode::Component`], in place.
pub fn normalize_components(json: &mut ApiJson) {
    let keys: Vec<String> = json.exports.keys().cloned().collect();
    for key in keys {
        let Some(node) = json.exports.get(&key) else {
            continue;
        };
        if let Some(component) = as_component(&key, node) {
            json.exports.insert(key, component);
        }
    }
}

/// Returns the `component` form of `node`, or `None` if it isn't a component.
fn as_component(key: &str, node: &TypeNode) -> Option<TypeNode> {
    match node {
        // Shape 1: `React.ForwardRefExoticComponent<Props & RefAttributes<T>>`.
        TypeNode::Application {
            base,
            type_parameters,
        } if is_forward_ref_exotic(base) && type_parameters.len() == 1 => {
            let (props, ref_type) = split_props_and_ref(&type_parameters[0]);
            Some(TypeNode::Component {
                id: None,
                name: Some(key.to_string()),
                props: Some(Box::new(props)),
                type_parameters: Vec::new(),
                ref_type: ref_type.map(Box::new),
                description: None,
                access: None,
            })
        }

        // Shape 2: a single-parameter function with a component-style name.
        //
        // Matching on the return type alone is not enough: `tsc` frequently
        // erases the return to `any` (see `is_import_type_erased` callers),
        // so 24 real components would be missed. Requiring a capitalized name
        // instead recovers all 181 of them, and misidentifies only
        // `@react-spectrum/s2:SkeletonCollection`, which legacy also renders
        // with a single `props` entry — so the residual diff is one line.
        TypeNode::Function {
            id,
            name,
            parameters,
            type_parameters,
            description,
            access,
            ..
        } if is_component_name(key) => {
            let params = parameters.iter_ordered();
            // Exactly one parameter: the props bag. A zero-parameter function
            // (e.g. `UNSTABLE_createLandmarkController()`) is a factory, and
            // anything taking two or more is a plain function.
            let [(_, param)] = params.as_slice() else {
                return None;
            };
            let TypeNode::Parameter { value, .. } = param else {
                return None;
            };
            let (props, ref_type) = split_props_and_ref(value);
            Some(TypeNode::Component {
                id: id.clone(),
                name: name.clone().or_else(|| Some(key.to_string())),
                props: Some(Box::new(props)),
                type_parameters: type_parameters.clone(),
                ref_type: ref_type.map(Box::new),
                description: description.clone(),
                access: access.clone(),
            })
        }

        _ => None,
    }
}

/// `React.ForwardRefExoticComponent`, `ForwardRefExoticComponent`, and the
/// `import("react").ForwardRefExoticComponent` spelling all reach us as an
/// identifier whose final segment is the type name.
fn is_forward_ref_exotic(base: &TypeNode) -> bool {
    matches!(base, TypeNode::Identifier { name } if last_segment(name) == "ForwardRefExoticComponent")
}

fn is_ref_attributes(node: &TypeNode) -> Option<&TypeNode> {
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
    if last_segment(name) != "RefAttributes" {
        return None;
    }
    type_parameters.first()
}

fn last_segment(name: &str) -> &str {
    name.rsplit('.').next().unwrap_or(name)
}

/// A React component is conventionally capitalized — that is in fact what JSX
/// itself uses to tell a component apart from an intrinsic element.
///
/// `UNSTABLE_`/`unstable_` prefixes are stripped first so that
/// `UNSTABLE_useTreeGridState` is correctly treated as a hook rather than a
/// component.
fn is_component_name(key: &str) -> bool {
    let bare = key
        .strip_prefix("UNSTABLE_")
        .or_else(|| key.strip_prefix("unstable_"))
        .unwrap_or(key);
    bare.chars().next().is_some_and(char::is_uppercase)
}

/// Split `Props & RefAttributes<T>` into `(Props, Some(T))`.
///
/// The intersection may carry more than two members, in which case everything
/// that isn't a `RefAttributes` stays on the props side.
fn split_props_and_ref(node: &TypeNode) -> (TypeNode, Option<TypeNode>) {
    let TypeNode::Intersection { types } = node else {
        return (node.clone(), None);
    };

    let mut ref_type = None;
    let mut props = Vec::new();
    for member in types {
        match is_ref_attributes(member) {
            Some(inner) if ref_type.is_none() => ref_type = Some(inner.clone()),
            _ => props.push(member.clone()),
        }
    }

    let props = match props.len() {
        // `ForwardRefExoticComponent<RefAttributes<T>>` with no props at all.
        0 => TypeNode::Unknown,
        1 => props.remove(0),
        _ => TypeNode::Intersection { types: props },
    };
    (props, ref_type)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn api(json: &str) -> ApiJson {
        serde_json::from_str(json).expect("fixture should parse")
    }

    fn props_name(node: &TypeNode) -> String {
        match node {
            TypeNode::Component { props, .. } => match props.as_deref() {
                Some(TypeNode::Link { id: Some(id) }) => {
                    id.rsplit(':').next().unwrap_or(id).to_string()
                }
                Some(TypeNode::Identifier { name }) => name.clone(),
                other => format!("{other:?}"),
            },
            other => panic!("expected a component, got {other:?}"),
        }
    }

    const FORWARD_REF: &str = r#"{"exports":{"Accordion":{
        "type":"application",
        "base":{"type":"identifier","name":"React.ForwardRefExoticComponent"},
        "typeParameters":[{"type":"intersection","types":[
            {"type":"link","id":"/x/Accordion.d.ts:AccordionProps"},
            {"type":"application","base":{"type":"identifier","name":"React.RefAttributes"},
             "typeParameters":[{"type":"identifier","name":"HTMLDivElement"}]}
        ]}]}}}"#;

    #[test]
    fn rewrites_forward_ref_exotic_component() {
        let mut json = api(FORWARD_REF);
        normalize_components(&mut json);
        let node = &json.exports["Accordion"];
        assert_eq!(props_name(node), "AccordionProps");
        let TypeNode::Component { ref_type, .. } = node else {
            panic!("expected component");
        };
        assert!(
            matches!(ref_type.as_deref(), Some(TypeNode::Identifier { name }) if name == "HTMLDivElement")
        );
    }

    const FUNCTION_COMPONENT: &str = r#"{"exports":{"Breadcrumb":{
        "type":"function","name":"Breadcrumb","description":"A breadcrumb.",
        "parameters":[{"type":"parameter","name":"props","value":{"type":"intersection","types":[
            {"type":"link","id":"/x/Breadcrumb.d.ts:BreadcrumbProps"},
            {"type":"application","base":{"type":"identifier","name":"React.RefAttributes"},
             "typeParameters":[{"type":"identifier","name":"HTMLLIElement"}]}
        ]},"optional":false,"rest":false}],
        "return":{"type":"union","elements":[{"type":"identifier","name":"React.ReactElement"},{"type":"null"}]}}}}"#;

    #[test]
    fn rewrites_single_param_function_component() {
        let mut json = api(FUNCTION_COMPONENT);
        normalize_components(&mut json);
        let node = &json.exports["Breadcrumb"];
        assert_eq!(props_name(node), "BreadcrumbProps");
        let TypeNode::Component { description, .. } = node else {
            panic!("expected component");
        };
        assert_eq!(description.as_deref(), Some("A breadcrumb."));
    }

    /// `tsc` erases `import("react").ReactElement` to `any`, so the return
    /// type carries no signal. The component must still be recovered.
    #[test]
    fn rewrites_function_component_with_erased_return() {
        let mut json = api(r#"{"exports":{"Chat":{"type":"function","name":"Chat",
            "parameters":[{"type":"parameter","name":"props","value":{"type":"link","id":"/x:ChatProps"},"optional":false,"rest":false}],
            "return":{"type":"any"}}}}"#);
        normalize_components(&mut json);
        assert_eq!(props_name(&json.exports["Chat"]), "ChatProps");
    }

    #[test]
    fn leaves_hooks_and_factories_alone() {
        let mut json = api(r#"{"exports":{
            "useCachedChildren":{"type":"function","name":"useCachedChildren",
              "parameters":[{"type":"parameter","name":"props","value":{"type":"any"},"optional":false,"rest":false}],
              "return":{"type":"identifier","name":"ReactNode"}},
            "UNSTABLE_useTreeGridState":{"type":"function","name":"UNSTABLE_useTreeGridState",
              "parameters":[{"type":"parameter","name":"props","value":{"type":"any"},"optional":false,"rest":false}],
              "return":{"type":"any"}},
            "UNSTABLE_createLandmarkController":{"type":"function","name":"UNSTABLE_createLandmarkController",
              "parameters":[],"return":{"type":"any"}},
            "Renderer":{"type":"function","name":"Renderer",
              "parameters":[
                {"type":"parameter","name":"a","value":{"type":"any"},"optional":false,"rest":false},
                {"type":"parameter","name":"b","value":{"type":"any"},"optional":false,"rest":false}],
              "return":{"type":"any"}}
        }}"#);
        normalize_components(&mut json);
        for key in [
            "useCachedChildren",
            "UNSTABLE_useTreeGridState",
            "UNSTABLE_createLandmarkController",
            "Renderer",
        ] {
            assert!(
                matches!(json.exports[key], TypeNode::Function { .. }),
                "{key} should not have been rewritten into a component"
            );
        }
    }

    #[test]
    fn keeps_extra_intersection_members_on_the_props_side() {
        let mut json = api(r#"{"exports":{"Card":{"type":"application",
            "base":{"type":"identifier","name":"ForwardRefExoticComponent"},
            "typeParameters":[{"type":"intersection","types":[
                {"type":"link","id":"/x:CardProps"},
                {"type":"link","id":"/x:StyleProps"},
                {"type":"application","base":{"type":"identifier","name":"RefAttributes"},
                 "typeParameters":[{"type":"identifier","name":"HTMLDivElement"}]}
            ]}]}}}"#);
        normalize_components(&mut json);
        let TypeNode::Component {
            props, ref_type, ..
        } = &json.exports["Card"]
        else {
            panic!("expected component");
        };
        assert!(
            matches!(props.as_deref(), Some(TypeNode::Intersection { types }) if types.len() == 2)
        );
        assert!(ref_type.is_some());
    }

    #[test]
    fn leaves_plain_interfaces_alone() {
        let mut json = api(
            r#"{"exports":{"ButtonProps":{"type":"interface","name":"ButtonProps","properties":{}}}}"#,
        );
        normalize_components(&mut json);
        assert!(matches!(
            json.exports["ButtonProps"],
            TypeNode::Interface { .. }
        ));
    }
}
