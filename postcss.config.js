module.exports = {
  modules: true,
  plugins: require('@spectrum-css/component-builder/css/processors').processors.concat([
    require('postcss-logical')(),
    require('postcss-dir-pseudo-class')(),
  ])
};
