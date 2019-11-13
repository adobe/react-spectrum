module.exports = {
  modules: true,
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-inherit'),
    require('postcss-logical')(),
    require('postcss-dir-pseudo-class')(),
    require('postcss-custom-properties')({
      noValueNotifications: 'error',
      warnings: false
    }),
    // require('./lib/postcss-custom-properties-passthrough')(),
    require('postcss-calc'),
    require('./lib/postcss-custom-properties-mapping'),
    require('./lib/postcss-notnested')({replace: '.spectrum'}),
    require('postcss-svg'),
    require('postcss-functions')({
      functions: {
        noscale: function (value) {
          return value.toString().toUpperCase();
        },
        percent: function (value) {
          return parseInt(value, 10) / 100;
        }
      }
    }),
    // require('./lib/postcss-strip-comments')({ preserveTopdoc: false }),
    require('postcss-focus-ring'),
    require('./lib/postcss-hover-media')
    // require('autoprefixer')({
    //   'browsers': [
    //     'IE >= 10',
    //     'last 2 Chrome versions',
    //     'last 2 Firefox versions',
    //     'last 2 Safari versions',
    //     'last 2 iOS versions'
    //   ]
    // })
  ]
};
