var webpack = require('webpack');

module.exports = {
  entry: './source/sharedb-ace-rw-control.js',
  output: {
    library: "SharedbAceRWControl",
    libraryTarget: "umd",
    filename: "distribution/sharedb-ace-rw-control.min.js"
  }, 
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      } 
    }),
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
 }
