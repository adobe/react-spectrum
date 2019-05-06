const path = require('path');
const webpack = require('webpack');

const generateScopedName = (localName, resourcePath) => {
  const componentName = resourcePath.split('/').slice(-2, -1);

  return componentName + '_' + localName;
};

module.exports = ({config}, env) => {
  // Hack to get icons loading in the storybook without copying them over
  config.plugins.push(new webpack.NormalModuleReplacementPlugin(/Icon\/(core\/)?([^\/\.]+)$/, function (resource) {
    resource.request = '@react/react-spectrum-icons/dist/' + (/core/.test(resource.request) ? 'core/' : '') + path.basename(resource.request);
  }));
  config.plugins.push(new webpack.NormalModuleReplacementPlugin(/\.\/js\/Icon/, path.resolve(__dirname + '/../src/Icon/js/Icon.js')));
  config.plugins.push(new webpack.NormalModuleReplacementPlugin(/\.\/focus-ring-polyfill/, '@adobe/focus-ring-polyfill'));

  if (env === 'PRODUCTION') {
    // see https://github.com/storybooks/storybook/issues/1570
    config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== 'UglifyJsPlugin')
  }

  config.resolve.extensions.push('.ts', '.tsx');

  return Object.assign(config, {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [__dirname, path.resolve(__dirname + '/../src'), path.resolve(__dirname + '/../packages'), /collection-view/],
          loader: require.resolve('babel-loader')
        },
        {
          test: /\.(ts|tsx)$/,
          use: [
            { loader: require.resolve('babel-loader') },
            { loader: require.resolve("react-docgen-typescript-loader") }
          ]
        },
        {
          test: /\.styl$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'stylus-loader',
              options: {
                paths: [__dirname + '/../node_modules'],
                define: {
                  'embedurl': require('stylus').url()
                },
                'resolve url': true,
                set: {
                  'include css': true
                },
                use: [require('svg-stylus')(), require('nib')()]
              }
            }
          ],
          include: path.resolve(__dirname, '../')
        },
        {
          test: /@adobe\/spectrum-css-temp\/.*\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
                getLocalIdent: (context, localIdentName, localName) => {
                  return generateScopedName(localName, context.resourcePath);
                },
              }
            }
          ],
          include: path.resolve(__dirname, '../')
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
          include: path.resolve(__dirname, '../'),
          exclude: /@adobe\/spectrum-css-temp\/.*\.css$/
        },
        {
          test: /\.(ttf|woff|woff2|svg|gif|cur|eot|png|jpg)(\?[a-f0-9]{32})?$/,
          loader: 'url-loader?limit=8192'// limit inlining base64 URLs to <=8k images, direct URLs for the rest
        }
      ]
    }
  });
};
