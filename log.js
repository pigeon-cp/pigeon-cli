import chalk from 'chalk';

export default {
    warn () {
        return console.log(chalk.yellow.bold(arguments[0]))
    },
    error () {
        return console.log(chalk.red.bold(arguments[0]))
    }
} 
