const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
const { parsed: envs } = result;


var nodeEnv = envs.NODE_ENV;
const isProduction = nodeEnv !== 'development';
if(isProduction)
  nodeEnv = 'production';
console.log("Setting up env for server build in  " + nodeEnv);

const entryObject = {}
const path = require('path');
const webpack = require('webpack');

var nodeExternals = require("webpack-node-externals");

entryObject.index  = {
  import: "./src/server/server.js",
  filename: 'server/server.js'
};


const plugins = [];

if (!isProduction) {
 //   plugins.push(new webpack.HotModuleReplacementPlugin())
   // plugins.push(new webpack.NoEmitOnErrorsPlugin())
}


module.exports = [{
  entry: entryObject,
  name: "server", 
  output: {
    filename: '[name]',
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
  watch: false,
  watchOptions: {
  	ignored: ['node_modules/*']
  },
  target: "node",
  externals:  nodeExternals(),
  plugins: plugins,
  node: {
  	__dirname: false,
  	__filename: false,
    global: true

  },
  mode: nodeEnv
}];