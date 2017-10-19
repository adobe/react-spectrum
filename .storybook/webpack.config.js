const path = require('path');

module.exports = (config, env) => {
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
