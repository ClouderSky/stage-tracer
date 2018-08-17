
const override = require('./override.json');


module.exports = function(config) {
    Object.keys(override).forEach(key => {
        const value = override[key];
        if ( true === value ) {
            const plugin = require(key);
            plugin(config);
        }
    });

    return config;
};
