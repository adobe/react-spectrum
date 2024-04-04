
import { dirname, join } from "path";
module.exports = {
  stories: ['../packages/**/stories/*.stories.{js,jsx,ts,tsx}'],

  addons: [
    getAbsolutePath("@storybook/addon-actions"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-controls"),
    getAbsolutePath("storybook-dark-mode"),
    "./custom-addons/provider/register",
    "./custom-addons/descriptions/register",
    "./custom-addons/theme/register",
    "./custom-addons/strictmode/register",
    "./custom-addons/scrolling/register"
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

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
