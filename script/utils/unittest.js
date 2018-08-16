
const jestCLI = require('jest');


module.exports = async function() {
    const {results} = await jestCLI.runCLI([], [process.cwd()]);
    if ( !results.success ) {
        results.testResults.forEach(result => {
            console.log(result.failureMessage);
        });
    }
    return results.success;
}
