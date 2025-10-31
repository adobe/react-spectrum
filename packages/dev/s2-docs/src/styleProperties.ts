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
const baseSpacingValues = ['0', '2', '4', '8', '12', '16', '20', '24', '28', '32', '36', '40', '44', '48', '56', '64', '80', '96'];
const negativeBaseSpacingValues = ['-2', '-4', '-8', '-12', '-16', '-20', '-24', '-28', '-32', '-36', '-40', '-44', '-48', '-56', '-64', '-80', '-96'];
const relativeSpacingValues = ['text-to-control', 'text-to-visual', 'edge-to-text', 'pill'];
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
  color: ['accent', 'neutral', 'neutral-subdued', 'negative', 'disabled', 'heading', 'title', 'body', 'detail', 'code', 'auto', 'baseColors'],
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
    'disabled', 'base', 'layer-1', 'layer-2', 'pasteboard', 'elevated', 'baseColors'
  ],
  borderColor: ['negative', 'disabled', 'baseColors'],
  outlineColor: ['focus-ring', 'baseColors'],
  fill: [
    'none', 'currentColor',
    'accent', 'neutral', 'negative', 'informative', 'positive', 'notice',
    'gray', 'red', 'orange', 'yellow', 'chartreuse', 'celery', 'green',
    'seafoam', 'cyan', 'blue', 'indigo', 'purple', 'fuchsia', 'magenta',
    'pink', 'turquoise', 'cinnamon', 'brown', 'silver', 'baseColors'
  ],
  stroke: ['none', 'currentColor', 'baseColors']
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
  // TODO: ideally would be type for LinearGradient, will need to decide if we wanna export LinearGradient
  backgroundImage: ['string', 'LinearGradient'],
  backgroundPosition: ['bottom', 'center', 'left', 'left bottom', 'left top', 'right', 'right bottom', 'right top', 'top'],
  backgroundSize: ['auto', 'cover', 'contain'],
  backgroundAttachment: ['fixed', 'local', 'scroll'],
  backgroundClip: ['border-box', 'padding-box', 'content-box', 'text'],
  backgroundRepeat: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'round', 'space'],
  backgroundOrigin: ['border-box', 'padding-box', 'content-box'],
  backgroundBlendMode: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
  mixBlendMode: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity', 'plus-darker', 'plus-lighter'],
  opacity: ['number'],
  outlineStyle: ['none', 'solid', 'dashed', 'dotted', 'double', 'inset'],
  outlineOffset: ['number'],
  outlineWidth: ['0', '1', '2', '4'],
  transition: ['default', 'colors', 'opacity', 'shadow', 'transform', 'all', 'none'],
  transitionDelay: ['string', 'number'],
  transitionDuration: ['string', 'number'],
  transitionTimingFunction: ['default', 'linear', 'in', 'out', 'in-out'],
  animation: ['string'],
  animationDuration: ['string', 'number'],
  animationDelay: ['string', 'number'],
  animationDirection: ['normal', 'reverse', 'alternate', 'alternate-reverse'],
  animationFillMode: ['none', 'forwards', 'backwards', 'both'],
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
  // these will be handled via specific links
  flexShrink: [],
  flexGrow: [],
  gridColumnStart: [],
  gridColumnEnd: [],
  gridRowStart: [],
  gridRowEnd: [],
  gridAutoFlow: ['row', 'column', 'dense', 'row dense', 'column dense'],
  gridAutoRows: ['auto', 'min-content', 'max-content', '${number}fr', 'minmax(${string}, ${string})', 'string'],
  gridAutoColumns: ['auto', 'min-content', 'max-content', '${number}fr', 'minmax(${string}, ${string})', 'string'],
  gridTemplateColumns: ['auto', 'min-content', 'max-content', '${number}fr', 'minmax(${string}, ${string})', 'none', 'subgrid', 'string'],
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
  order: ['number']
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
  zIndex: ['number'],
  disableTapHighlight: ['true'],
  unicodeBidi: ['normal', 'embed', 'bidi-override', 'isolate', 'isolate-override', 'plaintext'],
  caretColor: ['auto', 'transparent']
};

const shorthandMapping: {[key: string]: {values: string[], mapping: string[]}} = {
  padding: {
    values: relativeSpacingValues,
    mapping: ['paddingTop', 'paddingBottom', 'paddingStart', 'paddingEnd']
  },
  paddingX: {
    values: relativeSpacingValues,
    mapping: ['paddingStart', 'paddingEnd']
  },
  paddingY: {
    values: relativeSpacingValues,
    mapping: ['paddingTop', 'paddingBottom']
  },
  margin: {
    values: ['auto'],
    mapping: ['marginTop', 'marginBottom', 'marginStart', 'marginEnd']
  },
  marginX: {
    values: ['auto'],
    mapping: ['marginStart', 'marginEnd']
  },
  marginY: {
    values: ['auto'],
    mapping: ['marginTop', 'marginBottom']
  },
  scrollPadding: {
    values: [],
    mapping: ['scrollPaddingTop', 'scrollPaddingBottom', 'scrollPaddingStart', 'scrollPaddingEnd']
  },
  scrollPaddingX: {
    values: [],
    mapping: ['scrollPaddingStart', 'scrollPaddingEnd']
  },
  scrollPaddingY: {
    values: [],
    mapping: ['scrollPaddingTop', 'scrollPaddingBottom']
  },
  scrollMargin: {
    values: [],
    mapping: ['scrollMarginTop', 'scrollMarginBottom', 'scrollMarginStart', 'scrollMarginEnd']
  },
  scrollMarginX: {
    values: [],
    mapping: ['scrollMarginStart', 'scrollMarginEnd']
  },
  scrollMarginY: {
    values: [],
    mapping: ['scrollMarginTop', 'scrollMarginBottom']
  },
  borderWidth: {
    values: ['0', '1', '2', '4'],
    mapping: ['borderTopWidth', 'borderBottomWidth', 'borderStartWidth', 'borderEndWidth']
  },
  borderXWidth: {
    values: ['0', '1', '2', '4'],
    mapping: ['borderStartWidth', 'borderEndWidth']
  },
  borderYWidth: {
    values: ['0', '1', '2', '4'],
    mapping: ['borderTopWidth', 'borderBottomWidth']
  },
  borderRadius: {
    values: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
    mapping: ['borderTopStartRadius', 'borderTopEndRadius', 'borderBottomStartRadius', 'borderBottomEndRadius']
  },
  borderTopRadius: {
    values: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
    mapping: ['borderTopStartRadius', 'borderTopEndRadius']
  },
  borderBottomRadius: {
    values: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
    mapping: ['borderBottomStartRadius', 'borderBottomEndRadius']
  },
  borderStartRadius: {
    values: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
    mapping: ['borderTopStartRadius', 'borderBottomStartRadius']
  },
  borderEndRadius: {
    values: ['none', 'sm', 'default', 'lg', 'xl', 'full', 'pill'],
    mapping: ['borderTopEndRadius', 'borderBottomEndRadius']
  },
  translate: {
    values: ['full'],
    mapping: ['translateX', 'translateY']
  },
  scale: {
    values: ['number', '${number}%'],
    mapping: ['scaleX', 'scaleY']
  },
  inset: {
    values: ['auto', 'full'],
    mapping: ['top', 'bottom', 'insetStart', 'insetEnd']
  },
  insetX: {
    values: ['auto', 'full'],
    mapping: ['insetStart', 'insetEnd']
  },
  insetY: {
    values: ['auto', 'full'],
    mapping: ['top', 'bottom']
  },
  placeItems: {
    values: ['start', 'end', 'center', 'stretch'],
    mapping: ['alignItems', 'justifyItems']
  },
  placeContent: {
    values: ['normal', 'center', 'start', 'end', 'space-between', 'space-around', 'space-evenly', 'baseline', 'stretch'],
    mapping: ['alignContent', 'justifyContent']
  },
  placeSelf: {
    values: ['auto', 'start', 'end', 'center', 'stretch', 'baseline'],
    mapping: ['alignSelf', 'justifySelf']
  },
  gap: {
    values: relativeSpacingValues,
    mapping: ['rowGap', 'columnGap']
  },
  size: {
    values: heightBaseValues,
    mapping: ['width', 'height']
  },
  minSize: {
    values: heightBaseValues,
    mapping: ['minWidth', 'minHeight']
  },
  maxSize: {
    values: [...heightBaseValues, 'none'],
    mapping: ['maxWidth', 'maxHeight']
  },
  overflow: {
    values: ['auto', 'hidden', 'clip', 'visible', 'scroll'],
    mapping: ['overflowX', 'overflowY']
  },
  overscrollBehavior: {
    values: ['auto', 'contain', 'none'],
    mapping: ['overscrollBehaviorX', 'overscrollBehaviorY']
  },
  gridArea: {
    values: ['string'],
    mapping: ['gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd']
  },
  transition: {
    values: ['default', 'colors', 'opacity', 'shadow', 'transform', 'all', 'none'],
    mapping: ['transition', 'transitionDuration', 'transitionTimingFunction']
  },
  animation: {
    values: ['string'],
    mapping: ['animation', 'animationDuration', 'animationTimingFunction']
  },
  truncate: {
    values: ['true'],
    mapping: ['overflowX', 'overflowY', 'textOverflow', 'whiteSpace']
  },
  font: {
    values: ['fontSize'],
    mapping: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color']
  }
};

const conditionMapping: {[key: string]: string[]} = {
  forcedColors: ['@media (forced-colors: active)'],
  touch: ['@media not ((hover: hover) and (pointer: fine))'],
  sm: ['@media (min-width: ${pxToRem(640)})'],
  md: ['@media (min-width: ${pxToRem(768)})'],
  lg: ['@media (min-width: ${pxToRem(1024)})'],
  xl: ['@media (min-width: ${pxToRem(1280)})'],
  '2xl': ['@media (min-width: ${pxToRem(1536)})']
};

const properties: {[key: string]: {[key: string]: string[]}} = {
  color: colorPropertyValues,
  dimensions: dimensionsPropertyValues,
  text: textPropertyValues,
  effects: effectsPropertyValues,
  layout: layoutPropertyValues,
  misc: miscPropertyValues,
  conditions: conditionMapping
};

export function getAdditionalTypes(propertyName: string): string[] {
  let types: string[] = [];

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

export const spacingTypeValues = {
  baseSpacing: baseSpacingValues,
  negativeSpacing: negativeBaseSpacingValues
};

// a mapping of value to relative links that should be replaced in place
// opted NOT to link to Fonts from 'ui', 'code', etc since the visual example
// is so close to the area in the table where those are rendered
const relativeLinks: {[key: string]: string} = {
  'text-to-control': '#dimensions',
  'text-to-visual': '#dimensions',
  'edge-to-text': '#dimensions',
  'pill': '#dimensions',
  'baseColors': '#colors',
  'fontSize': '#text'
};

// a mapping of value to mdn links that should be replaced in place
const mdnTypeLinks: {[key: string]: string} = {
  'string': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
  'number': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number'
};

// a mapping of value to links that should be replaced in place with the provided string
const mdnPropertyLinks: {[key: string]: {[value: string]: string}} = {
  'flexShrink': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink'
  },
  'flexGrow': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow'
  },
  'gridColumnStart': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start'
  },
  'gridColumnEnd': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end'
  },
  'gridRowStart': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start'
  },
  'gridRowEnd': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end'
  }
};

const propertyDescriptions: {[key: string]: string} = {
  'rotate': 'Accepts a number (treated as degrees) or a string with units (deg, rad, grad, turn).',
  'scaleX': 'Accepts a number or percentage string.',
  'scaleY': 'Accepts a number or percentage string.',
  'scaleShortHand': 'Accepts a number or percentage string.',
  'aspectRatio': 'Also accepts a ratio in the format number/number (e.g., 16/9, 4/3).',
  'transitionShorthand': 'This shorthand explicitly defines duration as 150 and the timing function as "default".',
  'animationShortHand': 'This shorthand explicitly defines duration as 150 and the timing function as "default".',
  'truncateShortHand': 'Applying this shorthand will enable text truncation.',
  'fontShortHand': 'The "fontSize" provided defines the values this shorthand sets on the mapped values.'
};

interface StyleMacroPropertyDefinition {
  values: string[],
  additionalTypes?: string[],
  links?: {[value: string]: {href: string, isRelative?: boolean}},
  description?: string,
  mapping?: string[]
}

export function getPropertyDefinitions(propertyCategory: string): {[key: string]: StyleMacroPropertyDefinition} {
  let result: {[key: string]: StyleMacroPropertyDefinition} = {};
  let propertiesMapping = properties[propertyCategory] || {};

  for (let [name, values] of Object.entries(propertiesMapping)) {
    let links: {[value: string]: {href: string, isRelative?: boolean}} = {};

    if (mdnPropertyLinks[name]) {
      let [key, value] = Object.entries(mdnPropertyLinks[name])[0];
      links[key] = {href: value};
      values = [key];
    } else {
      // see if the property has any common types that should link to MDN instead
      for (let value of values) {
        // make sure not to overwrite number in sizing properties and pill in other sections aka effects
        if ((value === 'number' && sizingProperties.has(name)) || (value === 'pill' && propertyCategory !== 'dimensions')) {
          continue;
        }

        if (mdnTypeLinks[value]) {
          links[value] = {href: mdnTypeLinks[value]};
        } else if (relativeLinks[value]) {
          links[value] = {href: relativeLinks[value], isRelative: true};
        }
      }
    }

    result[name] = {
      values,
      additionalTypes: getAdditionalTypes(name),
      links: Object.keys(links).length > 0 ? links : undefined,
      description: propertyDescriptions[name]
    };
  }
  return result;
}

export function getShorthandDefinitions(): {[key: string]: StyleMacroPropertyDefinition} {
  let result: {[key: string]: StyleMacroPropertyDefinition} = {};

  for (let [shorthandName, shorthandDef] of Object.entries(shorthandMapping)) {
    let values = shorthandDef.values;
    let links: {[value: string]: {href: string, isRelative?: boolean}} = {};

    for (let value of values) {
      if (value === 'pill' && shorthandName.includes('border')) {
        continue;
      }

      if (mdnTypeLinks[value]) {
        links[value] = {href: mdnTypeLinks[value]};
      } else if (relativeLinks[value]) {
        links[value] = {href: relativeLinks[value], isRelative: true};
      }
    }

    result[shorthandName] = {
      values,
      additionalTypes: getAdditionalTypes(shorthandDef.mapping[0]),
      links: Object.keys(links).length > 0 ? links : undefined,
      mapping: shorthandDef.mapping,
      description: propertyDescriptions[`${shorthandName}ShortHand`]
    };
  }

  return result;
}
