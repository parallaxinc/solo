/*
 *   TERMS OF USE: MIT License
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 */

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpack = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
/**
 * The relative path to the distribution directory
 * @type {string}
 */
const targetPath = '../dist';
const isDevelopment = true;
/**
 * The relative path to the Blockly package media files
 * @type {string}
 */
const blocklyMedia = '../node_modules/blockly/media';

module.exports = (opts) => {
  opts = Object.assign({
    env: 'dev',
    analyze: false
  }, opts);

  const isDev = (opts.env === 'dev');
  if (isDev) console.log(`DEVELOPMENT`);
  if (isDevelopment) console.log(`Hardcoded development is off`);

  return {
    mode: 'development',
    entry: { // Bundle entry points
      index: 'editor.js',
    },
    output: {
      path: path.resolve(__dirname, targetPath),
      filename: '[name].bundle.[chunkhash].js',
      sourceMapFilename: '[name].bundle.js.map',
    },
    target: 'web',
    resolve: {
      // Places to look for application files
      modules: [
        './src/modules',
        './src/scss',
        './node_modules',
      ],
      extensions: [
        '.js',
        '.scss'
      ],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          }
        },
        chunks: 'all',
        name: false
      },
    },
    module: {
      rules: [
        {
          test:  /\.scss/,
          use: [
            {
              // Creates `style` nodes from JS strings
              // loader: isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
              loader: MiniCssExtractPlugin.loader,
            },
            {
              // Translates CSS into CommonJS
              loader: 'css-loader',
              options: {
                modules: true,
                sourceMap: isDevelopment
              }
            },

            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment,
                // Prefer `dart-sass`
                implementation: require("sass"),
              },
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: [
            path.resolve(__dirname, './src/modules/blockly/generators/propc/comms/i2c_protocol.js'),
            path.resolve(__dirname, './src/modules/blockly/generators/propc/comms/lcd_parallel.js'),
            path.resolve(__dirname, './src/modules/blockly/generators/propc/comms/wx_simple.js'),
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isDevelopment ? '[name].css' : '[name].[hash].css',
        chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
      }),
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        DEBUG: false,
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      }),
      new HtmlWebpack({
        template: './src/templates/index.html',
        chunks: ["index"],
        filename: 'index.html',
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, blocklyMedia),
            to: path.resolve(__dirname, `${targetPath}/media`)
          },
          {
            from: './src/images',
            to: path.resolve(__dirname, `${targetPath}/images`)
          },
          {
            from: './src/load_images.js',
            to: path.resolve(__dirname, targetPath)
          },
          {
            from: './src/lib/bootstrap.min.css',
            to: path.resolve(__dirname, targetPath)
          },
        ]
      })
    ],
    stats: {
      children: true,
      errorDetails: true
    },
    watchOptions: {
      ignored: '/node_modules',
      poll: 1000,
    },
    devtool: "source-map"
  }
};
