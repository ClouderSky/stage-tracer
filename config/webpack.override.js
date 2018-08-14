
// const glob = require('glob');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const DtsCreator = require('typed-css-modules');


// const pluginName = 'TypingCssModulePlugin';

// class TypingCssModulePlugin {

//     constructor(options = {}) {
//         this.sourcePattern =
//             options.sourcePattern || 'src/**/*.module.+(css|scss|sass)';
//     }

//     apply(compiler) {
//         const transformer = this.transformer(new DtsCreator());
//         compiler.hooks.beforeRun.tapPromise(
//             pluginName, c => this.getAllCssModule().then(matchs => {
//                 matchs.forEach(transformer);
//             }),
//         );
//     }

//     getAllCssModule() {
//         return new Promise((resolve, reject) => {
//             glob(this.sourcePattern, (err, matchs) => {
//                 err ? reject(err) : resolve(matchs);
//             });
//         });
//     }

//     transformer(creator) {
//         return filename => creator.create(filename)
//             .then(content => content.writeFile())
//     }

// }


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
    // config.plugins.push(new TypingCssModulePlugin());

    if ( willExtractCss ) {
        config.plugins.push(new MiniCssExtractPlugin({filename: cssFilename}));
    }
}

module.exports = function(config, env) {
    config.mode = env;

    useCssModule(config, env);

    return config;
};
