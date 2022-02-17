import chalk from 'chalk';

export default {
    warn() {
        return console.log(chalk.red.bold(arguments[0]))
    }
} 
