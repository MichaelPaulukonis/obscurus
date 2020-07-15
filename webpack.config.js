const path = require('path');
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const loader = require('./loadImages.js')
const images = loader('./assets/images')

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, 'src', 'index.js')
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 8080,
    open: true,
    stats: 'errors-only',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: [
      '.js'
    ]
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/g,
      }
    ],
  },
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      IMAGES: JSON.stringify(images)
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      inject: 'body',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'assets'),
        to: path.resolve(__dirname, 'dist', 'assets'),
      }
    ]),
  ],
  devtool: 'source-map'
};
