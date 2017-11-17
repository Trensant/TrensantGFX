var path = require('path');
var webpack = require('webpack');
var PROD = JSON.parse(process.env.PROD_ENV || '0');

module.exports = {
  entry: "./src/js/tgwWithDependencies.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: PROD ? "tgwWithDependencies.min.js" : "tgwWithDependencies.js",
    library: "tgw"
  },
  module :{
	  loaders: [
	  {
		test: /\.css$/,
		exclude: /node_modules/,
		loader: "style-loader!css-loader"
	  }
	  ]
  },
  plugins: PROD ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ] : []
  // watch: true
}