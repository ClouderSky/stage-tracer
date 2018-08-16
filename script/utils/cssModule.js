
const glob = require('glob');
const DtsCreator = require('typed-css-modules');
const chokidar = require('chokidar');


module.exports = class {

    constructor(source) {
        this.source = source || 'src/**/*.module.+(css|scss|sass)';
    }

    iterSourceFile() {
        return new Promise((resolve, reject) => {
            glob(this.source, (err, matchs) => {
                err ? reject(err) : resolve(matchs);
            });
        });
    }

    newCreator() {
        return new DtsCreator({ camelCase: true });
    }

    compileFile(creator, options = {}) {
        return filename => {
            creator.create(filename, null, !!options.inWatch).then(content => {
                content.writeFile();
                if ( !!options.needPrint ) {
                    console.log('生成样式类声明文件：', content.outputFilePath);
                }
            });
        };
    }

    async compile() {
        const creator = this.newCreator();
        const matchs = await this.iterSourceFile();
        matchs.forEach(this.compileFile(creator));
        return matchs;
    }

    watch() {
        const creator = this.newCreator();
        const compiler = this.compileFile(creator, {
            needPrint: true, inWatch: true,
        });

        const watcher = chokidar.watch(this.source);
        watcher.on('add', compiler);
        watcher.on('change', compiler);
        return () => watcher.close();
    }

};
