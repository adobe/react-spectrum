const {parse} = require('@babel/parser');
const glob = require('glob').sync;
const path = require('path');
const fs = require('fs');

for (let pkg of glob('packages/{react-aria-components,{@react-aria,@react-spectrum,@react-stately,@react-types,@internationalized}/*}/package.json')) {
  let json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
  if (json.name === '@internationalized/string-compiler') {
    // This is a CommonJS package, so we can't analyze it.
    continue;
  }

  let pkgDeps = new Set(Object.keys(json.dependencies || {}));
  let dir = path.dirname(pkg);
  let seenDeps = new Set(['@swc/helpers']);

  for (let file of glob(`${dir}/src/*.{ts,tsx}`)) {
    let ast = parse(fs.readFileSync(file, 'utf8'), {
      filename: file,
      allowReturnOutsideFunction: true,
      strictMode: false,
      sourceType: 'module',
      plugins: ['classProperties', 'exportDefaultFrom', 'exportNamespaceFrom', 'dynamicImport', 'typescript', 'jsx', 'classPrivateProperties', 'classPrivateMethods']
    });

    for (let node of ast.program.body) {
      if (node.type === 'ImportDeclaration' || ((node.type === 'ExportAllDeclaration' || node.type === 'ExportNamedDeclaration') && node.source)) {
        let pkg = node.source.value.startsWith('@') ? node.source.value.split('/').slice(0, 2).join('/') : node.source.value.split('/')[0];
        seenDeps.add(pkg);
      }
    }
  }

  for (let dep of pkgDeps) {
    if (!seenDeps.has(dep)) {
      console.log(`Unused dependency ${dep} in ${json.name}`);
      delete json.dependencies[dep];
    }
  }

  fs.writeFileSync(pkg, JSON.stringify(json, false, 2) + '\n');
}
