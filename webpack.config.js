var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    client: './source/client.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "sharedb-ace-rw-control.[name].js"
  }, 
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
};
