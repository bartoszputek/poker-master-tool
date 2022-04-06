const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './frontend/scripts/script.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: path.resolve(__dirname, 'frontend'),
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: "tsconfig.frontend.json"
          }
        }],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader, 
          {
            loader: 'css-loader',
            options: {
              url: false,
            }
          }],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    }),
    new Dotenv(),
    new CopyPlugin({
      patterns: [
        { 
          from: "./frontend/assets", 
          to: "assets",
          globOptions: {
            ignore: ["**/favicon/**"],
          }, 
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: "./frontend/index.html"
    }),
    new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
  ],
   optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
  },
  output: {
    filename: 'script.[contenthash].js',
    path: path.resolve(__dirname, 'public'),
    assetModuleFilename: '[name].[contenthash][ext][query]',
    clean: true,
  }
};