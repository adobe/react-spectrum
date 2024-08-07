const path = require('path');
import installPackage from './installPackage';
import logger from './logger';

export async function addMacroSupport() {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const parcelVersion = packageJson && (packageJson.dependencies?.parcel || packageJson.devDependencies?.parcel);
  if (parcelVersion) {
    logger.success('Parcel detected in package.json. Macros are supported by default in v2.12.0 and newer.');
    return {isMacroPluginInstalled: false, isMacroSupportEnabled: false};
  }

  let isMacroPluginInstalled = await installPackage('unplugin-parcel-macros', {dev: true});

  // TODO: Try to automatically update bundle config
  return {isMacroPluginInstalled, isMacroSupportEnabled: false};
}
