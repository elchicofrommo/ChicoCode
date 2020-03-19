const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
const { parsed: envs } = result;

console.log("webpack.config.js envs are " + JSON.stringify(envs))

const nodeEnv = envs.NODE_ENV;
const isProduction = nodeEnv !== 'development';

console.log("setting up env for : " + nodeEnv);

const path = require('path');
const glob = require('glob');
const entryArray = glob.sync('src/app/**/index.js');
const plugins = [];
const entryObject = entryArray.reduce((acc, item) => {



  const name =  item.replace("src/", "").replace(".js", "");
  console.log("adding entry point for " + name)

  acc[name] = {};
  acc[name].import = [];
  if(!isProduction){
    acc[name].import.push('react-hot-loader/patch');
    acc[name].import.push('webpack-hot-middleware/client?quiet=true')
  }
  acc[name].import.push("./" + item);
  acc[name].filename = name + ".js";
  acc[name].dependOn = "shared";

  console.log(JSON.stringify(acc[name]));
  plugins.push(new HtmlWebPackPlugin({
    template: "./src/template/app-template.html",
    chunks: [name, "shared"],
    filename:  name  + ".html"
  }))

  return acc;
}, {});

entryObject.shared = {
  import: ["react", "react-dom"],
  filename: 'js/shared.js'
};
let loaders = [];

if (!isProduction) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
    plugins.push(new webpack.NoEmitOnErrorsPlugin())
    loaders.push({loader: 'style-loader'})
} else{
        plugins.push(new MiniCssExtractPlugin({
    	filename: '[name].[hash].css',
    	chunkFilename: '[name].[hash].css'
    }))
    loaders.push({
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: !isProduction,
      },
    })
}

loaders.push({loader: 'css-loader'});
loaders.push({loader: 'sass-loader'});

          
plugins.push(new CopyPlugin(
      [
        {from: 'src/static' , to: 'static'},
        {from: 'src/style', to: 'style'}
      ]
    ));






console.log("entryObject  is " + JSON.stringify(entryObject));
console.log("htmlPages is " + JSON.stringify(plugins));
module.exports = {
  entry: entryObject,
  output: {
    filename: '[name]',
    path: path.resolve('bin'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
	        {loader: "babel-loader"}
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /node_modules/,
        use: loaders
      }
    ]
  },
  watch: false,
  watchOptions: {
  	ignored: ['node_modules/*']
  },
	resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    },
		extensions: ['.js', '.jsx', '.scss']
	},
  plugins:plugins,
  mode: nodeEnv
};