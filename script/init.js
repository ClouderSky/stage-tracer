
const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');
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

const commandExecutor = target => (cmd, arg = [], options = {}) => {
    return spawn.sync(cmd, arg, { cwd: target, stdio: 'inherit', ...options });
};

function initDependencies(executor) {
    let result = executor('yarn');
    if ( 0 === result.status ) { return 'yarn'; }

    result = executor('npm', ['install']);
    if ( 0 === result.status ) { return 'npm'; }

    return true;
}

const dependencyInstaller = executor => (cmd, args = []) =>
    new Promise((resolve, reject) => {
        const result = executor(cmd, args);
        0 === result.status ? resolve(result) : reject(result);
    });

const cmdMap = useYarn => useYarn ? {
    add: package => ['yarn', ['add', ...package]],
    build: 'yarn build',
    start: 'yarn start',
    test: 'yarn test',
} : {
    add: package => ['npm', ['install', ...package]],
    build: 'npm run build',
    start: 'npm run start',
    test: 'npm run test',
};

function printHelloWorld(commands) {
    console.log();
    console.log('项目创建成功');
    console.log('可以执行以下指令来操作项目：');
    console.log();
    console.log('  ' + chalk.cyan(commands.build));
    console.log('    编译生产环境使用的文件');
    console.log();
    console.log('  ' + chalk.cyan(commands.test));
    console.log('    运行项目测试');
    console.log();
    console.log('  ' + chalk.cyan(commands.start));
    console.log('    启动一个调试用的服务器');
    console.log();
    console.log('搬砖快乐！');
}

void async function() {
    const result = await prompt();

    const source = path.resolve(__dirname, '..');
    const target = process.cwd();

    const spinner = ora();
    spinner.start('生成项目');
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
    spinner.succeed(chalk.green('生成完毕'));

    const executor = commandExecutor(target);

    spinner.start('安装依赖包，可能需要等待几分钟');
    const envTool = initDependencies(executor);
    if ( false === envTool ) {
        spinner.fail('安装依赖包失败');
        console.log(chalk.yellow('请手动执行依赖安装：yarn 或 npm install'))
        return;
    }
    spinner.succeed(chalk.green('依赖安装完毕'));

    const commands = cmdMap('yarn' === envTool);
    const installer = dependencyInstaller(executor);

    try {
        spinner.start('安装React');
        const [cmd, args] = commands.add([
            'react', 'react-dom', '@types/react', '@types/react-dom',
        ]);
        await installer(cmd, args);
        spinner.succeed(chalk.green('React安装成功'));
    } catch (err) {
        spinner.fail(chalk.red('安装失败'));
    }

    const gitPath = path.resolve(target, '.git');
    const gitExists = await fs.exists(gitPath);
    if ( !gitExists ) {
        spinner.start('初始化git仓库');
        const { status } = executor('git', ['init']);
        if ( 0 === status ) {
            spinner.succeed(chalk.green('git仓库已创建'));
        } else {
            spinner.fail(chalk.red('git仓库创建失败'));
            await fs.remove(gitPath);
        }
    }

    printHelloWorld(commands);
}();
