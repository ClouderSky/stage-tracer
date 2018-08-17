
const path = require('path');

const configOverride = require('./config/webpack.override');
const config = require('./webpack.config');

config.mode = 'development';

const hotEntry = require.resolve('react-dev-utils/webpackHotDevClient');
config.entry = config.entry instanceof Array ?
    [hotEntry, ...config.entry] : [hotEntry, config.entry];

module.exports = configOverride(config);
