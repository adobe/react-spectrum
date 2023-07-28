import plugin from "tailwindcss/plugin";

const attributes = {
  boolean: {
    data: [
      "hovered",
      "focused",
      "focus-visible",
      "pressed",
      "disabled",
      "drop-target",
      "dragging",
      "empty",
      "allows-removing",
      "placeholder",
      "selected",
      "indeterminate",
      "readonly",
      "required",
      "entering",
      "exiting",
      "open",
      "unavailable"
    ],
    aria: ["sort", "invalid", "current"],
  },
  enum: {
    data: {
      "validation-state": ["invalid", "valid"],
      "placement": ["left", "right", "top", "bottom"],
      "type": ["literal", "year", "month", "day"],
      "layout": ["grid", "stack"]
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
