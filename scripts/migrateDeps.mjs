/* eslint-disable max-depth */
import fs from 'fs';
import {parse} from '@babel/parser';
import path from 'path';
import * as recast from 'recast';
import * as t from '@babel/types';

const skipped = ['example-theme', 'test-utils', 'story-utils', 'style-macro-s1'];
const importMap = {
  'react-aria': buildImportMap('packages/react-aria/src/index.ts'),
  'react-stately': buildImportMap('packages/react-stately/src/index.ts'),
  'react-aria-components': buildImportMap('packages/react-aria-components/src/index.ts'),
  '@react-spectrum/s2': buildImportMap('packages/@react-spectrum/s2/src/index.ts'),
  '@adobe/react-spectrum': buildImportMap('packages/@adobe/react-spectrum/src/index.ts')
};

for (let pkg of fs
  .globSync(['packages/@react-aria/*', 'packages/@react-spectrum/*', 'packages/@react-stately/*'])
  .sort()) {
  if (fs.statSync(pkg).isDirectory()) {
    let name = pkg.split('/').slice(1).join('/');
    if (skipped.includes(path.basename(pkg))) {
      let pkgJSON = JSON.parse(fs.readFileSync(`${pkg}/package.json`, 'utf8'));
      if (pkgJSON.types) {
        pkgJSON.types = './dist/types/src/index.d.ts';
        if (pkgJSON.exports) {
          pkgJSON.exports.types = pkgJSON.types;
        }
        pkgJSON.targets = {
          types: false
        };
        fs.writeFileSync(`${pkg}/package.json`, JSON.stringify(pkgJSON, false, 2) + '\n');
      }
      continue;
    }

    importMap[name] = buildImportMap(`${pkg}/src/index.ts`);
  }
}

for (let pkg of fs.globSync('packages/@internationalized/{message,string,date,number}')) {
  let pkgJSON = JSON.parse(fs.readFileSync(`${pkg}/package.json`, 'utf8'));
  if (pkgJSON.types) {
    pkgJSON.types = './dist/types/src/index.d.ts';
    pkgJSON.exports.types = pkgJSON.types;
    pkgJSON.targets = {
      types: false
    };
    fs.writeFileSync(`${pkg}/package.json`, JSON.stringify(pkgJSON, false, 2) + '\n');
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

standalone.add('useOverlayTrigger');
standalone.add('useId');
standalone.add('useToolbar');
standalone.add('Virtualizer');

standalone.add('defaultTheme');
standalone.add('darkTheme');
standalone.add('lightTheme');

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

// Documented but not in the monopackage.
standalone.delete('useAutocomplete');
standalone.delete('useAutocompleteState');
standalone.delete('useToolbar');

// Public but grouped with a parent component/hook.
let parentFile = {
  useBreadcrumbItem: 'useBreadcrumbs',
  useCalendarCell: 'useCalendar',
  useCalendarGrid: 'useCalendar',
  useCheckboxGroupItem: 'useCheckboxGroup',
  // 'CollectionBuilder': '',
  useColorChannelField: 'useColorField',
  useDateSegment: 'useDateField',
  useDraggableItem: 'useDraggableCollection',
  useDropIndicator: 'useDroppableCollection',
  useDroppableItem: 'useDroppableCollection',
  // 'utils': '',
  useGridListItem: 'useGridList',
  useGridListSection: 'useGridList',
  useGridListSelectionCheckbox: 'useGridList',
  // 'useFocusable': '',
  // 'useInteractOutside': '',
  // 'useScrollWheel': '',
  useListBoxSection: 'useListBox',
  useOption: 'useListBox',
  useMenuItem: 'useMenu',
  useMenuSection: 'useMenu',
  useMenuTrigger: 'useMenu',
  useSubmenuTrigger: 'useMenu',
  DismissButton: 'Overlay',
  // 'useModal': '',
  // 'useOverlay': '',
  // 'useOverlayPosition': '',
  // 'useOverlayTrigger': '',
  // 'usePreventScroll': '',
  useRadio: 'useRadioGroup',
  HiddenSelect: 'useSelect',
  useSliderThumb: 'useSlider',
  useTableCell: 'useTable',
  useTableColumnHeader: 'useTable',
  useTableColumnResize: 'useTable',
  useTableHeaderRow: 'useTable',
  useTableRow: 'useTable',
  useTableRowGroup: 'useTable',
  useTableSelectionCheckbox: 'useTable',
  useTab: 'useTabList',
  useTabPanel: 'useTabList',
  useTag: 'useTagGroup',
  useToastRegion: 'useToast',
  useTooltip: 'useTooltipTrigger',
  ToastContainer: 'Toast',
  // 'useTree': '',
  // 'chain': '',
  // 'openLink': '',
  ActionBarContainer: 'ActionBar',
  useDialogContainer: 'DialogContainer',
  Radio: 'RadioGroup',
  // 'TableViewWrapper': '',
  TooltipTrigger: 'Tooltip',
  // 'types': '',
  // 'useCollection': '',
  useColorChannelFieldState: 'useColorFieldState',
  // 'useFormValidationState': '',
  useSubmenuTriggerState: 'useMenuTriggerState',
  // 'types': '',
  useTableColumnResizeState: 'useTableState',
  Layout: 'Virtualizer',
  LayoutInfo: 'Virtualizer',
  Point: 'Virtualizer',
  Rect: 'Virtualizer',
  Size: 'Virtualizer',
  DateSegmentType: 'useDateFieldState',
  DragAndDrop: 'useDragAndDrop',
  parseColor: 'Color',
  useLocale: 'I18nProvider',
  ColorEditor: 'ColorPicker',
  SubmenuTrigger: 'Menu',
  ContextualHelpTrigger: 'Menu',
  MenuTrigger: 'Menu'
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
for (let pkg of [
  'react-aria',
  'react-stately',
  'react-aria-components',
  '@react-spectrum/s2',
  '@adobe/react-spectrum'
]) {
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

// Special case
rewriteMonopackageImports('packages/@internationalized/number/test/NumberParser.test.js');

writePrivateExports();

for (let f of fs.globSync('packages/dev/s2-docs/pages/**/*.mdx')) {
  rewriteMdx(f);
}

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
  monopackageJSON.source = 'exports/index.ts';
  if (monopackageJSON.exports && !monopackageJSON.exports['.']) {
    monopackageJSON.exports = {
      '.': monopackageJSON.exports
    };
  }

  Object.assign((monopackageJSON.exports ??= {}), {
    '.': {
      source: './exports/index.ts',
      types: './dist/types/exports/index.d.ts',
      import: './dist/exports/index.mjs',
      require: './dist/exports/index.cjs'
    },
    './package.json': './package.json',
    './*': {
      source: './exports/*.ts',
      types: './dist/types/exports/*.d.ts',
      import: './dist/exports/*.mjs',
      require: './dist/exports/*.cjs'
    }
  });

  let includeNodeModules = false;
  if (monopackage === '@adobe/react-spectrum') {
    includeNodeModules = ['@adobe/spectrum-css-temp'];
  }

  monopackageJSON.targets = {
    main: false,
    module: false,
    types: false,
    'exports-module': {
      source: ['exports/**/*.ts'],
      distDir: 'dist',
      isLibrary: true,
      outputFormat: 'esmodule',
      includeNodeModules: includeNodeModules
    },
    'exports-main': {
      source: ['exports/**/*.ts'],
      distDir: 'dist',
      isLibrary: true,
      outputFormat: 'commonjs',
      includeNodeModules: includeNodeModules
    }
  };

  for (let dep in monopackageJSON.dependencies || {}) {
    let depScope = dep.match(/@(react-aria|react-spectrum|react-stately)/);
    if (depScope) {
      let p = depScope[1] === 'react-spectrum' ? '@adobe/react-spectrum' : depScope[1];
      if (!monopackageJSON.dependencies[p]) {
        monopackageJSON.dependencies[p] = JSON.parse(
          fs.readFileSync(`packages/${p}/package.json`, 'utf8')
        ).version;
      }
      delete monopackageJSON.dependencies[dep];
    }
  }

  if (monopackage === '@adobe/react-spectrum') {
    monopackageJSON.devDependencies['@adobe/spectrum-css-temp'] = '3.0.0-alpha.1';
    monopackageJSON.sideEffects = ['*.css'];
  }

  fs.mkdirSync(`packages/${monopackage}/exports`, {recursive: true});
  fs.writeFileSync(
    `packages/${monopackage}/package.json`,
    JSON.stringify(monopackageJSON, false, 2) + '\n'
  );
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

  for (let dep in packageJSON.dependencies || {}) {
    let depScope = dep.match(/@(react-aria|react-spectrum|react-stately)/);
    if (!depScope && !monopackageJSON.dependencies[dep]) {
      monopackageJSON.dependencies[dep] = packageJSON.dependencies[dep];
    } else if (depScope && depScope[0] !== scope && !monopackageJSON.dependencies[depScope[1]]) {
      monopackageJSON.dependencies[depScope[1]] = JSON.parse(
        fs.readFileSync(`packages/${depScope[1]}/package.json`, 'utf8')
      ).version;
    }

    if (depScope) {
      let p = depScope[1] === 'react-spectrum' ? '@adobe/react-spectrum' : depScope[1];
      if (!packageJSON.dependencies[p]) {
        packageJSON.dependencies[p] =
          '^' + JSON.parse(fs.readFileSync(`packages/${p}/package.json`, 'utf8')).version;
      }
      delete packageJSON.dependencies[dep];
    }
  }

  fs.writeFileSync(
    `packages/${monopackage}/package.json`,
    JSON.stringify(monopackageJSON, false, 2) + '\n'
  );

  packageJSON.source = 'src/index.ts';
  packageJSON.dependencies[monopackage] = '^' + monopackageJSON.version;
  packageJSON.targets = {
    types: false // TODO: i18n package
  };

  if (!packageJSON.exports['.']) {
    packageJSON.exports = {
      '.': {...packageJSON.exports}
    };
  }
  packageJSON.exports['./package.json'] = './package.json';

  Object.assign((packageJSON.peerDependencies ??= {}), {
    react: '^16.8.0 || ^17.0.0-rc.1 || ^18.0.0 || ^19.0.0-rc.1',
    'react-dom': '^16.8.0 || ^17.0.0-rc.1 || ^18.0.0 || ^19.0.0-rc.1'
  });

  delete packageJSON.peerDependencies['@react-spectrum/provider'];

  fs.writeFileSync(
    `packages/${scope}/${name}/package.json`,
    JSON.stringify(packageJSON, false, 2) + '\n'
  );
  fs.rmSync(`packages/${scope}/${name}/index.ts`);

  createPublicExports(`packages/${monopackage}/src/${name}/index.ts`, monopackage, scope, name);
}

function moveTree(scope, name, tree, monopackage) {
  if (fs.existsSync(`packages/${scope}/${name}/${tree}`)) {
    let monopackageTree = tree;
    fs.rmSync(`packages/${monopackage}/${monopackageTree}/${name}`, {recursive: true, force: true});
    fs.mkdirSync(`packages/${monopackage}/${monopackageTree}`, {recursive: true});
    fs.renameSync(
      `packages/${scope}/${name}/${tree}`,
      `packages/${monopackage}/${monopackageTree}/${name}`
    );

    for (let file of fs.globSync(
      `packages/${monopackage}/${monopackageTree}/${name}/**/*.{ts,tsx,js,jsx,mdx}`
    )) {
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
        packageJSON.dependencies[p] = JSON.parse(
          fs.readFileSync(`packages/${p}/package.json`, 'utf8')
        ).version;
      }
      delete packageJSON.dependencies[dep];
    }
  }

  if (!packageJSON.exports['.']) {
    packageJSON.exports = {
      '.': packageJSON.exports
    };
  }

  packageJSON.source = 'exports/index.ts';
  packageJSON.exports['.'].source = './exports/index.ts';

  packageJSON.types = './dist/types/exports/index.ts';
  packageJSON.exports['.'].types = './dist/types/exports/index.ts';

  packageJSON.main = './dist/exports/index.cjs';
  packageJSON.exports['.'].require = './dist/exports/index.cjs';

  packageJSON.module = './dist/exports/index.mjs';
  packageJSON.exports['.'].import = './dist/exports/index.mjs';

  packageJSON.exports['./package.json'] = './package.json';
  packageJSON.exports['./*'] = {
    source: './exports/*.ts',
    types: './dist/types/exports/*.d.ts',
    import: './dist/exports/*.mjs',
    require: './dist/exports/*.cjs'
  };

  packageJSON.exports['./private/*'] = null;

  delete packageJSON['style-types'];
  if (packageJSON.targets) {
    delete packageJSON.targets['style-types'];
  }
  Object.assign((packageJSON.targets ??= {}), {
    main: false,
    module: false,
    types: false,
    'exports-module': {
      source: 'exports/*.ts',
      distDir: 'dist',
      isLibrary: true,
      outputFormat: 'esmodule',
      includeNodeModules: false
    },
    'exports-main': {
      source: 'exports/*.ts',
      distDir: 'dist',
      isLibrary: true,
      outputFormat: 'commonjs',
      includeNodeModules: false
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
        let name =
          specifier.exported.type === 'Identifier'
            ? specifier.exported.name
            : specifier.exported.value;
        map[name] = [node.source.value, specifier.local.name];
      }
    }
  }

  return map;
}

function rewriteMonopackageImports(file, pkg, subpath) {
  if (path.extname(file) === '.mdx') {
    rewriteMdx(file);
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
    if (
      !(
        (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration') &&
        node.source
      )
    ) {
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
      if (
        source === '.' ||
        source === './' ||
        source === './index' ||
        source === '../' ||
        source === '..' ||
        source === '../index' ||
        source === '../src'
      ) {
        node.source = t.stringLiteral(pkg);
        return getImportStatements(node, file);
      } else if (source === '../package.json' && subpath) {
        source = '../../package.json';
      } else if (subpath) {
        source = source.replace(
          /\.\.\/(src|stories|chromatic|intl)/,
          (_, tree) => `../../${tree}/${subpath}`
        );
      }
      node.source = t.stringLiteral(source);
    } else if (
      source.startsWith('/packages/') &&
      !source.startsWith('/packages/@internationalized/')
    ) {
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
    } else {
      switch (source) {
        case '@react-aria/table/test/tableResizingTests.tsx':
          node.source.value = 'react-aria/test/table/tableResizingTests.tsx';
          hadImports = true;
          break;
        case '@react-aria/dnd/test/mocks':
          node.source.value = 'react-aria/test/dnd/mocks';
          hadImports = true;
          break;
        case '@react-aria/dnd/src/constants':
          node.source.value = 'react-aria/src/dnd/constants';
          hadImports = true;
          break;
        case '@react-aria/dnd/test/examples':
          node.source.value = 'react-aria/test/dnd/examples';
          hadImports = true;
          break;
        case '@react-aria/dnd/src/utils':
          node.source.value = 'react-aria/src/dnd/utils';
          hadImports = true;
          break;
        case '@react-aria/numberfield/intl/*.json':
          node.source.value = 'react-aria/intl/numberfield/*.json';
          hadImports = true;
          break;
      }
    }

    return [node];
  });

  t.traverseFast(ast.program, node => {
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'jest' &&
      (node.callee.property.name === 'mock' || node.callee.property.name === 'requireActual') &&
      node.arguments[0]?.type === 'StringLiteral'
    ) {
      // Hard coding special cases here
      switch (node.arguments[0].value) {
        case '@react-aria/live-announcer':
          node.arguments[0].value = file.startsWith('packages/react-aria/')
            ? '../../src/live-announcer/LiveAnnouncer'
            : 'react-aria/src/live-announcer/LiveAnnouncer';
          break;
        case '@react-aria/utils/src/scrollIntoView':
          node.arguments[0].value = file.startsWith('packages/react-aria/')
            ? '../../src/utils/scrollIntoView'
            : 'react-aria/src/utils/scrollIntoView';
          break;
        case '@react-aria/utils':
          node.arguments[0].value = '../../src/utils/focusWithoutScrolling';
          break;
        default:
          console.log(node.arguments[0].value);
      }
    }
  });

  if (!hadImports) {
    return;
  }

  content = recast.print(ast, {objectCurlySpacing: false, quote: 'single'}).code;
  fs.writeFileSync(file, content);
}

function rewriteMdx(file) {
  let contents = fs.readFileSync(file, 'utf8');
  contents = contents
    .replace(
      /\/packages\/@(react-aria|react-spectrum|react-stately)\/(.+?)\/docs\/(.+\.svg)/g,
      (_, scope, pkg, file) => {
        let monopackage = scope === 'react-spectrum' ? '@adobe/react-spectrum' : scope;
        return `/packages/${monopackage}/docs/${pkg}/${file}`;
      }
    )
    .replace(
      /(['"])@(react-aria|react-spectrum|react-stately)\/(.+?)\/docs\/(.+\.svg)/g,
      (_, q, scope, pkg, file) => {
        let monopackage = scope === 'react-spectrum' ? '@adobe/react-spectrum' : scope;
        return `${q}/packages/${monopackage}/docs/${pkg}/${file}`;
      }
    );

  fs.writeFileSync(file, contents);
}

function getImportStatements(node, file, relative = true) {
  let source = node.source.value;
  let groups = {};
  for (let specifier of node.specifiers) {
    let importedName =
      specifier.type === 'ImportSpecifier' ? specifier.imported.name : specifier.local.name;
    if (!importedName) {
      continue;
    }
    let local = node.type === 'ImportDeclaration' ? specifier.local : specifier.exported;
    let importSource = source;
    let src, imported;
    if (source === '@react-spectrum/theme-default') {
      src = file.includes('@adobe/react-spectrum')
        ? path.relative(
            path.dirname(file),
            'packages/@adobe/react-spectrum/src/theme-default/defaultTheme'
          )
        : '@adobe/react-spectrum/defaultTheme';
      imported = 'defaultTheme';
      local = file.includes('@react-spectrum') ? t.identifier('theme') : local;
    } else if (source === '@react-spectrum/theme-dark') {
      src = file.includes('@adobe/react-spectrum')
        ? path.relative(
            path.dirname(file),
            'packages/@adobe/react-spectrum/src/theme-dark/darkTheme'
          )
        : '@adobe/react-spectrum/darkTheme';
      imported = 'darkTheme';
      local = file.includes('@react-spectrum') ? t.identifier('theme') : local;
    } else if (source === '@react-spectrum/theme-light') {
      src = file.includes('@adobe/react-spectrum')
        ? path.relative(
            path.dirname(file),
            'packages/@adobe/react-spectrum/src/theme-light/lightTheme'
          )
        : '@adobe/react-spectrum/lightTheme';
      imported = 'lightTheme';
      local = file.includes('@react-spectrum') ? t.identifier('theme') : local;
    } else if (source === '@react-spectrum/theme-express') {
      src = file.includes('@adobe/react-spectrum')
        ? path.relative(
            path.dirname(file),
            'packages/@adobe/react-spectrum/src/theme-express/expressTheme'
          )
        : '@adobe/react-spectrum/private/theme-express/expressTheme';
      imported = 'expressTheme';
      local = file.includes('@react-spectrum') ? t.identifier('theme') : local;
    } else if (!importMap[source][importedName]) {
      continue;
    } else {
      [src, imported] = importMap[source][importedName];
      while (importMap[src] && importMap[src][imported]) {
        importSource = src;
        [src, imported] = importMap[src][imported];
      }
    }

    if (src.startsWith('./')) {
      src = `${importSource}/${src.slice(2)}`;
      src = getRenamedSpecifier(src, file, importedName, relative);
    }
    groups[src] ||= [];
    if (node.type === 'ImportDeclaration') {
      groups[src].push(t.importSpecifier(local, t.identifier(imported)));
    } else if (node.type === 'ExportNamedDeclaration') {
      groups[src].push(t.exportSpecifier(t.identifier(imported), local));
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
    let subpath =
      pkg === monopackage || monopackage === '@react-spectrum/s2' ? name : `${pkg}/${name}`;
    let fullPath =
      monopackage === 'react-aria-components' || monopackage === '@react-spectrum/s2'
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

  if (specifier === '@react-spectrum/theme-default') {
    return '@adobe/react-spectrum/defaultTheme';
  }

  if (specifier === '@react-spectrum/theme-dark') {
    return '@adobe/react-spectrum/darkTheme';
  }

  if (specifier === '@react-spectrum/theme-light') {
    return '@adobe/react-spectrum/lightTheme';
  }

  let isPrivate = importedName == null || privateNames.has(importedName);
  if (
    ((monopackage === 'react-aria' || monopackage === 'react-stately') &&
      (name === 'Virtualizer' || parentFile[name] === 'Virtualizer')) ||
    (monopackage === '@adobe/react-spectrum' &&
      (name === 'CardView' ||
        name === 'Card' ||
        name === 'Overlay' ||
        name === 'Popover' ||
        name === 'Modal' ||
        name === 'StepList' ||
        name === 'SearchAutocomplete' ||
        name === 'Label'))
  ) {
    isPrivate = true;
  }

  let subpath = name;
  if (standalone.has(name) && !isPrivate) {
    subpath = name;
  } else if (parentFile[name] && !isPrivate) {
    subpath = parentFile[name];
  } else if (name === 'Column' && monopackage === '@adobe/react-spectrum') {
    subpath = 'TableView';
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
        unmatched.push(node);
      }

      node.specifiers = node.specifiers.filter(s => {
        if (s.exported.name === 'theme') {
          s.exported = s.local;
          return true;
        }
        return importMap[monopackage][s.exported.name];
      });
      if (node.source.value.startsWith('./') && node.specifiers.length > 0) {
        let source = node.source.value.slice(2);
        node.source.value = pkg ? `../src/${pkg}/${source}` : `../src/${source}`;
        if (
          standalone.has(source) ||
          (monopackage === 'react-aria-components' && source === 'utils')
        ) {
          groups[source] ||= [];
          groups[source].push(node);
        } else if (parentFile[source]) {
          groups[parentFile[source]] ||= [];
          groups[parentFile[source]].push(node);
        }
      }
    }
  }

  if (scope && unmatched.length) {
    for (let node of unmatched) {
      for (let key in groups) {
        let n = t.cloneNode(node, true);
        if (n.source.value.startsWith('../')) {
          n.source.value = path.relative(
            `packages/${monopackage}/exports`,
            `packages/${monopackage}/src/${n.source.value.slice(3)}`
          );
        }
        groups[key].push(n);
      }
    }
  }

  for (let source in groups) {
    let f = `packages/${monopackage}/exports/${path.basename(source)}.ts`;
    let body = groups[source];
    if (monopackage === 'react-aria-components') {
      body = [ast.program.body[0], ...body]; // import 'client-only';
    } else {
      groups[source][0].comments = ast.program.body[0].leadingComments;
    }
    let content = recast.print(
      {
        type: 'Program',
        body
      },
      {objectCurlySpacing: false, quote: 'single'}
    ).code;
    fs.writeFileSync(f, content);
  }

  if (scope) {
    fs.rmSync(file);

    let imports = [];
    if (specifiers.length) {
      imports.push(
        ...getImportStatements(
          t.exportNamedDeclaration(null, specifiers, t.stringLiteral(`${scope}/${pkg}`)),
          `packages/${scope}/${pkg}/src/index.ts`,
          false
        )
      );
    }
    if (typeSpecifiers.length) {
      let decl = t.exportNamedDeclaration(null, typeSpecifiers, t.stringLiteral(`${scope}/${pkg}`));
      decl.exportKind = 'type';
      imports.push(...getImportStatements(decl, `packages/${scope}/${pkg}/src/index.ts`, false));
    }
    for (let node of unmatched) {
      let n = t.cloneNode(node, true);
      if (n.source.value.startsWith('../')) {
        n.source.value = `${monopackage}/private/${n.source.value.slice(3)}`;
      }
      imports.push(n);
    }

    imports[0].comments = ast.program.body[0].leadingComments;
    let index = recast.print(
      {
        type: 'Program',
        body: imports
      },
      {objectCurlySpacing: false, quote: 'single'}
    ).code;
    fs.mkdirSync(`packages/${scope}/${pkg}/src`);
    fs.writeFileSync(`packages/${scope}/${pkg}/src/index.ts`, index);
  }
}

function writePrivateExports() {
  let privateExports = {};

  for (let file of fs.globSync('packages/**/*.{ts,tsx,js}')) {
    let content = fs.readFileSync(file, 'utf8');
    let ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'importAttributes'],
      sourceFilename: file,
      tokens: true,
      errorRecovery: true
    });

    for (let item of ast.program.body) {
      if (
        item.type === 'ImportDeclaration' ||
        (item.type === 'ExportNamedDeclaration' && item.source)
      ) {
        if (item.source.value.includes('/private/')) {
          privateExports[item.source.value] ??= new Set();
          for (let specifier of item.specifiers) {
            let importedName =
              specifier.type === 'ImportSpecifier' ? specifier.imported.name : specifier.local.name;
            privateExports[item.source.value].add(importedName);
          }
        }
      }
    }
  }

  console.log(privateExports);
  for (let specifier in privateExports) {
    let file = `packages/${specifier.replace('/private/', '/exports/private/')}.ts`;
    fs.mkdirSync(path.dirname(file), {recursive: true});

    let contents = 'export {';
    let first = true;
    for (let exp of privateExports[specifier]) {
      if (!first) {
        contents += ', ';
      }
      first = false;
      if (
        (!/^(use|UNSTABLE_use)/.test(exp) &&
          /(Aria|Props|State|Options)$/.test(exp) &&
          exp !== 'filterDOMProps' &&
          exp !== 'getSyntheticLinkProps' &&
          exp !== 'baseStyleProps' &&
          exp !== 'viewStyleProps' &&
          exp !== 'convertStyleProps') ||
        exp === 'LayoutNode' ||
        exp === 'MultipleSelectionManager' ||
        exp === 'RectCorner' ||
        exp === 'InvalidationContext' ||
        exp === 'CollectionBuilderContext' ||
        exp === 'PartialNode' ||
        exp === 'Modality' ||
        exp === 'SelectableItemStates' ||
        exp === 'RTLOffsetType' ||
        exp === 'FormatMessage' ||
        exp === 'FocusVisibleHandler' ||
        exp === 'IconPropsWithoutChildren' ||
        exp === 'IllustrationPropsWithoutChildren' ||
        exp === 'UIIconPropsWithoutChildren' ||
        exp === 'StyleHandlers' ||
        exp === 'Filter' ||
        exp === 'Locale'
      ) {
        contents += 'type ';
      }
      contents += exp;
    }

    contents += '} from ';

    let originalFile = `packages/${specifier.replace('/private/', '/src/')}`;
    specifier = path.relative(path.dirname(file), originalFile);

    contents += `'${specifier}'` + ';\n';
    fs.writeFileSync(file, contents);
  }
}
