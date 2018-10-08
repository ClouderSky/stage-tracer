#!/usr/bin/env node

const program = require('commander');

const cmdInit = require('../script/init');


program
    .command('init', '在当前路径初始化项目')
    .command('build', '编译生产环境使用的文件')
    .command('test', '运行项目测试')
    .command('start', '启动一个调试用的服务器')
    .option('-v, --version', '显示版本号')
    .option('--tslint', '是否需要做规范检查')
    .option('--test', '是否需要进行单元测试');


const main = async (cmd) => {
    switch ( cmd ) {
        case 'init' :
            await cmdInit();
        case 'build' :
        case 'test' :
        case 'start' :
            break;
        default :
            program.help();
            break;
    }
};
main(process.argv[2]);
