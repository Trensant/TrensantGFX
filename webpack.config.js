var path = require('path')

module.exports = {
  entry: "./src/js/tgw.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "tgw.js",
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
  }
  // watch: true,
  // externals: {
  //   "jQuery": "jQuery",
  //   "d3":"d3"
  //
  // }
}