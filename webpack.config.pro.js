
const configOverride = require('./config/webpack.override');
const config = require('./webpack.config');

config.mode = 'production';

module.exports = configOverride(config);
