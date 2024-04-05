
import { dirname, join } from "path";
module.exports = {
  stories: ['../packages/**/stories/*.stories.{js,jsx,ts,tsx}'],

  addons: [
    "@storybook/addon-actions",
    "@storybook/addon-a11y",
    "@storybook/addon-controls",
    "storybook-dark-mode"
  ],

  typescript: {
    check: false,
    reactDocgen: false
  },

  framework: {
    name: "storybook-react-parcel",
    options: {},
  }
};
