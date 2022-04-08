
module.exports = {
  core: {
    builder: "storybook-builder-parcel",
  },
  stories: ['../packages/*/*/stories/*.stories.{js,jsx,ts,tsx}'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-knobs',
    'storybook-dark-mode',
    './custom-addons/provider/register',
    './custom-addons/descriptions/register',
    './theme.register'
  ],
  typescript: {
    check: false,
    reactDocgen: false
  }
};
