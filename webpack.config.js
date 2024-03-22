const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: 'index.bundle.js'
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
            { test: /\.css$/, sideEffects: true, use: ["style-loader", "css-loader"] }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
        static: {
            directory: path.join(__dirname),
        },
        port: 9001
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: './index.html', to: 'index.html' },
                { from: './index.css', to: 'index.css' },
                { from: path.resolve(__dirname, './assets'), to: path.resolve(__dirname, './docs/assets') }
            ]
        })
    ]
}