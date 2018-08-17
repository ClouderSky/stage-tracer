
const tsImportPluginFactory = require('ts-import-plugin');


const getLoader = (rules, matcher) => {
    for ( let rule of rules ) {
        if ( matcher(rule) ) { return rule; }

        const matched = getLoader(
            rule.use || rule.oneOf || (
                Array.isArray(rule.loader) && rule.loader
            ) || [],
            matcher
        );
        if ( matched ) { return matched; }
    }
};

module.exports = config => {
    const tsLoader = getLoader(config.module.rules, rule => (
        rule.test && rule.test instanceof RegExp && rule.test.test('index.ts')
    ));

    tsLoader.options = Object.assign({}, tsLoader.options, {
        getCustomTransformers: () => ({
            before: [tsImportPluginFactory({
                libraryName: 'antd',
                libraryDirectory: 'lib',
                style: 'css',
            })],
        }),
    });
    tsLoader.exclude = /node_modules/;
};
