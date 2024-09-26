
module.exports = {
  stories: [
    '../packages/@{react-aria,react-stately,spectrum-icons}/*/stories/*.stories.{js,jsx,ts,tsx}',
    '../packages/@react-spectrum/!(s2)/stories/*.stories.{js,jsx,ts,tsx}',
    '../packages/react-aria-components/stories/*.stories.{js,jsx,ts,tsx}'
  ],

  addons: [
    "@storybook/addon-actions",
    "@storybook/addon-a11y",
    "@storybook/addon-controls",
    "storybook-dark-mode",
    './custom-addons/provider/register',
    './custom-addons/descriptions/register',
    './custom-addons/theme/register',
    './custom-addons/strictmode/register',
    './custom-addons/scrolling/register'
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
