var path = require('path')

module.exports = {
  entry: "./src/js/tgw.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "tgw.js",
    library: "tgw"
  },
  watch: true
}