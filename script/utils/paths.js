
const path = require('path');


const appBuild = path.resolve('./build');
const appPublic = path.resolve('./public');
const appHtml = path.resolve(appPublic, 'index.html');

module.exports = {
    appBuild, appPublic, appHtml,
};
