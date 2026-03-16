import chalk from 'chalk';

function info(message: string): void {
  console.log(chalk.cyan(message));
}

function success(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

function warn(message: string): void {
  console.log(chalk.yellow(`WARNING: ${message}`));
}

function error(message: string): void {
  console.error(chalk.red(`ERROR: ${message}`));
}

export default {
  info,
  success,
  warn,
  error
} as {
  info: typeof info,
  success: typeof success,
  warn: typeof warn,
  error: typeof error
};
