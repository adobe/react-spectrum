var nib = require('nib');
var stylus = require('stylus');
var svg = require('svg-stylus');

/**
 * This is a stylus plugin that sets things up the way we need
 */
module.exports = function () {
  return function (style) {
    style
      .include(__dirname + '/../node_modules')
      .use(svg())
      .use(nib())
      .define('embedurl', stylus.url())
      .define('url', stylus.resolver())
      .set('include css', true);
  };
};
