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
const migrate = require('db-migrate');
const { exit } = require('process');
const os = require('os');
const gh = require('./src/utils/gh');

let program = new Command();


function spawn_async(cmd, args) {
    return new Promise((resolve, reject) => {
        // child process
        let cp
        try {
            cp = spawn(cmd, args)
        } catch(err) {
            reject(err)
        }

        cp.stdin.pipe(process.stdin)
        cp.stdout.pipe(process.stdout)
        cp.stderr.pipe(process.stderr)

        cp.on('error', err => {
            reject(err)
        })
        cp.on('exit', exit_val => {
            resolve(exit_val)
        })
    })
}

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

program
.option('-h --host <host>', 'target Pigeon instance host.', '127.0.0.1')
.option('-p --port <port>', 'target Pigeon instance port.', '8081')
.option('-s --ssl', 'use ssl for comminucation.')
.action((opts) => {
    let server = repl.start({
        prompt: '> ',
        ignoreUndefined: true
    })
    server.prependListener('close', () => {
        console.log(`👋 ${chalk.bold('byebye.')}`)
    })
    const Pigeon = require('./src/apis/pigeon')
    const Apis = require('./src/apis/all')
    server.context.pigeon = new Pigeon(opts.host, opts.port, opts.ssl)
    server.context.apis = new Apis(server.context.pigeon)
});

program.command('debug')
.addArgument(new Argument('[port]', 'java jdwp connecting port.').default('56789'))
.option('-d --path <value>', 'Pigeon application executable jars dir path.', '/usr/local/pigeon')
.option('-f --file <value>', 'Pigeon application executable jar file path.')
.option('-t --properties <value>', 'Pigeon application additional runtime properties file path.', 'debug.properties')
// .option('-x --plugins <value>', 'Pigeon application plugins path.')
.description('start Pigeon application as debug mode. Use --help to see this sub-command\'s help.')
.action(async (port, opts) => {
    let jarFile
    if(opts.file) {
        jarFile = opts.file
        if(!fs.existsSync(jarFile)) {
            log.error(`Specified jar file ${jarFile} not exists.`)
            process.exit()
        }
    } else {
        let abs_path = path.isAbsolute(opts.path) ? opts.path : path.join(process.cwd(), opts.path)
        jarFile = `${abs_path}/pigeon.jar`
        if(!fs.existsSync(jarFile)) {
            console.log(chalk.yellow.bold(`Pigeon jar file: ${jarFile} not exists.`))
            console.log(chalk.white.bold(`try download automatically.`))

            if(fs.existsSync(abs_path)) {
                try {
                    fs.accessSync(abs_path, fs.constants.W_OK)
                } catch (err) {
                    console.warn(`no permission to access '${abs_path}'. try sudo mode agian.`)
                    exit(1)
                }
            } else {
                console.log(chalk.red.bold(`folder '${abs_path}' does not exists.`))
                exit(1)
            }

            let answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'ver',
                    choices: (await gh.tags()).map(tag => tag.replace(/^v/, '')),
                    message: 'select version of Pigeon'
                }
            ])

            let tmp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'com.github.pigeon.'))
            try {
                // script 'download.sh' can not be found by spawn if pack as binary file by pkg.js
                let script_str = fs.readFileSync(path.join(__dirname, 'script/download.sh')) + ''
                let args = ['-c', script_str]
                args.push('')   // pass empty str as $0(-c args start with $0 instead $1)
                args.push(await gh.jar_download_url('v' + answers.ver))
                args.push(tmp_dir)
                args.push(abs_path)
                let exit_val = await spawn_async('/bin/bash', args)
                // let exit_val = await spawn_async(path.join(__dirname, 'script/download.sh'), [await gh.jar_download_url('v' + answers.ver), tmp_dir, abs_path])
                if (exit_val != 0) {
                    console.log(chalk.red.bold('download failed.'))
                    exit(exit_val)
                } else {
                    console.log(chalk.green.bold('🎉 download finished.'))
                }
            } catch(err) {
                console.error(err)
                exit()
            } finally {
                fs.rmSync(tmp_dir, {recursive: true})
            }
        }
    }

    console.log(`Java debugger connecting profile: ${chalk.blue.underline.bold(`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${port}`)}`)

    let spawnOpts = [
        // '-Dpf4j.mode=dev',
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

program.command('migrate')
.description('help you to migrate db.')
.addArgument(new Argument('[type]', 'db type.').choices(['sqlite', 'mysql']).default('mysql'))
.option('-h --host <host>', '[mysql] target db host.', 'localhost')
.option('-p --port <port>', '[mysql] target db port.', '3306')
.option('-u --user <username>', '[mysql] provide username for target db.', 'root')
.option('-a --pass <password>', '[mysql] provide password for target db or input later on interactive mode(recommanded).')
.option('--db <database>', 'target database name.', 'pigeon_mig_demo')
.action((type, opts) => {
    console.log(`type: ${type}`)
    console.log(`db-migrate version: ${migrate.version}`)

    function mig(_type, _opts) {
        let ins = migrate.getInstance(true, {
            env: _type,
            config: {
                "mysql": {
                    "driver": "mysql",
                    "host": _opts.host,
                    "port": _opts.port,
                    "database": _opts.db,
                    "user": _opts.user,
                    "password": _opts.pass,
                    "multipleStatements": true
                }
            }
        });

        // clear argv manually
        ins.internals.argv._ = []

        // ins.config['sql-file'] = true
        // ins.create('0.2', 'mysql')

        let vmap = {
            '0.2': 2,
        }

        inquirer.prompt([
            {
                type: 'list',
                name: 'version',
                message: 'select target db version of pigeon you want to upgrade to',
                choices: Object.keys(vmap),
                default: '0.2'
            }
        ]).then(answers => {
            ins.up(vmap[answers.version], 'mysql')
        })
    }
    
    if(type === 'mysql') {
        console.log(`database: ${opts.host}:${opts.port}/${opts.db}`)
        if(!opts.pass) {
            inquirer.prompt([
                {
                    type: 'password',
                    name: 'pass',
                    message: '🔑 enter you db password',
                }
            ]).then(answers => {
                opts.pass = answers.pass
                mig(type, opts)
            })
        } else {
            mig(type, opts)
        }
    } else {
        // sqlite
        mig(type, opts)
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
