const path = require('path');

module.exports = {
  module: {
    loaders: [
      {
        test: /\.styl$/,
        loaders: [ 'style', 'css', 'stylus' ],
        include: path.resolve(__dirname, '../')
      },
      {
        test: /\.css$/,
        loaders: [ 'style', 'css' ],
        include: path.resolve(__dirname, '../')
      },
      {
        test: /\.(ttf|woff|svg|gif|cur|eot|png|jpg)$/,
        loader: 'url-loader?limit=8192'// limit inlining base64 URLs to <=8k images, direct URLs for the rest
      }
    ]
  }
}
