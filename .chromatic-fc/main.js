
module.exports = {
  framework: {
    name: "storybook-react-parcel",
    options: {},
  },
  stories: [
    '../packages/**/chromatic-fc/**/*.stories.{js,jsx,ts,tsx}',
    '../packages/@react-spectrum/s2/chromatic/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: process.env.NODE_ENV === 'production' ? [] : [
    'storybook/actions',
    '@storybook/addon-a11y'
  ],
  typescript: {
    check: false,
    reactDocgen: false
  }
};
