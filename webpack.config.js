
var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,

  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss', '.json']
  },

  entry: './app/index.js',

  output: {
    path: './dist',
    filename: '[name].js'
  },

  module: {
    loaders: [
      {
        test: /\.(css|scss)$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap!toolbox')
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader?presets[]=es2015&presets[]=react&presets[]=stage-0'
      },
      {
        test: /\.(woff|woff2)(\?.*)?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.ttf(\?.*)?$/,
        loader: "file-loader"
      },
      {
        test: /\.eot(\?.*)?$/,
        loader: "file-loader"
      },
      {
        test: /\.svg(\?.*)?$/,
        loader: "file-loader"
      }
    ]
  },

  postcss: [autoprefixer],

  plugins: [
    new ExtractTextPlugin('[name].css', {allChunks: true}),

    new HtmlWebpackPlugin({
      template: './app/index.html',
      inject: true
    })
  ]
};
