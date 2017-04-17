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
        test: /\.(ttf|woff|woff2|svg|gif|cur|eot|png|jpg)(\?[a-f0-9]{32})?$/,
        loader: 'url-loader?limit=8192'// limit inlining base64 URLs to <=8k images, direct URLs for the rest
      }
    ]
  },
  stylus: {
    // urlfunc: 'embedurl',
    use: [require('svg-stylus')()],
    define: {
      'embedurl': require('stylus').url()
    },
    'resolve url': true
    // 'include css': 'true',
    // 'import': ['nib']
  }
}
