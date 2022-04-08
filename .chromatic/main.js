
module.exports = {
  core: {
    builder: "storybook-builder-parcel",
  },
  stories: ['../packages/**/chromatic/**/*.chromatic.{js,jsx,ts,tsx}'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-knobs'
  ],
  typescript: {
    check: false,
    reactDocgen: false
  }
};
