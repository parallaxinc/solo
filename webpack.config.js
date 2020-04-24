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

const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

// Bundle entry points
const entries = {
    index: 'index.js',
    editor: 'editor.js',
};

// Places to look for application files
const modulePaths = {
    modules: [
        './src/modules',
        './node_modules',
    ],
    extensions: ['.js']
};

module.exports = {
    resolve: modulePaths,
    target: 'web',
    mode: 'development',
    devtool: 'source-map',
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        // filename: '[name].[chunkhash].bundle.js',
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        pathinfo: true,
        sourceMapFilename: '[name].bundle.js.map',
    },
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all',
    //     },
    // },
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
            { from: './index.html', to: path.resolve(__dirname, 'dist') },
            { from: './blocklyc.html', to: path.resolve(__dirname, 'dist') }
        ]),

        // Copy over media resources from the Blockly package
        new CopyPlugin([
            {
                from: path.resolve(__dirname, './node_modules/blockly/media'),
                to: path.resolve(__dirname, 'dist/media')
            }
        ]),
        // Copy over media resources from Solo images tree
        new CopyPlugin([
            {
                from: path.resolve(__dirname, './src/images'),
                to: path.resolve(__dirname, 'dist/images')
            }
        ]),
        // Copy over style sheets
        new CopyPlugin([
            { from: './src/site.css', to: path.resolve(__dirname, 'dist')},
            { from: './src/style.css', to: path.resolve(__dirname, 'dist')},
            { from: './src/style-clientdownload.css', to: path.resolve(__dirname, 'dist')},
            { from: './src/style-editor.css', to: path.resolve(__dirname, 'dist')}
        ]),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],
    devServer: {
        port: 3000
    }
};
