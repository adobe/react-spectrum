const glob = require('glob');

const withTM = require("next-transpile-modules")([
  '@adobe/react-spectrum',
  '@react-spectrum/*',
  '@spectrum-icons/*',
].flatMap(spec => glob.sync(`${spec}`, { cwd: 'node_modules/' })));

module.exports = withTM({
  basePath:
    process.env.VERDACCIO && process.env.CIRCLE_SHA1
      ? `/reactspectrum/${process.env.CIRCLE_SHA1}/verdaccio/next17`
      : "",
});
