import type {Value, CSSValue, CSSProperties, PropertyFunction, PropertyValueMap, Theme, Condition, StyleFunction, StyleValue, ThemeProperties, PropertyValueDefinition, CustomValue} from './types';

export function createArbitraryProperty<T extends Value>(fn: (value: T) => CSSProperties): PropertyFunction<T> {
  return (value) => {
    let selector = Array.isArray(value) ? value.map(v => generateArbitraryValueSelector(String(v))).join('') : generateArbitraryValueSelector(String(value));
    return {default: [fn(value), selector]};
  };
}

export function createMappedProperty<T extends CSSValue>(fn: (value: string, property: string) => CSSProperties, values: PropertyValueMap<T> | string[]): PropertyFunction<T> {
  let valueMap = createValueLookup(Array.isArray(values) ? values : Object.values(values).flatMap((v: any) => typeof v === 'object' ? Object.values(v) : [v]));

  return (value, property) => {
    let v = parseArbitraryValue(value);
    if (v) {
      return {default: [fn(v[0], property), v[1]]};
    }

    // @ts-ignore
    let val = Array.isArray(values) ? value : values[String(value)];
    return mapConditionalValue(val, value => {
      return [fn(value, property), valueMap.get(value)!];
    });
  };
}

type Color<C extends string> = C | `${string}/${number}`;
export function createColorProperty<C extends string>(colors: PropertyValueMap<C>, property?: keyof CSSProperties): PropertyFunction<Color<C>> {
  let valueMap = createValueLookup(Object.values(colors).flatMap((v: any) => typeof v === 'object' ? Object.values(v) : [v]));
  return (value: Color<C>, key: string) => {
    let v = parseArbitraryValue(value);
    if (v) {
      return {default: [{[property || key]: v[0]}, v[1]]};
    }

    let [color, opacity] = value.split('/');
    // @ts-ignore
    let c = colors[color];
    return mapConditionalValue(c, value => {
      let css = opacity ? `rgb(from ${value} r g b / ${opacity}%)` : value;
      let selector = valueMap.get(value)! + (opacity ? opacity.replace('.', '-') : '');
      return [{[property || key]: css}, selector];
    });
  };
}

function mapConditionalValue<T, U>(value: PropertyValueDefinition<T>, fn: (value: T) => U): PropertyValueDefinition<U> {
  if (typeof value === 'object') {
    let res: PropertyValueDefinition<U> = {};
    for (let condition in value) {
      res[condition] = mapConditionalValue((value as any)[condition], fn);
    }
    return res;
  } else {
    return fn(value);
  }
}

function createValueLookup(values: Array<CSSValue>, atStart = false) {
  let map = new Map<CSSValue, string>();
  for (let value of values) {
    if (!map.has(value)) {
      map.set(value, generateName(map.size, atStart));
    }
  }
  return map;
}

function parseArbitraryValue(value: any) {
  if (typeof value === 'string' && value.startsWith('--')) {
    return [`var(${value})`, value];
  } else if (typeof value === 'string' && value[0] === '[' && value[value.length - 1] === ']') {
    let s = generateArbitraryValueSelector(value.slice(1, -1));
    return [value.slice(1, -1), s];
  }
}

interface MacroContext {
  addAsset(asset: {type: string, content: string}): void
}

export function createTheme<T extends Theme>(theme: T): StyleFunction<ThemeProperties<T>, Condition<T>> {
  let themePropertyMap = createValueLookup(Object.keys(theme.properties), true);
  let themeConditionMap = createValueLookup(['default', ...Object.values(theme.conditions)]);
  let propertyFunctions = new Map(Object.entries(theme.properties).map(([k, v]) => {
    if (typeof v === 'function') {
      return [k, v];
    }
    return [k, createMappedProperty((value, p) => ({[p]: value}), v) as PropertyFunction<Value>];
  }));

  let dependencies = new Set<string>();
  return function style(this: MacroContext | void, style) {
    // Declare layers for each condition in the theme ahead of time so the order is always correct.
    let css = '@layer ';
    let first = true;
    for (let name of themeConditionMap.values()) {
      if (first) {
        first = false;
      } else {
        css += ', ';
      }
      css += name;
    }
    css += ';\n\n';

    // Generate rules for each property.
    let rules = new Map<string, Rule[]>();
    let values =  new Map();
    dependencies.clear();
    for (let key in style) {
      let value = style[key]!;
      let themeProperty = key;
      values.set(key, value);

      // Get the type of custom properties in the theme.
      if (key.startsWith('--')) {
        themeProperty = value.type;
        value = value.value;
      }

      // Expand shorthands to longhands so that merging works as expected.
      if (theme.shorthands[key]) {
        for (let prop of theme.shorthands[key]) {
          values.set(prop, value);
          rules.set(prop, compileValue(prop, prop, value));
        }
      } else if (themeProperty in theme.properties) {
        rules.set(key, compileValue(key, themeProperty, value));
      }
    }

    // For properties referenced by self(), rewrite the declarations to assign
    // to an intermediary custom property so we can access the value.
    for (let dep of dependencies) {
      let value = values.get(dep);
      if (value != null) {
        if (!(dep in theme.properties)) {
          throw new Error(`Unknown dependency ${dep}`);
        }
        let name = `--${themePropertyMap.get(dep)}`;
        // Could potentially use @property to prevent the var from inheriting in children.
        rules.set(name, compileValue(name, dep, value));
        rules.set(dep, compileValue(dep, dep, name));
      }
    }
    dependencies.clear();

    // Generate JS and CSS for each rule.
    let js = 'let rules = "";\n';
    let printedRules = new Set<string>();
    for (let propertyRules of rules.values()) {
      js += printJS(propertyRules) + '\n';
      for (let rule of propertyRules) {
        css += printRule(rule, printedRules) + '\n\n';
      }
    }

    js += 'return rules;';

    if (typeof this?.addAsset === 'function') {
      this.addAsset({
        type: 'css',
        content: css
      });
    }

    return new Function('props', js) as any;
  };

  function compileValue(property: string, themeProperty: string, value: StyleValue<Value, Condition<T>, any>) {
    return conditionalToRules(value as PropertyValueDefinition<Value>, new Set(), new Set(), (value, conditions, skipConditions) => {
      return compileRule(property, themeProperty, value, conditions, skipConditions);
    });
  }

  function conditionalToRules<P extends CustomValue | any[]>(
    value: PropertyValueDefinition<P>,
    currentConditions: Set<string>,
    skipConditions: Set<string>,
    fn: (value: P, conditions: Set<string>, skipConditions: Set<string>) => Rule[]
  ) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      let rules: Rule[] = [];

      // Later conditions in parent rules override conditions in child rules.
      let subSkipConditions = new Set([...skipConditions, ...Object.keys(value)]);
      
      // Skip the default condition if we're already filtering by one of the other possible conditions.
      // For example, if someone specifies `dark: 'gray-400'`, only include the dark version of `gray-400` from the theme.
      let skipDefault = Object.keys(value).some(k => currentConditions.has(k));
      let wasThemeCondition = false;

      for (let condition in value) {
        if (skipConditions.has(condition) || (condition === 'default' && skipDefault)) {
          continue;
        }
        subSkipConditions.delete(condition);

        let val = value[condition];

        // If a theme condition comes after runtime conditions, create a new grouping.
        // This makes the CSS class unconditional so it appears outside the `else` block in the JS.
        // The @layer order in the generated CSS will ensure that it overrides classes applied by runtime conditions.
        let isThemeCondition = condition in theme.conditions;
        if (!wasThemeCondition && isThemeCondition && rules.length) {
          rules = [{prelude: '', condition: '', body: rules}];
        }
        wasThemeCondition = isThemeCondition;

        if (condition === 'default' || isThemeCondition || /^is[A-Z]/.test(condition)) {
          let subConditions = currentConditions;
          if (condition in theme.conditions) {
            subConditions = new Set([...currentConditions, condition]);
          }
          rules.push(...compileCondition(currentConditions, condition, conditionalToRules(val, subConditions, subSkipConditions, fn)));
        } else if (val && typeof val === 'object' && !Array.isArray(val)) {
          for (let key in val) {
            rules.push(...compileCondition(currentConditions, `${condition} === ${JSON.stringify(key)}`, conditionalToRules(val[key], currentConditions, subSkipConditions, fn)));
          }
        }
      }
      return rules;
    } else {
      return fn(value, currentConditions, skipConditions);
    }
  }

  function compileCondition(conditions: Set<string>, condition: string, rules: Rule[]): Rule[] {
    if (condition === 'default') {
      return [{prelude: '', condition: '', body: rules}];
    }

    if (condition in theme.conditions) {
      if (conditions.has(condition)) {
        return [{prelude: '', condition: '', body: rules}];
      }
      return [{
        prelude: `@layer ${themeConditionMap.get(theme.conditions[condition])}`,
        body: [{prelude: theme.conditions[condition], body: rules, condition: ''}],
        condition: ''
      }];
    }

    return [{prelude: '', condition, body: rules}];
  }

  function compileRule(property: string, themeProperty: string, value: Value, conditions: Set<string>, skipConditions: Set<string>): Rule[] {
    // Generate selector. This consists of three parts:
    // 1. Property. For custom properties we use a hash. For theme properties, we use the index within the theme.
    // 2. Conditions. This uses the index within the theme.
    // 3. Value. The index in the theme, or a hash for arbitrary values.
    let prelude = '.';
    if (property.startsWith('--')) {
      prelude += generateArbitraryValueSelector(property, true) + '-';
    } else {
      prelude += themePropertyMap.get(themeProperty);
    }

    let propertyFunction = propertyFunctions.get(themeProperty);
    if (propertyFunction) {
      // Expand value to conditional CSS values, and then to rules.
      let res = propertyFunction(value, property);
      return conditionalToRules(res, conditions, skipConditions, (value, conditions) => {
        let [obj, p] = value;
        let body = '';
        for (let key in obj) {
          let k = key as any;
          let value = obj[k];
          if (typeof value === 'string') {
            // Replace self() references with variables and track the dependencies.
            value = value.replace(/self\(([a-zA-Z]+)/g, (_, v) => {
              dependencies.add(v);
              return `var(--${themePropertyMap.get(v)}`;
            });
          }
          body += `${kebab(key)}: ${value};`;
        }

        let selector = prelude;
        for (let condition of conditions) {
          if (condition in theme.conditions) {
            selector += themeConditionMap.get(theme.conditions[condition]);
          }
        }

        let rules = [{
          condition: '',
          prelude: selector + p,
          body
        }];

        if (conditions.size === 0) {
          return [{
            prelude: '@layer a',
            body: rules,
            condition: ''
          }];
        }

        return rules;
      });
    } else {
      throw new Error('Unknown property ' + themeProperty);
    }
  }
}

function kebab(property: string) {
  if (property.startsWith('--')) {
    return property;
  }
  return property.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}-${b.toLowerCase()}`);
}

interface Rule {
  prelude: string,
  condition: string,
  body: string | Rule[]
}

// Generate a class name from a number, e.g. index within the theme.
// This maps to an alphabet containing lower case letters, upper case letters, and numbers.
// For numbers larger than 62, an underscore is prepended.
// This encoding allows easy parsing to enable runtime merging by property.
function generateName(index: number, atStart = false): string {
  if (index < 26) {
    // lower case letters
    return String.fromCharCode(index + 97);
  }

  if (index < 52) {
    // upper case letters
    return String.fromCharCode((index - 26) + 65);
  }

  if (index < 62) {
    // numbers
    let res = String.fromCharCode((index - 52) + 48);
    if (atStart) {
      res = '_' + res;
    }
    return res;
  }

  return '_' + generateName(index - 62);
}

// For arbitrary values, we use a hash of the string to generate the class name.
function generateArbitraryValueSelector(v: string, atStart = false) {
  let c = hash(v).toString(36);
  if (atStart && /^[0-9]/.test(c)) {
    c = `_${c}`;
  }
  return `-${c}`;
}

// djb2 hash function.
// http://www.cse.yorku.ca/~oz/hash.html
function hash(v: string) {
  let hash = 5381;
  for (let i = 0; i < v.length; i++) {
    hash = ((hash << 5) + hash) + v.charCodeAt(i) >>> 0;
  }
  return hash;
}

function printRule(rule: Rule, printedRules: Set<string>, indent = ''): string {
  if (!rule.prelude && typeof rule.body !== 'string') {
    return rule.body.map(b => printRule(b, printedRules, indent)).join('\n\n');
  }

  if (typeof rule.body === 'string') {
    if (printedRules.has(rule.prelude)) {
      return '';
    }
    printedRules.add(rule.prelude);
  }

  return `${indent}${rule.prelude} {
${typeof rule.body === 'string' ? indent + '  ' + rule.body : rule.body.map(b => printRule(b, printedRules, indent + '  ')).join('\n\n')}
${indent}}`;
}

function printJS(rules: Rule[], indent = ''): string {
  rules = rules.slice().reverse();

  let conditional = rules.filter(rule => rule.condition).map((rule, i) => {
    return `${i > 0 ? ' else ' : ''}if (props.${rule.condition}) {\n${indent}  ${printRuleChildren(rule, indent + '  ')}\n${indent}}`;
  });

  let elseCases = rules.filter(rule => !rule.condition).map(rule => printRuleChildren(rule, indent + '  '));

  if (conditional.length && elseCases.length) {
    return `${conditional.join('')} else {\n${indent}  ${elseCases.join('\n' + indent + '  ')}\n${indent}}`;
  }

  if (conditional.length) {
    return conditional.join('');
  }

  return elseCases.join('\n' + indent);
}

function printRuleChildren(rule: Rule, indent = '') {
  return typeof rule.body === 'string'
    ? `rules += ' ${rule.prelude.slice(1)}';`
    : printJS(rule.body, indent);
}

export function raw(this: MacroContext | void, css: string) {
  let className = generateArbitraryValueSelector(css, true);
  css = `.${className} {
  ${css}
}`;
  if (typeof this?.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: css
    });
  }
  return className;
}
