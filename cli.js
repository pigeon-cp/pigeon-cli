#!/usr/local/bin/node

import repl from 'repl';
import { spawn } from 'child_process';
import { Command, Argument }  from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url';

let __dirname = path.dirname(fileURLToPath(import.meta.url));
let program = new Command();

let pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
program.version(pkg.version, '-v --version');
program.description(pkg.description);
program.usage('[command] [options]');

program.action(() => {
    let server = repl.start('> ')

    server.context.pigeon = {
        template: {
            list() {
                console.log('template1, template2, template3')
            },
            add () {
                console.log('success create template')
            }
        }
    }
});

program.command('debug')
.addArgument(new Argument('[port]', 'Java jdwp connecting port.').default('56789'))
.option('-p --path <value>', 'Pigeon application executable jars dir path.')
.description('Start Pigeon application as debug mode. Use --help to see this sub-command\'s help.')
.action((port, opts) => {
    console.log(`Java debugger connecting profile: ${chalk.blue.underline.bold(`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${port}`)}`)

    var result = spawn('java', [
        `-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=${port}`,
        '-jar', `${opts.path || '/Users/liaojinfeng/Documents/workspace/tac/code/java/pegion/target'}/pigeon.jar`,
        '--spring.profiles.active=local',
        '--spring.datasource.password=my-secret-ab',
        '--spring.output.ansi.enabled=always'
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
