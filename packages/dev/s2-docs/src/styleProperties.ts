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

// Properties that use PercentageProperty (accept lengthPercentage in addition to mapped values)
const percentageProperties = new Set([
  'top', 'left', 'bottom', 'right',
  'insetStart', 'insetEnd',
  'marginTop', 'marginBottom', 'marginStart', 'marginEnd',
  'paddingTop', 'paddingBottom', 'paddingStart', 'paddingEnd',
  'textIndent', 'translateX', 'translateY'
]);

// Properties that use SizingProperty (accept number and lengthPercentage in addition to mapped values)
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
const baseSpacingValues = [0, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96];
const negativeBaseSpacingValues = [-2, -4, -8, -12, -16, -20, -24, -28, -32, -36, -40, -44, -48, -56, -64, -80, -96];
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

const dimensionsPropertyValues: {[key: string]: (string | number)[]} = {
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
  borderStartWidth: [0, 1, 2, 4],
  borderEndWidth: [0, 1, 2, 4],
  borderTopWidth: [0, 1, 2, 4],
  borderBottomWidth: [0, 1, 2, 4],
  borderStyle: ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none'],
  strokeWidth: [0, 1, 2],
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

const textPropertyValues: {[key: string]: (string | number)[]} = {
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

const effectsPropertyValues: {[key: string]: (string | number)[]} = {
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
  outlineWidth: [0, 1, 2, 4],
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

const layoutPropertyValues: {[key: string]: (string | number)[]} = {
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

const miscPropertyValues: {[key: string]: (string | number)[]} = {
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

const shorthandMapping: {[key: string]: {values: (string | number)[], mapping: string[]}} = {
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
    values: [0, 1, 2, 4],
    mapping: ['borderTopWidth', 'borderBottomWidth', 'borderStartWidth', 'borderEndWidth']
  },
  borderXWidth: {
    values: [0, 1, 2, 4],
    mapping: ['borderStartWidth', 'borderEndWidth']
  },
  borderYWidth: {
    values: [0, 1, 2, 4],
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
    values: ['normal', 'center', 'start', 'end', 'space-between', 'space-around', 'space-evenly', 'stretch'],
    mapping: ['alignContent', 'justifyContent']
  },
  placeSelf: {
    values: ['auto', 'start', 'end', 'center', 'stretch'],
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
    values: ['boolean'],
    mapping: ['overflowX', 'overflowY', 'textOverflow', 'whiteSpace']
  },
  font: {
    values: [...fontSize],
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

const properties: {[key: string]: {[key: string]: (string | number)[]}} = {
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
    types.push('number', 'lengthPercentage');
  }

  if (percentageProperties.has(propertyName)) {
    types.push('lengthPercentage');
  }

  return types;
}

export const spacingTypeValues = {
  baseSpacing: baseSpacingValues,
  negativeSpacing: negativeBaseSpacingValues
};

// a mapping of value to mdn links that should be replaced in place
const mdnTypeLinks: {[key: string]: string} = {
  'string': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
  'number': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
  'currentColor': 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword',
  'transparent': 'https://developer.mozilla.org/en-US/docs/Web/CSS/named-color#transparent',
  'min': 'https://developer.mozilla.org/en-US/docs/Web/CSS/min-content',
  'max': 'https://developer.mozilla.org/en-US/docs/Web/CSS/max-content',
  'fit': 'https://developer.mozilla.org/en-US/docs/Web/CSS/fit-content'
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
  },
  'marginStart': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-start#auto'
  },
  'marginEnd': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-end#auto'
  },
  'marginTop': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top#auto'
  },
  'marginBottom': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom#auto'
  },
  'insetStart': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-start#auto'
  },
  'insetEnd': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-end#auto'
  },
  'top': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/top#auto'
  },
  'left': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/left#auto'
  },
  'bottom': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/bottom#auto'
  },
  'right': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/right#auto'
  },
  'height': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/height#auto'
  },
  'width': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/width#auto'
  },
  'minHeight': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/min-height#auto'
  },
  'minWidth': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/min-width#auto'
  },
  'maxHeight': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/max-height#none'
  },
  'maxWidth': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/max-width#none'
  },
  'flexBasis': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis#auto'
  },
  'containIntrinsicWidth': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-width#auto'
  },
  'containIntrinsicHeight': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-height#auto'
  },
  'aspectRatio': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio#auto'
  },
  'position': {
    'absolute': 'https://developer.mozilla.org/en-US/docs/Web/CSS/position#absolute',
    'fixed': 'https://developer.mozilla.org/en-US/docs/Web/CSS/position#fixed',
    'relative': 'https://developer.mozilla.org/en-US/docs/Web/CSS/position#relative',
    'sticky': 'https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky',
    'static': 'https://developer.mozilla.org/en-US/docs/Web/CSS/position#static'
  },
  'caretColor': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/caret-color#auto',
    'transparent': 'https://developer.mozilla.org/en-US/docs/Web/CSS/caret-color#color_value'
  },
  'borderStyle': {
    'solid': 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-style#solid',
    'dashed': 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-style#dashed',
    'dotted': 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-style#dotted',
    'double': 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-style#double',
    'hidden': 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-style#hidden',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-style#none'
  },
  'outlineStyle': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style#none',
    'solid': 'https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style#solid',
    'dashed': 'https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style#dashed',
    'dotted': 'https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style#dotted',
    'double': 'https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style#double',
    'inset': 'https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style#inset'
  },
  'transform': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/transform'
  },
  'boxDecorationBreak': {
    'slice': 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break#slice',
    'clone': 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break#clone'
  },
  'hyphens': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens#none',
    'manual': 'https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens#manual',
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens#auto'
  },
  'lineClamp': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/line-clamp'
  },
  'listStyleType': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type#none',
    'disc': 'https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type#disc',
    'decimal': 'https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type#decimal'
  },
  'listStylePosition': {
    'inside': 'https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-position#inside',
    'outside': 'https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-position#outside'
  },
  'textTransform': {
    'uppercase': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform#uppercase',
    'lowercase': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform#lowercase',
    'capitalize': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform#capitalize',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform#none'
  },
  'textAlign': {
    'start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-align#start',
    'center': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-align#center',
    'end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-align#end',
    'justify': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-align#justify'
  },
  'verticalAlign': {
    'baseline': 'https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align#baseline',
    'top': 'https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align#top',
    'middle': 'https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align#middle',
    'bottom': 'https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align#bottom',
    'text-top': 'https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align#text-top',
    'text-bottom': 'https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align#text-bottom',
    'sub': 'https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align#sub',
    'super': 'https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align#super'
  },
  'textDecoration': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration#none',
    'underline': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line#underline',
    'overline': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line#overline',
    'line-through': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line#line-through'
  },
  'textOverflow': {
    'ellipsis': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow#ellipsis',
    'clip': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow#clip'
  },
  'whiteSpace': {
    'normal': 'https://developer.mozilla.org/en-US/docs/Web/CSS/white-space#normal',
    'nowrap': 'https://developer.mozilla.org/en-US/docs/Web/CSS/white-space#nowrap',
    'pre': 'https://developer.mozilla.org/en-US/docs/Web/CSS/white-space#pre',
    'pre-line': 'https://developer.mozilla.org/en-US/docs/Web/CSS/white-space#pre-line',
    'pre-wrap': 'https://developer.mozilla.org/en-US/docs/Web/CSS/white-space#pre-wrap',
    'break-spaces': 'https://developer.mozilla.org/en-US/docs/Web/CSS/white-space#break-spaces'
  },
  'textWrap': {
    'wrap': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap#wrap',
    'nowrap': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap#nowrap',
    'balance': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap#balance',
    'pretty': 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap#pretty'
  },
  'wordBreak': {
    'normal': 'https://developer.mozilla.org/en-US/docs/Web/CSS/word-break#normal',
    'break-all': 'https://developer.mozilla.org/en-US/docs/Web/CSS/word-break#break-all',
    'keep-all': 'https://developer.mozilla.org/en-US/docs/Web/CSS/word-break#keep-all',
    'break-word': 'https://developer.mozilla.org/en-US/docs/Web/CSS/word-break#break-word'
  },
  'overflowWrap': {
    'normal': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap#normal',
    'anywhere': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap#anywhere',
    'break-word': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap#break-word'
  },
  'display': {
    'block': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#block',
    'inline-block': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#inline-block',
    'inline': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#inline',
    'flex': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#flex',
    'inline-flex': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#inline-flex',
    'grid': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#grid',
    'inline-grid': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#inline-grid',
    'contents': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#contents',
    'list-item': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#list-item',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/display#none'
  },
  'alignContent': {
    'normal': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#normal',
    'center': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#center',
    'start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#start',
    'end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#end',
    'space-between': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#space-between',
    'space-around': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#space-around',
    'space-evenly': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#space-evenly',
    'baseline': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#baseline',
    'stretch': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-content#stretch'
  },
  'alignItems': {
    'start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-items#start',
    'end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-items#end',
    'center': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-items#center',
    'baseline': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-items#baseline',
    'stretch': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-items#stretch'
  },
  'justifyContent': {
    'normal': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#normal',
    'start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#start',
    'end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#end',
    'center': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#center',
    'space-between': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#space-between',
    'space-around': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#space-around',
    'space-evenly': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#space-evenly',
    'stretch': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content#stretch'
  },
  'justifyItems': {
    'start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items#start',
    'end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items#end',
    'center': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items#center',
    'stretch': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items#stretch'
  },
  'alignSelf': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-self#auto',
    'start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-self#start',
    'end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-self#end',
    'center': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-self#center',
    'stretch': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-self#stretch',
    'baseline': 'https://developer.mozilla.org/en-US/docs/Web/CSS/align-self#baseline'
  },
  'justifySelf': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self#auto',
    'start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self#start',
    'end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self#end',
    'center': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self#center',
    'stretch': 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self#stretch'
  },
  'flexDirection': {
    'row': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction#row',
    'column': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction#column',
    'row-reverse': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction#row-reverse',
    'column-reverse': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction#column-reverse'
  },
  'flexWrap': {
    'wrap': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap#wrap',
    'wrap-reverse': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap#wrap-reverse',
    'nowrap': 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap#nowrap'
  },
  'gridAutoFlow': {
    'row': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow#row',
    'column': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow#column',
    'dense': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow#dense',
    'row dense': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow#row_dense',
    'column dense': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow#column_dense'
  },
  'gridAutoRows': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows#auto',
    'min-content': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows#min-content',
    'max-content': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows#max-content',
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows'
  },
  'gridAutoColumns': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns#auto',
    'min-content': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns#min-content',
    'max-content': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns#max-content',
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns'
  },
  'gridTemplateColumns': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns#auto',
    'min-content': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns#min-content',
    'max-content': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns#max-content',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns#none',
    'subgrid': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns#subgrid',
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns'
  },
  'gridTemplateRows': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows#auto',
    'min-content': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows#min-content',
    'max-content': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows#max-content',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows#none',
    'subgrid': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows#subgrid',
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows'
  },
  'gridTemplateAreas': {
    'string[]': 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas'
  },
  'float': {
    'inline-start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/float#inline-start',
    'inline-end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/float#inline-end',
    'right': 'https://developer.mozilla.org/en-US/docs/Web/CSS/float#right',
    'left': 'https://developer.mozilla.org/en-US/docs/Web/CSS/float#left',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/float#none'
  },
  'clear': {
    'inline-start': 'https://developer.mozilla.org/en-US/docs/Web/CSS/clear#inline-start',
    'inline-end': 'https://developer.mozilla.org/en-US/docs/Web/CSS/clear#inline-end',
    'left': 'https://developer.mozilla.org/en-US/docs/Web/CSS/clear#left',
    'right': 'https://developer.mozilla.org/en-US/docs/Web/CSS/clear#right',
    'both': 'https://developer.mozilla.org/en-US/docs/Web/CSS/clear#both',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/clear#none'
  },
  'overflowX': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x#auto',
    'hidden': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x#hidden',
    'clip': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x#clip',
    'visible': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x#visible',
    'scroll': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x#scroll'
  },
  'overflowY': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y#auto',
    'hidden': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y#hidden',
    'clip': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y#clip',
    'visible': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y#visible',
    'scroll': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y#scroll'
  },
  'overscrollBehaviorX': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-x#auto',
    'contain': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-x#contain',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-x#none'
  },
  'overscrollBehaviorY': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-y#auto',
    'contain': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-y#contain',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-y#none'
  },
  'boxSizing': {
    'border-box': 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing#border-box',
    'content-box': 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing#content-box'
  },
  'tableLayout': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout#auto',
    'fixed': 'https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout#fixed'
  },
  'order': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/order'
  },
  'pointerEvents': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events#none',
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events#auto'
  },
  'userSelect': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/user-select#none',
    'text': 'https://developer.mozilla.org/en-US/docs/Web/CSS/user-select#text',
    'all': 'https://developer.mozilla.org/en-US/docs/Web/CSS/user-select#all',
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/user-select#auto'
  },
  'visibility': {
    'visible': 'https://developer.mozilla.org/en-US/docs/Web/CSS/visibility#visible',
    'hidden': 'https://developer.mozilla.org/en-US/docs/Web/CSS/visibility#hidden',
    'collapse': 'https://developer.mozilla.org/en-US/docs/Web/CSS/visibility#collapse'
  },
  'cursor': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#auto',
    'default': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#default',
    'pointer': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#pointer',
    'wait': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#wait',
    'text': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#text',
    'move': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#move',
    'help': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#help',
    'not-allowed': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#not-allowed',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#none'
  },
  'objectFit': {
    'contain': 'https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit#contain',
    'cover': 'https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit#cover',
    'fill': 'https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit#fill',
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit#none',
    'scale-down': 'https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit#scale-down'
  },
  'zIndex': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/z-index'
  },
  'boxShadow': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow#none'
  },
  'filter': {
    'none': 'https://developer.mozilla.org/en-US/docs/Web/CSS/filter#none'
  },
  'opacity': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/opacity'
  },
  'outlineOffset': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset'
  },
  'backgroundSize': {
    'auto': 'https://developer.mozilla.org/en-US/docs/Web/CSS/background-size#auto',
    'cover': 'https://developer.mozilla.org/en-US/docs/Web/CSS/background-size#cover',
    'contain': 'https://developer.mozilla.org/en-US/docs/Web/CSS/background-size#contain'
  },
  'backgroundImage': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/background-image'
  },
  'transitionDelay': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/transition-delay',
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/transition-delay'
  },
  'transitionDuration': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/transition-duration',
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/transition-duration'
  },
  'animation': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation'
  },
  'animationDuration': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration',
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration'
  },
  'animationDelay': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay',
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay'
  },
  'animationIterationCount': {
    'string': 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count',
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count'
  },
  'rotate': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/rotate'
  },
  'scaleX': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/scale'
  },
  'scaleY': {
    'number': 'https://developer.mozilla.org/en-US/docs/Web/CSS/scale'
  }
};

const propertyDescriptions: {[key: string]: string} = {
  'rotate': 'Accepts a number (treated as degrees) or a string with units (deg, rad, grad, turn).',
  'scaleX': 'Accepts a number or percentage string.',
  'scaleY': 'Accepts a number or percentage string.',
  'scaleShortHand': 'Accepts a number or percentage string.',
  'aspectRatio': 'Also accepts a ratio in the format number/number (e.g., 16/9, 4/3).',
  'transitionShortHand': 'This shorthand explicitly defines duration as 150 and the timing function as "default".',
  'animationShortHand': 'This shorthand explicitly defines duration as 150 and the timing function as "default".',
  'truncateShortHand': 'Accepts a boolean value. Applying this shorthand will set the required style macro properties to enable text truncation.',
  'fontShortHand': 'Accepts the same values as fontSize. The fontSize provided defines the values this shorthand sets on the mapped values.',
  'borderStartWidth': 'These values map to pixels.',
  'borderEndWidth': 'These values map to pixels.',
  'borderTopWidth': 'These values map to pixels.',
  'borderBottomWidth': 'These values map to pixels.',
  'outlineWidth': 'These values map to pixels.',
  'strokeWidth': 'These values map to pixels.'
};

interface StyleMacroPropertyDefinition {
  values: (string | number)[],
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

    // check for property specific MDN links
    if (mdnPropertyLinks[name]) {
      for (let [key, href] of Object.entries(mdnPropertyLinks[name])) {
        links[key] = {href};
      }
    }

    // see if the property has any common types that should link to MDN
    for (let value of values) {
      // skip if we already have a property specific link
      if (links[value]) {
        continue;
      }

      // make sure not to overwrite number in sizing properties and pill in other sections aka effects
      if ((value === 'number' && sizingProperties.has(name)) || (value === 'pill' && propertyCategory !== 'dimensions')) {
        continue;
      }

      if (mdnTypeLinks[value]) {
        links[value] = {href: mdnTypeLinks[value]};
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

export function getPropertyToShorthandsMapping(): {[propertyName: string]: string[]} {
  let result: {[propertyName: string]: string[]} = {};

  for (let [shorthandName, shorthandDef] of Object.entries(shorthandMapping)) {
    for (let propertyName of shorthandDef.mapping) {
      if (!result[propertyName]) {
        result[propertyName] = [];
      }
      result[propertyName].push(shorthandName);
    }
  }

  return result;
}
