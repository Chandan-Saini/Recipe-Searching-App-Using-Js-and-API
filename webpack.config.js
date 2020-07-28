const path = require('path');
const HtmlWebpackPlugin= require('html-webpack-plugin')

module.exports = {
  entry: ["@babel/polyfill", "./src/js/index.js"], //fromm here bundling starts
  output: {
    //here bundling will be stored or saved
    path: path.resolve(__dirname, "dist"), //this path should be absolute so we require path, and here dirname is current absolute path which will get adds in dist/js,
    // now earlier we have written path as dist/js but it was not helping to run webpack dev server automatically so we changed the path to dist only
    filename: "js/bundle.js", //earlier here path was only name of file bundle.js but webpack server was not running automatically so we used path as js/bundle.js
  },
  devServer: {
    contentBase: "./dist", //this is the path where webpack have to store data
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
    }),
  ],
  module: {
    //it contains code for loader
    rules: [
      {
        test: /\.m.js$/, //this line means loader need to find files ends with .js and work on that
        exclude: /node_modules/, //this line means loader needs to exclude this file to work with
        use: {
          loader: "babel-loader", //the loader we want to use
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
