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
        test: /\.(cur)$/,
        loaders: [ 'url?limit=8192' ], // limit inlining base64 URLs to <=8k images, direct URLs for the rest
        include: path.resolve(__dirname, '../')
      },
    ]
  }
}
