import chalk from 'chalk';

function info(message: string) {
  console.log(chalk.cyan(message));
}

function success(message: string) {
  console.log(chalk.green(`✓ ${message}`));
}

function warn(message: string) {
  console.log(chalk.yellow(`WARNING: ${message}`));
}

function error(message: string) {
  console.error(chalk.red(`ERROR: ${message}`));
}

export default {
  info,
  success,
  warn,
  error
};
