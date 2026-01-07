import fs from 'fs';
import path from 'path';
import * as recast from 'recast';
import * as t from '@babel/types';
import {parse} from '@babel/parser';

const skipped = ['example-theme', 'test-utils', 'story-utils', 's2', 'style-macro-s1'];
const importMap = {
  'react-aria': buildImportMap('packages/react-aria/src/index.ts'),
  'react-stately': buildImportMap('packages/react-stately/src/index.ts'),
  'react-aria-components': buildImportMap('packages/react-aria-components/src/index.ts'),
  '@react-spectrum/s2': buildImportMap('packages/@react-spectrum/s2/src/index.ts')
};

migrateScope('@react-aria', 'react-aria');
migrateScope('@react-stately', 'react-stately');
migrateScope('@react-spectrum', '@adobe/react-spectrum');
migrateToMonopackage('react-aria-components');
migrateToMonopackage('@react-spectrum/s2');
migrateToMonopackage('@internationalized/number');

function migrateScope(scope, monopackage) {
  prepareMonopackage(monopackage);

  for (let pkg of fs.globSync(`packages/${scope}/*`).sort()) {
    if (fs.statSync(pkg).isDirectory()) {
      let name = path.basename(pkg);
      if (skipped.includes(name)) {
        continue;
      }

      migratePackage(scope, name, monopackage);
    }
  }

  rewriteIndex(`packages/${monopackage}/src/index.ts`, scope);
}

function prepareMonopackage(monopackage) {
  let monopackageJSON = JSON.parse(fs.readFileSync(`packages/${monopackage}/package.json`, 'utf8'));
  monopackageJSON.source = ['src/index.ts', 'src/*/index.ts'];
  if (!monopackageJSON.exports['.']) {
    monopackageJSON.exports = {
      '.': monopackageJSON.exports
    };
  } else {
    // TODO
    monopackageJSON.exports = {
      '.': monopackageJSON.exports['.']
    };
  }

  for (let dep in monopackageJSON.dependencies || {}) {
    let depScope = dep.match(/@(react-aria|react-spectrum|react-stately)/);
    if (depScope) {
      let p = depScope[1] === 'react-spectrum' ? '@adobe/react-spectrum' : depScope[1];
      if (!monopackageJSON.dependencies[p]) {
        monopackageJSON.dependencies[p] = JSON.parse(fs.readFileSync(`packages/${p}/package.json`, 'utf8')).version;
      }
      delete monopackageJSON.dependencies[dep];
    }
  }

  fs.writeFileSync(`packages/${monopackage}/package.json`, JSON.stringify(monopackageJSON, false, 2) + '\n');
}

function migratePackage(scope, name, monopackage) {
  let packageJSON = JSON.parse(fs.readFileSync(`packages/${scope}/${name}/package.json`, 'utf8'));
  let monopackageJSON = JSON.parse(fs.readFileSync(`packages/${monopackage}/package.json`, 'utf8'));

  // Move files
  moveTree(scope, name, 'src', monopackage);
  moveTree(scope, name, 'test', monopackage);
  moveTree(scope, name, 'stories', monopackage);
  moveTree(scope, name, 'chromatic', monopackage);
  moveTree(scope, name, 'chromatic-fc', monopackage);
  moveTree(scope, name, 'docs', monopackage);
  moveTree(scope, name, 'intl', monopackage);
  
  let exports = packageJSON.exports || {source: './' + packageJSON.source};
  if (exports['.']) {
    exports = exports['.'];
    // TODO: add others
  }

  monopackageJSON.exports[`./${name}`] = remapExports(exports, name);
  for (let dep in packageJSON.dependencies || {}) {
    let depScope = dep.match(/@(react-aria|react-spectrum|react-stately)/);
    if (!depScope && !monopackageJSON.dependencies[dep]) {
      monopackageJSON.dependencies[dep] = packageJSON.dependencies[dep];
    } else if (depScope && depScope[0] !== scope && !monopackageJSON.dependencies[depScope[1]]) {
      monopackageJSON.dependencies[depScope[1]] = JSON.parse(fs.readFileSync(`packages/${depScope[1]}/package.json`, 'utf8')).version;
    }
  }

  fs.writeFileSync(`packages/${monopackage}/package.json`, JSON.stringify(monopackageJSON, false, 2) + '\n');

  let index = fs.readFileSync(`packages/${scope}/${name}/index.ts`, 'utf8');
  index = index.replace('./src', `${monopackage}/${name}`);
  fs.writeFileSync(`packages/${scope}/${name}/index.ts`, index);

  packageJSON.source = 'index.ts';
  delete packageJSON.exports; // TODO
  packageJSON.dependencies = {
    [monopackage]: '^' + monopackageJSON.version
  };
  fs.writeFileSync(`packages/${scope}/${name}/package.json`, JSON.stringify(packageJSON, false, 2) + '\n');
}

function remapExports(exports, name) {
  exports = {...exports};
  for (let key in exports) {
    if (typeof exports[key] === 'string') {
      exports[key] = exports[key].replace(/\.\/(src|dist)/, `./$1/${name}`);
    } else if (Array.isArray(exports[key])) {
      exports[key] = exports[key].map(v => v.replace(/\.\/(src|dist)/, `./$1/${name}`));
    } else if (typeof exports[key] === 'object') {
      exports[key] = remapExports(exports[key], name);
    }
  }
  return exports;
}

function moveTree(scope, name, tree, monopackage) {
  if (fs.existsSync(`packages/${scope}/${name}/${tree}`)) {
    fs.rmSync(`packages/${monopackage}/${tree}/${name}`, {recursive: true, force: true});
    fs.mkdirSync(`packages/${monopackage}/${tree}`, {recursive: true});
    fs.renameSync(`packages/${scope}/${name}/${tree}`, `packages/${monopackage}/${tree}/${name}`);

    for (let file of fs.globSync(`packages/${monopackage}/${tree}/${name}/**/*.{ts,tsx,js,jsx,mdx}`)) {
      rewriteImports(file, scope, name);
    }
  }
}

function rewriteImports(file, scope, name) {
  let contents = fs.readFileSync(file, 'utf8');
  contents = contents.replace(/@(react-aria|react-spectrum|react-stately)\/([^/'"]+)\/(src|test|stories|chromatic|intl)/g, (m, importedScope, pkg, dir) => {
    if (skipped.some(s => pkg.includes(s))) {
      return m;
    }

    if (importedScope === 'react-spectrum') {
      return pkg === 's2' ? `@react-spectrum/s2/${dir}` : `@adobe/react-spectrum/${dir}/${pkg}`;
    }
    return `${importedScope}/${dir}/${pkg}`;
  });

  contents = contents.replace(/@(react-aria|react-spectrum|react-stately)\/([^/'"]+)/g, (m, importedScope, pkg) => {
    if (skipped.some(s => pkg.includes(s))) {
      return m;
    }
    
    if (scope && importedScope === scope.slice(1) && file.includes('src')) {
      return `../${pkg}`;
    }

    if (importedScope === 'react-spectrum') {
      return pkg === 's2' ? '@react-spectrum/s2' : `@adobe/react-spectrum/${pkg}`;
    }
    return `${importedScope}/${pkg}`;
  });

  if (scope) {
    contents = contents.replaceAll('../src', `../../src/${name}`);
    contents = contents.replaceAll('../stories', `../../stories/${name}`);
    contents = contents.replaceAll('../chromatic', `../../chromatic/${name}`);
    contents = contents.replaceAll('../index', `../../src/${name}`);
    contents = contents.replaceAll("'../'", `'../../src/${name}'`);
    contents = contents.replaceAll("'..'", `'../../src/${name}'`);
    contents = contents.replaceAll('../intl', `../../intl/${name}`);
    contents = contents.replaceAll('../package.json', '../../package.json');
  }

  fs.writeFileSync(file, contents);
}

function rewriteIndex(file, scope) {
  let contents = fs.readFileSync(file, 'utf8');
  contents = contents.replace(/@(react-aria|react-spectrum|react-stately)\/([^/'"]+)/g, (m, importedScope, pkg) => {
    if (skipped.some(s => pkg.includes(s))) {
      return m;
    }

    if (importedScope === scope.slice(1)) {
      return `./${pkg}`;
    }

    if (importedScope === 'react-spectrum') {
      return pkg === 's2' ? '@react-spectrum/s2' : `@adobe/react-spectrum/${pkg}`;
    }
    return `${importedScope}/${pkg}`;
  });

  fs.writeFileSync(file, contents);
}

function migrateToMonopackage(pkg) {
  for (let file of fs.globSync(`packages/${pkg}/**/*.{ts,tsx,js,jsx,mdx}`)) {
    rewriteMonopackageImports(file); // TODO: only src?
    rewriteImports(file);
  }

  let packageJSON = JSON.parse(fs.readFileSync(`packages/${pkg}/package.json`, 'utf8'));
  for (let dep in packageJSON.dependencies || {}) {
    let depScope = dep.match(/@(react-aria|react-spectrum|react-stately)/);
    if (depScope) {
      let p = depScope[1] === 'react-spectrum' ? '@adobe/react-spectrum' : depScope[1];
      if (!packageJSON.dependencies[p]) {
        packageJSON.dependencies[p] = JSON.parse(fs.readFileSync(`packages/${p}/package.json`, 'utf8')).version;
      }
      delete packageJSON.dependencies[dep];
    }
  }

  if (!packageJSON.exports['.']) {
    packageJSON.exports = {
      '.': packageJSON.exports
    };
  }

  for (let specifier in importMap[pkg]) {
    let [source] = importMap[pkg][specifier];
    if (source.startsWith('./') && !packageJSON.exports[source]) {
      let ext = ['ts', 'tsx', 'js'].find(e => fs.existsSync(`packages/${pkg}/src/${source.slice(2)}.${e}`));
      packageJSON.exports[source] = {
        source: `./src/${source.slice(2)}.${ext}`,
        types: [`./dist/${source.slice(2)}.d.ts`, `./src/${source.slice(2)}.${ext}`],
        import: `./dist/${source.slice(2)}.mjs`,
        require: `./dist/${source.slice(2)}.cjs`
      };
    }
  }

  fs.writeFileSync(`packages/${pkg}/package.json`, JSON.stringify(packageJSON, false, 2) + '\n');
}

function buildImportMap(file) {
  let content = fs.readFileSync(file, 'utf8');
  let ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'importAttributes'],
    sourceFilename: file,
    tokens: true,
    errorRecovery: true
  });

  let map = {};
  for (let node of ast.program.body) {
    if (node.type === 'ExportNamedDeclaration' && node.source) {
      for (let specifier of node.specifiers) {
        let name = specifier.exported.type === 'Identifier' ? specifier.exported.name : specifier.exported.value;
        map[name] = [node.source.value, specifier.local.name];
      }
    }
  }

  return map;
}

function rewriteMonopackageImports(file) {
  if (path.extname(file) === '.mdx') {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let ast = recast.parse(content, {
    parser: {
      parse() {
        return parse(content, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx', 'importAttributes'],
          sourceFilename: file,
          tokens: true,
          errorRecovery: true
        });
      }
    }
  });

  let hadImports = false;
  ast.program.body = ast.program.body.flatMap(node => {
    if (node.type === 'ImportDeclaration' && importMap[node.source.value]) {
      hadImports = true;

      let groups = {};
      for (let specifier of node.specifiers) {
        let [source, imported] = importMap[node.source.value][specifier.imported.name];
        if (source.startsWith('./')) {
          source = `${node.source.value}/${source.slice(2)}`;
        }
        groups[source] ||= [];
        groups[source].push(t.importSpecifier(specifier.local, t.identifier(imported)));
      }
      
      let res = Object.entries(groups).map(([source, specifiers]) => {
        let decl = t.importDeclaration(specifiers, t.stringLiteral(source));
        decl.importKind = node.importKind;
        return decl;
      });

      res[0].comments = node.leadingComments;
      return res;
    }

    return [node];
  });

  if (!hadImports) {
    return;
  }

  content = recast.print(ast, {objectCurlySpacing: false, quote: 'single'}).code;
  fs.writeFileSync(file, content);
}
