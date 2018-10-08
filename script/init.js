
const path = require('path');
const spawn = require('cross-spawn');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const del = require('del');

const gulp = require('gulp');
const rename = require('gulp-rename');
const template = require('gulp-template');

const pkgConfig = require('../package.json');


const logWrapper = spinner =>
    (start, success, failed) =>
    callback => new Promise((resolve, reject) => {
        spinner.start(start);
        try {
            const result = callback();
            if ( result instanceof Promise ) {
                result.then(value => {
                    spinner.succeed(chalk.green(success));
                    return resolve(value);
                }, error => {
                    spinner.fail(chalk.red(failed));
                    return reject(error);
                });
            } else {
                spinner.succeed(chalk.green(success));
                resolve(result);
            }
        } catch (error) {
            spinner.fail(chalk.red(failed));
            return reject(error);
        }
    });

const pipeToPromise = writeable => new Promise(resolve => {
    writeable.on('end', resolve);
});

function shouldUseYarn () {
    const result = spawn.sync(
        'yarnpkg', ['--version'], { stdio : 'ignore' },
    );
    return 0 === result.status;
}

const createExecutor = target => (cmd, args) => new Promise(
    resolve => spawn(cmd, args, {
        cwd : target, stdio : 'ignore',
    }).on('close', resolve),
);

const cmdMap = executor => useYarn => useYarn ? {
    add : args => executor('yarn', ['add', ...args]),
    addDev : args => executor('yarn', ['add', '--dev', ...args]),
    exec : args => executor('yarn', [...args]),
} : {
    add : args => executor('npm', ['install', '--save', ...args]),
    addDev : args => executor('npm', ['install', '--save-dev', ...args]),
    exec : args => executor('npm', ['run', ...args]),
};

function prompt () {
    return inquirer.prompt([{
        name : 'name', message : '项目名称',
        default : path.basename(process.cwd()),
    }, {
        name : 'version', message : '初始版本号', default : '0.1.0',
    }, {
        name : 'description', message : '项目描述', default : '',
    }, {
        name : 'dva', message : '使用DvaBlock',
        type : 'list', choices : [{
            name : 'yes', value : true,
        }, {
            name : 'no', value : false,
        }],
    }, {
        name : 'antd', message : '使用Ant Design',
        type : 'list', choices : [{
            name : 'yes', value : true,
        }, {
            name : 'no', value : false,
        }],
    }]);
}

async function generate (source, target, context) {
    // await del(
    //     [path.join(target, '**', '*')],
    //     { force : true, dot : true },
    // );

    const tempPath = path.join(source, 'template');

    const gitIgnore = gulp.src(path.join(tempPath, 'gitignore'))
        .pipe(rename('.gitignore'))
        .pipe(gulp.dest(target));

    const pkgJson = gulp.src(path.join(tempPath, 'package.json'))
        .pipe(template(context))
        .pipe(gulp.dest(target));

    const publicDir = gulp.src(path.join(tempPath, 'public', '*'))
        .pipe(gulp.dest(path.join(target, 'public')));

    return await Promise.all(
        [gitIgnore, pkgJson, publicDir].map(pipeToPromise),
    );
}


module.exports = async () => {
    const spinner = ora();

    const result = await prompt();
    result.pkgConfig = pkgConfig;

    const source = path.join(__dirname, '..');
    const target = process.cwd();

    const logExec = logWrapper(spinner);

    await logExec('生成项目', '生成完毕', '生成失败')(
        () => generate(source, target, result),
    );

    const useYarn = shouldUseYarn();
    const executor = createExecutor(target);
    const command = cmdMap(executor)(useYarn);

    await logExec('安装React', 'React安装成功', 'React安装失败')(
        async () => {
            await command.add(['react', 'react-dom']);
            await command.addDev(['@types/react', '@types/react-dom']);
        },
    );

    if ( result.dva ) {
        await logExec(
            '安装dva-block', 'dva-block安装成功', 'dva-block安装失败',
        )(async () => {
            await command.add(['dva-block']);
        });
    }

    if ( result.antd ) {
        await logExec(
            '安装Ant Design', 'Ant Design安装成功', 'Ant Design安装失败',
        )(async () => {
            await command.add(['antd', 'ant-design-pro']);
        });
    }
};
