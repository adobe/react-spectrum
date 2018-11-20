const template = require('babel-template');
const fs = require('fs');
const Path = require('path');

const THEMES = ['light', 'dark', 'lightest', 'darkest'];

const notThemeTemplate = template('!process.env.THEME_NAME');
const themeTemplate = template('if (NO_THEMES || process.env.THEME_NAME) require(PATH);');
const scaleTemplate = template(`
  if (process.env.SCALE_MEDIUM && process.env.SCALE_LARGE) {
    require(INDEX_PATH);
    require(DIFF_PATH);
  } else if (process.env.SCALE_LARGE) {
    require(LARGE_PATH);
  } else {
    require(INDEX_PATH);
  }
`);

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
    let dir = Path.dirname(filename);

    // When building for production, we copy spectrum-css into react-spectrum.
    let base = process.env.BUILD_ENV === 'production'
      ? Path.relative(dir, 'dist/spectrum-css')
      : '@spectrum/spectrum-css/dist/components';

    let path = `${component}/`;
    if (theme) {
      path += `multiStops/${theme}.css`;
    } else {
      path += 'index.css';
    }

    // Check if an override exists for this component
    if (fs.existsSync(Path.join(__dirname, '..', 'spectrum-css-overrides', path))) {
      return Path.join(Path.relative(dir, 'dist/spectrum-css-overrides'), path);
    }

    let realpath = process.env.BUILD_ENV === 'production'
      ? Path.resolve(dir, base, path)
      : Path.join(__dirname, '..', 'node_modules', base, path);

    if (fs.existsSync(realpath)) {
      return Path.join(base, path);
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
          statements.push(scaleTemplate({
            INDEX_PATH: t.stringLiteral(main),
            DIFF_PATH: t.stringLiteral(main.replace('index.css', 'index-diff.css')),
            LARGE_PATH: t.stringLiteral(main.replace('index.css', 'index-lg.css'))
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
