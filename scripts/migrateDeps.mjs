import fs from 'fs';
import path from 'path';
import * as recast from 'recast';
import * as t from '@babel/types';
import {parse} from '@babel/parser';

const skipped = ['example-theme', 'test-utils', 'story-utils', 'style-macro-s1'];
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

standalone.add('CloseButton');
standalone.add('CustomDialog');
standalone.add('FullscreenDialog');
standalone.add('ImageCoordinator');
standalone.add('NotificationBadge');
standalone.add('SkeletonCollection');

// these are questionable.
standalone.add('ColorThumb');
standalone.add('FieldError');
standalone.add('Input');
standalone.add('Collection');
standalone.add('Label');
standalone.add('OverlayArrow');
standalone.add('SelectionIndicator');
standalone.add('SharedElementTransition');
standalone.add('pressScale');
standalone.add('theme-default');
standalone.add('theme-light');
standalone.add('theme-dark');

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
  'DateSegmentType': 'useDateFieldState',
  'DragAndDrop': 'useDragAndDrop'
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

function migrateScope(scope, monopackage) {
  prepareMonopackage(monopackage);

  for (let pkg of fs.globSync(`packages/${scope}/*`).sort()) {
    if (fs.statSync(pkg).isDirectory()) {
      let name = path.basename(pkg);
      if (skipped.includes(name) || name === 's2') {
        continue;
      }

      migratePackage(scope, name, monopackage);
    }
  }

  fs.renameSync(`packages/${monopackage}/src/index.ts`, `packages/${monopackage}/exports/index.ts`);
  rewriteMonopackageImports(`packages/${monopackage}/exports/index.ts`, monopackage, '');
}

function prepareMonopackage(monopackage) {
  let monopackageJSON = JSON.parse(fs.readFileSync(`packages/${monopackage}/package.json`, 'utf8'));
  monopackageJSON.source = 'exports/*.ts';
  if (!monopackageJSON.exports['.']) {
    monopackageJSON.exports = {
      '.': {
        source: './exports/index.ts',
        types: './dist/exports/index.d.ts',
        import: './dist/exports/index.mjs',
        require: './dist/exports/index.js'
      },
      './private/*': {
        source: ['./src/*.ts', './src/*.tsx'],
        types: ['./dist/private/*.d.ts'],
        import: './dist/private/*.mjs',
        require: './dist/private/*.js'
      },
      './*': {
        source: ['./exports/*.ts'],
        types: './dist/exports/*.d.ts',
        import: './dist/exports/*.mjs',
        require: './dist/exports/*.js'
      }
    };
  } else {
    // TODO
    monopackageJSON.exports = {
      '.': {
        source: './exports/index.ts',
        types: './dist/exports/index.d.ts',
        import: './dist/exports/index.mjs',
        require: './dist/exports/index.js'
      },
      './private/*': {
        source: ['./src/*.ts', './src/*.tsx'],
        types: ['./dist/private/*.d.ts'],
        import: './dist/private/*.mjs',
        require: './dist/private/*.js'
      },
      './*': {
        source: ['./exports/*.ts'],
        types: './dist/exports/*.d.ts',
        import: './dist/exports/*.mjs',
        require: './dist/exports/*.js'
      }
    };
  }

  monopackageJSON.targets = {
    main: false,
    module: false,
    types: false,
    "exports-module": {
      "source": "exports/*.ts",
      "distDir": "dist",
      "isLibrary": true,
      "outputFormat": "esmodule",
      "includeNodeModules": false
    },
    "exports-main": {
      "source": "exports/*.ts",
      "distDir": "dist",
      "isLibrary": true,
      "outputFormat": "commonjs",
      "includeNodeModules": false
    }
  };

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

  createPublicExports(`packages/${monopackage}/src/${name}/index.ts`, monopackage, scope, name);
}

function moveTree(scope, name, tree, monopackage) {
  if (fs.existsSync(`packages/${scope}/${name}/${tree}`)) {
    let monopackageTree = tree;
    fs.rmSync(`packages/${monopackage}/${monopackageTree}/${name}`, {recursive: true, force: true});
    fs.mkdirSync(`packages/${monopackage}/${monopackageTree}`, {recursive: true});
    fs.renameSync(`packages/${scope}/${name}/${tree}`, `packages/${monopackage}/${monopackageTree}/${name}`);

    for (let file of fs.globSync(`packages/${monopackage}/${monopackageTree}/${name}/**/*.{ts,tsx,js,jsx,mdx}`)) {
      // rewriteImports(file, scope, name);
      rewriteMonopackageImports(file, `${scope}/${name}`, name);
    }
  }
}

function migrateToMonopackage(pkg) {
  for (let file of fs.globSync(`packages/${pkg}/**/*.{ts,tsx,js,jsx,mdx}`)) {
    rewriteMonopackageImports(file, pkg, ''); // TODO: only src?
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

  packageJSON.exports['.'].source = './exports/index.ts';
  if (Array.isArray(packageJSON.exports['.'].types)) {
    packageJSON.exports['.'].types[1] = './exports/index.ts';
  }

  packageJSON.exports['./*'] = {
    source: './exports/*.ts',
    types: './dist/*.d.ts',
    import: './dist/*.mjs',
    require: './dist/*.cjs'
  };

  packageJSON.exports['./private/*'] = null;

  Object.assign(packageJSON.targets ??= {}, {
    main: false,
    module: false,
    types: false,
    "exports-module": {
      "source": "exports/*.ts",
      "distDir": "dist",
      "isLibrary": true,
      "outputFormat": "esmodule",
      "includeNodeModules": false
    },
    "exports-main": {
      "source": "exports/*.ts",
      "distDir": "dist",
      "isLibrary": true,
      "outputFormat": "commonjs",
      "includeNodeModules": false
    }
  });

  fs.writeFileSync(`packages/${pkg}/package.json`, JSON.stringify(packageJSON, false, 2) + '\n');

  fs.mkdirSync(`packages/${pkg}/exports`, {recursive: true});
  fs.renameSync(`packages/${pkg}/src/index.ts`, `packages/${pkg}/exports/index.ts`);
  createPublicExports(`packages/${pkg}/exports/index.ts`, pkg);

  fs.rmSync(`packages/${pkg}/index.ts`, {force: true});
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

function rewriteMonopackageImports(file, pkg, subpath) {
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
    } else if (source.startsWith('.') && pkg) {
      hadImports = true;
      if (source === '.' || source === './' || source === './index' || source === '../' || source === '..' || source === '../index' || source === '../src') {
        node.source = t.stringLiteral(pkg);
        return getImportStatements(node, file);
      } else if (source === '../package.json' && subpath) {
        source = '../../package.json';
      } else if (subpath) {
        source = source.replace(/\.\.\/(src|stories|chromatic|intl)/, (_, tree) => `../../${tree}/${subpath}`);
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
  let pkg = scope;
  if (pkg.startsWith('@')) {
    pkg = parts.shift();
  }

  let monopackage;
  if (scope === '@react-spectrum') {
    monopackage = pkg === 's2' ? '@react-spectrum/s2' : '@adobe/react-spectrum';
  } else if (scope.startsWith('@')) {
    monopackage = scope.slice(1);
  } else {
    monopackage = scope;
  }

  let name = parts.join('/');

  let [fromPkg] = parsePackage(from);
  if (relative && fromPkg === monopackage) {
    let subpath = pkg === monopackage || monopackage === '@react-spectrum/s2' ? name : `${pkg}/${name}`;
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
    (monopackage === '@adobe/react-spectrum' && (name === 'CardView' || name === 'Card' || name === 'Overlay' || name === 'Popover' || name === 'Modal' || name === 'StepList' || name === 'SearchAutocomplete' || name === 'Label'))
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

function createPublicExports(file, monopackage, scope, pkg) {
  if (!importMap[monopackage]) {
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
        node.source.value = pkg ? `${monopackage}/private/${pkg}/${source}` : `../src/${source}`;
        if (standalone.has(source) || (monopackage === 'react-aria-components' && source === 'utils')) {
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
      body: groups[source]
    }, {objectCurlySpacing: false, quote: 'single'}).code;
    fs.writeFileSync(`packages/${monopackage}/exports/${path.basename(source)}.ts`, content);
  }

  if (scope) {
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
}
