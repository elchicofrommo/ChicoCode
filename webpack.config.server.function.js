const path = require('path');


const entryObject = {}


var nodeExternals = require("webpack-node-externals");
entryObject.index  = {
  import: "./src/server/functionServer.js",
  filename: 'server/functionServer.js'
};

module.exports = [{
  entry: entryObject,
  name: "function_server", 
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'bin')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  
  includeModules: true,
  target: "node",
  externals:  nodeExternals(),

  node: {
  	__dirname: false,
  	__filename: false,
    global: true

  },
  performance: {
  	hints: false
  },
  mode: 'production'
}];