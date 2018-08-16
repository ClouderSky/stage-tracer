
const path = require('path');
const tslint = require('tslint');
const chalk = require('chalk');


module.exports = function() {
    const { Linter } = tslint;
    const project = Linter.createProgram(path.resolve('./tsconfig.json'));
    const linter = new tslint.Linter({}, project);

    const configuration = tslint.Configuration
        .findConfiguration(path.resolve('./tslint.json')).results;

    Linter.getFileNames(project)
        .forEach(filename => linter.lint(filename, '', configuration));

    const result = linter.getResult();
    if ( 0 < result.errorCount ) {
        console.error(chalk.red(result.output));
        return false;
    }

    return true;
};
