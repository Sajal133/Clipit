const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: './src/renderer/index.tsx',
        settings: './src/renderer/settings.tsx'
    },
    target: 'electron-renderer',
    output: {
        path: path.resolve(__dirname, 'dist/renderer'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/renderer/index.html',
            filename: 'index.html',
            chunks: ['main']
        }),
        new HtmlWebpackPlugin({
            template: './src/renderer/settings.html',
            filename: 'settings.html',
            chunks: ['settings']
        })
    ],
    devtool: 'source-map'
};
