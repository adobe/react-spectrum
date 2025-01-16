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

import type * as CSS from 'csstype';

export type CSSValue = string | number;
export type CustomValue = string | number | boolean;
export type Value = CustomValue | readonly CustomValue[];
export type PropertyValueDefinition<T> = T | {[condition: string]: PropertyValueDefinition<T>};
export type PropertyValueMap<T extends CSSValue = CSSValue> = {
  [name in T]: PropertyValueDefinition<string>
};

export type CustomProperty = `--${string}`;
export type CSSProperties = CSS.Properties & {
  [k: CustomProperty]: CSSValue
};

export type PropertyFunction<T> = (value: T, property: string) => PropertyValueDefinition<[CSSProperties, string]>;

export type ShorthandProperty<T> = (value: T) => {[name: string]: Value};

export interface Theme {
  properties: {
    [name: string]: PropertyValueMap | PropertyFunction<any> | string[]
  },
  conditions: {
    [name: string]: string
  },
  shorthands: {
    [name: string]: string[] | ShorthandProperty<any>
  }
}

type PropertyValue<T> =
  T extends PropertyFunction<infer P>
    ? P
    : T extends PropertyValueMap<infer P>
      ? P
      : T extends string[]
        ? T[number]
        : never;

export type ArbitraryValue = CustomProperty | `[${string}]`;
type PropertyValue2<T> = PropertyValue<T> | ArbitraryValue;
type Merge<T> = T extends any ? T : never;
type ShorthandValue<T extends Theme, P> = 
  P extends string[]
    ? PropertyValue2<T['properties'][P[0]]>
    : P extends ShorthandProperty<infer V>
      ? V
      : never;

// Pre-compute value types for all theme properties ahead of time.
export type ThemeProperties<T extends Theme> = Merge<{
  [K in keyof T['properties'] | keyof T['shorthands']]: K extends keyof T['properties']
    ? Merge<PropertyValue2<T['properties'][K]>>
    : K extends keyof T['shorthands']
      ? Merge<ShorthandValue<T, T['shorthands'][K]>>
      : never
}>;

type Style<T extends ThemeProperties<Theme>, C extends string, R extends RenderProps<string>> =
  StaticProperties<T, C, R> & CustomProperties<T, C, R>;

type StaticProperties<T extends ThemeProperties<Theme>, C extends string, R extends RenderProps<string>> = {
  [Name in keyof T]?: StyleValue<T[Name], C, R>
};

type CustomProperties<T extends ThemeProperties<Theme>, C extends string, R extends RenderProps<string>> = {
  [key: CustomProperty]: CustomPropertyValue<T, keyof T, C, R>
};

// Infer the value type of custom property values from the `type` key, which references a theme property.
type CustomPropertyValue<T extends ThemeProperties<Theme>, P extends keyof T, C extends string, R extends RenderProps<string>> =
  P extends any
    ? {type: P, value: StyleValue<T[P], C, R>}
    : never;

export type RenderProps<K extends string> = {
  [key in K]: any
};

export type StyleValue<V extends Value, C extends string, R extends RenderProps<string>> = V | Conditional<V, C, R>;
export type Condition<T extends Theme> = 'default' | Extract<keyof T['conditions'], string>;
type Conditional<V extends Value, C extends string, R extends RenderProps<string>> =
  CSSConditions<V, C, R> & RuntimeConditions<V, C, R>

type ArbitraryCondition = `:${string}` | `@${string}`;
type CSSConditions<V extends Value, C extends string, R extends RenderProps<string>> = {
  [name in C]?: StyleValue<V, C, R>
};

// If render props are unknown, allow any custom conditions to be inferred.
// Unfortunately this breaks "may only specify known properties" errors.
type RuntimeConditions<V extends Value, C extends string, R extends RenderProps<string>> =
  [R] extends [never]
    ? UnknownConditions<V, C>
    : RenderPropConditions<V, C, R>;

type UnknownConditions<V extends Value, C extends string> = {
  [name: string]: StyleValue<V, C, never> | VariantMap<string, V, C, never>
};

type BooleanConditionName = `is${Capitalize<string>}` | `allows${Capitalize<string>}`;
type RenderPropConditions<V extends Value, C extends string, R extends RenderProps<string>> = {
  [K in keyof R]?: K extends BooleanConditionName ? StyleValue<V, C, R> : VariantMap<R[K], V, C, R>
};

type Values<T, K extends keyof T = keyof T> = {
  [k in K]: T[k]
}[K];

export type VariantMap<K extends CSSValue, V extends Value, C extends string, R extends RenderProps<string>> = {
  [k in K]?: StyleValue<V, C, R>
};

// These types are used to recursively extract all runtime conditions/variants in case an
// explicit render prop generic type is not provided/inferred. This allows the returned function
// to automatically accept the correct arguments based on the style definition.
type ExtractConditionalValue<C extends keyof any, V> = V extends Value
  ? never
  // Add the keys from this level for boolean conditions not in the theme.
  : RuntimeConditionObject<Extract<keyof V, BooleanConditionName>, boolean>
    // Add variant values for non-boolean named keys.
    | Variants<V, Exclude<keyof V, C | BooleanConditionName>>
    // Recursively include conditions from the next level.
    | ExtractConditionalValue<C,
      | Values<V, Extract<keyof V, C | BooleanConditionName>>
      // And skip over variants to get to the values.
      | Values<Values<V, Exclude<keyof V, C | BooleanConditionName>>>
    >;

type RuntimeConditionObject<K, V> = K extends keyof any ?  { [P in K]?: V } : never;

type Variants<T, K extends keyof T> = K extends any ? {
  [k in K]?: keyof T[k]
} : never;

type InferCustomPropertyValue<T> = T extends {value: infer V} ? V : never;

// https://stackoverflow.com/questions/49401866/all-possible-keys-of-an-union-type
type KeysOfUnion<T> = T extends T ? keyof T: never;
type KeyValue<T, K extends KeysOfUnion<T>> =  T extends {[k in K]?: any} ? T[K] : never;
type MergeUnion<T> = { [K in KeysOfUnion<T>]: KeyValue<T, K> };

type RuntimeConditionsObject<C extends keyof any, S extends Style<any, any, any>> = MergeUnion<
  ExtractConditionalValue<C,
    | Values<S, Exclude<keyof S, CustomProperty>>
    // Skip top-level object for custom properties and go straight to value.
    | InferCustomPropertyValue<Values<S, Extract<keyof S, CustomProperty>>>
  >
>;

// Return an intersection between string and the used style props so we can prevent passing certain properties to components.
export type StyleString<P = string> = string & {properties: P};
type Keys<R> = [R] extends [never] ? never : keyof R;
export type RuntimeStyleFunction<S extends string, R> = Keys<R> extends never ? () => StyleString<S> : (props: R) => StyleString<S>;

// If a render prop type was provided, use that so that we get autocomplete for conditions.
// Otherwise, fall back to inferring the render props from the style definition itself.
type InferProps<R, C extends keyof any, S extends Style<any, any, any>> = [R] extends [never] ? AllowOthers<RuntimeConditionsObject<C, S>> : R;
type AllowOthers<R> = Keys<R> extends never ? never : R | {[x: string]: any};
type StyleFunctionResult<S, R> = Keys<R> extends never ? StyleString<S> : (props: R) => StyleString<S>;
type StyleFunctionResultWithOverrides<S, R> = (props: Keys<R> extends never ? null : R, overrides?: StyleString<string> | null) => StyleString<S>
export type StyleFunction<T extends ThemeProperties<Theme>, C extends string> = {
  <R extends RenderProps<string> = never, S extends Style<T, C, R> = Style<T, C | ArbitraryCondition, R>>(style: S): StyleFunctionResult<keyof S, InferProps<R, C | ArbitraryCondition, S>>,
  <R extends RenderProps<string> = never, S extends Style<T, C, R> = Style<T, C | ArbitraryCondition, R>>(style: S, allowedProperties: readonly string[]): StyleFunctionResultWithOverrides<keyof S, InferProps<R, C | ArbitraryCondition, S>>
};
