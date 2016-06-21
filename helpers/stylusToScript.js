/*eslint-disable*/

'use strict';

var stylus = require('stylus');
var path = require('path');
var fs = require('fs');

var dirname = path.dirname;
var isAbsolute = path.isAbsolute;
var resolve = path.resolve;

var resolveModulePath = function(filename) {
  var dir = dirname(filename);
  if (isAbsolute(dir)) {
    return dir;
  }

  if (process.env.PWD) {
    return resolve(process.env.PWD, dir);
  }

  return resolve(dir);
};

module.exports = function () {
  return {
    visitor: {
      ImportDeclaration: function(path, options) {
        var fileName = path.node.source.value;
        var filePath = resolve(resolveModulePath(options.file.opts.filename), fileName);
        if (fileName.match(/^.*\.(styl)$/)) {
          var content = fs.readFileSync(filePath, 'utf8'),
            css = stylus(content, {compress: true}).render();
            path.replaceWithSourceString(
              'require("./buildGlobalScript.js").default("' + encodeURI(css) + '")'
            );
        }
      }
    }
  };
};
