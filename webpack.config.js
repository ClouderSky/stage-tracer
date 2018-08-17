
const resolve = require('path').resolve;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = require('./script/utils/paths');


module.exports = {

    entry: resolve('./src/index.tsx'),

    output: {
        path: paths.appBuild,
        publicPath: '/',
        filename: 'static/js/[name].bundle.js',
    },

    devtool: 'source-map',

    devServer: {
        hot: true,
        quiet: true,
        inline: true,
        watchContentBase: true,
        contentBase: paths.appBuild,
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
            template: paths.appHtml,
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
