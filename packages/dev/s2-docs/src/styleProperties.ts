/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// properties that extend from baseColors
const baseColorProperties = new Set([
  'color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'
])

// Properties that use PercentageProperty (accept LengthPercentage in addition to mapped values)
const percentageProperties = new Set([
  'top', 'left', 'bottom', 'right',
  'insetStart', 'insetEnd',
  'marginTop', 'marginBottom', 'marginStart', 'marginEnd',
  'paddingTop', 'paddingBottom', 'paddingStart', 'paddingEnd',
  'textIndent', 'translateX', 'translateY'
]);

// Properties that use SizingProperty (accept number and LengthPercentage in addition to mapped values)
const sizingProperties = new Set([
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  'flexBasis', 'containIntrinsicWidth', 'containIntrinsicHeight'
]);


const colorPropertyValues: {[key: string]: string[]} = {
  // This should append baseColors in getPropertyDefinition
  outlineColor: ['focus-ring'],
  // This should append what seems to be a combination of semantic colors and background/global colors
  fill: ['none', 'currentColor'],
  stroke: ['none', 'currentColor'],
};

const dimensionsPropertyValues: {[key: string]: string[]} = {
  top: ['0', '2', '4', '8', '12', '16', '20', '24', '28', '32', '36', '40', '44', '48', '56', '64', '80', '96', '-2', '-4', '-8', '-12', '-16', '-20', '-24', '-28', '-32', '-36', '-40', '-44', '-48', '-56', '-64', '-80', '-96', 'auto', 'full'],
  height: ['auto', 'full', 'min', 'max', 'fit', 'screen'],
};

const textPropertyValues: {[key: string]: string[]} = {
  fontFamily: ['sans', 'serif', 'code'],
  // todo: skipped font-size, font-weight, line height though these will also just be manually defined here
  listStyleType: ['none', 'disc', 'decimal'],
  listStylePosition: ['inside', 'outside'],
  textTransform: ['uppercase', 'lowercase', 'capitalize', 'none'],
  textAlign: ['start', 'center', 'end', 'justify'],
  verticalAlign: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'],
  textDecoration: ['none' , 'underline' , 'overline' , 'line-through'],
  textOverflow: ['ellipsis', 'clip'],
  lineClamp: ['number'],
  hyphens: ['none', 'manual', 'auto'],
  whiteSpace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'],
  textWrap: ['wrap', 'nowrap', 'balance', 'pretty'],
  wordBreak: ['normal', 'break-all', 'keep-all', 'break-word'],
  overflowWrap: ['normal', 'anywhere', 'break-word'],
  boxDecorationBreak: ['slice', 'clone'],
};

const effectsPropertyValues: {[key: string]: string[]} = {
  // TODO: should the below have a typelink explaining more details
  boxShadow: ['emphasized', 'elevated', 'dragged', 'none'],
  filter: ['emphasized', 'elevated', 'dragged', 'none'],
};

const layoutPropertyValues: {[key: string]: string[]} = {

  display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'list-item', 'none'],
};

const miscPropertyValues: {[key: string]: string[]} = {

};

const shorthandMapping: {[key: string]: string[]} = {

};

const conditionMapping: {[key: string]: string[]} = {

};

const properties: {[key: string]: {[key: string]: string[]}} = {
  color: colorPropertyValues,
  dimensions: dimensionsPropertyValues,
  text: textPropertyValues,
  effects: effectsPropertyValues,
  layout: layoutPropertyValues,
  misc: miscPropertyValues
};

// TODO: will we need something specific for short hand?
// TODO: see if there are any others that we will need to add additional shared types for
export function getAdditionalTypes(propertyName: string): string[] {
  if (baseColorProperties.has(propertyName)) {
    return ['baseColors']
  }

  if (sizingProperties.has(propertyName)) {
    return ['number', 'LengthPercentage']
  }

  if (percentageProperties.has(propertyName)) {
    return ['LengthPercentage']
  }

  return [];
}

interface StyleMacroPropertyDefinition {
  values: string[],
  additionalTypes?: string[]
}

export function getPropertyDefinitions(propertyCategory: string): {[key: string]: StyleMacroPropertyDefinition} {
  let result: {[key: string]: StyleMacroPropertyDefinition} = {};
  let propertiesMapping = properties[propertyCategory] || {};

  for (let [name, values] of Object.entries(propertiesMapping)) {
    result[name] = {
      values,
      additionalTypes: getAdditionalTypes(name)
    }
  }
  return result;
}
