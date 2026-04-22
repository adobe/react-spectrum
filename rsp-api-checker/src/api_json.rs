//! Strongly-typed representation of the `api.json` format produced by
//! the TypeScript extractor (and previously by parcel-transformer-docs).

use indexmap::IndexMap;
use serde::Deserialize;

/// Top-level api.json structure.
#[derive(Debug, Deserialize, Default)]
pub struct ApiJson {
    #[serde(default)]
    pub exports: IndexMap<String, TypeNode>,
    #[serde(default)]
    pub links: IndexMap<String, TypeNode>,
}

/// Every type node in the API JSON. Uses serde's internally-tagged enum
/// representation: `{ "type": "string", "value": "hello" }`.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum TypeNode {
    // ── Primitives ──────────────────────────────────────────────────────
    Any,
    Null,
    Undefined,
    Void,
    Unknown,
    Never,
    This,
    Symbol,

    Boolean {
        value: Option<bool>,
    },
    String {
        value: Option<String>,
    },
    Number {
        value: Option<serde_json::Number>,
    },

    // ── Composite types ─────────────────────────────────────────────────
    Union {
        elements: Vec<TypeNode>,
    },
    Intersection {
        types: Vec<TypeNode>,
    },
    Array {
        #[serde(rename = "elementType")]
        element_type: Box<TypeNode>,
    },
    Tuple {
        elements: Vec<TypeNode>,
    },
    Object {
        properties: Option<IndexMap<String, TypeNode>>,
        #[serde(default)]
        exact: bool,
    },

    // ── Generics / type-level constructs ────────────────────────────────
    Application {
        base: Box<TypeNode>,
        #[serde(rename = "typeParameters", default)]
        type_parameters: Vec<TypeNode>,
    },
    TypeParameter {
        name: String,
        constraint: Option<Box<TypeNode>>,
        default: Option<Box<TypeNode>>,
    },
    Conditional {
        #[serde(rename = "checkType")]
        check_type: Box<TypeNode>,
        #[serde(rename = "extendsType")]
        extends_type: Box<TypeNode>,
        #[serde(rename = "trueType")]
        true_type: Box<TypeNode>,
        #[serde(rename = "falseType")]
        false_type: Box<TypeNode>,
    },
    IndexedAccess {
        #[serde(rename = "objectType")]
        object_type: Box<TypeNode>,
        #[serde(rename = "indexType")]
        index_type: Box<TypeNode>,
    },
    #[serde(rename = "keyof")]
    Keyof {
        keyof: Box<TypeNode>,
    },
    TypeOperator {
        operator: String,
        value: Box<TypeNode>,
    },
    Mapped {
        #[serde(rename = "typeParameter")]
        type_parameter: Box<TypeNode>,
        #[serde(rename = "typeAnnotation")]
        type_annotation: Box<TypeNode>,
        readonly: Option<String>,
    },
    Infer {
        value: String,
    },
    Template {
        elements: Vec<TypeNode>,
    },

    // ── Named references ────────────────────────────────────────────────
    Identifier {
        name: String,
    },
    Link {
        id: Option<String>,
    },

    // ── Declarations ────────────────────────────────────────────────────
    Interface {
        #[serde(default)]
        id: Option<String>,
        #[serde(default)]
        name: Option<String>,
        #[serde(default)]
        properties: IndexMap<String, TypeNode>,
        #[serde(rename = "typeParameters", default)]
        type_parameters: Vec<TypeNode>,
        #[serde(default)]
        extends: Vec<TypeNode>,
        #[serde(default)]
        description: Option<String>,
        #[serde(default)]
        access: Option<String>,
    },
    Component {
        #[serde(default)]
        id: Option<String>,
        #[serde(default)]
        name: Option<String>,
        props: Option<Box<TypeNode>>,
        #[serde(rename = "typeParameters", default)]
        type_parameters: Vec<TypeNode>,
        #[serde(rename = "ref", default)]
        ref_type: Option<Box<TypeNode>>,
        #[serde(default)]
        description: Option<String>,
        #[serde(default)]
        access: Option<String>,
    },
    Function {
        #[serde(default)]
        id: Option<String>,
        #[serde(default)]
        name: Option<String>,
        #[serde(default)]
        parameters: ParameterMap,
        #[serde(rename = "return", default)]
        return_type: Option<Box<TypeNode>>,
        #[serde(rename = "typeParameters", default)]
        type_parameters: Vec<TypeNode>,
        #[serde(default)]
        description: Option<String>,
        #[serde(default)]
        access: Option<String>,
    },
    Alias {
        #[serde(default)]
        id: Option<String>,
        #[serde(default)]
        name: Option<String>,
        value: Box<TypeNode>,
        #[serde(rename = "typeParameters", default)]
        type_parameters: Vec<TypeNode>,
        #[serde(default)]
        description: Option<String>,
        #[serde(default)]
        access: Option<String>,
    },
    Property {
        name: String,
        #[serde(rename = "indexType", default)]
        index_type: Option<Box<TypeNode>>,
        value: Box<TypeNode>,
        #[serde(default)]
        optional: bool,
        #[serde(default)]
        description: Option<String>,
        #[serde(default)]
        access: Option<String>,
        #[serde(default)]
        default: Option<serde_json::Value>,
    },
    Method {
        name: String,
        value: Box<TypeNode>,
        #[serde(default)]
        optional: bool,
        #[serde(default)]
        access: Option<String>,
        #[serde(default)]
        description: Option<String>,
        #[serde(default)]
        default: Option<serde_json::Value>,
        #[serde(rename = "static", default)]
        is_static: bool,
        #[serde(rename = "abstract", default)]
        is_abstract: bool,
    },
    Parameter {
        #[serde(default)]
        name: Option<String>,
        value: Box<TypeNode>,
        #[serde(default)]
        optional: bool,
        #[serde(default)]
        rest: bool,
    },
}

/// Parameters can come as either `[param, param, ...]` or `{ name: param, ... }`.
#[derive(Debug, Clone)]
pub enum ParameterMap {
    Map(IndexMap<String, TypeNode>),
    List(Vec<TypeNode>),
}

impl Default for ParameterMap {
    fn default() -> Self {
        Self::Map(IndexMap::new())
    }
}

impl ParameterMap {
    pub fn iter_ordered(&self) -> Vec<(&str, &TypeNode)> {
        match self {
            Self::Map(m) => m.iter().map(|(k, v)| (k.as_str(), v)).collect(),
            Self::List(l) => l
                .iter()
                .enumerate()
                .map(|(i, v)| {
                    // Try to extract the name from the parameter node
                    let name = match v {
                        TypeNode::Parameter { name: Some(n), .. } => n.as_str(),
                        _ => "",
                    };
                    let _ = i; // suppress unused warning
                    (name, v)
                })
                .collect(),
        }
    }
}

impl<'de> Deserialize<'de> for ParameterMap {
    fn deserialize<D: serde::Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        use serde::de;

        struct Visitor;
        impl<'de> de::Visitor<'de> for Visitor {
            type Value = ParameterMap;
            fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
                write!(f, "an object or array of parameters")
            }
            fn visit_seq<A: de::SeqAccess<'de>>(self, mut seq: A) -> Result<Self::Value, A::Error> {
                let mut list = Vec::new();
                while let Some(item) = seq.next_element()? {
                    list.push(item);
                }
                Ok(ParameterMap::List(list))
            }
            fn visit_map<A: de::MapAccess<'de>>(self, mut map: A) -> Result<Self::Value, A::Error> {
                let mut m = IndexMap::new();
                while let Some((k, v)) = map.next_entry()? {
                    m.insert(k, v);
                }
                Ok(ParameterMap::Map(m))
            }
        }

        d.deserialize_any(Visitor)
    }
}

impl ApiJson {
    pub fn load(path: &std::path::Path) -> anyhow::Result<Self> {
        let data = std::fs::read_to_string(path)?;
        Ok(serde_json::from_str(&data)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse_node(s: &str) -> TypeNode {
        serde_json::from_str(s).expect("failed to parse TypeNode")
    }

    // ── Primitives ─────────────────────────────────────────────────────────

    #[test]
    fn test_primitive_unit_variants() {
        assert!(matches!(parse_node(r#"{"type":"any"}"#), TypeNode::Any));
        assert!(matches!(parse_node(r#"{"type":"null"}"#), TypeNode::Null));
        assert!(matches!(parse_node(r#"{"type":"undefined"}"#), TypeNode::Undefined));
        assert!(matches!(parse_node(r#"{"type":"void"}"#), TypeNode::Void));
        assert!(matches!(parse_node(r#"{"type":"unknown"}"#), TypeNode::Unknown));
        assert!(matches!(parse_node(r#"{"type":"never"}"#), TypeNode::Never));
        assert!(matches!(parse_node(r#"{"type":"this"}"#), TypeNode::This));
        assert!(matches!(parse_node(r#"{"type":"symbol"}"#), TypeNode::Symbol));
    }

    #[test]
    fn test_boolean_variants() {
        assert!(matches!(parse_node(r#"{"type":"boolean"}"#), TypeNode::Boolean { value: None }));
        assert!(
            matches!(parse_node(r#"{"type":"boolean","value":true}"#), TypeNode::Boolean { value: Some(true) })
        );
        assert!(
            matches!(parse_node(r#"{"type":"boolean","value":false}"#), TypeNode::Boolean { value: Some(false) })
        );
    }

    #[test]
    fn test_string_variants() {
        assert!(matches!(parse_node(r#"{"type":"string"}"#), TypeNode::String { value: None }));
        let node = parse_node(r#"{"type":"string","value":"hello"}"#);
        assert!(matches!(node, TypeNode::String { value: Some(ref v) } if v == "hello"));
    }

    #[test]
    fn test_number_variants() {
        assert!(matches!(parse_node(r#"{"type":"number"}"#), TypeNode::Number { value: None }));
        let node = parse_node(r#"{"type":"number","value":42}"#);
        assert!(matches!(node, TypeNode::Number { value: Some(_) }));
    }

    // ── Composite types ────────────────────────────────────────────────────

    #[test]
    fn test_union() {
        let node = parse_node(r#"{"type":"union","elements":[{"type":"string"},{"type":"null"}]}"#);
        assert!(matches!(node, TypeNode::Union { elements } if elements.len() == 2));
    }

    #[test]
    fn test_intersection() {
        let node = parse_node(r#"{"type":"intersection","types":[{"type":"any"},{"type":"never"}]}"#);
        assert!(matches!(node, TypeNode::Intersection { types } if types.len() == 2));
    }

    #[test]
    fn test_array() {
        let node = parse_node(r#"{"type":"array","elementType":{"type":"string"}}"#);
        assert!(matches!(node, TypeNode::Array { element_type } if matches!(*element_type, TypeNode::String { .. })));
    }

    #[test]
    fn test_tuple() {
        let node = parse_node(r#"{"type":"tuple","elements":[{"type":"string"},{"type":"number"}]}"#);
        assert!(matches!(node, TypeNode::Tuple { elements } if elements.len() == 2));
    }

    #[test]
    fn test_object_with_properties() {
        let json = r#"{"type":"object","properties":{"x":{"type":"property","name":"x","value":{"type":"number"}}}}"#;
        let node = parse_node(json);
        assert!(matches!(node, TypeNode::Object { properties: Some(_), exact: false }));
    }

    #[test]
    fn test_object_no_properties() {
        let node = parse_node(r#"{"type":"object"}"#);
        assert!(matches!(node, TypeNode::Object { properties: None, .. }));
    }

    // ── Generic / type-level ───────────────────────────────────────────────

    #[test]
    fn test_application() {
        let json = r#"{"type":"application","base":{"type":"identifier","name":"Promise"},"typeParameters":[{"type":"string"}]}"#;
        let node = parse_node(json);
        assert!(matches!(node, TypeNode::Application { .. }));
    }

    #[test]
    fn test_type_parameter() {
        let json = r#"{"type":"typeParameter","name":"T","constraint":{"type":"string"}}"#;
        let node = parse_node(json);
        assert!(matches!(node, TypeNode::TypeParameter { name, constraint: Some(_), .. } if name == "T"));
    }

    #[test]
    fn test_conditional() {
        let json = r#"{
            "type": "conditional",
            "checkType": {"type":"any"},
            "extendsType": {"type":"string"},
            "trueType": {"type":"string"},
            "falseType": {"type":"never"}
        }"#;
        assert!(matches!(parse_node(json), TypeNode::Conditional { .. }));
    }

    #[test]
    fn test_indexed_access() {
        let json = r#"{"type":"indexedAccess","objectType":{"type":"identifier","name":"T"},"indexType":{"type":"string","value":"key"}}"#;
        assert!(matches!(parse_node(json), TypeNode::IndexedAccess { .. }));
    }

    #[test]
    fn test_keyof() {
        let json = r#"{"type":"keyof","keyof":{"type":"identifier","name":"Props"}}"#;
        assert!(matches!(parse_node(json), TypeNode::Keyof { .. }));
    }

    #[test]
    fn test_mapped() {
        let json = r#"{"type":"mapped","typeParameter":{"type":"typeParameter","name":"K"},"typeAnnotation":{"type":"string"}}"#;
        assert!(matches!(parse_node(json), TypeNode::Mapped { .. }));
    }

    #[test]
    fn test_infer() {
        let json = r#"{"type":"infer","value":"R"}"#;
        assert!(matches!(parse_node(json), TypeNode::Infer { value } if value == "R"));
    }

    #[test]
    fn test_template() {
        let json = r#"{"type":"template","elements":[{"type":"string","value":"prefix-"}]}"#;
        assert!(matches!(parse_node(json), TypeNode::Template { elements } if elements.len() == 1));
    }

    // ── Named references ───────────────────────────────────────────────────

    #[test]
    fn test_identifier() {
        let node = parse_node(r#"{"type":"identifier","name":"ReactNode"}"#);
        assert!(matches!(node, TypeNode::Identifier { name } if name == "ReactNode"));
    }

    #[test]
    fn test_link_with_id() {
        let node = parse_node(r#"{"type":"link","id":"@pkg:SomeType"}"#);
        assert!(matches!(node, TypeNode::Link { id: Some(ref s) } if s == "@pkg:SomeType"));
    }

    #[test]
    fn test_link_no_id() {
        let node = parse_node(r#"{"type":"link"}"#);
        assert!(matches!(node, TypeNode::Link { id: None }));
    }

    // ── Declarations ──────────────────────────────────────────────────────

    #[test]
    fn test_interface() {
        let json = r#"{
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
        }"#;
        let node = parse_node(json);
        assert!(matches!(node, TypeNode::Interface { name: Some(ref n), .. } if n == "ButtonProps"));
        if let TypeNode::Interface { properties, .. } = node {
            assert!(properties.contains_key("isDisabled"));
        }
    }

    #[test]
    fn test_component() {
        let json = r#"{"type":"component","name":"Button","props":{"type":"interface","properties":{}}}"#;
        let node = parse_node(json);
        assert!(matches!(node, TypeNode::Component { name: Some(ref n), .. } if n == "Button"));
    }

    #[test]
    fn test_function_with_map_parameters() {
        let json = r#"{
            "type": "function",
            "name": "myFn",
            "parameters": {
                "x": {"type":"parameter","name":"x","value":{"type":"string"}}
            },
            "return": {"type":"void"}
        }"#;
        let node = parse_node(json);
        if let TypeNode::Function { parameters, .. } = node {
            assert!(matches!(parameters, ParameterMap::Map(_)));
            assert_eq!(parameters.iter_ordered().len(), 1);
        } else {
            panic!("expected Function variant");
        }
    }

    #[test]
    fn test_function_with_list_parameters() {
        let json = r#"{
            "type": "function",
            "parameters": [
                {"type":"parameter","name":"a","value":{"type":"number"}},
                {"type":"parameter","name":"b","value":{"type":"string"}}
            ]
        }"#;
        let node = parse_node(json);
        if let TypeNode::Function { parameters, .. } = node {
            assert!(matches!(parameters, ParameterMap::List(_)));
            assert_eq!(parameters.iter_ordered().len(), 2);
        } else {
            panic!("expected Function variant");
        }
    }

    #[test]
    fn test_alias() {
        let json = r#"{"type":"alias","name":"MyAlias","value":{"type":"string"},"typeParameters":[]}"#;
        let node = parse_node(json);
        assert!(matches!(node, TypeNode::Alias { name: Some(ref n), .. } if n == "MyAlias"));
    }

    #[test]
    fn test_property() {
        let json = r#"{"type":"property","name":"foo","value":{"type":"string"},"optional":true}"#;
        let node = parse_node(json);
        assert!(
            matches!(node, TypeNode::Property { ref name, optional: true, .. } if name == "foo")
        );
    }

    #[test]
    fn test_method() {
        let json = r#"{"type":"method","name":"onClick","value":{"type":"function","parameters":[]},"optional":false}"#;
        let node = parse_node(json);
        assert!(matches!(node, TypeNode::Method { ref name, optional: false, .. } if name == "onClick"));
    }

    #[test]
    fn test_parameter() {
        let json = r#"{"type":"parameter","name":"value","value":{"type":"string"},"optional":false,"rest":false}"#;
        let node = parse_node(json);
        assert!(
            matches!(node, TypeNode::Parameter { name: Some(ref n), optional: false, rest: false, .. } if n == "value")
        );
    }

    // ── ParameterMap ──────────────────────────────────────────────────────

    #[test]
    fn test_parameter_map_iter_ordered_list_uses_param_name() {
        let json = r#"{"type":"function","parameters":[{"type":"parameter","name":"arg1","value":{"type":"string"}}]}"#;
        if let TypeNode::Function { parameters, .. } = parse_node(json) {
            let ordered = parameters.iter_ordered();
            assert_eq!(ordered[0].0, "arg1");
        }
    }

    #[test]
    fn test_parameter_map_iter_ordered_map_uses_key() {
        let json = r#"{"type":"function","parameters":{"myParam":{"type":"parameter","value":{"type":"number"}}}}"#;
        if let TypeNode::Function { parameters, .. } = parse_node(json) {
            let ordered = parameters.iter_ordered();
            assert_eq!(ordered[0].0, "myParam");
        }
    }

    // ── ApiJson ────────────────────────────────────────────────────────────

    #[test]
    fn test_api_json_defaults() {
        let json: ApiJson = serde_json::from_str(r#"{}"#).unwrap();
        assert!(json.exports.is_empty());
        assert!(json.links.is_empty());
    }

    #[test]
    fn test_api_json_load_from_file() {
        use std::io::Write;
        let mut f = tempfile::NamedTempFile::new().unwrap();
        let content = r#"{"exports":{"Foo":{"type":"any"}},"links":{"Bar":{"type":"string"}}}"#;
        f.write_all(content.as_bytes()).unwrap();
        let loaded = ApiJson::load(f.path()).unwrap();
        assert!(loaded.exports.contains_key("Foo"));
        assert!(loaded.links.contains_key("Bar"));
    }

    #[test]
    fn test_api_json_load_nonexistent_returns_error() {
        let result = ApiJson::load(std::path::Path::new("/nonexistent/path/api.json"));
        assert!(result.is_err());
    }
}
