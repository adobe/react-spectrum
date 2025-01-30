const plugin = require('tailwindcss/plugin');

// Order of these is important because it determines which states win in a conflict.
// We mostly follow Tailwind's defaults, adding our additional states following the categories they define.
// https://github.com/tailwindlabs/tailwindcss/blob/304c2bad6cb5fcb62754a4580b1c8f4c16b946ea/src/corePlugins.js#L83
const attributes = {
  boolean: [
    // Conditions
    'allows-removing',
    'allows-sorting',
    'allows-dragging',
    'has-submenu',

    // States
    'open',
    'expanded',
    'entering',
    'exiting',
    'indeterminate',
    ['placeholder-shown', 'placeholder'],
    'current',
    'required',
    'unavailable',
    'invalid',
    ['read-only', 'readonly'],
    'outside-month',
    'outside-visible-range',
    'pending',

    // Content
    'empty',

    // Interactive states
    'focus-within',
    ['hover', 'hovered'],
    ['focus', 'focused'],
    'focus-visible',
    'pressed',
    'selected',
    'selection-start',
    'selection-end',
    'dragging',
    'drop-target',
    'resizing',
    'disabled'
  ],
  enum: {
    placement: ['left', 'right', 'top', 'bottom'],
    type: ['literal', 'year', 'month', 'day'],
    layout: ['grid', 'stack'],
    orientation: ['horizontal', 'vertical'],
    'selection-mode': ['single', 'multiple'],
    'resizable-direction': ['right', 'left', 'both'],
    'sort-direction': ['ascending', 'descending']
  }
};

const shortNames = {
  'selection-mode': 'selection',
  'resizable-direction': 'resizable',
  'sort-direction': 'sort'
};

// Variants we use that are already defined by Tailwind:
// https://github.com/tailwindlabs/tailwindcss/blob/a2fa6932767ab328515f743d6188c2164ad2a5de/src/corePlugins.js#L84
const nativeVariants = ['indeterminate', 'required', 'invalid', 'empty', 'focus-visible', 'focus-within', 'disabled'];
const nativeVariantSelectors = new Map([
  ...nativeVariants.map((variant) => [variant, `:${variant}`]),
  ['hovered', ':hover'],
  ['focused', ':focus'],
  ['readonly', ':read-only'],
  ['open', '[open]'],
  ['expanded', '[expanded]']
]);

// Variants where both native and RAC attributes should apply. We don't override these.
const nativeMergeSelectors = new Map([
  ['placeholder', ':placeholder-shown']
]);

// If no prefix is specified, we want to avoid overriding native variants on non-RAC components, so we only target elements with the data-rac attribute for those variants.
let getSelector = (prefix, attributeName, attributeValue) => {
  let baseSelector = attributeValue ? `[data-${attributeName}="${attributeValue}"]` : `[data-${attributeName}]`;
  let nativeSelector = nativeVariantSelectors.get(attributeName);
  if (prefix === '' && nativeSelector) {
    let wrappedNativeSelector = `&:where(:not([data-rac]))${nativeSelector}`;
    let nativeSelectorGenerator = wrappedNativeSelector;
    if (nativeSelector === ':hover') {
      nativeSelectorGenerator = wrap => `@media (hover: hover) { ${wrap(wrappedNativeSelector)} }`;
    }
    return [`&:where([data-rac])${baseSelector}`, nativeSelectorGenerator];
  } else if (prefix === '' && nativeMergeSelectors.has(attributeName)) {
    return [`&${baseSelector}`, `&${nativeMergeSelectors.get(attributeName)}`];
  } else {
    return `&${baseSelector}`;
  }
};

let mapSelector = (selector, fn) => {
  if (Array.isArray(selector)) {
    return selector.map(fn);
  } else {
    return fn(selector);
  }
};

let wrapSelector = (selector, wrap) => {
  if (typeof selector === 'function') {
    return selector(wrap);
  } else {
    return wrap(selector);
  }
};

let addVariants = (variantName, selectors, addVariant) => {
  addVariant(variantName, mapSelector(selectors, selector => wrapSelector(selector, s => s)));
};

module.exports = plugin.withOptions((options) => (({addVariant}) => {
  let prefix = options?.prefix ? `${options.prefix}-` : '';

  // Enum attributes go first because currently they are all non-interactive states.
  Object.keys(attributes.enum).forEach((attributeName) => {
    attributes.enum[attributeName].forEach(
      (attributeValue, i) => {
        let name = shortNames[attributeName] || attributeName;
        let variantName = `${prefix}${name}-${attributeValue}`;
        let selectors = getSelector(prefix, attributeName, attributeValue);
        addVariants(variantName, selectors, addVariant, i);
      }
    );
  });

  attributes.boolean.forEach((attribute, i) => {
    let variantName = Array.isArray(attribute) ? attribute[0] : attribute;
    variantName = `${prefix}${variantName}`;
    let attributeName = Array.isArray(attribute) ? attribute[1] : attribute;
    let selectors = getSelector(prefix, attributeName, null);
    addVariants(variantName, selectors, addVariant, i);
  });
}));
