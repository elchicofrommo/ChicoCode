const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const {logger} = require('./src/server/utils/Logger')


const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
const { parsed: envs } = result;

logger.info("webpack.config.js envs are " + JSON.stringify(envs))

const nodeEnv = envs.NODE_ENV;
const isProduction = nodeEnv !== 'development';

logger.info("setting up env for : " + nodeEnv);

const path = require('path');
const glob = require('glob');
const entryArray = glob.sync('src/app/**/index.js');
const plugins = [];


const entryObject = entryArray.reduce((acc, item) => {

  const name =  item.replace("src/", "").replace(".js", "");
  logger.verbose("adding entry point for " + name)

  acc[name] = {};
  acc[name].import = [];
  if(!isProduction){
    acc[name].import.push('react-hot-loader/patch');
    acc[name].import.push('webpack-hot-middleware/client?quiet=false&timeout=2000')
  }
  acc[name].import.push("./" + item);
  acc[name].filename = name + ".js";
  acc[name].dependOn = "shared";

  logger.verbose(JSON.stringify(acc[name]));
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
    
    /*plugins.push(new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css'
    }))
    loaders.push({
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: !isProduction,
      },
    })
    */
    loaders.push({loader: 'style-loader'})
} else{
    /*plugins.push(new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[name].[hash].css'
    }))
    loaders.push({
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: !isProduction,
      },
    })
    */
    loaders.push({loader: 'style-loader'})
}


loaders.push({loader: 'css-loader?modules=true'});
loaders.push({loader: 'namespace-css-module-loader?combine=true'});
loaders.push({loader: 'sass-loader'});

logger.verbose("entryObject  is " + JSON.stringify(entryObject));
logger.verbose("htmlPages is " + JSON.stringify(plugins));
module.exports = {
  entry: entryObject,
  output: {
    filename: '[name]',
    path: path.resolve('bin'),
    publicPath: '/'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: [
          {loader: "babel-loader"}
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        use: loaders
      },
      {
        test: /\.css$/i,
        use: ['style-loader','css-loader' ]
      },     
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options:{
          name: '[folder]/[name].[ext]'
        }
      }
    ]
  },
  node: {
      global: true
  },
  watch: false,
  watchOptions: {
    ignored: ['node_modules/*']
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
      "https": "https-browserify" ,
      "http": "stream-http",
    },
    extensions: ['.js', '.jsx', '.scss', 'css','.tsx', '.ts']
  },
  plugins:plugins,
  mode: nodeEnv
};

