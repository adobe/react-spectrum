
module.exports = {
  core: {
    builder: "storybook-builder-parcel",
  },
  // TODO: revert this back to  stories: ['../packages/**/stories/*.stories.{js,jsx,ts,tsx}'], when done testing individual stories
  stories: ['../packages/@react-spectrum/dialog/stories/*.stories.{js,jsx,ts,tsx}'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
    '@storybook/addon-controls',
    'storybook-dark-mode',
    './custom-addons/provider/register',
    './custom-addons/descriptions/register',
    './custom-addons/theme/register',
    './custom-addons/strictmode/register',
    './custom-addons/scrolling/register'
  ],
  typescript: {
    check: false,
    reactDocgen: false
  }
};
