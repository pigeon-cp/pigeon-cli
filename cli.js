#!/usr/local/bin/node

const commander = require('commander');
const repl = require('repl');
const spawn = require('child_process').spawn

let program = new commander.Command();

program.version(require('./package.json').version)

program.usage('command(debug|admin|...) [options]')

program.command('debug')
.addArgument(new commander.Argument('[port]', 'JDWP debug 连接端口').default('56789'))
.option('-p --path <value>', 'Pigeon 可执行 jar 所在路径')
.description('以 Debug 模式启动 Pigeon 应用实例')
.action((port, opts) => {
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

program.command('admin')
.description('在交互模式下管理你的应用实例')
.action((tmp, port) => {
    console.log('start: ', tmp)
    console.log(`jdwp=transport=dt_socket,server=y,address=${port}`)
    let server = repl.start('> ')


    server.context.say = function(msg) {
        console.log(msg)
        return 'success'
    }
});

program.command('say')
.argument('<what...>')
.action(what => {
    console.log(`you say: ${what}`)
})

program.parse();

console.log('Options: ', program.opts());
console.log('Remaining arguments: ', program.args);




