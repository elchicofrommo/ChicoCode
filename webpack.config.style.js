const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
const path = require('path');
const glob = require('glob');
const result = dotenv.config();
const { parsed: envs } = result;

console.log("webpack.config.js envs are " + JSON.stringify(envs))

const nodeEnv = envs.NODE_ENV;
const isProduction = nodeEnv !== 'development';

console.log("setting up env for : " + nodeEnv);
const MyPlugin = {};



module.exports = {
  name: "styles",
  entry: {
    style: {
      import: "./src/style/styles.js",
      filename: 'style/styles.js'
    }
  },
  optimization: {
    splitChunks: {
      // include all types of chunks
      chunks: 'all'
    }
  },
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
        test: /\.s?(a|c)ss$/,
        exclude: /node_modules/,
        use: [
        'file-loader?name=[folder]/[name].css', 
          'extract-loader', 
          {
            loader: 'css-loader',
            options: {
              modules:{
                localIdentName: '[name]'
              }
            }
          },
          'namespace-css-module-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options:{
          name: '[folder]/[name].[ext]'
        }
      },
      {
        test: /\.html$/,
        use: [
          'file-loader?name=[folder]/[name].[ext]', 'extract-loader', 'html-loader'
        ]
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

  mode: nodeEnv
}