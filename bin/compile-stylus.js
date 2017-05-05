var nib = require('nib');
var stylus = require('stylus');
var svg = require('svg-stylus');

var BASE_URL = 'https://cdn.livefyre.com/libs/react-spectrum/v' + require('../package.json').version + '/';

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
      .define('url', resolver)
      .set('include css', true);
  };
};

function resolver(v) {
  var url = v.val;
  if (!/^data:/.test(url)) {
    url = BASE_URL + url;
  }

  return new stylus.nodes.Literal('url("' + url + '")');
}
