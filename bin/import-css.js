const template = require('babel-template');
const fs = require('fs');
const Path = require('path');

const THEMES = ['light', 'dark', 'lightest', 'darkest'];

const requireTemplate = template('require(PATH)');
const notThemeTemplate = template('!process.env.THEME_NAME');
const themeTemplate = template('if (NO_THEMES || process.env.THEME_NAME) require(PATH);');

module.exports = function ({types: t}) {
  // Produce an && chain to check if none of the theme variables are set.
  function noThemes() {
    let left = null;
    for (let theme of THEMES) {
      let right = notThemeTemplate({THEME_NAME: t.identifier(`THEME_${theme.toUpperCase()}`)}).expression;
      if (left) {
        left = t.logicalExpression('&&', left, right);
      } else {
        left = right;
      }
    }

    return left;
  }

  // Get the path to a CSS file for the component + theme.
  function getCSS(component, theme, filename) {
    // When building for production, we copy spectrum-css into react-spectrum.
    let base = process.env.BUILD_ENV === 'production'
      ? Path.relative(Path.dirname(filename), 'dist/spectrum-css')
      : '@spectrum/spectrum-css/dist/components';

    let path = `${base}/${component}/`;
    if (theme) {
      path += `multiStops/${theme}.css`;
    } else {
      path += 'index.css';
    }

    let realpath = process.env.BUILD_ENV === 'production'
      ? Path.resolve(Path.dirname(filename), path)
      : __dirname + '/../node_modules/' + path;

    if (fs.existsSync(realpath)) {
      return path;
    } else if (!theme) {
      console.error('Could not find Spectrum CSS import: ', realpath);
    }
  }

  return {
    visitor: {
      CallExpression(path) {
        if (!t.isIdentifier(path.node.callee, {name: 'importSpectrumCSS'})) {
          return;
        }

        let component = path.node.arguments[0].value;
        let statements = [];

        // Get index.css
        let main = getCSS(component, null, path.hub.file.opts.filename);
        if (main) {
          statements.push(requireTemplate({
            PATH: t.stringLiteral(main)
          }));
        }

        // Get css files for each theme.
        for (let theme of THEMES) {
          let css = getCSS(component, theme, path.hub.file.opts.filename);
          if (css) {
            statements.push(themeTemplate({
              NO_THEMES: noThemes(),
              THEME_NAME: t.identifier(`THEME_${theme.toUpperCase()}`),
              PATH: t.stringLiteral(css)
            }));
          }
        }

        path.getStatementParent().insertBefore(statements);
        path.remove();
      }
    }
  };
};
