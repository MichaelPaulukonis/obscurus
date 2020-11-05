const path = require('path')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { images, fonts } = require('./loadFiles.js')

console.log(JSON.stringify(images))
console.log(JSON.stringify(fonts))

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, 'src', 'index.js')
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 8081,
    open: true,
    stats: 'errors-only'
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
        exclude: /node_modules/g
      },
      {
        test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        include: [/fonts/],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg)$/i,
        include: [/images/],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      IMAGES: JSON.stringify(images),
      FONTS: JSON.stringify(fonts)
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      inject: 'body'
    }),
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, 'assets'),
    //     to: path.resolve(__dirname, 'dist', 'assets')
    //   }
    // ])
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'assets'),
          to: path.resolve(__dirname, 'dist', 'assets')
        }
      ]
    })
  ],
  devtool: 'source-map'
}
