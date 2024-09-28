import {addMacroSupport} from './utils/addMacroSupport.js';
import chalk from 'chalk';
import installPackage from './utils/installPackage.js';
import logger from './utils/logger.js';
import {S1ToS2CodemodOptions} from '../../index.js';
import {transform} from './transform.js';
import {waitForKeypress} from './utils/waitForKeypress.js';
const boxen = require('boxen');

export async function s1_to_s2(options: S1ToS2CodemodOptions) {
  console.log(boxen(
    'Welcome to the React Spectrum v3 to Spectrum 2 upgrade assistant!\n\n' +
    'This tool will:\n\n' +
    `1. Install the ${chalk.bold('@react-spectrum/s2')} package and setup your bundler to use the Spectrum 2 style macro.\n\n` +
    '2. Upgrade the components in the current directory to use Spectrum 2.\n\n' +
    '3. Provide next steps to complete your upgrade.',
    {borderStyle: 'round', padding: 1, borderColor: 'green'}
  ), '\n\n');

  console.log('Press Enter to get started...');
  await waitForKeypress();

  // Install S2 package
  let isS2PackageInstalled = await installPackage('@react-spectrum/s2');

  // Add support for macros
  let {isMacroPluginInstalled, isMacroSupportEnabled} = await addMacroSupport();

  console.log('Press Enter to upgrade components...');
  await waitForKeypress();

  logger.info('Upgrading components...');
  await transform(options);

  logger.success('Upgrade complete!');

  let nextSteps = [
    'Add the following import to the entry component of your app: \n\n' +
    `${chalk.bold('import \'@react-spectrum/s2/page.css\';')}\n\n` +
    'Note that unlike React Spectrum v3, a Provider is not required.'
  ];

  if (!isS2PackageInstalled) {
    nextSteps.unshift(`Install the ${chalk.bold('@react-spectrum/s2')} package manually.`);
  }

  if (!isMacroSupportEnabled) {
    nextSteps.push(
      'Configure your bundler to support using the Spectrum 2 style macro.\n\n' +
      `Macros are supported by default in Parcel v2.12.0 or later and can be used with other bundlers by${!isMacroPluginInstalled ? ` installing the ${chalk.bold('unplugin-parcel-macros')} package and` : ''} adding the plugin to your bundler config. See the examples for:\n\n` +
      `  - Webpack: ${chalk.underline('https://github.com/adobe/react-spectrum/tree/main/examples/s2-webpack-5-example')}\n` +
      `  - Next.js: ${chalk.underline('https://github.com/adobe/react-spectrum/tree/main/examples/s2-next-macros')}\n` +
      `  - Vite: ${chalk.underline('https://github.com/adobe/react-spectrum/tree/main/examples/s2-vite-project')}\n` +
      `  - Rollup: ${chalk.underline('https://github.com/adobe/react-spectrum/tree/main/examples/s2-rollup-starter-app')}\n` +
      `  - ESBuild: ${chalk.underline('https://github.com/adobe/react-spectrum/tree/main/examples/s2-esbuild-starter-app')}\n\n` +
      `or view documentation here: ${chalk.underline('https://react-spectrum.adobe.com/s2/index.html?path=/docs/intro--docs#configuring-your-bundler')}`
    );
  }

  nextSteps.push(
    'Handle remaining upgrades and run your project\'s linter or formatter.\n\n' +
    'There may have been some upgrades that we couldn\'t handle automatically. We marked these with comments containing:\n\n' +
    `${chalk.bold('TODO(S2-upgrade)')}\n\n` +
    'You should be able to search your codebase and handle these manually. \n\n' +
    'We also recommend running your project\'s code formatter (i.e. Prettier, ESLint) after the upgrade process to clean up any extraneous formatting from the codemod.\n\n' +
    `For additional help, reference the Spectrum 2 Migration Guide: ${chalk.underline('https://react-spectrum.adobe.com/s2/index.html?path=/docs/migrating--docs')}`
  );

  console.log(boxen(
    `Next steps:\n\n ${nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n\n\n')}`,
    {borderStyle: 'round', padding: 1, borderColor: 'green'}
  ));

  process.exit(0);
}

