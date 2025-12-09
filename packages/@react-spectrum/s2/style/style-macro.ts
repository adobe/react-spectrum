/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {Condition, CSSProperties, CSSValue, CustomValue, Property, PropertyValueDefinition, PropertyValueMap, RenderProps, ShorthandProperty, StyleFunction, StyleValue, Theme, ThemeProperties, Value} from './types';
import fs from 'fs';
import * as propertyInfo from './properties.json';

// Postfix all class names with version for now.
const json = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8'));
const POSTFIX = json.version.includes('nightly') ? json.version.match(/-nightly-(.*)/)[1] : json.version.replace(/[0.]/g, '');

export class ArbitraryProperty<T extends Value> implements Property<T> {
  property: string;
  toCSS: (value: T) => CSSValue;

  constructor(property: string, toCSS?: (value: T) => CSSValue) {
    this.property = property;
    this.toCSS = toCSS || ((value) => String(value));
  }

  get cssProperties(): string[] {
    return [this.property];
  }

  toCSSValue(value: T): PropertyValueDefinition<Value> {
    return this.toCSS(value);
  }

  toCSSProperties(customProperty: string | null, value: PropertyValueDefinition<Value>): PropertyValueDefinition<[CSSProperties]> {
    return mapConditionalValue(value, value => [{[customProperty || this.property]: String(value)}]);
  }
}

export class MappedProperty<T extends CSSValue> extends ArbitraryProperty<T> implements Property<T> {
  mapping: PropertyValueMap<T> | string[];

  constructor(property: string, mapping: PropertyValueMap<T> | string[]) {
    super(property);
    this.mapping = mapping;
  }

  toCSSValue(value: T): PropertyValueDefinition<Value> {
    if (Array.isArray(this.mapping)) {
      if (!this.mapping.includes(String(value))) {
        throw new Error('Invalid style value: ' + value);
      }
      return value;
    } else {
      let res = this.mapping[String(value)];
      if (res == null) {
        throw new Error('Invalid style value: ' + value);
      }
      return res;
    }
  }
}

export type Color<C extends string> = C | `${string}/${number}`;
export class ColorProperty<C extends string> extends MappedProperty<C> implements Property<Color<C>> {
  toCSSValue(value: Color<C>): PropertyValueDefinition<Value> {
    let [color, opacity] = value.split('/');
    return mapConditionalValue(this.mapping[color], value => {
      return opacity ? `rgb(from ${value} r g b / ${opacity}%)` : value;
    });
  }
}

export type LengthPercentageUnit = '%' | 'vw' | 'svw' | 'dvw' | 'vh' | 'svh' | 'dvh' | 'vmin' | 'svmin' | 'dvmin' | 'vmax' | 'svmax' | 'dvmax' | 'cqw' | 'cqh' | 'cqmin' | 'cqmax';
export type LengthPercentage = `${number}${LengthPercentageUnit}`;

export class PercentageProperty<T extends CSSValue> extends MappedProperty<T> implements Property<T | LengthPercentage> {
  constructor(property: string, mapping: PropertyValueMap<T> | string[]) {
    super(property, mapping);
  }

  toCSSValue(value: T | LengthPercentage): PropertyValueDefinition<Value> {
    if (typeof value === 'string' && /^-?\d+(?:\.\d+)?(%|vw|svw|dvw|vh|svh|dvh|vmin|svmin|dvmin|vmax|svmax|dvmax|cqw|cqh|cqmin|cqmax)$/.test(value)) {
      return value;
    }

    return super.toCSSValue(value as T);
  }
}

export class SizingProperty<T extends CSSValue> extends PercentageProperty<T> implements Property<T | number | LengthPercentage> {
  numberToCSS: (value: number) => string;

  constructor(property: string, mapping: PropertyValueMap<T> | string[], numberToCSS: (value: number) => string) {
    super(property, mapping);
    this.numberToCSS = numberToCSS;
  }

  toCSSValue(value: T | LengthPercentage | number): PropertyValueDefinition<Value> {
    if (typeof value === 'number') {
      return value === 0 ? '0px' : this.numberToCSS(value);
    }

    return super.toCSSValue(value);
  }
}

export class ExpandedProperty<T extends Value> implements Property<T> {
  cssProperties: string[];
  mapping: Property<T> | null;
  expand: (v: T | CSSValue) => CSSProperties;

  constructor(properties: string[], expand: (v: T | CSSValue) => CSSProperties, mapping?: Property<T> | PropertyValueMap<CSSValue>) {
    this.cssProperties = properties;
    this.expand = expand;
    if (mapping instanceof MappedProperty) {
      this.mapping = mapping;
    } else if (mapping) {
      this.mapping = new MappedProperty<any>(properties[0], mapping as any);
    } else {
      this.mapping = null;
    }
  }

  toCSSValue(value: T): PropertyValueDefinition<Value> {
    if (!this.mapping) {
      return value;
    }

    return this.mapping.toCSSValue(value);
  }

  toCSSProperties(customProperty: string | null, value: PropertyValueDefinition<T>): PropertyValueDefinition<[CSSProperties]> {
    if (customProperty) {
      throw new Error('Style properties that expand into multiple CSS properties cannot be set as CSS variables.');
    }
    return mapConditionalValue(value, value => [this.expand(value)]);
  }
}

function mapConditionalValue<T, U>(value: PropertyValueDefinition<T>, fn: (value: T) => U): PropertyValueDefinition<U> {
  if (typeof value === 'object' && !Array.isArray(value)) {
    let res: PropertyValueDefinition<U> = {};
    for (let condition in value) {
      res[condition] = mapConditionalValue((value as any)[condition], fn);
    }
    return res;
  } else {
    return fn(value);
  }
}

function mapConditionalShorthand<T, C extends string, R extends RenderProps<string>>(value: PropertyValueDefinition<T>, fn: ShorthandProperty<T>): {[property: string]: StyleValue<Value, C, R>} {
  if (typeof value === 'object') {
    let res = {};
    for (let condition in value) {
      let properties = mapConditionalShorthand(value[condition], fn);
      for (let property in properties) {
        res[property] ??= {};
        res[property][condition] = properties[property];
      }
    }
    return res;
  } else {
    return fn(value);
  }
}

export function parseArbitraryValue(value: Value): string | undefined {
  if (typeof value === 'string' && value.startsWith('--')) {
    return `var(${value})`;
  } else if (typeof value === 'string' && value[0] === '[' && value[value.length - 1] === ']') {
    return value.slice(1, -1);
  } else if (
    typeof value === 'string' && (
      /^(var|calc|min|max|clamp|round|mod|rem|sin|cos|tan|asin|acos|atan|atan2|pow|sqrt|hypot|log|exp|abs|sign)\(.+\)$/.test(value) || 
      /^(inherit|initial|unset)$/.test(value)
    )
  ) {
    return value;
  }
}

function shortCSSPropertyName(property: string) {
  return propertyInfo.properties[property] ?? generateArbitraryValueSelector(property, true);
}

function classNamePrefix(property: string, cssProperty: string) {
  let className = propertyInfo.properties[cssProperty];
  if (className && property === '--' + className) {
    return '-' + className + '_-';
  }

  if (className && !property.startsWith('--')) {
    return className;
  }

  return '-' + generateArbitraryValueSelector(property, true) + '-';
}

interface MacroContext {
  addAsset(asset: {type: string, content: string}): void
}

export function createTheme<T extends Theme>(theme: T): StyleFunction<ThemeProperties<T>, 'default' | Extract<keyof T['conditions'], string>> {
  let properties = new Map<string, Property<any>>(Object.entries(theme.properties).map(([k, v]) => {
    if (!Array.isArray(v) && v.cssProperties) {
      return [k, v as Property<any>];
    }

    return [k, new MappedProperty(k, v as any)];
  }));

  let dependencies = new Set<string>();
  let hasConditions = false;
  return function style(this: MacroContext | void, style, allowedOverrides?: readonly string[]) {
    // Check if `this` is undefined, which means style was not called as a macro but as a normal function.
    // We also check if this is globalThis, which happens in non-strict mode bundles.
    // Also allow style to be called as a normal function in tests.
    // @ts-ignore
    // eslint-disable-next-line
    if ((this == null || this === globalThis) && process.env.NODE_ENV !== 'test') {
      throw new Error('The style macro must be imported with {type: "macro"}.');
    }

    // Generate rules for each property.
    let rules = new Map<string, Rule>();
    let values =  new Map();
    dependencies.clear();
    let usedPriorities = 0;
    let setRules = (key: string, value: [number, Rule[]]) => {
      usedPriorities = Math.max(usedPriorities, value[0]);
      rules.set(key, new GroupRule(value[1]));
    };

    hasConditions = false;
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
        let shorthand = theme.shorthands[key];
        if (typeof shorthand === 'function') {
          let expanded = mapConditionalShorthand(value, shorthand);
          for (let k in expanded) {
            let v = expanded[k];
            values.set(k, v);
            setRules(k, compileValue(k, k, v));
          }
        } else {
          for (let prop of shorthand) {
            values.set(prop, value);
            setRules(prop, compileValue(prop, prop, value));
          }
        }
      } else if (themeProperty in theme.properties) {
        setRules(key, compileValue(key, themeProperty, value));
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
        let prop = properties.get(dep)!;
        let name = `--${shortCSSPropertyName(prop.cssProperties[0])}`;
        // Could potentially use @property to prevent the var from inheriting in children.
        setRules(name, compileValue(name, dep, value));
        setRules(dep, compileValue(dep, dep, name));
      }
    }
    dependencies.clear();

    let css = '';

    // Declare layers for each priority ahead of time so the order is always correct.
    css += '@layer ';
    let first = true;
    for (let i = 0; i <= usedPriorities; i++) {
      if (first) {
        first = false;
      } else {
        css += ', ';
      }
      css += layerName(generateName(i, true));
    }
    css += ';\n\n';

    // If allowed overrides are provided, generate code to match the input override string and include only allowed classes.
    // Also generate a variable for each overridable property that overlaps with the style definition. If those are defined,
    // the defaults from the style definition are omitted.
    let allowedOverridesSet = new Set<string>();
    let js = 'let rules = " ";\n';
    if (allowedOverrides?.length) {
      for (let property of allowedOverrides) {
        let shorthand = theme.shorthands[property];
        let props = Array.isArray(shorthand) ? shorthand : [property];
        for (let property of props) {
          if (property.startsWith('--')) {
            allowedOverridesSet.add(property);
            continue;
          }
          
          let prop = properties.get(property);
          if (!prop) {
            throw new Error(`Invalid property ${property} in allowedOverrides`);
          }
          for (let property of prop.cssProperties) {
            allowedOverridesSet.add(property);
          }
        }
      }

      let loop = '';
      for (let property of rules.keys()) {
        let prop = properties.get(property);
        if (prop) {
          for (let property of prop.cssProperties) {
            if (property && allowedOverridesSet.has(property)) {
              let selector = classNamePrefix(property, property);
              let p = property.replace('--', '__');
              js += `let ${p} = false;\n`;
              loop += `  if (p[1] === ${JSON.stringify(selector)}) ${p} = true;\n`;
            }
          }
        } else if (property.startsWith('--') && allowedOverridesSet.has(property)) {
          let selector = classNamePrefix(property, property);
          let p = property.replace('--', '__');
          js += `let ${p} = false;\n`;
          loop += `  if (p[1] === ${JSON.stringify(selector)}) ${p} = true;\n`;
        }
      }

      let regex = `/(?:^|\\s)(${[...allowedOverridesSet].map(p => classNamePrefix(p, p)).join('|')})[^\\s]+/g`;
      if (loop) {
        js += `let matches = (overrides || '').matchAll(${regex});\n`;
        js += 'for (let p of matches) {\n';
        js += loop;
        js += '  rules += p[0];\n';
        js += '}\n';
      } else {
        js += `rules += ((overrides || '').match(${regex}) || []).join('')\n`;
      }
    }

    // Generate JS and CSS for each rule.
    let isStatic = !(hasConditions || allowedOverrides);
    let className = '';
    let rulesByLayer = new Map<string, string[]>();
    let rootRule = new GroupRule([...rules.values()]);
    if (isStatic) {
      className += rootRule.getStaticClassName();
    } else {
      js += rootRule.toJS(allowedOverridesSet) + '\n';
    }
    rootRule.toCSS(rulesByLayer);

    for (let [layer, rules] of rulesByLayer) {
      css += `@layer ${layerName(layer)} {\n`;
      css += rules.join('\n\n');
      css += '}\n\n';
    }

    if (this && typeof this.addAsset === 'function') {
      this.addAsset({
        type: 'css',
        content: css
      });
    }

    if (isStatic) {
      return className;
    }

    js += 'return rules;';
    if (allowedOverrides) {
      return new Function('props', 'overrides', js) as any;
    }
    return new Function('props', js) as any;
  };

  function compileValue(property: string, themeProperty: string, value: StyleValue<Value, Condition<T>, any>) {
    return conditionalToRules(value as any, 0, new Set(), new Set(), (value, priority, conditions, skipConditions) => {
      return compileRule(property, themeProperty, value, priority, conditions, skipConditions);
    });
  }

  function conditionalToRules<P extends CustomValue | any[]>(
    value: PropertyValueDefinition<P>,
    parentPriority: number,
    currentConditions: Set<string>,
    skipConditions: Set<string>,
    fn: (value: P, priority: number, conditions: Set<string>, skipConditions: Set<string>) => [number, Rule[]]
  ): [number, Rule[]] {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      let rules: Rule[] = [];

      // Later conditions in parent rules override conditions in child rules.
      let subSkipConditions = new Set([...skipConditions, ...Object.keys(value)]);

      // Skip the default condition if we're already filtering by one of the other possible conditions.
      // For example, if someone specifies `dark: 'gray-400'`, only include the dark version of `gray-400` from the theme.
      let skipDefault = Object.keys(value).some(k => currentConditions.has(k));
      let wasCSSCondition = false;
      let priority = parentPriority;

      for (let condition in value) {
        if (skipConditions.has(condition) || (condition === 'default' && skipDefault)) {
          continue;
        }
        subSkipConditions.delete(condition);

        let val = value[condition];

        // If a theme condition comes after runtime conditions, create a new grouping.
        // This makes the CSS class unconditional so it appears outside the `else` block in the JS.
        // The @layer order in the generated CSS will ensure that it overrides classes applied by runtime conditions.
        let isCSSCondition = condition in theme.conditions || /^[@:]/.test(condition);
        if (!wasCSSCondition && isCSSCondition && rules.length) {
          rules = [new GroupRule(rules)];
        }
        wasCSSCondition = isCSSCondition;

        // Increment the current priority whenever we see a new CSS condition.
        if (isCSSCondition) {
          priority++;
        }

        // If this is a runtime condition, inherit the priority from the parent rule.
        // Otherwise, use the current maximum of the parent and current priorities.
        let rulePriority = isCSSCondition ? priority : parentPriority;

        if (condition === 'default' || isCSSCondition || /^is[A-Z]/.test(condition) || /^allows[A-Z]/.test(condition)) {
          let subConditions = currentConditions;
          if (isCSSCondition) {
            subConditions = new Set([...currentConditions, condition]);
          }
          let [subPriority, subRules] = conditionalToRules(val, rulePriority, subConditions, subSkipConditions, fn);
          rules.push(...compileCondition(currentConditions, condition, priority, subRules));
          priority = Math.max(priority, subPriority);
        } else if (val && typeof val === 'object' && !Array.isArray(val)) {
          for (let key in val) {
            let [subPriority, subRules] = conditionalToRules(val[key], rulePriority, currentConditions, subSkipConditions, fn);
            rules.push(...compileCondition(currentConditions, `${condition} === ${JSON.stringify(key)}`, priority, subRules));
            priority = Math.max(priority, subPriority);
          }
        }
      }
      return [priority, rules];
    } else {
      // @ts-ignore - broken in non-strict?
      return fn(value, parentPriority, currentConditions, skipConditions);
    }
  }

  function compileCondition(conditions: Set<string>, condition: string, priority: number, rules: Rule[]): Rule[] {
    if (condition === 'default' || conditions.has(condition)) {
      return [new GroupRule(rules)];
    }

    if (condition in theme.conditions || /^[@:]/.test(condition)) {
      // Conditions starting with : are CSS pseudo classes. Nest them inside the parent rule.
      let prelude = theme.conditions[condition] || condition;
      let preludes = Array.isArray(prelude) ? prelude : [prelude];
      return preludes.map(prelude => {
        if (prelude.startsWith(':')) {
          let rulesWithPseudo = rules.map(rule => {
            rule = rule.copy();
            rule.addPseudo(prelude);
            return rule;
          });

          return new GroupRule(rulesWithPseudo, generateName(priority, true));
        }

        // Otherwise, wrap the rule in the condition (e.g. @media).
        // Top level layer is based on the priority of the rule, not the condition.
        // Also group in a sub-layer based on the condition so that lightningcss can more effectively deduplicate rules.
        let layer = `${generateName(priority, true)}.${propertyInfo.conditions[prelude] || generateArbitraryValueSelector(condition, true)}`;
        return new AtRule(rules, prelude, layer);
      });
    }

    hasConditions = true;
    return [new ConditionalRule(rules, condition)];
  }

  function compileRule(property: string, themeProperty: string, value: Value, priority: number, conditions: Set<string>, skipConditions: Set<string>): [number, Rule[]] {
    let propertyFunction = properties.get(themeProperty);
    if (propertyFunction) {
      // Expand value to conditional CSS values, and then to rules.
      let arbitrary = parseArbitraryValue(value);
      let cssValue = arbitrary ? arbitrary : propertyFunction.toCSSValue(value);
      let cssProperties = propertyFunction.toCSSProperties(property.startsWith('--') ? property : null, cssValue);

      return conditionalToRules(cssProperties, priority, conditions, skipConditions, (value, priority, conditions) => {
        let [obj] = value;
        let rules: Rule[] = [];
        for (let key in obj) {
          let k = key as any;
          let value = obj[k];
          if (value === undefined) {
            continue;
          }
          if (typeof value === 'string') {
            // Replace self() references with variables and track the dependencies.
            value = value.replace(/self\(([a-zA-Z]+)/g, (_, v) => {
              let prop = properties.get(v);
              if (!prop) {
                throw new Error(`self(${v}) is invalid. ${v} is not a known property.`);
              }
              let cssProperties = prop.cssProperties;
              if (cssProperties.length !== 1) {
                throw new Error(`self(${v}) is not supported. ${v} expands to multiple CSS properties.`);
              }
              dependencies.add(v);
              return `var(--${shortCSSPropertyName(cssProperties[0])}`;
            });
          }

          // Generate selector. This consists of three parts: property, conditions, value.
          let cssProperty = key;
          if (property.startsWith('--')) {
            cssProperty = propertyFunction.cssProperties[0];
          }

          let className = classNamePrefix(key, cssProperty);
          if (conditions.size > 0) {
            for (let condition of conditions) {
              let prelude = theme.conditions[condition] || condition;
              let preludes = Array.isArray(prelude) ? prelude : [prelude];
              for (let prelude of preludes) {
                className += propertyInfo.conditions[prelude] || generateArbitraryValueSelector(condition);
              }
            }
          }

          if (cssProperty !== key) {
            className += shortCSSPropertyName(cssProperty);
          }

          className += propertyInfo.values[cssProperty]?.[String(value)] ?? generateArbitraryValueSelector(String(value));
          className += POSTFIX;
          rules.push(new StyleRule(className, key, String(value)));
        }

        return [0, rules];
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

  if (index < 62 && !atStart) {
    // numbers
    return String.fromCharCode((index - 52) + 48);
  }

  return '_' + generateName(index - (atStart ? 52 : 62));
}

// For arbitrary values, we use a hash of the string to generate the class name.
function generateArbitraryValueSelector(v: string, atStart = false) {
  let c = toBase62(hash(v));
  if (atStart && /^[0-9]/.test(c)) {
    c = `_${c}`;
  }
  return c;
}

function toBase62(value: number) {
  if (value === 0) {
    return generateName(value);
  }

  let res = '';
  while (value) {
    let remainder = value % 62;
    res += generateName(remainder);
    value = Math.floor((value - remainder) / 62);
  }

  return res;
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

function layerName(name: string) {
  // All of our layers should be sub-layers of a single parent layer, so that
  // the unsafe overrides layer always comes after.
  return `_.${name}`;
}

interface Rule {
  addPseudo(prelude: string): void,
  getStaticClassName(): string,
  toCSS(rulesByLayer: Map<string, string[]>, preludes?: string[], layer?: string): void,
  toJS(allowedOverridesSet: Set<string>, indent?: string): string,
  copy(): Rule
}

/** A CSS style rule. */
class StyleRule implements Rule {
  className: string;
  pseudos: string;
  property: string;
  value: string;

  constructor(className: string, property: string, value: string) {
    this.className = className;
    this.pseudos = '';
    this.property = property;
    this.value = value;
  }

  copy(): Rule {
    let rule = new StyleRule(this.className, this.property, this.value);
    rule.pseudos = this.pseudos;
    return rule;
  }

  addPseudo(prelude: string) {
    this.pseudos += prelude;
  }

  getStaticClassName(): string {
    return ' ' + this.className;
  }

  toCSS(rulesByLayer: Map<string, string[]>, preludes: string[] = [], layer = 'a') {
    let prelude = `.${this.className}${this.pseudos}`;
    preludes.push(prelude);

    // Nest rule in our stack of preludes (e.g. media queries/selectors).
    let content = '  ';
    preludes.forEach((p, i) => {
      content += `${p} {\n${' '.repeat((i + 2) * 2)}`;
    });
    content += `${kebab(this.property)}: ${this.value};\n`;
    preludes.map((_, i) => {
      content += `${' '.repeat((preludes.length - i) * 2)}}\n`;
    });

    // Group rule into the appropriate layer.
    let rules = rulesByLayer.get(layer);
    if (!rules) {
      rules = [];
      rulesByLayer.set(layer, rules);
    }
    rules.push(content);
    preludes.pop();
  }

  toJS(allowedOverridesSet: Set<string>, indent = ''): string {
    let res = '';
    if (allowedOverridesSet.has(this.property)) {
      res += `${indent}if (!${this.property.replace('--', '__')}) `;
    }
    res +=  `${indent}rules += ' ${this.className}';`;
    return res;
  }
}

/** Base class for rules that contain other rules. */
class GroupRule implements Rule {
  rules: Rule[];
  layer: string | null;

  constructor(rules: Rule[], layer?: string | null) {
    this.rules = rules;
    this.layer = layer ?? null;
  }

  copy(): Rule {
    return new GroupRule(this.rules.map(rule => rule.copy()), this.layer);
  }

  addPseudo(prelude: string) {
    for (let rule of this.rules) {
      rule.addPseudo(prelude);
    }
  }

  getStaticClassName(): string {
    return this.rules.map(rule => rule.getStaticClassName()).join('');
  }

  toCSS(rulesByLayer: Map<string, string[]>, preludes?: string[], layer?: string) {
    for (let rule of this.rules) {
      rule.toCSS(rulesByLayer, preludes, this.layer || layer);
    }
  }

  toJS(allowedOverridesSet: Set<string>, indent = ''): string {
    let rules = this.rules.slice();
    let conditional = rules.filter(rule => rule instanceof ConditionalRule).reverse().map((rule, i) => {
      return `${i > 0 ? ' else ' : ''}${rule.toJS(allowedOverridesSet, indent)}`;
    });

    let elseCases = rules.filter(rule => !(rule instanceof ConditionalRule)).map(rule => rule.toJS(allowedOverridesSet, indent));
    if (conditional.length && elseCases.length) {
      return `${conditional.join('')} else {\n${indent}  ${elseCases.join('\n' + indent + '  ')}\n${indent}}`;
    }

    if (conditional.length) {
      return conditional.join('');
    }

    return elseCases.join('\n' + indent);
  }
}

/** A rule that applies conditionally in CSS (e.g. @media). */
class AtRule extends GroupRule {
  prelude: string;

  constructor(rules: Rule[], prelude: string, layer: string | null) {
    super(rules, layer);
    this.prelude = prelude;
  }

  copy(): Rule {
    return new AtRule(this.rules.map(rule => rule.copy()), this.prelude, this.layer);
  }

  toCSS(rulesByLayer: Map<string, string[]>, preludes: string[] = [], layer?: string): void {
    preludes.push(this.prelude);
    super.toCSS(rulesByLayer, preludes, layer);
    preludes?.pop();
  }
}

/** A rule that applies conditionally at runtime. */
class ConditionalRule extends GroupRule {
  condition: string;

  constructor(rules: Rule[], condition: string) {
    super(rules);
    this.condition = condition;
  }

  copy(): Rule {
    return new ConditionalRule(this.rules.map(rule => rule.copy()), this.condition);
  }

  getStaticClassName(): string {
    throw new Error('Conditional rules cannot be compiled to a static class name. This is a bug.');
  }

  toJS(allowedOverridesSet: Set<string>, indent = ''): string {
    return `${indent}if (props.${this.condition}) {\n${super.toJS(allowedOverridesSet, indent + '  ')}\n${indent}}`;
  }
}

export function raw(this: MacroContext | void, css: string, layer = '_.a'): string {
  // Check if `this` is undefined, which means style was not called as a macro but as a normal function.
  // We also check if this is globalThis, which happens in non-strict mode bundles.
  // Also allow style to be called as a normal function in tests.
  // @ts-ignore
  // eslint-disable-next-line
  if ((this == null || this === globalThis) && process.env.NODE_ENV !== 'test') {
    throw new Error('The raw macro must be imported with {type: "macro"}.');
  }
  let className = generateArbitraryValueSelector(css, true);
  css = `@layer ${layer} {
  .${className} {
  ${css}
  }
}`;

  // Ensure layer is always declared after the _ layer used by style macro.
  if (!layer.startsWith('_.')) {
    css = `@layer _, ${layer};\n` + css;
  }

  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: css
    });
  }
  return className;
}

export function keyframes(this: MacroContext | void, css: string): string {
  // Check if `this` is undefined, which means style was not called as a macro but as a normal function.
  // We also check if this is globalThis, which happens in non-strict mode bundles.
  // Also allow style to be called as a normal function in tests.
  // @ts-ignore
  // eslint-disable-next-line
  if ((this == null || this === globalThis) && process.env.NODE_ENV !== 'test') {
    throw new Error('The keyframes macro must be imported with {type: "macro"}.');
  }
  let name = generateArbitraryValueSelector(css, true);
  css = `@keyframes ${name} {
  ${css}
}`;
  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: css
    });
  }
  return name;
}
