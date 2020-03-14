const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');


const path = require('path');
const glob = require('glob');
const entryArray = glob.sync('src/app/**/index.js');
const htmlPages = [];
const entryObject = entryArray.reduce((acc, item) => {

  console.log("item: " + item);

  const name =  item.replace("src/app/", "").replace(".js", "");
  acc[name] = {};
  acc[name].import = "./" + item;
  acc[name].filename = acc[name].import.replace("src", "");
  acc[name].dependOn = "shared";

  htmlPages.push(new HtmlWebPackPlugin({
    template: "./src/template/app-template.html",
    chunks: [name, "shared"],
    filename: "app/" + name  + ".html"
  }))
  return acc;
}, {});

entryObject.shared = {
  import: ["react", "react-dom"],
  filename: 'js/shared.js'
};

entryObject.index  = {
  import: "./src/server/server.js",
  filename: 'server/server.js'
};

console.log("entryObject  is " + JSON.stringify(entryObject));
console.log("htmlPages is " + JSON.stringify(htmlPages));
module.exports = {
  entry: entryObject,
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

	resolve: {
		alias: {
			"path": "path-browserify",
			"stream": "stream-browserify" ,
		 	"os": "os-browserify/browser" ,
		 	"zlib": "browserify-zlib" ,
		 	"https": "https-browserify" ,
		 	"http": "stream-http" ,
		 	"crypto": "crypto-browserify" ,
		 	"fs" : false,
		 	"net": false,
		 	"module" : false,
		 	"dgram" : false,
		 	"tls": false,
		 	"vm": "vm-browserify" 
		}
	},
  plugins: [
    ...htmlPages,
    new CopyPlugin(
      [
        {from: 'src/static' , to: 'static'},
        {from: 'src/style', to: 'style'}
      ]
    )
  ],
  mode: "development"
};