
const resolve = require('path').resolve;
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {

    mode: 'production',

    entry: resolve('./src/index.tsx'),

    output: {
        path: resolve('./build'),
        publicPath: '/',
        filename: 'static/js/[name].bundle.js',
    },

    devtool: 'source-map',

    devServer: {
        contentBase: resolve('./build'),
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
        rules: [{
            test: /\.tsx?$/, loader: 'awesome-typescript-loader',
        }, {
            test: /\.js$/, enforce: 'pre', loader: 'source-map-loader',
        }],
    },

    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: resolve('./public/index.html'),
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
            templateParameters: {
                publicUrl: '',
            },
        }),
    ],

};
