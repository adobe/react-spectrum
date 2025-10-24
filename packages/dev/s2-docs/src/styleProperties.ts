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

interface StyleMacroPropertyDefinition {
  type: 'mapped' | 'percentage' | 'sizing' | 'arbitrary',
  values: string[],
  additionalTypes?: string[]
}

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

// Manually defined property values from spectrum-theme.ts
// These are extracted from the theme definition
const propertyValues: {[key: string]: string[]} = {
  display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'list-item', 'none'],
  top: ['0', '2', '4', '8', '12', '16', '20', '24', '28', '32', '36', '40', '44', '48', '56', '64', '80', '96', '-2', '-4', '-8', '-12', '-16', '-20', '-24', '-28', '-32', '-36', '-40', '-44', '-48', '-56', '-64', '-80', '-96', 'auto', 'full'],
  position: ['absolute', 'fixed', 'relative', 'sticky', 'static'],
  width: ['auto', 'full', 'min', 'max', 'fit', 'screen'],
  height: ['auto', 'full', 'min', 'max', 'fit', 'screen'],
  minWidth: ['auto', 'full', 'min', 'max', 'fit', 'screen'],
  minHeight: ['auto', 'full', 'min', 'max', 'fit', 'screen'],
  maxWidth: ['auto', 'full', 'min', 'max', 'fit', 'screen', 'none'],
  maxHeight: ['auto', 'full', 'min', 'max', 'fit', 'screen', 'none'],
  flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
  justifyContent: ['normal', 'start', 'end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch'],
  alignItems: ['start', 'end', 'center', 'baseline', 'stretch'],
  gap: ['0', '2', '4', '8', '12', '16', '20', '24', '28', '32', '36', '40', '44', '48', '56', '64', '80', '96', 'text-to-control', 'text-to-visual', 'edge-to-text', 'pill']
};

export function getPropertyDefinition(propertyName: string): StyleMacroPropertyDefinition {
  const values = propertyValues[propertyName] || [];

  if (sizingProperties.has(propertyName)) {
    return {
      type: 'sizing',
      values,
      additionalTypes: ['number', 'LengthPercentage']
    };
  }

  if (percentageProperties.has(propertyName)) {
    return {
      type: 'percentage',
      values,
      additionalTypes: ['LengthPercentage']
    };
  }

  return {
    type: 'mapped',
    values
  };
}

export function getPropertyDefinitions(propertyNames: string[]): {[key: string]: StyleMacroPropertyDefinition} {
  const result: {[key: string]: StyleMacroPropertyDefinition} = {};
  for (const name of propertyNames) {
    result[name] = getPropertyDefinition(name);
  }
  return result;
}
