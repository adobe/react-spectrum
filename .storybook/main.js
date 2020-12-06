
const webpackconfig = require('./webpack-storybook.config.js');

module.exports = {
  stories: ['../packages/**/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-a11y',
    '@storybook/addon-knobs',
    'storybook-dark-mode',
    './custom-addons/provider/register',
    './theme.register'
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
