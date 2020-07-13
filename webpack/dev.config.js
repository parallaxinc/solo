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

const merge = require('webpack-merge');
const baseConfig = require('./base.config');
const CopyPlugin = require('copy-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

/**
 * The relative path to the distribution directory
 * @type {string}
 */
const targetPath = '../dist';


module.exports = merge(baseConfig, {
  devServer: {
    port: 3000
  },
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, targetPath),
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js',
    pathinfo: true,
    sourceMapFilename: '[name].bundle.js.map',
  },
  watchOptions: {
    ignored: '/node_modules',
    poll: 1000,
  },
  plugins: [
    new CopyPlugin([
        {
          from: './index.html',
          to: path.resolve(__dirname, targetPath)
        },
        {
          from: './blocklyc.html',
          to: path.resolve(__dirname, targetPath)
        }
      ]),

    // Copy over media resources from the Blockly package
    new CopyPlugin([
        {
          from: path.resolve(__dirname, '../node_modules/blockly/media'),
          to: path.resolve(__dirname, `${targetPath}/media`)
        }
      ]),

    // Copy over media resources from Solo images tree
    new CopyPlugin([
        {
          from: './src/images',
          to: path.resolve(__dirname, `${targetPath}/images`)
        }
      ]),

    // Copy over style sheets
    new CopyPlugin([
        {
          from: './src/site.css',
          to: path.resolve(__dirname, targetPath)
        },
        {
          from: './src/style.css',
          to: path.resolve(__dirname, targetPath)
        },
        {
          from: './src/style-clientdownload.css',
          to: path.resolve(__dirname, targetPath)
        },
        {
          from: './src/style-editor.css',
          to: path.resolve(__dirname, targetPath)
        }
      ]),
    ],
  }
);
