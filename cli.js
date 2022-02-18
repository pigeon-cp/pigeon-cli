#!/usr/local/bin/node

// import repl from 'repl';
// import { spawn } from 'child_process';
// import { Command, Argument }  from 'commander';
// import chalk from 'chalk';
// import fs from 'fs';
// import path from 'path'
// import { fileURLToPath } from 'url';
// import ora from 'ora';
// import log from './log.js'
// import simple from './src/scaffold/simple.js'
// let __dirname = path.dirname(fileURLToPath(import.meta.url));

const repl = require('repl');
const { spawn } = require('child_process')
const { Command, Argument }  = require('commander')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const log = require('./log.js')
const simple = require('./src/scaffold/simple.js');
const inquirer = require('inquirer');

let program = new Command();

function show_help(sub_command) {
    let opts = ['--help']
    if(sub_command) {
        opts.unshift(sub_command)
    }
    var result = spawn('pigeon-cli', opts)
    result.stdout.on('data', function(data) {
        console.log('' + data);
    });
    result.stderr.on('data', function(data) {
        console.error('' + data);
    });
}

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
.addArgument(new Argument('[port]', 'java jdwp connecting port.').default('56789'))
.option('-p --path <value>', 'Pigeon application executable jars dir path.', '/usr/local/pigeon')
.option('-f --file <value>', 'Pigeon application executable jar file path.')
.option('-t --properties <value>', 'Pigeon application additional runtime properties file path.', 'debug.properties')
// .option('-x --plugins <value>', 'Pigeon application plugins path.')
.description('start Pigeon application as debug mode. Use --help to see this sub-command\'s help.')
.action((port, opts) => {
    let jarFile
    if(opts.file) {
        jarFile = opts.file
        if(!fs.existsSync(jarFile)) {
            log.error(`Specified jar file ${jarFile} not exists.`)
            process.exit()
        }
    } else {
        jarFile = `${path.isAbsolute(opts.path) ? opts.path : path.join(process.cwd(), opts.path)}/pigeon.jar`
        if(!fs.existsSync(jarFile)) {
            console.log(chalk.yellow.bold(`Pigeon jar file: ${jarFile} not exists.`))
            console.log(chalk.blue.bold(`Try download automatically.`))
            // const spinner = ora(chalk.blue.bold('Downloading...')).start();
            // TODO:: do download
            // spinner.color = 'green'
            // spinner.stopAndPersist({
            //     symbol: '🎉',
            //     text: chalk.green.bold('Downloaded.')
            // })
        }
    }

    console.log(`Java debugger connecting profile: ${chalk.blue.underline.bold(`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${port}`)}`)

    let spawnOpts = [
        '-Dpf4j.mode=dev',
        `-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=${port}`,
        '-jar', jarFile,
        '--spring.output.ansi.enabled=always',
    ]

    if(opts.properties) {
        let propFilePath = path.isAbsolute(opts.properties) ? opts.properties: path.join(process.cwd(), opts.properties)
        if (fs.existsSync(propFilePath)) {
            // resolve .porperties and append to the end of command
            let props = fs.readFileSync(propFilePath)
            props = props.toString().split('\n')
            .map(prop => {
                if(prop) {
                    return  prop.trim().startsWith('#') ? undefined : `--${prop}`
                } else {
                    return undefined
                }
            })
            .filter(prop => prop != undefined)
            spawnOpts.push(...props)
        } else {
            log.warn(`properties ${propFilePath} not exists.`)
        }
    }

    console.log(spawnOpts)
    var result = spawn('java', spawnOpts);
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

program.command('plugin')
.description('create a new plugin project.')
.addArgument(new Argument('[type]', 'plugin type.').default('simple'))
.option('-f --folder <folder>', 'specify folder that save new project.')
.action((type, opts) => {
    let folder = process.cwd()
    if(opts.folder) {
        folder = opts.folder
    }

    let existFiles = fs.readdirSync(folder)
    if(existFiles.length > 0) {
        inquirer.prompt([
            {
                type: 'list',
                name: 'ok',
                message: `folder ${folder} is not empty. clear now?`,
                choices: [ 'No', 'Yes' ]
            }
        ]).then(answers => {
            if(answers.ok === 'Yes') {
                existFiles.forEach(name => {
                    let file = path.join(folder, name)
                    console.log(`${chalk.red.bold('-')} ${file}`)
                    if(fs.statSync(file).isDirectory()) {
                        fs.rmdirSync(file, {
                        recursive: true,
                        force: true
                        })
                    } else {
                        fs.unlinkSync(file)
                    }
                })
            } else {
                console.log(chalk.red.bold('🤧 stop create simple plugin.'))
                process.exit()
            }
        }).then(() => {
            gen(type, folder)
        })
    } else {
        gen(type, folder)
    }
})

function gen(type, folder) {
    if(type === 'simple') {
        inquirer.prompt([
            {
                type: 'input',
                name: 'pigeon_version',
                message: 'specify dependent Pigeon version',
                default: '0.2',
            },
            {
                type: 'input',
                name: 'artifact_id',
                message: 'provide artifact id(is also plugin id) for you plugin project:',
                default: path.basename(folder)
            },
            {
                type: 'input',
                name: 'group_id',
                message: 'provide group id for you plugin project:',
                default: 'pigeon.plugin'
            },
            {
                type: 'input',
                name: 'author',
                message: 'your name is:',
            },
        ]).then(answers => {
            simple.generate(folder, {
                'project_path': folder,
                'pigeon_version': answers['pigeon_version'],
                'plugin_id': answers['artifact_id'],
                'group_id': answers['group_id'],
                'artifact_id': answers['artifact_id'],
                'version': '0.1',
                'author': answers['author'],
                'description': 'Pigeon plugin project.',
                'base_path': path.join(...answers['group_id'].split('.')),
                'base_package': answers['group_id'] ,
            });
        })
    } else {
        console.log(chalk.red.bold(`🥶 not supported plugin type ${type}`))
        show_help('plugin')
    }
}

program.parse();
