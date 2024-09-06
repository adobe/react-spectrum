import chalk from 'chalk';
import fs from 'fs';
import logger from './logger.js';
import path from 'path';

const execa = require('execa');
function detectPackageManager() {
  let packageManagers = [
    {name: 'yarn', file: 'yarn.lock', installCommand: 'add'},
    {name: 'npm', file: 'package-lock.json', installCommand: 'install'},
    {name: 'pnpm', file: 'pnpm-lock.yaml', installCommand: 'add'}
  ];

  for (let pm of packageManagers) {
    if (fs.existsSync(pm.file)) {
      return pm;
    }
  }
  return null;
}

function hasPackageJson() {
  return fs.existsSync(path.join(process.cwd(), 'package.json'));
}

export default async function installPackage(packageName: string, options?: {dev?: boolean}) {
  logger.info('Checking for package.json...');
  if (!hasPackageJson()) {
    logger.warn(`Could not find package.json in the current directory. Please install ${chalk.bold(packageName)} manually.\n`);
    return false;
  }

  let packageManager = detectPackageManager();

  if (!packageManager) {
    logger.warn(`Could not detect package manager. Please install ${chalk.bold(packageName)} manually.\n`);
    return false;
  }
  try {
    logger.info(`Installing ${chalk.bold(packageName)} using ${chalk.bold(packageManager.name)}...`);
    const devFlag = options?.dev ? ['-D'] : [];
    await execa(packageManager.name, [packageManager.installCommand, `${packageName}@latest`, ...devFlag]);
    logger.success(`Successfully installed ${chalk.bold(packageName)}!\n`);
    return true;
  } catch (e: any) {
    logger.warn(`Failed to install ${chalk.bold(packageName)} with ${chalk.bold(packageManager.name)}.\n\nReceived error: ${e.message}.\n\nPlease install ${chalk.bold(packageName)} manually.\n`);
    return false;
  }
}
