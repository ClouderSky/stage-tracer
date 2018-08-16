
const configOverride = require('./config/webpack.override');
const config = require('./webpack.config');

config.mode = 'development';

module.exports = configOverride(config);
