// @ts-check

/** @type {import('@yarnpkg/types')} */
const {defineConfig} = require(`@yarnpkg/types`);

/**
 * This rule will enforce that a workspace MUST depend on the same version of
 * a dependency as the one used by the other workspaces.
 *
 * @param {Context} context
 */
// function enforceConsistentDependenciesAcrossTheProject({Yarn}) {
//   for (const dependency of Yarn.dependencies()) {
//     if (dependency.type === `peerDependencies`)
//       continue;
//
//     for (const otherDependency of Yarn.dependencies({ident: dependency.ident})) {
//       if (otherDependency.type === `peerDependencies`)
//         continue;
//
//       dependency.update(otherDependency.range);
//     }
//   }
// }
function isPublishing(name) {
  return name.includes('@react-spectrum')
    || name.includes('@react-aria')
    || name.includes('@react-stately')
    || name.includes('@react-types')
    || name.includes('@internationalized')
    || name.includes('@spectrum-icons')
    || name.startsWith('react-aria-components')
    || name.startsWith('tailwindcss-react-aria-components')
    || name.startsWith('react-aria')
    || name.startsWith('react-stately');
}

function enforceWorkspaceDependencies({Yarn}) {
  for (const dependency of Yarn.dependencies()) {
    if (dependency.type === `peerDependencies`)
      continue;

    for (const otherDependency of Yarn.dependencies({ident: dependency.ident})) {
      if (otherDependency.type === `peerDependencies`)
        continue;

      if (isPublishing(dependency.ident)) {
        dependency.update('workspace:^');
      }
    }
  }
}

function enforceCSS({Yarn}) {
  for (const workspace of Yarn.workspaces()) {
    let name = workspace.ident;
    if (!name.startsWith('@react-spectrum/docs') && name.startsWith('@react-spectrum') && workspace.pkg.dependencies?.has('@adobe/spectrum-css-temp')) {
      workspace.set('targets', {
        main: {includeNodeModules: ['@adobe/spectrum-css-temp']},
        module: {includeNodeModules: ['@adobe/spectrum-css-temp']}
      });
    }
  }
}

function enforcePublishing({Yarn}) {
  for (const workspace of Yarn.workspaces()) {
    let name = workspace.ident;
    // should whitelist instead
    if (!name.includes('@react-types')
      && !name.includes('@spectrum-icons')
      && !name.includes('@react-aria/example-theme')
      && !name.includes('@react-spectrum/style-macro-s1')
      && !name.includes('@react-spectrum/docs')
      && !name.includes('parcel')
      && !name.includes('@adobe/spectrum-css-temp')
      && !name.includes('css-module-types')
      && !name.includes('eslint')
      && !name.includes('optimize-locales-plugin')) {
      let name = workspace.ident;
      if (name.startsWith('@react-spectrum')) {
        workspace.set('license', 'Apache-2.0');
      }
      if (workspace.pkg.publishConfig) {
        workspace.set('publishConfig', {access: 'public'});
      }
      workspace.set('repository', {
        type: 'git',
        url: name.startsWith('@internationalized/date') ?
          'https://github.com/adobe/react-spectrum/tree/main/packages/@internationalized/date'
          : 'https://github.com/adobe/react-spectrum'
      })
    }
  }
}

module.exports = defineConfig({
  constraints: async ctx => {
    enforceWorkspaceDependencies(ctx);
    // enforceConsistentDependenciesAcrossTheProject(ctx);
    enforceCSS(ctx)
    enforcePublishing(ctx)
  },
});
