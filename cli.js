#!/usr/local/bin/node

const commander = require('commander');
const repl = require('repl');
const spawn = require('child_process').spawn

let program = new commander.Command();

program.version(require('./package.json').version)

program.usage('[command] [options]')

program.description('在交互模式下管理你的应用实例')
.action((tmp, port) => {
    let server = repl.start('> ')

    server.context.pigeon = {
        template: {
            list() {
                console.log('template1, template2, template3')
            },
            add () {
                console.log('新增模板成功')
            }
        }
    }
});

program.command('debug')
.addArgument(new commander.Argument('[port]', 'JDWP debug 连接端口').default('56789'))
.option('-p --path <value>', 'Pigeon 可执行 jar 所在路径')
.description('以 Debug 模式启动 Pigeon 应用实例')
.action((port, opts) => {
    console.log(`Java Debugger 连接参数: -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${port}`)

    var result = spawn('java', [
        `-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=${port}`,
        '-jar', `${opts.path || '/Users/liaojinfeng/Documents/workspace/tac/code/java/pegion/target'}/pigeon.jar`,
        '--spring.profiles.active=local',
        '--spring.datasource.password=my-secret-ab'
    ]);
    result.on('close', function(code) {
        console.log('child process exited with code :' + code);
    });
    result.stdout.on('data', function(data) {
        console.log('' + data);
    });
    result.stderr.on('data', function(data) {
        console.log('' + data);
    });
});


program.parse();




