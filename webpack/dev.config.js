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

/**
 * The relative path to the distribution directory
 * @type {string}
 */
const targetPath = '../dist';


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

  return {
    mode: 'development',
    entry: { // Bundle entry points
      index: 'index.js',
      editor: 'editor.js',
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
        './node_modules',
      ],
      extensions: ['.js']
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: false
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.html$/,
          use: [
            'html-loader'
          ]
        },
      ]
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        DEBUG: false,
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      }),
      new HtmlWebpack({
        template: './src/templates/index.template',
        chunks: ["index"],
        filename: 'index.html',
      }),
      new HtmlWebpack({
        template: './src/templates/editor.template',
        chunks: ["editor"],
        filename: 'blocklyc.html',
      }),
      new CopyPlugin({
        patterns: [
          {from: path.resolve(__dirname, blocklyMedia), to: path.resolve(__dirname, `${targetPath}/media`)},
          {from: './src/images', to: path.resolve(__dirname, `${targetPath}/images`)},
          {from: './src/site.css', to: path.resolve(__dirname, targetPath)},
          {from: './src/style.css', to: path.resolve(__dirname, targetPath)},
          {from: './src/style-clientdownload.css', to: path.resolve(__dirname, targetPath)},
          {
            from: './src/style-editor.css', to: path.resolve(__dirname, targetPath)
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
    devServer: {
      port: 3000
    },
    devtool: "source-map"
  }
};
