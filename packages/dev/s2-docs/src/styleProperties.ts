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

// Properties that extend from baseColors
const baseColorProperties = new Set([
  'color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'
]);

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

// Properties that accept baseSpacing values
const baseSpacingProperties = new Set([
  'borderSpacing', 'rowGap', 'columnGap',
  'paddingStart', 'paddingEnd', 'paddingTop', 'paddingBottom',
  'scrollMarginStart', 'scrollMarginEnd', 'scrollMarginTop', 'scrollMarginBottom',
  'scrollPaddingStart', 'scrollPaddingEnd', 'scrollPaddingTop', 'scrollPaddingBottom',
  'textIndent', 'gridAutoRows', 'gridAutoColumns', 'gridTemplateColumns', 'gridTemplateRows',
  'marginStart', 'marginEnd', 'marginTop', 'marginBottom', 'translateX', 'translateY',
  'insetStart', 'insetEnd', 'top', 'left', 'bottom', 'right'
]);

// Properties that accept negative spacing values
const negativeSpacingProperties = new Set([
  'marginStart', 'marginEnd', 'marginTop', 'marginBottom',
  'translateX', 'translateY',
  'insetStart', 'insetEnd', 'top', 'left', 'bottom', 'right'
]);

// Spacing values used across multiple properties
const baseSpacingValues = ['0', '2', '4', '8', '12', '16', '20', '24', '28', '32', '36', '40', '44', '48', '56', '64', '80', '96',];
const negativeBaseSpacingValues = ['-2', '-4', '-8', '-12', '-16', '-20', '-24', '-28', '-32', '-36', '-40', '-44', '-48', '-56', '-64', '-80', '-96'];
const relativeSpacingValues = [ 'text-to-control', 'text-to-visual', 'edge-to-text', 'pill'];
// const spacingValues = [...baseSpacingValues, ...relativeSpacingValues];
// const marginValues = [...spacingValues, ...negativeBaseSpacingValues, 'auto'];
// const insetValues = [...baseSpacingValues, ...negativeBaseSpacingValues, 'auto', 'full'];
// const translateValues = [...baseSpacingValues, ...negativeBaseSpacingValues, 'full'];
const heightBaseValues = ['auto', 'full', 'min', 'max', 'fit', 'screen'];
const fontSize = [
  'ui-xs', 'ui-sm', 'ui', 'ui-lg', 'ui-xl', 'ui-2xl', 'ui-3xl',
  'heading-2xs', 'heading-xs', 'heading-sm', 'heading', 'heading-lg', 'heading-xl', 'heading-2xl', 'heading-3xl',
  'title-xs', 'title-sm', 'title', 'title-lg', 'title-xl', 'title-2xl', 'title-3xl',
  'body-2xs', 'body-xs', 'body-sm', 'body', 'body-lg', 'body-xl', 'body-2xl', 'body-3xl',
  'detail-sm', 'detail', 'detail-lg', 'detail-xl',
  'code-xs', 'code-sm', 'code', 'code-lg', 'code-xl'
];

const colorPropertyValues: {[key: string]: string[]} = {
  color: ['accent', 'neutral', 'neutral-subdued', 'negative', 'disabled', 'heading', 'title', 'body', 'detail', 'code', 'auto'],
  backgroundColor: [
    'accent', 'accent-subtle', 'neutral', 'neutral-subdued', 'neutral-subtle',
    'negative', 'negative-subtle', 'informative', 'informative-subtle',
    'positive', 'positive-subtle', 'notice', 'notice-subtle',
    'gray', 'gray-subtle', 'red', 'red-subtle', 'orange', 'orange-subtle',
    'yellow', 'yellow-subtle', 'chartreuse', 'chartreuse-subtle',
    'celery', 'celery-subtle', 'green', 'green-subtle',
    'seafoam', 'seafoam-subtle', 'cyan', 'cyan-subtle',
    'blue', 'blue-subtle', 'indigo', 'indigo-subtle',
    'purple', 'purple-subtle', 'fuchsia', 'fuchsia-subtle',
    'magenta', 'magenta-subtle', 'pink', 'pink-subtle',
    'turquoise', 'turquoise-subtle', 'cinnamon', 'cinnamon-subtle',
    'brown', 'brown-subtle', 'silver', 'silver-subtle',
    'disabled', 'base', 'layer-1', 'layer-2', 'pasteboard', 'elevated'
  ],
  borderColor: ['negative', 'disabled'],
  outlineColor: ['focus-ring'],
  fill: [
    'none', 'currentColor',
    'accent', 'neutral', 'negative', 'informative', 'positive', 'notice',
    'gray', 'red', 'orange', 'yellow', 'chartreuse', 'celery', 'green',
    'seafoam', 'cyan', 'blue', 'indigo', 'purple', 'fuchsia', 'magenta',
    'pink', 'turquoise', 'cinnamon', 'brown', 'silver'
  ],
  stroke: ['none', 'currentColor']
};

const dimensionsPropertyValues: {[key: string]: string[]} = {
  borderSpacing: [],
  flexBasis: ['auto', 'full'],
  rowGap: relativeSpacingValues,
  columnGap: relativeSpacingValues,
  height: heightBaseValues,
  width: heightBaseValues,
  containIntrinsicWidth: heightBaseValues,
  containIntrinsicHeight: heightBaseValues,
  minHeight: heightBaseValues,
  maxHeight: [...heightBaseValues, 'none'],
  minWidth: heightBaseValues,
  maxWidth: [...heightBaseValues, 'none'],
  borderStartWidth: ['0', '1', '2', '4'],
  borderEndWidth: ['0', '1', '2', '4'],
  borderTopWidth: ['0', '1', '2', '4'],
  borderBottomWidth: ['0', '1', '2', '4'],
  borderStyle: ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none'],
  strokeWidth: ['0', '1', '2'],
  marginStart: ['auto'],
  marginEnd: ['auto'],
  marginTop: ['auto'],
  marginBottom: ['auto'],
  paddingStart: relativeSpacingValues,
  paddingEnd: relativeSpacingValues,
  paddingTop: relativeSpacingValues,
  paddingBottom: relativeSpacingValues,
  scrollMarginStart: [],
  scrollMarginEnd: [],
  scrollMarginTop: [],
  scrollMarginBottom: [],
  scrollPaddingStart: [],
  scrollPaddingEnd: [],
  scrollPaddingTop: [],
  scrollPaddingBottom: [],
  textIndent: [],
  translateX: ['full'],
  translateY: ['full'],


  // TODO These ones should have a description for the supported values, make a type link for number however
  rotate: ['number', '${number}deg', '${number}rad', '${number}grad', '${number}turn'],
  scaleX: ['number', '${number}%'],
  scaleY: ['number', '${number}%'],


  transform: ['string'],
  position: ['absolute', 'fixed', 'relative', 'sticky', 'static'],
  insetStart: ['auto', 'full'],
  insetEnd: ['auto', 'full'],
  top: ['auto', 'full'],
  left: ['auto', 'full'],
  bottom: ['auto', 'full'],
  right: ['auto', 'full'],

  // TODO: also would like this number/number to be code formatted, not a string? Maybe make it a type link as well
  aspectRatio: ['auto', 'square', 'video', 'number / number']
};

const textPropertyValues: {[key: string]: string[]} = {
  fontFamily: ['sans', 'serif', 'code'],
  fontSize: fontSize,
  fontWeight: ['normal', 'medium', 'bold', 'extra-bold', 'black', 'heading', 'title', 'detail'],
  lineHeight: ['ui', 'heading', 'title', 'body', 'detail', 'code'],
  listStyleType: ['none', 'disc', 'decimal'],
  listStylePosition: ['inside', 'outside'],
  textTransform: ['uppercase', 'lowercase', 'capitalize', 'none'],
  textAlign: ['start', 'center', 'end', 'justify'],
  verticalAlign: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'],
  textDecoration: ['none', 'underline', 'overline', 'line-through'],
  textOverflow: ['ellipsis', 'clip'],
  // TODO: make common type link for number, link to mdn
  lineClamp: ['number'],
  hyphens: ['none', 'manual', 'auto'],
  whiteSpace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'],
  textWrap: ['wrap', 'nowrap', 'balance', 'pretty'],
  wordBreak: ['normal', 'break-all', 'keep-all', 'break-word'],
  overflowWrap: ['normal', 'anywhere', 'break-word'],
  boxDecorationBreak: ['slice', 'clone']
};


const effectsPropertyValues: {[key: string]: string[]} = {
  boxShadow: ['emphasized', 'elevated', 'dragged', 'none'],
  filter: ['emphasized', 'elevated', 'dragged', 'none'],
  borderTopStartRadius: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
  borderTopEndRadius: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
  borderBottomStartRadius: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
  borderBottomEndRadius: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
  forcedColorAdjust: ['auto', 'none'],
  colorScheme: ['light', 'dark', 'light dark'],
  // TODO: ideally would be type links for string and LinearGradient, will need to decide if we wanna export LinearGradient
  backgroundImage: ['string', 'LinearGradient'],
  backgroundPosition: ['bottom', 'center', 'left', 'left bottom', 'left top', 'right', 'right bottom', 'right top', 'top'],
  backgroundSize: ['auto', 'cover', 'contain'],
  backgroundAttachment: ['fixed', 'local', 'scroll'],
  backgroundClip: ['border-box', 'padding-box', 'content-box', 'text'],
  backgroundRepeat: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'round', 'space'],
  backgroundOrigin: ['border-box', 'padding-box', 'content-box'],
  backgroundBlendMode: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
  mixBlendMode: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity', 'plus-darker', 'plus-lighter'],
  // TODO: ideally would be a type link
  opacity: ['number'],
  outlineStyle: ['none', 'solid', 'dashed', 'dotted', 'double', 'inset'],
  outlineOffset: ['number'],
  outlineWidth: ['0', '1', '2', '4'],
  transition: ['default', 'colors', 'opacity', 'shadow', 'transform', 'all', 'none'],

  // TODO: type link
  transitionDelay: ['string', 'number'],
  transitionDuration: ['string', 'number'],

  transitionTimingFunction: ['default', 'linear', 'in', 'out', 'in-out'],

  // TODO: type link, maybe some of these type links should just be links to MDN?
  // Could make it similar to getAdditionalTypes and have a links object that has the type (aka string | number) and then links it to MDN
  animation: ['string', 'number'],
  animationDuration: ['string', 'number'],
  animationDelay: ['string', 'number'],



  animationDirection: ['normal', 'reverse', 'alternate', 'alternate-reverse'],
  animationFillMode: ['none', 'forwards', 'backwards', 'both'],

  // TODO: type link, see above
  animationIterationCount: ['string', 'number'],


  animationTimingFunction: ['default', 'linear', 'in', 'out', 'in-out'],
  animationPlayState: ['paused', 'running']
};

const layoutPropertyValues: {[key: string]: string[]} = {
  display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'list-item', 'none'],
  alignContent: ['normal', 'center', 'start', 'end', 'space-between', 'space-around', 'space-evenly', 'baseline', 'stretch'],
  alignItems: ['start', 'end', 'center', 'baseline', 'stretch'],
  justifyContent: ['normal', 'start', 'end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch'],
  justifyItems: ['start', 'end', 'center', 'stretch'],
  alignSelf: ['auto', 'start', 'end', 'center', 'stretch', 'baseline'],
  justifySelf: ['auto', 'start', 'end', 'center', 'stretch'],
  flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
  flexWrap: ['wrap', 'wrap-reverse', 'nowrap'],


  // TODO: the below definitely link to MDN
  // flexShrink: new ArbitraryProperty<CSS.Property.FlexShrink>('flexShrink'),
  // flexGrow: new ArbitraryProperty<CSS.Property.FlexGrow>('flexGrow'),
  // gridColumnStart: new ArbitraryProperty<CSS.Property.GridColumnStart>('gridColumnStart'),
  // gridColumnEnd: new ArbitraryProperty<CSS.Property.GridColumnEnd>('gridColumnEnd'),
  // gridRowStart: new ArbitraryProperty<CSS.Property.GridRowStart>('gridRowStart'),
  // gridRowEnd: new ArbitraryProperty<CSS.Property.GridRowEnd>('gridRowEnd'),


  gridAutoFlow: ['row', 'column', 'dense', 'row dense', 'column dense'],

  // TODO: make these link to MDN and also have baseSpacingValue type link
  gridAutoRows:['auto', 'min-content', 'max-content', '${number}fr', 'minmax(${string}, ${string})', 'string'],
  gridAutoColumns: ['auto', 'min-content', 'max-content', '${number}fr', 'minmax(${string}, ${string})', 'string'],
  gridTemplateColumns: ['auto', 'min-content', 'max-content', '${number}fr', 'minmax(${string}, ${string})', 'none', 'subgrid', 'string',],
  gridTemplateRows: ['auto', 'min-content', 'max-content', '${number}fr', 'minmax(${string}, ${string})', 'none', 'subgrid', 'string'],
  gridTemplateAreas: ['string[]'],


  float: ['inline-start', 'inline-end', 'right', 'left', 'none'],
  clear: ['inline-start', 'inline-end', 'left', 'right', 'both', 'none'],
  contain: ['none', 'strict', 'content', 'size', 'inline-size', 'layout', 'style', 'paint'],
  boxSizing: ['border-box', 'content-box'],
  tableLayout: ['auto', 'fixed'],
  captionSide: ['top', 'bottom'],
  borderCollapse: ['collapse', 'separate'],
  breakBefore: ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'],
  breakInside: ['auto', 'avoid', 'avoid-page', 'avoid-column'],
  breakAfter: ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'],
  overflowX: ['auto', 'hidden', 'clip', 'visible', 'scroll'],
  overflowY: ['auto', 'hidden', 'clip', 'visible', 'scroll'],
  overscrollBehaviorX: ['auto', 'contain', 'none'],
  overscrollBehaviorY: ['auto', 'contain', 'none'],
  scrollBehavior: ['auto', 'smooth'],

  // TODO: make type link
  order: ['number'],
};

const miscPropertyValues: {[key: string]: string[]} = {
  pointerEvents: ['none', 'auto'],
  touchAction: ['auto', 'none', 'pan-x', 'pan-y', 'manipulation', 'pinch-zoom'],
  userSelect: ['none', 'text', 'all', 'auto'],
  visibility: ['visible', 'hidden', 'collapse'],
  isolation: ['isolate', 'auto'],
  transformOrigin: ['center', 'top', 'top right', 'right', 'bottom right', 'bottom', 'bottom left', 'left', 'top right'],
  cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out'],
  resize: ['none', 'vertical', 'horizontal', 'both'],
  scrollSnapType: ['x', 'y', 'both', 'x mandatory', 'y mandatory', 'both mandatory'],
  scrollSnapAlign: ['start', 'end', 'center', 'none'],
  scrollSnapStop: ['normal', 'always'],
  appearance: ['none', 'auto'],
  objectFit: ['contain', 'cover', 'fill', 'none', 'scale-down'],
  objectPosition: ['bottom', 'center', 'left', 'left bottom', 'left top', 'right', 'right bottom', 'right top', 'top'],
  willChange: ['auto', 'scroll-position', 'contents', 'transform'],
  // TODO: need type link
  zIndex: ['number'],
  disableTapHighlight: ['true'],
  unicodeBidi: ['normal', 'embed', 'bidi-override', 'isolate', 'isolate-override', 'plaintext'],
  caretColor: ['auto', 'transparent']
};


// TODO add shorthand mapping and conditions to the docs
const shorthandMapping: {[key: string]: string[]} = {
  padding: ['paddingTop', 'paddingBottom', 'paddingStart', 'paddingEnd'],
  paddingX: ['paddingStart', 'paddingEnd'],
  paddingY: ['paddingTop', 'paddingBottom'],
  margin: ['marginTop', 'marginBottom', 'marginStart', 'marginEnd'],
  marginX: ['marginStart', 'marginEnd'],
  marginY: ['marginTop', 'marginBottom'],
  scrollPadding: ['scrollPaddingTop', 'scrollPaddingBottom', 'scrollPaddingStart', 'scrollPaddingEnd'],
  scrollPaddingX: ['scrollPaddingStart', 'scrollPaddingEnd'],
  scrollPaddingY: ['scrollPaddingTop', 'scrollPaddingBottom'],
  scrollMargin: ['scrollMarginTop', 'scrollMarginBottom', 'scrollMarginStart', 'scrollMarginEnd'],
  scrollMarginX: ['scrollMarginStart', 'scrollMarginEnd'],
  scrollMarginY: ['scrollMarginTop', 'scrollMarginBottom'],
  borderWidth: ['borderTopWidth', 'borderBottomWidth', 'borderStartWidth', 'borderEndWidth'],
  borderXWidth: ['borderStartWidth', 'borderEndWidth'],
  borderYWidth: ['borderTopWidth', 'borderBottomWidth'],
  borderRadius: ['borderTopStartRadius', 'borderTopEndRadius', 'borderBottomStartRadius', 'borderBottomEndRadius'],
  borderTopRadius: ['borderTopStartRadius', 'borderTopEndRadius'],
  borderBottomRadius: ['borderBottomStartRadius', 'borderBottomEndRadius'],
  borderStartRadius: ['borderTopStartRadius', 'borderBottomStartRadius'],
  borderEndRadius: ['borderTopEndRadius', 'borderBottomEndRadius'],
  translate: ['translateX', 'translateY'],
  scale: ['scaleX', 'scaleY'],
  inset: ['top', 'bottom', 'insetStart', 'insetEnd'],
  insetX: ['insetStart', 'insetEnd'],
  insetY: ['top', 'bottom'],
  placeItems: ['alignItems', 'justifyItems'],
  placeContent: ['alignContent', 'justifyContent'],
  placeSelf: ['alignSelf', 'justifySelf'],
  gap: ['rowGap', 'columnGap'],
  size: ['width', 'height'],
  minSize: ['minWidth', 'minHeight'],
  maxSize: ['maxWidth', 'maxHeight'],
  overflow: ['overflowX', 'overflowY'],
  overscrollBehavior: ['overscrollBehaviorX', 'overscrollBehaviorY'],
  gridArea: ['gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd'],

  // TODO: is it more important to display the mapping that each short hand corresponds to or the value that it accepts?
  // I was hoping that I would just display the mapping and then have people reference the value for the corresponding
  // values in the sections above
  font: fontSize

  // TODO: For the below, similar question as the above
  // transition: (value: keyof typeof transitionProperty) => ({
  //   transition: value,
  //   transitionDuration: 150,
  //   transitionTimingFunction: 'default'
  // }),
  // animation: (value: string) => ({
  //   animation: value,
  //   animationDuration: 150,
  //   animationTimingFunction: 'default'
  // }),
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // truncate: (_value: true) => ({
  //   overflowX: 'hidden',
  //   overflowY: 'hidden',
  //   textOverflow: 'ellipsis',
  //   whiteSpace: 'nowrap'
  // }),
  // font: (value: keyof typeof fontSize) => {
  //   let type = value.split('-')[0];
  //   return {
  //     fontFamily: type === 'code' ? 'code' : 'sans',
  //     fontSize: value,
  //     fontWeight: type === 'heading' || type === 'title' || type === 'detail' ? type : 'normal',
  //     lineHeight: type,
  //     color: type === 'ui' ? 'body' : type
  //   };
  // }
};

const conditionMapping: {[key: string]: string[]} = {
  forcedColors: ['@media (forced-colors: active)'],
  touch: ['@media not ((hover: hover) and (pointer: fine))'],
  sm: ['@media (min-width: ${pxToRem(640)})'],
  md: ['@media (min-width: ${pxToRem(768)})'],
  lg: ['@media (min-width: ${pxToRem(1024)})'],
  xl: ['@media (min-width: ${pxToRem(1280)})'],
  '2xl': ['@media (min-width: ${pxToRem(1536)})']
}

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
// this is less additional types and more that we want to represent the below as a type link
export function getAdditionalTypes(propertyName: string): string[] {
  let types: string[] = [];

  if (baseColorProperties.has(propertyName)) {
    types.push('baseColors');
  }

  if (baseSpacingProperties.has(propertyName)) {
    types.push('baseSpacing');
  }

  if (negativeSpacingProperties.has(propertyName)) {
    types.push('negativeSpacing');
  }

  if (sizingProperties.has(propertyName)) {
    types.push('number', 'LengthPercentage');
  }

  if (percentageProperties.has(propertyName)) {
    types.push('LengthPercentage');
  }

  return types;
}

// Export spacing values for use in TypePopover
export const spacingTypeValues = {
  baseSpacing: baseSpacingValues,
  negativeSpacing: negativeBaseSpacingValues
};

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
    };
  }
  return result;
}
