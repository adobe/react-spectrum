import plugin from 'tailwindcss/plugin';

const attributes = {
  boolean: [
    'hovered',
    'focused',
    'focus-visible',
    'pressed',
    'disabled',
    'drop-target',
    'dragging',
    'empty',
    'allows-removing',
    'allows-sorting',
    'placeholder',
    'selected',
    'indeterminate',
    'readonly',
    'required',
    'entering',
    'exiting',
    'open',
    'unavailable',
    'current',
    'invalid'
  ],
  enum: {
    'validation-state': ['invalid', 'valid'],
    placement: ['left', 'right', 'top', 'bottom'],
    type: ['literal', 'year', 'month', 'day'],
    layout: ['grid', 'stack'],
    orientation: ['horizontal', 'vertical']
  }
};

module.exports = plugin(({addVariant}) => {
  attributes.boolean.forEach((attributeName) => {
    let selector = `&[data-${attributeName}]`;
    addVariant(attributeName, selector);
  });
  Object.keys(attributes.enum).forEach((attributeName) => {
    attributes.enum[attributeName].forEach(
        (attributeValue) => {
          let variantName = `${attributeName}-${attributeValue}`;
          let selector = `&[data-${attributeName}]="${attributeValue}"`;
          addVariant(variantName, selector);
        }
      );
  });
});
