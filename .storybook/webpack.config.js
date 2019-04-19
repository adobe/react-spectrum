const path = require('path');
const webpack = require('webpack');

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

  config.resolve.symlinks = false;

  // enable both scales for the storybook
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.SCALE_MEDIUM': 'true',
    'process.env.SCALE_LARGE': 'true'
  }));

  return Object.assign(config, {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [__dirname, path.resolve(__dirname + '/../src'), path.resolve(__dirname + '/../stories'), /collection-view/],
          loader: require.resolve('babel-loader')
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
          loaders: ['style-loader', 'css-loader'],
          include: path.resolve(__dirname, '../')
        },
        {
          test: /\.(ttf|woff|woff2|svg|gif|cur|eot|png|jpg)(\?[a-f0-9]{32})?$/,
          loader: 'url-loader?limit=8192'// limit inlining base64 URLs to <=8k images, direct URLs for the rest
        }
      ]
    }
  });
};
