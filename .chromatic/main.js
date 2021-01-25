
const webpackconfig = require('./webpack-chromatic.config.js');

module.exports = {
  stories: ['../packages/**/chromatic/**/*.chromatic.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-knobs'
  ],
  typescript: {
    check: false,
    reactDocgen: false
  },
  webpackFinal: async (config) => {
    let custom = webpackconfig();

    let resultConfig = {
      ...config,
      plugins: config.plugins.concat(custom.plugins),
      parallelism: 1,
      module: {
        ...config.module,
        rules: custom.module.rules
      }
    };

    if (resultConfig.mode === 'production') {
      // see https://github.com/storybooks/storybook/issues/1570
      resultConfig.plugins = resultConfig.plugins.filter(plugin => plugin.constructor.name !== 'UglifyJsPlugin')
    }

    return resultConfig;
  }
};
