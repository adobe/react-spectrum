module.exports = ({ config }, env) => {
  config = require("../.storybook-shared/webpack.config")({ config }, env);
  config.resolve.alias = {
    ...config.resolve.alias,
    react: "preact/compat",
    "react-dom": "preact/compat",
    "@storybook/react": "@storybook/preact",
  };
  return config;
};
