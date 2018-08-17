
const path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");


function loadCssRule(willExtractCss) {
    return (test, useCssModule, preLoaders = []) => ({
        test,
        exclude: useCssModule ? path.resolve('./node_modules') : undefined,
        use: [
            willExtractCss ? MiniCssExtractPlugin.loader : 'style-loader',
            {loader: 'css-loader', options : useCssModule ? {
                modules: true,
                namedExport: true,
                camelCase: true,
                minimize: true,
                localIdentName : '[local]_[hash:base64:5]',
            } : undefined},
            ...preLoaders,
        ],
    });
}

module.exports = config => {
    const willExtractCss = ('production' === config.mode);
    const createRule = loadCssRule(willExtractCss);

    config.module.rules.push({
        oneOf: [
            createRule(/\.module\.css$/, true),
            createRule(/\.module\.(scss|sass)$/, true, ['sass-loader']),
            createRule(/\.css$/, false),
            createRule(/\.(scss|sass)$/, false, ['sass-loader']),
        ],
    });

    if ( !config.plugins ) {
        config.plugins = [];
    }

    if ( willExtractCss ) {
        config.plugins.push(new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
        }));
    }
}
