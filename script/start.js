
const chalk = require('chalk');
const {
    choosePort,
    createCompiler,
    prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const package = require('../package.json');
const config = require('../webpack.config.dev');
const CssModule = require('./utils/cssModule');


const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT, 10) || 3000;


void async function() {
    const port = await choosePort(HOST, PORT);
    if ( !port ) { return; }

    const closeCssWatcher = new CssModule().watch();

    const useYarn = true;
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = package.name;
    const urls = prepareUrls(protocol, HOST, port);
    const options = {};

    const compiler = createCompiler(webpack, config, appName, urls, useYarn);
    const devServer = new WebpackDevServer(compiler, options);

    devServer.listen(port, HOST, err => {
        if ( err ) {
            console.error(err);
        }

        console.log(chalk.cyan('启动调试服务器'));
        openBrowser(urls.localUrlForBrowser);
    });

    ['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => {
        devServer.close();
        closeCssWatcher();
        process.exit();
    }));
}();
