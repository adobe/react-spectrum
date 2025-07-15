
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
    './custom-addons/provider/register.js',
    './custom-addons/descriptions/register.js',
    './custom-addons/theme/register.js',
    './custom-addons/strictmode/register.js',
    './custom-addons/scrolling/register.js'
  ],

  typescript: {
    check: false,
    reactDocgen: false
  },

  framework: {
    name: "storybook-react-parcel",
    options: {},
  },

  core: {
    disableWhatsNewNotifications: true
  }
};
