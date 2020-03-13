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

module.exports = {
    target: 'web',
    mode: 'development',
    entry: {
        index: './src/modules/index.js',
        editor: './src/editor.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new CopyPlugin([
            { from: './index.html', to: path.resolve(__dirname, 'build') },
            { from: './blocklyc.html', to: path.resolve(__dirname, 'build') }
        ]),

        // Copy over media resources from the Blockly package
        new CopyPlugin([
            {
                from: path.resolve(__dirname, './node_modules/blockly/media'),
                to: path.resolve(__dirname, 'build/media')
            }
        ]),
        // Copy over media resources from Solo images tree
        new CopyPlugin([
            {
                from: path.resolve(__dirname, './src/images'),
                to: path.resolve(__dirname, 'build/images')
            }
        ])
    ],
    devServer: {
        port: 3000
    }
};
