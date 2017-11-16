var path = require('path');
var webpack = require('webpack');
var PROD = JSON.parse(process.env.PROD_ENV || '0');

console.log(PROD);
module.exports = {
  entry: "./src/js/tgw.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: PROD ? "tgw.min.js" : "tgw.js",
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
  // watch: true,
  // externals: {
  //   "jQuery": "jQuery",
  //   "d3":"d3"
  //
  // }
}