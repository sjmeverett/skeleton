var webpack = require('webpack');
var merge = require('webpack-merge');
var baseConfig = require('./webpack.config.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(baseConfig, {
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[id].[chunkhash].js'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),

    new webpack.optimize.OccurenceOrderPlugin(),

    // extract css into its own file
    new ExtractTextPlugin('[name].[contenthash].css'),

    new HtmlWebpackPlugin({
      template: './src/client/app.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    })
  ]
});
