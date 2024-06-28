const fs = require('fs');
const path = require('path');
const jscodeshift = require('jscodeshift');
import installPackage from './installPackage';
import logger from './logger';
import chalk from 'chalk';

export async function addMacroSupport() {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const parcelVersion = packageJson && (packageJson.dependencies?.parcel || packageJson.devDependencies?.parcel);
  if (parcelVersion) {
    logger.success('Parcel detected in package.json. Macros are supported by default in v2.12.0 and newer.');
    return {isMacroPluginInstalled: false, isMacroSupportEnabled: false};
  }

  let isMacroPluginInstalled = await installPackage('unplugin-parcel-macros', {dev: true});

  return {isMacroPluginInstalled, isMacroSupportEnabled: false};

  // TODO: Try to automatically update bundle config

  const configFiles = ['webpack', 'next', 'vite', 'rollup'].flatMap(bundler => [
    `${bundler}.config.js`,
    `${bundler}.config.ts`,
    `${bundler}.config.mjs`
  ]);

  // TODO: Detecting esbuild config is harder

  const configFile = configFiles.find(file => fs.existsSync(path.join(process.cwd(), file)));

  if (!configFile) {
    logger.warn(`Bundler config was not detected, so we couldn't update it automatically. Be sure to configure your bundler to support macros: ${chalk.bold('https://react-spectrum.corp.adobe.com/s2/#configuring-your-bundler')}`);
    return;
  }

  const filePath = path.join(process.cwd(), configFile);
  const source = fs.readFileSync(filePath, 'utf8');
  const j = jscodeshift.withParser(configFile.endsWith('.ts') ? 'ts' : 'babel');
  const root = j(source);

  const bundler = configFile.split('.')[0];
  const pluginName = `macros.${bundler}()`;

  let modified = false;

  if (bundler === 'webpack' || bundler === 'vite') {
    root
      .find(j.ArrayExpression)
      .filter(path => path.parent.node.key && path.parent.node.key.name === 'plugins')
      .forEach(path => {
        path.node.elements.push(j.callExpression(j.identifier(pluginName), []));
        modified = true;
      });
  } else if (bundler === 'rollup') {
    root
      .find(j.ArrayExpression)
      .filter(path => path.parent.node.key && path.parent.node.key.name === 'plugins')
      .forEach(path => {
        // Ensure macro plugin is placed before babel plugin
        const babelPluginIndex = path.node.elements.findIndex(node => node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'babel');
        const newPlugin = j.callExpression(j.identifier(pluginName), []);
        if (babelPluginIndex !== -1) {
          path.node.elements.splice(babelPluginIndex, 0, newPlugin);
        } else {
          path.node.elements.unshift(newPlugin);
        }
        modified = true;
      });
  } else if (bundler === 'next') {
    root
      .find(j.ObjectExpression)
      .filter(path => path.parent.node.type === 'AssignmentExpression' && path.parent.node.left.type === 'MemberExpression' && path.parent.node.left.property.name === 'webpack')
      .forEach(path => {
        const configParam = j.identifier('config');
        const pushCall = j.callExpression(
          j.memberExpression(j.memberExpression(configParam, j.identifier('plugins')), j.identifier('push')),
          [j.identifier('plugin')]
        );
        const returnStatement = j.returnStatement(configParam);
        path.node.body = j.blockStatement([pushCall, returnStatement]);
        modified = true;
      });

    // Add plugin instantiation
    root.get().node.program.body.unshift(
      j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier('plugin'),
          j.callExpression(j.identifier(pluginName), [])
        )
      ])
    );
  }

  if (modified) {
    // Add import statement
    root.get().node.program.body.unshift(
      j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('macros'))],
        j.literal('unplugin-parcel-macros')
      )
    );

    fs.writeFileSync(filePath, root.toSource());
    logger.success(`Successfully updated ${chalk.bold(configFile)} with the macros plugin.`);
  } else {
    console.log(`Could not automatically add the macro plugin to ${chalk.bold(configFile)}. See the docs to try configuring it manually: ${chalk.bold('https://react-spectrum.corp.adobe.com/s2/#configuring-your-bundler')}`);
  }
}
