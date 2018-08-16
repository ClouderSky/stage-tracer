
const fs = require('fs-extra');
const chalk = require('chalk');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const webpack = require('webpack');
const program = require('commander');

const config = require('../webpack.config.pro');
const paths = require('./utils/paths');
const CssModule = require('./utils/cssModule');
const unittest = require('./utils/unittest');
const tslinter = require('./utils/linter');

const measureFileSizesBeforeBuild =
    FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;


function build() {
    console.log('开始编译');
    return new Promise((resolve, reject) => {
        webpack(config).run((err, stats) => {
            if ( err ) { return reject(err); }

            const message = formatWebpackMessages(stats.toJson({}, true));
            if ( message.errors.length ) {
                return reject(new Error(message.errors.join('\n')));
            }

            if ( message.warnings.length ) {
                console.log(chalk.yellow('编译时警告：'));
                console.log(warnings.warnings.join('\n'));
            } else {
                console.log(chalk.green('编译成功'));
            }

            resolve(stats);
        });
    });
}

void async function() {
    program
        .option('--tslint', '是否需要做规范检查')
        .option('--test', '是否需要进行单元测试')
        .parse(process.argv);
    const willCheckLint = program.tslint || false;
    const willUnitTest = program.test || false;
    
    const appBuild = config.output.path;
    const appPublic = paths.appPublic;
    const appHtml = paths.appHtml;

    const previousFileSizes = await measureFileSizesBeforeBuild(appBuild);

    fs.emptyDirSync(appBuild);
    fs.copySync(appPublic, appBuild, {
        dereference: true, filter: file => file !== appHtml,
    });

    await (new CssModule().compile());

    if ( willCheckLint ) {
        console.log('开始代码规范检查');
        if ( !tslinter() ) { return; }
        console.log(chalk.green('代码规范检查通过'));
    }

    if ( willUnitTest ) {
        console.log('开始测试');
        const result = await unittest();
        if ( !result ) { return; }
        console.log(chalk.green('测试通过'));
    }

    try {
        const buildStats = await build();

        console.log('文件GZip压缩后大小');
        printFileSizesAfterBuild(
            buildStats, previousFileSizes, appBuild,
            WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE,
        );
    } catch (err) {
        return console.log(err);
    }
}();
