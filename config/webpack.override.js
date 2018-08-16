
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


const defaultCssFilename = '/static/css/[name].[contenthash:8].css';

function loadCssRule(willExtractCss) {
    return (test, useCssModule, preLoaders = []) => ({
        test, use: [
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

function useCssModule(config, env, cssFilename = defaultCssFilename) {
    const willExtractCss = ('production' === env);
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
        config.plugins.push(new MiniCssExtractPlugin({filename: cssFilename}));
    }
}

module.exports = function(config) {
    useCssModule(config, config.mode);

    return config;
};
