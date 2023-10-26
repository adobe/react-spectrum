
module.exports = {
  core: {
    builder: "storybook-builder-parcel",
  },
  stories: ['../packages/**/chromatic/**/*.chromatic-fc.{js,jsx,ts,tsx}'],
  addons: process.env.NODE_ENV === 'production' ? [] : [
    '@storybook/addon-actions',
    '@storybook/addon-a11y'
  ],
  typescript: {
    check: false,
    reactDocgen: false
  }
};
