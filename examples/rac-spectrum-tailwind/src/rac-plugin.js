import plugin from "tailwindcss/plugin";

/**
 * Map to multiple:
 * isSelected, isPressed ->	[aria-pressed=true], data-pressed
 * isFocused :focus, data-focused
 * isDisabled ->	:disabled, [data-disabled] aria-disabled
 * [data-type="..."] literal, year, month, day, etc.
 * readonly ->	[aria-readonly=true], data-readonly
 */

const attributes = {
  boolean: {
    data: ["hovered", "pressed", "focus-visible", "focused", "drop-target", "empty", "allows-removing", "placeholder", "selected", "indeterminate", "disabled", "readonly", "required", "entering", "exiting", "open"],
    aria: ["sort", "invalid", "current"],
  },
  enum: {
    data: {
      "validation-state": ["invalid", "valid"],
      "placement": ["left", "right", "top", "bottom"],
    },
    aria: {
      "orientation": ["horizontal", "vertical"],
    },
  }
}


module.exports = plugin(({ addVariant, e }) => {
  Object.keys(attributes.boolean).forEach((attributePrefix) => {
    attributes.boolean[
      attributePrefix
    ].forEach((attributeName) => {
      let variantName = attributeName;
      let selector = `${attributePrefix}-${attributeName}`;

      addVariant(`${variantName}`, ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.${e(`${variantName}${separator}${className}`)}[${selector}]`;
        });
      });
    });
  });
  Object.keys(attributes.enum).forEach((attributePrefix) => {
    Object.keys(attributes.enum[
      attributePrefix
    ]).forEach((attributeName) => {
      attributes.enum[
        attributePrefix
      ][attributeName].forEach((attributeValue) => {
        let variantName = `${attributeName}-${attributeValue}`;
        let selector = `${attributePrefix}-${attributeName}="${attributeValue}"`;

        addVariant(`${variantName}`, ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            return `.${e(`${variantName}${separator}${className}`)}[${selector}]`;
          });
        });
      });
    });
  });
});
