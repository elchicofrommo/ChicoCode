
const entryObject = {}
const path = require('path');

entryObject.index  = {
  import: "./src/server/server.js",
  filename: 'server/server.js'
};

console.log("entryObject  is " + JSON.stringify(entryObject));

module.exports = {
  entry: entryObject,
  target: "node",
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

  plugins: [

  ],
  mode: "development"
};