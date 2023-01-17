
module.exports = {
  core: {
    builder: "storybook-builder-parcel",
  },
  stories: ['../packages/*/*/stories/*.stories.{js,jsx,ts,tsx}'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
    '@storybook/addon-controls',
    'storybook-dark-mode',
    './custom-addons/provider/register',
    './custom-addons/descriptions/register',
    './custom-addons/theme/register',
    './custom-addons/strictmode/register'
  ],
  typescript: {
    check: false,
    reactDocgen: false
  }
};
