module.exports = function (keepVars = false) {
  return [
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-inherit'),
    require('postcss-logical')(),
    require('postcss-dir-pseudo-class')(),
    require('postcss-custom-properties')({
      noValueNotifications: 'error',
      warnings: !keepVars
    }),
    // require('./lib/postcss-custom-properties-passthrough')(),
    require('postcss-calc'),
    keepVars ? require('./lib/postcss-custom-properties-mapping') : null,
    keepVars ? require('./lib/postcss-notnested')({ replace: '.spectrum' }) : null,
    require('postcss-svg'),
    require('postcss-functions')({
      functions: {
        noscale: function(value) {
          return value.toString().toUpperCase();
        },
        percent: function(value) {
          return parseInt(value, 10) / 100;
        }
      }
    }),
    // require('./lib/postcss-strip-comments')({ preserveTopdoc: false }),
    require('postcss-focus-ring'),
    // require('autoprefixer')({
    //   'browsers': [
    //     'IE >= 10',
    //     'last 2 Chrome versions',
    //     'last 2 Firefox versions',
    //     'last 2 Safari versions',
    //     'last 2 iOS versions'
    //   ]
    // })
  ].filter(Boolean);
}
