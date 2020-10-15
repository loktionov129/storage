# webpack5 available here:
# https://github.com/my-repositories/friendly2/blob/master/webpack/base.config.js

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    context: path.resolve(__dirname, 'src'),
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src')
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    entry: {
        main: './app/main.js',
        lib: './lib.js'
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'build')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            template: './index.html'
        }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'public/favicon.ico'),
                to: path.resolve(__dirname, 'build')
            }
        ])
    ]
}
