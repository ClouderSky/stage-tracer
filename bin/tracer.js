#!/usr/bin/env node

const path = require('path');
const spawn = require('cross-spawn');
const program = require('commander');
const package = require('../package.json');


program
    .command('init', '在当前路径初始化项目')
    .command('build', '编译生产环境使用的文件')
    .command('test', '运行项目测试')
    .command('start', '启动一个调试用的服务器')
    .option('-v, --version', '显示版本号')
    .option('--tslint', '是否需要做规范检查')
    .option('--test', '是否需要进行单元测试');

function defaultHandler(argv) {
    if ( argv.includes('-v') || argv.includes('--version') ) {
        return console.log(package.version);
    }
    program.help();
}

const command = process.argv[2];
switch ( command ) {
    case 'init':
    case 'start':
    case 'test':
    case 'build': {
        const result = spawn.sync('node', [
            path.resolve(__dirname, '../script/' + command + '.js'),
            ...process.argv.splice(3),
        ], { stdio: 'inherit' });
        if ( result.signal ) {
            process.exit(1);
        }
        process.exit(result.status);
        break;
    }
    default:
        defaultHandler(process.argv);
}

process.exit();
