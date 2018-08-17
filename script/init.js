
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
var inquirer = require('inquirer');
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');


function prompt() {
    return inquirer.prompt([{
        name: 'name', message: '项目名称',
        default: path.basename(process.cwd()),
    }, {
        name: 'version', message: '初始版本号', default: '0.1.0',
    }, {
        name: 'description', message: '项目描述', default: '',
    }]);
}

async function generator(source, target, context) {
    return new Promise((resolve, reject) => {
        Metalsmith(process.cwd())
            .metadata(context)
            .clean(false)
            .source(source)
            .destination(target)
            .use((files, metalsmith, done) => {
                const metadata = metalsmith.metadata();
                Object.keys(files).forEach(filename => {
                    const content = files[filename].contents.toString();
                    files[filename].contents =
                        new Buffer(Handlebars.compile(content)(metadata))
                });
                done();
            })
            .build(err => err ? reject(err) : resolve());
    });
}

function copyOP(source, target) {
    return filename => fs.copy(
        path.resolve(source, filename),
        path.resolve(target, filename), {
            overwrite: false, dereference: true,
        });
}

void async function() {
    const result = await prompt();
    const source = path.resolve(__dirname, '..');
    const target = process.cwd();

    const spinner = ora('生成项目');

    await generator(path.resolve(source, 'template'), target, result);

    const copy = copyOP(source, target);
    await Promise.all([
        copy('tsconfig.json'),
        copy('jest.config.js'),
        copy('tslint.json'),
        copy('config'),
        copy('public'),
        copy('src'),
    ]);

    spinner.succeed();
}();
