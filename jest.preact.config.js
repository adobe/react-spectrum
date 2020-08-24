const defaultConfig = require('./jest.config.js');

module.exports = {
  ...defaultConfig,
  moduleNameMapper: {
    ...(defaultConfig.moduleNameMapper),
    '^react$': 'preact/compat',
    '^react-dom$': 'preact/compat',
    '^@testing-library/react$': '@testing-library/preact',
    '^@testing-library/react-hooks$': '@testing-library/preact-hooks',
  }
};
