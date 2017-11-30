const path = require('path');
const webpack = require('webpack');

module.exports = (config, env) => {
  // Hack to get icons loading in the storybook without copying them over
  config.plugins.push(new webpack.NormalModuleReplacementPlugin(/Icon\/([^\/\.]+)$/, function (resource) {
    resource.request = require.resolve('@react/react-spectrum-icons/dist/' + path.basename(resource.request));
  }));
  config.plugins.push(new webpack.NormalModuleReplacementPlugin(/\.\.\/js\/Icon/, path.resolve(__dirname + '/../src/Icon/js/Icon.js')));

  return Object.assign(config, {
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          include: [__dirname, path.resolve(__dirname + '/../src'), path.resolve(__dirname + '/../stories'), /collection-view/],
          loader: require.resolve('babel-loader')
        },
        {
          test: /\.styl$/,
          loaders: ['style', 'css', 'stylus'],
          include: path.resolve(__dirname, '../')
        },
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: path.resolve(__dirname, '../')
        },
        {
          test: /\.(ttf|woff|woff2|svg|gif|cur|eot|png|jpg)(\?[a-f0-9]{32})?$/,
          loader: 'url-loader?limit=8192'// limit inlining base64 URLs to <=8k images, direct URLs for the rest
        }
      ]
    },
    stylus: {
      paths: [__dirname + '/../node_modules'],
      use: [require('svg-stylus')(), require('nib')()],
      define: {
        'embedurl': require('stylus').url()
      },
      'resolve url': true,
      set: {
        'include css': true
      }
    }
  });
};
