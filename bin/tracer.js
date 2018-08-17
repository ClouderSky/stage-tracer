#!/usr/bin/env node

const path = require('path');
const spawn = require('cross-spawn');
const program = require('commander');
const package = require('../package.json');


program.version(package.version).usage('<command>');

program.command('build', '构建项目')
    .option('--tslint', '是否需要做规范检查')
    .option('--test', '是否需要进行单元测试');

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
        program.help();
}

process.exit();
