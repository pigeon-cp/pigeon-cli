import chalk from 'chalk';

export default {
    error() {
        return console.log(chalk.red.bold(arguments[0]))
    }
} 
