const path = require('path');
const webpack = require('webpack');
const md5 = require('md5');
const fs = require('fs');

const fileHashMemo = {};

const getFileHash = (filepath) => {
  if (fileHashMemo[filepath]) {
    return fileHashMemo[filepath];
  }
  let contentHash = md5(fs.readFileSync(filepath, 'utf8'));
  fileHashMemo[filepath] = contentHash.substr(contentHash.length - 5);
  return fileHashMemo[filepath];
};

const generateScopedName = (localName, resourcePath) => {
  let componentName = resourcePath.split('/').slice(-2, -1);
  let contentHash = getFileHash(resourcePath);

  //let hash = md5(resourcePath);
  return `${componentName}_${localName}_${contentHash}`;
};

module.exports = ({config}, env) => {
  // Hack to get icons loading in the storybook without copying them over, these need to stay in for as long as we are using V2 components
  // in the v3 storybook. only use right now is the Provider selection menus in the top right for scale, theme, etc
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
    parallelism: 1,
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
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                getLocalIdent: (context, localIdentName, localName) => {
                  return generateScopedName(localName, context.resourcePath);
                },
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: require('./postcss')(true)
              }
            }
          ],
          include: path.resolve(__dirname, '../packages')
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
          include: path.resolve(__dirname, '../'),
          exclude: /packages\/.*\.css$/
        },
        {
          test: /\.(ttf|woff|woff2|svg|gif|cur|eot|png|jpg)(\?[a-f0-9]{32})?$/,
          loader: 'url-loader?limit=8192'// limit inlining base64 URLs to <=8k images, direct URLs for the rest
        }
      ]
    }
  });
};
