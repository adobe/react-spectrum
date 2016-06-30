const path = require('path');

module.exports = {
  resolve: {
    extensions: [ '', '.js', '.jsx' ]
  },
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
        test: /\.(gif|cur|png|jpg)$/,
        loader: 'url-loader?limit=8192'// limit inlining base64 URLs to <=8k images, direct URLs for the rest
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'url-loader?limit=8192'
      },
    ]
  }
}
