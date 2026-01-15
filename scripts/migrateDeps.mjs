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
  '@react-spectrum/s2': buildImportMap('packages/@react-spectrum/s2/src/index.ts'),
  '@adobe/react-spectrum': buildImportMap('packages/@adobe/react-spectrum/src/index.ts')
};

for (let pkg of fs.globSync(['packages/@react-aria/*', 'packages/@react-spectrum/*', 'packages/@react-stately/*']).sort()) {
  if (fs.statSync(pkg).isDirectory()) {
    let name = pkg.split('/').slice(1).join('/');
    if (skipped.includes(path.basename(pkg))) {
      continue;
    }

    importMap[name] = buildImportMap(`${pkg}/src/index.ts`);
  }
}

let standalone = new Set();
for (let f of fs.globSync('packages/**/*.mdx')) {
  standalone.add(path.basename(f, path.extname(f)));
}

// Public but current doesn't have docs.
standalone.add('DragPreview');
standalone.add('useListFormatter');
standalone.add('useLocalizedStringFormatter');
standalone.add('Overlay');
standalone.add('useDragAndDrop');
standalone.add('Icon');
standalone.add('Item');
standalone.add('Section');
standalone.add('Color');
// standalone.add('GridLayout');
// standalone.add('ListLayout');
// standalone.add('WaterfallLayout');
standalone.add('ListKeyboardDelegate');
standalone.add('ListDropTargetDelegate');
standalone.add('Cell');
standalone.add('Row');
standalone.add('Column');
standalone.add('TableBody');
standalone.add('TableHeader');
standalone.add('useToggleGroupState');
standalone.add('useColorPickerState');

// Documented but not in the monopackage.
standalone.delete('useAutocomplete');
standalone.delete('useAutocompleteState');
standalone.delete('useToolbar');

// Public but grouped with a parent component/hook.
let parentFile = {
  'useBreadcrumbItem': 'useBreadcrumbs',
  'useCalendarCell': 'useCalendar',
  'useCalendarGrid': 'useCalendar',
  'useCheckboxGroupItem': 'useCheckboxGroup',
  // 'CollectionBuilder': '',
  'useColorChannelField': 'useColorField',
  'useDateSegment': 'useDateField',
  'useDraggableItem': 'useDraggableCollection',
  'useDropIndicator': 'useDroppableCollection',
  'useDroppableItem': 'useDroppableCollection',
  // 'utils': '',
  'useGridListItem': 'useGridList',
  'useGridListSelectionCheckbox': 'useGridList',
  // 'useFocusable': '',
  // 'useInteractOutside': '',
  // 'useScrollWheel': '',
  'useListBoxSection': 'useListBox',
  'useOption': 'useListBox',
  'useMenuItem': 'useMenu',
  'useMenuSection': 'useMenu',
  'useMenuTrigger': 'useMenu',
  'useSubmenuTrigger': 'useMenu',
  'DismissButton': 'Overlay',
  // 'useModal': '',
  // 'useOverlay': '',
  // 'useOverlayPosition': '',
  // 'useOverlayTrigger': '',
  // 'usePreventScroll': '',
  'useRadio': 'useRadioGroup',
  'HiddenSelect': 'useSelect',
  'useSliderThumb': 'useSlider',
  'useTableCell': 'useTable',
  'useTableColumnHeader': 'useTable',
  'useTableColumnResize': 'useTable',
  'useTableHeaderRow': 'useTable',
  'useTableRow': 'useTable',
  'useTableSelectionCheckbox': 'useTable',
  'useTab': 'useTabList',
  'useTabPanel': 'useTabList',
  'useTag': 'useTagGroup',
  'useToastRegion': 'useToast',
  'useTooltip': 'useTooltipTrigger',
  // 'useTree': '',
  // 'chain': '',
  // 'openLink': '',
  'ActionBarContainer': 'ActionBar',
  'useDialogContainer': 'DialogContainer',
  'Radio': 'RadioGroup',
  // 'TableViewWrapper': '',
  'TooltipTrigger': 'Tooltip',
  // 'types': '',
  // 'useCollection': '',
  'useColorChannelFieldState': 'useColorFieldState',
  // 'useFormValidationState': '',
  'useSubmenuTriggerState': 'useMenuTriggerState',
  // 'types': '',
  'useTableColumnResizeState': 'useTableState',
  // 'Layout': 'useVirtualizerState',
  // 'LayoutInfo': 'useVirtualizerState',
  // 'Point': 'useVirtualizerState',
  // 'Rect': 'useVirtualizerState',
  // 'Size': 'useVirtualizerState',
  'DateSegmentType': 'useDateFieldState'
};

// Names that are included in public files but not exported by monopackages.
const privateNames = new Set([
  'setInteractionModality',
  'getInteractionModality',
  'useSlotId',
  'createFocusManager',
  'isFocusVisible',
  'UNSTABLE_createLandmarkController',
  'isElementInChildOfActiveScope',
  'getFocusableTreeWalker',
  'getPointerType',
  'addWindowFocusTracking',
  'useInteractionModality',
  'useFocusVisibleListener',
  'FocusVisibleHandler',
  'Modality',
  'LandmarkControllerOptions',
  'useOverlayFocusContain',
  'useSSRSafeId',
  'mergeIds',
  'useFormProps',
  'IconPropsWithoutChildren',
  'useProviderProps',
  'CollectionBuilderContext',
  'useLocalizedStringDictionary'
]);

let publicFiles = new Set();
for (let pkg of ['react-aria', 'react-stately', 'react-aria-components', '@react-spectrum/s2', '@adobe/react-spectrum']) {
  for (let exp in importMap[pkg]) {
    let [specifier, imported] = importMap[pkg][exp];
    if (!importMap[specifier] || !importMap[specifier][imported]) {
      continue;
    }
    let [s] = importMap[specifier][imported];
    if (!s.startsWith('.')) {
      continue;
    }
    let p = `${specifier}/${s.slice(2)}`;
    publicFiles.add(p);    
  }
}

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

  fs.renameSync(`packages/${monopackage}/src/index.ts`, `packages/${monopackage}/exports/index.ts`);
  rewriteMonopackageImports(`packages/${monopackage}/exports/index.ts`);
}

function prepareMonopackage(monopackage) {
  let monopackageJSON = JSON.parse(fs.readFileSync(`packages/${monopackage}/package.json`, 'utf8'));
  monopackageJSON.source = 'exports/*.ts';
  if (!monopackageJSON.exports['.']) {
    monopackageJSON.exports = {
      '.': {
        source: './exports/index.ts',
        types: './exports/index.ts',
        import: './dist/import.mjs',
        require: './dist/module.js'
      },
      './private/*': {
        source: ['./src/*.ts', './src/*.tsx', './src/*/index.ts'],
        types: ['./dist/*.d.ts', './src/*.ts', './src/*.tsx'],
        import: './dist/*.mjs',
        require: './dist/*.js'
      },
      './*': {
        source: ['./exports/*.ts'],
        types: ['./dist/*.d.ts', './exports/*.ts', './exports/*.tsx'],
        import: './dist/*.mjs',
        require: './dist/*.js'
      }
    };
  } else {
    // TODO
    monopackageJSON.exports = {
      '.': {
        source: './exports/index.ts',
        types: './exports/index.ts',
        import: './dist/import.mjs',
        require: './dist/module.js'
      },
      './private/*': {
        source: ['./src/*.ts', './src/*.tsx', './src/*/index.ts'],
        types: ['./dist/*.d.ts', './src/*.ts', './src/*.tsx'],
        import: './dist/*.mjs',
        require: './dist/*.js'
      },
      './*': {
        source: ['./exports/*.ts'],
        types: ['./dist/*.d.ts', './exports/*.ts', './exports/*.tsx'],
        import: './dist/*.mjs',
        require: './dist/*.js'
      }
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

  fs.mkdirSync(`packages/${monopackage}/exports`, {recursive: true});
  fs.writeFileSync(`packages/${monopackage}/package.json`, JSON.stringify(monopackageJSON, false, 2) + '\n');
  fs.rmSync(`packages/${monopackage}/index.ts`);
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

  // monopackageJSON.exports[`./${name}`] = remapExports(exports, name);
  for (let dep in packageJSON.dependencies || {}) {
    let depScope = dep.match(/@(react-aria|react-spectrum|react-stately)/);
    if (!depScope && !monopackageJSON.dependencies[dep]) {
      monopackageJSON.dependencies[dep] = packageJSON.dependencies[dep];
    } else if (depScope && depScope[0] !== scope && !monopackageJSON.dependencies[depScope[1]]) {
      monopackageJSON.dependencies[depScope[1]] = JSON.parse(fs.readFileSync(`packages/${depScope[1]}/package.json`, 'utf8')).version;
    }
  }

  fs.writeFileSync(`packages/${monopackage}/package.json`, JSON.stringify(monopackageJSON, false, 2) + '\n');

  packageJSON.source = 'src/index.ts';
  // delete packageJSON.exports; // TODO
  packageJSON.exports = {
    source: './src/index.ts',
    types: './src/index.ts',
    // TODO
  };
  packageJSON.dependencies = {
    [monopackage]: '^' + monopackageJSON.version
  };
  fs.writeFileSync(`packages/${scope}/${name}/package.json`, JSON.stringify(packageJSON, false, 2) + '\n');
  fs.rmSync(`packages/${scope}/${name}/index.ts`);

  createPublicExports(monopackage, scope, name);
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
    let monopackageTree = tree;
    fs.rmSync(`packages/${monopackage}/${monopackageTree}/${name}`, {recursive: true, force: true});
    fs.mkdirSync(`packages/${monopackage}/${monopackageTree}`, {recursive: true});
    fs.renameSync(`packages/${scope}/${name}/${tree}`, `packages/${monopackage}/${monopackageTree}/${name}`);

    for (let file of fs.globSync(`packages/${monopackage}/${monopackageTree}/${name}/**/*.{ts,tsx,js,jsx,mdx}`)) {
      // rewriteImports(file, scope, name);
      rewriteMonopackageImports(file, name, scope);
    }
  }
}

// function rewriteImports(file, scope, name) {
//   let contents = fs.readFileSync(file, 'utf8');
//   contents = contents.replace(/@(react-aria|react-spectrum|react-stately)\/([^/'"]+)\/(src|test|stories|chromatic|intl)/g, (m, importedScope, pkg, dir) => {
//     if (skipped.some(s => pkg.includes(s))) {
//       return m;
//     }

//     if (importedScope === 'react-spectrum') {
//       return pkg === 's2' ? `@react-spectrum/s2/${dir}` : `@adobe/react-spectrum/${dir}/${pkg}`;
//     }
//     return `${importedScope}/${dir}/${pkg}`;
//   });

//   contents = contents.replace(/@(react-aria|react-spectrum|react-stately)\/([^/'"]+)/g, (m, importedScope, pkg) => {
//     if (skipped.some(s => pkg.includes(s))) {
//       return m;
//     }
    
//     if (scope && importedScope === scope.slice(1) && file.includes('src')) {
//       return `../${pkg}`;
//     }

//     if (importedScope === 'react-spectrum') {
//       return pkg === 's2' ? '@react-spectrum/s2' : `@adobe/react-spectrum/${pkg}`;
//     }
//     return `${importedScope}/${pkg}`;
//   });

//   if (scope) {
//     contents = contents.replaceAll('../src', `../../src/${name}`);
//     contents = contents.replaceAll('../stories', `../../stories/${name}`);
//     contents = contents.replaceAll('../chromatic', `../../chromatic/${name}`);
//     contents = contents.replaceAll('../index', `../../src/${name}`);
//     contents = contents.replaceAll("'../'", `'../../src/${name}'`);
//     contents = contents.replaceAll("'..'", `'../../src/${name}'`);
//     contents = contents.replaceAll('../intl', `../../intl/${name}`);
//     contents = contents.replaceAll('../package.json', '../../package.json');
//   }

//   fs.writeFileSync(file, contents);
// }

// function rewriteIndex(file, scope) {
//   let contents = fs.readFileSync(file, 'utf8');
//   contents = contents.replace(/@(react-aria|react-spectrum|react-stately)\/([^/'"]+)/g, (m, importedScope, pkg) => {
//     if (skipped.some(s => pkg.includes(s))) {
//       return m;
//     }

//     if (importedScope === scope.slice(1)) {
//       return `./${pkg}`;
//     }

//     if (importedScope === 'react-spectrum') {
//       return pkg === 's2' ? '@react-spectrum/s2' : `@adobe/react-spectrum/${pkg}`;
//     }
//     return `${importedScope}/${pkg}`;
//   });

//   fs.writeFileSync(file, contents);
// }

function migrateToMonopackage(pkg) {
  for (let file of fs.globSync(`packages/${pkg}/**/*.{ts,tsx,js,jsx,mdx}`)) {
    rewriteMonopackageImports(file); // TODO: only src?
    // rewriteImports(file);
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

  // for (let specifier in importMap[pkg]) {
  //   let [source] = importMap[pkg][specifier];
  //   if (source.startsWith('./') && !packageJSON.exports[source]) {
  //     let ext = ['ts', 'tsx', 'js'].find(e => fs.existsSync(`packages/${pkg}/src/${source.slice(2)}.${e}`));
  //     packageJSON.exports[source] = {
  //       source: `./src/${source.slice(2)}.${ext}`,
  //       types: [`./dist/${source.slice(2)}.d.ts`, `./src/${source.slice(2)}.${ext}`],
  //       import: `./dist/${source.slice(2)}.mjs`,
  //       require: `./dist/${source.slice(2)}.cjs`
  //     };
  //   }
  // }

  packageJSON.exports['./*'] = {
    source: ['./src/*.ts', './src/*.tsx']
  };

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

function rewriteMonopackageImports(file, name, scope) {
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
    if (!((node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration') && node.source)) {
      return [node];
    }

    let source; 
    if (node.source) {
      source = node.source.value;
      // if (/\.\/?$/.test(source)) {
      //   if (!source.endsWith('/')) {
      //     source += '/';
      //   }
      //   source += 'src/index';
      // } else if (source.endsWith('/src')) {
      //   source += '/index';
      // }
      // if (source.endsWith('/src/index')) {
      //   let f = path.relative('.', path.resolve(path.dirname(file), source));
      //   let [pkg] = parsePackage(f);
      //   console.log('HERE', f, pkg)
      //   if (importMap[pkg]) {
      //     source = pkg;
      //   }
      // }
    }


    if (importMap[source]) {
      hadImports = true;
      return getImportStatements(node, file);
    } else if (source.startsWith('.') && name) {
      hadImports = true;
      if (source === '.' || source === './' || source === './index' || source === '../' || source === '..' || source === '../index' || source === '../src') {
        node.source = t.stringLiteral(`${scope}/${name}`);
        return getImportStatements(node, file);
      } else if (source === '../package.json') {
        source = '../../package.json';
      } else {
        source = source.replace(/\.\.\/(src|stories|chromatic|intl)/, (_, tree) => `../../${tree}/${name}`);
      }
      node.source = t.stringLiteral(source);
    } else if (source.startsWith('/packages/') && !source.startsWith('/packages/@internationalized/')) {
      hadImports = true;
      let parts = source.slice('/packages/'.length).split('/');
      let scope = parts.shift();
      let monopackage;
      if (scope === '@react-spectrum') {
        monopackage = '@adobe/react-spectrum';
      } else if (scope.startsWith('@')) {
        monopackage = scope.slice(1);
      } else {
        monopackage = scope;
      }

      let pkg = scope;
      if (pkg.startsWith('@')) {
        pkg = parts.shift();
      }

      let tree = parts.shift();

      source = `packages/${monopackage}/${tree}/${pkg}/${parts.join('/')}`;
      source = path.relative(path.dirname(file), source);
      if (!source.startsWith('.')) {
        source = './' + source;
      }

      node.source = t.stringLiteral(source);
    }

    return [node];
  });

  if (!hadImports) {
    return;
  }

  content = recast.print(ast, {objectCurlySpacing: false, quote: 'single'}).code;
  fs.writeFileSync(file, content);
}

function getImportStatements(node, file, relative = true) {
  let source = node.source.value;
  let groups = {};
  for (let specifier of node.specifiers) {
    let importedName = specifier.type === 'ImportSpecifier' ? specifier.imported.name : specifier.local.name;
    if (!importedName || !importMap[source][importedName]) {
      continue;
    }
    let importSource = source;
    let [src, imported] = importMap[source][importedName];
    if (importMap[src] && importMap[src][imported]) {
      importSource = src;
      [src, imported] = importMap[src][imported];
    }

    if (src.startsWith('./')) {
      src = `${importSource}/${src.slice(2)}`;
      src = getRenamedSpecifier(src, file, importedName, relative);
    }
    groups[src] ||= [];
    if (node.type === 'ImportDeclaration') {
      groups[src].push(t.importSpecifier(specifier.local, t.identifier(imported)));
    } else if (node.type === 'ExportNamedDeclaration') {
      groups[src].push(t.exportSpecifier(t.identifier(imported), specifier.exported));
    }
  }
  
  let res = Object.entries(groups).map(([source, specifiers]) => {
    if (node.type === 'ImportDeclaration') {
      let decl = t.importDeclaration(specifiers, t.stringLiteral(source));
      decl.importKind = node.importKind;
      return decl;
    } else if (node.type === 'ExportNamedDeclaration') {
      let decl = t.exportNamedDeclaration(null, specifiers, t.stringLiteral(source));
      decl.exportKind = node.exportKind;
      return decl;
    }
  });

  if (res.length === 0) {
    return [node];
  }

  res[0].comments = node.leadingComments;
  return res;
}

function parsePackage(file) {
  return file.match(/packages\/((?:@[^/]+\/)?[^/]+)\/([^/]+)/).slice(1);
}

function getRenamedSpecifier(specifier, from, importedName, relative = true) {
  if (skipped.some(s => specifier.includes(s))) {
    return specifier;
  }

  let parts = specifier.split('/');
  let scope = parts.shift();
  let fullPkg = scope;
  let pkg = scope;
  let monopackage;
  if (scope === '@react-spectrum') {
    monopackage = '@adobe/react-spectrum';
  } else if (scope.startsWith('@')) {
    monopackage = scope.slice(1);
  } else {
    monopackage = scope;
  }

  if (pkg.startsWith('@')) {
    pkg = parts.shift();
    fullPkg += '/' + pkg;
  }

  let name = parts.join('/');

  let [fromPkg] = parsePackage(from);
  if (relative && fromPkg === monopackage) {
    let subpath = pkg === monopackage ? name : `${pkg}/${name}`;
    let fullPath = monopackage === 'react-aria-components' || monopackage === '@react-spectrum/s2'
      ? `packages/${monopackage}/src/${subpath}`
      : `packages/${monopackage}/src/${subpath}`;
    let relative = path.relative(path.dirname(from), fullPath);
    if (!relative.startsWith('.')) {
      relative = './' + relative;
    }
    return relative;
  }

  if (monopackage === 'react-aria-components' || monopackage === '@react-spectrum/s2') {
    return `${monopackage}/${name}`;
  }

  let isPrivate = privateNames.has(importedName);
  if (
    (monopackage === 'react-aria' && name === 'Virtualizer') ||
    (monopackage === '@adobe/react-spectrum' && (name === 'CardView' || name === 'Card' || name === 'Overlay' || name === 'Popover' || name === 'Modal' || name === 'StepList' || name === 'SearchAutocomplete'))
  ) {
    isPrivate = true;
  }

  let subpath = name;
  if (standalone.has(name) && !isPrivate) {
    subpath = name;
  } else if (parentFile[name] && !isPrivate) {
    subpath = parentFile[name];
  } else if (pkg === monopackage) {
    subpath = `private/${name}`;
  } else {
    subpath = `private/${pkg}/${name}`;
  }

  return `${monopackage}/${subpath}`;
}

function createPublicExports(monopackage, scope, pkg) {
  let file = `packages/${monopackage}/src/${pkg}/index.ts`;
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

  let groups = {};
  let unmatched = [];
  let specifiers = [];
  let typeSpecifiers = [];
  for (let node of ast.program.body) {
    if (node.type === 'ExportNamedDeclaration' && node.source) {
      if (node.source.value.startsWith('./')) {
        if (node.exportKind === 'type') {
          typeSpecifiers.push(...node.specifiers);
        } else {
          specifiers.push(...node.specifiers);
        }
      } else {
        let n = t.cloneNode(node, true);
        if (n.source.value.startsWith('../')) {
          n.source.value = `${monopackage}/private/${n.source.value.slice(3)}`;
        }
        unmatched.push(n);
      }

      node.specifiers = node.specifiers.filter(s => importMap[monopackage][s.exported.name]);
      if (node.source.value.startsWith('./') && node.specifiers.length > 0) {
        let source = node.source.value.slice(2);
        node.source.value = `${monopackage}/private/${pkg}/${source}`;
        if (standalone.has(source)) {
          groups[source] ||= [];
          groups[source].push(node);
        } else if (parentFile[source]) {
          groups[parentFile[source]] ||= [];
          groups[parentFile[source]].push(node);
        }
      }
    }
  }

  for (let source in groups) {
    groups[source][0].comments = ast.program.body[0].leadingComments;
    let content = recast.print({
      type: 'Program',
      body: groups[source].concat(unmatched)
    }, {objectCurlySpacing: false, quote: 'single'}).code;
    fs.writeFileSync(`packages/${monopackage}/exports/${path.basename(source)}.ts`, content);
  }

  fs.rmSync(file);
  
  let imports = [];
  if (specifiers.length) {
    imports.push(...getImportStatements(t.exportNamedDeclaration(null, specifiers, t.stringLiteral(`${scope}/${pkg}`)), `packages/${scope}/${pkg}/src/index.ts`, false));
  }
  if (typeSpecifiers.length) {
    let decl = t.exportNamedDeclaration(null, typeSpecifiers, t.stringLiteral(`${scope}/${pkg}`));
    decl.exportKind = 'type';
    imports.push(...getImportStatements(decl, `packages/${scope}/${pkg}/src/index.ts`, false));
  }
  imports.push(...unmatched);

  imports[0].comments = ast.program.body[0].leadingComments;
  let index = recast.print({
    type: 'Program',
    body: imports
  }, {objectCurlySpacing: false, quote: 'single'}).code;
  fs.mkdirSync(`packages/${scope}/${pkg}/src`);
  fs.writeFileSync(`packages/${scope}/${pkg}/src/index.ts`, index);
}
