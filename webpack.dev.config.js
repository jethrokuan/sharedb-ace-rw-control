var webpack = require('webpack');

module.exports = {
  entry: './source/sharedb-ace-rw-control.js',
  output: {
    library: "SharedbAceRWControl",
    libraryTarget: "umd",
    filename: "distribution/sharedb-ace-rw-control.js"
  },
  plugins: [
    new webpack.DefinePlugin({
      ENVIRONMENT: JSON.stringify("development"),
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
