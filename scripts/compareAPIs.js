
let fs = require('fs');
let fg = require('fast-glob');
let path = require('path');
let util = require('util');
let chalk = require('chalk');
let Diff = require('diff');
const {parseArgs} = require('util');


const args = parseArgs({
  options: {
    verbose: {
      short: 'v',
      type: 'boolean'
    },
    rawNames: {
      type: 'boolean'
    },
    package: {
      type: 'string'
    },
    interface: {
      type: 'string'
    },
    isCI: {
      type: 'boolean'
    },
    'branch-api-dir': {
      type: 'string'
    },
    'compare-v3-s2': {
      type: 'boolean'
    }
  }
});

let allChanged = new Set();

// {'useSliderState' => [ 'SliderStateOptions', 'SliderState' ], ... }
let dependantOnLinks = new Map();
let currentlyProcessing = '';
let depth = 0;

// Style props from @react-spectrum/utils/src/styleProps.ts that should be excluded from diffs
// These are baseStyleProps and viewStyleProps
let stylePropsToExclude = new Set([
  // baseStyleProps
  'margin', 'marginStart', 'marginEnd', 'marginTop', 'marginBottom', 'marginX', 'marginY',
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  'isHidden', 'alignSelf', 'justifySelf',
  'position', 'zIndex', 'top', 'bottom', 'start', 'end', 'left', 'right',
  'order', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
  'gridArea', 'gridColumn', 'gridColumnEnd', 'gridColumnStart', 'gridRow', 'gridRowEnd', 'gridRowStart',
  // viewStyleProps (additional to baseStyleProps)
  'backgroundColor',
  'borderWidth', 'borderStartWidth', 'borderEndWidth', 'borderLeftWidth', 'borderRightWidth',
  'borderTopWidth', 'borderBottomWidth', 'borderXWidth', 'borderYWidth',
  'borderColor', 'borderStartColor', 'borderEndColor', 'borderLeftColor', 'borderRightColor',
  'borderTopColor', 'borderBottomColor', 'borderXColor', 'borderYColor',
  'borderRadius', 'borderTopStartRadius', 'borderTopEndRadius', 'borderBottomStartRadius',
  'borderBottomEndRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  'padding', 'paddingStart', 'paddingEnd', 'paddingLeft', 'paddingRight',
  'paddingTop', 'paddingBottom', 'paddingX', 'paddingY',
  'overflow'
]);

// Mapping of S2 component names to their v3 package locations
// Format: 'S2ComponentName': {package: '@react-spectrum/packagename', component: 'ComponentName'}
let s2ToV3ComponentMap = {
  'ActionButton': {package: '@react-spectrum/button', component: 'ActionButton'},
  'ActionButtonGroup': {package: '@react-spectrum/actiongroup', component: 'ActionGroup'},
  'ActionMenu': {package: '@react-spectrum/menu', component: 'ActionMenu'},
  'AlertDialog': {package: '@react-spectrum/dialog', component: 'AlertDialog'},
  'Breadcrumb': {package: '@react-stately/collections', component: 'Item'},
  'CheckboxGroup': {package: '@react-spectrum/checkbox', component: 'CheckboxGroup'},
  'ColorArea': {package: '@react-spectrum/color', component: 'ColorArea'},
  'ColorField': {package: '@react-spectrum/color', component: 'ColorField'},
  'ColorSlider': {package: '@react-spectrum/color', component: 'ColorSlider'},
  'ColorWheel': {package: '@react-spectrum/color', component: 'ColorWheel'},
  'Column': {package: '@react-spectrum/table', component: 'Column'},
  'ComboBoxItem': {package: '@react-stately/collections', component: 'Item'},
  'ComboBoxSection': {package: '@react-stately/collections', component: 'Section'},
  'Content': {package: '@react-spectrum/view', component: 'Content'},
  'DateField': {package: '@react-spectrum/datepicker', component: 'DateField'},
  'DateRangePicker': {package: '@react-spectrum/datepicker', component: 'DateRangePicker'},
  'DialogContainer': {package: '@react-spectrum/dialog', component: 'DialogContainer'},
  'DialogTrigger': {package: '@react-spectrum/dialog', component: 'DialogTrigger'},
  'Disclosure': {package: '@react-spectrum/accordion', component: 'Disclosure'},
  'DisclosureHeader': {package: '@react-spectrum/accordion', component: 'DisclosureTitle'},
  'DisclosurePanel': {package: '@react-spectrum/accordion', component: 'DisclosurePanel'},
  'DisclosureTitle': {package: '@react-spectrum/accordion', component: 'DisclosureTitle'},
  'AccordionItem': {package: '@react-spectrum/accordion', component: 'Disclosure'},
  'AccordionItemTitle': {package: '@react-spectrum/accordion', component: 'DisclosureTitle'},
  'AccordionItemPanel': {package: '@react-spectrum/accordion', component: 'DisclosurePanel'},
  'AccordionItemHeader': {package: '@react-spectrum/accordion', component: 'DisclosureTitle'},
  'Footer': {package: '@react-spectrum/view', component: 'Footer'},
  'Header': {package: '@react-spectrum/view', component: 'Header'},
  'Heading': {package: '@react-spectrum/text', component: 'Heading'},
  'Keyboard': {package: '@react-spectrum/text', component: 'Keyboard'},
  'MenuItem': {package: '@react-stately/collections', component: 'Item'},
  'MenuSection': {package: '@react-stately/collections', component: 'Section'},
  'MenuTrigger': {package: '@react-spectrum/menu', component: 'MenuTrigger'},
  'PickerItem': {package: '@react-stately/collections', component: 'Item'},
  'PickerSection': {package: '@react-stately/collections', component: 'Section'},
  'ProgressBar': {package: '@react-spectrum/progress', component: 'ProgressBar'},
  'ProgressCircle': {package: '@react-spectrum/progress', component: 'ProgressCircle'},
  'RadioGroup': {package: '@react-spectrum/radio', component: 'RadioGroup'},
  'RangeCalendar': {package: '@react-spectrum/calendar', component: 'RangeCalendar'},
  'RangeSlider': {package: '@react-spectrum/slider', component: 'RangeSlider'},
  'Row': {package: '@react-spectrum/table', component: 'Row'},
  'Tab': {package: '@react-spectrum/tabs', component: 'Item'},
  'TabList': {package: '@react-spectrum/tabs', component: 'TabList'},
  'TabPanel': {package: '@react-spectrum/tabs', component: 'Item'},
  'TableBody': {package: '@react-spectrum/table', component: 'TableBody'},
  'TableHeader': {package: '@react-spectrum/table', component: 'TableHeader'},
  'TableView': {package: '@react-spectrum/table', component: 'TableView'},
  'TagGroup': {package: '@react-spectrum/tag', component: 'TagGroup'},
  'Tag': {package: '@react-stately/collections', component: 'Item'},
  'TextArea': {package: '@react-spectrum/textfield', component: 'TextArea'},
  'TimeField': {package: '@react-spectrum/datepicker', component: 'TimeField'},
  'ToggleButton': {package: '@react-spectrum/button', component: 'ToggleButton'},
  'ToggleButtonGroup': {package: '@react-spectrum/actiongroup', component: 'ActionGroup'},
  'TooltipTrigger': {package: '@react-spectrum/tooltip', component: 'TooltipTrigger'},
  'TreeView': {package: '@react-spectrum/tree', component: 'TreeView'},
  'TreeViewItem': {package: '@react-spectrum/tree', component: 'TreeViewItem'},
  'TreeViewItemContent': {package: '@react-spectrum/tree', component: 'TreeViewItemContent'}
};

compare().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

function readJsonSync(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to read JSON from ${filePath}: ${error.message}`);
  }
}

/**
 * This takes the json files generated by the buildBranchAPI and buildPublishedAPI and
 * reconstructs our interfaces and create a graph of all dependencies between interfaces.
 * From there, we diff the reconstructed interfaces and track all that have changes.
 * We use the graph to communicate what interfaces have changed as a result of a
 * dependency changing.
 * We build up strings of the diffs and make them easy to read in both a github comment
 * as well as the local console.
 */
async function compare() {
  let branchDir = args.values['branch-api-dir'] || path.join(__dirname, '..', 'dist', 'branch-api');
  let pairs = [];

  if (args.values['compare-v3-s2']) {
    // Compare v3 vs s2 components within branch-api only
    if (!fs.existsSync(branchDir)) {
      console.log(chalk.redBright(`branchDir ${branchDir} does not exist`));
      return;
    }

    let branchAPIs = fg.sync(`${branchDir}/**/api.json`);

    // Find the s2 API file
    let s2Api = branchAPIs.find(api => api.includes('@react-spectrum/s2/dist/api.json'));
    if (!s2Api) {
      console.log(chalk.redBright('Could not find @react-spectrum/s2 API'));
      return;
    }

    let s2ApiData = getAPI(s2Api);
    let s2ComponentsWithoutMatch = [];
    let v3ComponentsWithoutMatch = [];
    let matchedV3Packages = new Set();

    // For each export in s2, try to find matching v3 component
    for (let exportName of Object.keys(s2ApiData.exports)) {
      // Skip hooks (exports starting with 'use')
      if (exportName.startsWith('use')) {
        continue;
      }

      let exportItem = s2ApiData.exports[exportName];
      // Only process components
      if (exportItem?.type !== 'component') {
        continue;
      }

      // Find matching v3 component package
      let v3PackageName, v3ComponentName;

      // Check if there's a custom mapping for this component
      if (s2ToV3ComponentMap[exportName]) {
        v3PackageName = s2ToV3ComponentMap[exportName].package;
        v3ComponentName = s2ToV3ComponentMap[exportName].component;
      } else {
        // Default: use lowercase component name as package name
        let componentName = exportName.toLowerCase();
        v3PackageName = `@react-spectrum/${componentName}`;
        v3ComponentName = exportName;
      }

      let v3Api = branchAPIs.find(api => api.includes(`${v3PackageName}/dist/api.json`));

      if (v3Api) {
        // Check if it's not a react-aria package
        let v3PackageJson = readJsonSync(path.join(v3Api, '..', '..', 'package.json'));
        if (!v3PackageJson.name.includes('@react-aria/')) {
          pairs.push({
            v3Api,
            s2Api,
            componentName: exportName,
            v3PackageName: v3PackageJson.name,
            v3ComponentName: v3ComponentName
          });
          matchedV3Packages.add(v3PackageJson.name);
        }
      } else {
        s2ComponentsWithoutMatch.push(exportName);
      }
    }

    // Find v3 @react-spectrum components that weren't matched
    for (let apiPath of branchAPIs) {
      if (!apiPath.includes('@react-spectrum/') || apiPath.includes('@react-spectrum/s2/')) {
        continue;
      }

      let pkgJsonPath = path.join(apiPath, '..', '..', 'package.json');
      if (!fs.existsSync(pkgJsonPath)) {
        continue;
      }

      let pkgJson = readJsonSync(pkgJsonPath);

      // Skip if not a react-spectrum package, or if it's react-aria
      if (!pkgJson.name.startsWith('@react-spectrum/') || pkgJson.name.includes('@react-aria/')) {
        continue;
      }

      // Skip if it was already matched
      if (matchedV3Packages.has(pkgJson.name)) {
        continue;
      }

      // Check if it has any component exports (not just hooks)
      let apiData = getAPI(apiPath);
      let hasComponentExport = Object.values(apiData.exports || {}).some(exp =>
        exp?.type === 'component'
      );

      if (hasComponentExport) {
        v3ComponentsWithoutMatch.push(pkgJson.name);
      }
    }

    // Log unmatched components
    if (s2ComponentsWithoutMatch.length > 0 || v3ComponentsWithoutMatch.length > 0) {
      console.log('\n' + chalk.yellow('='.repeat(60)));
      console.log(chalk.yellow.bold('Unmatched Components Report'));
      console.log(chalk.yellow('='.repeat(60)));

      if (s2ComponentsWithoutMatch.length > 0) {
        console.log('\n' + chalk.cyan.bold(`S2 components without v3 match (${s2ComponentsWithoutMatch.length}):`));
        s2ComponentsWithoutMatch.sort().forEach(name => {
          console.log(chalk.cyan(`  - ${name}`));
        });
      }

      if (v3ComponentsWithoutMatch.length > 0) {
        console.log('\n' + chalk.magenta.bold(`v3 components without S2 match (${v3ComponentsWithoutMatch.length}):`));
        v3ComponentsWithoutMatch.sort().forEach(name => {
          console.log(chalk.magenta(`  - ${name}`));
        });
      }

      console.log('\n' + chalk.green.bold(`Successfully matched: ${pairs.length} components`));
      console.log(chalk.yellow('='.repeat(60)) + '\n');
    }
  } else {
    // Original comparison logic: branch vs published
    let publishedDir = args.values['base-api-dir'] || path.join(__dirname, '..', 'dist', 'base-api');
    if (!(fs.existsSync(branchDir) && fs.existsSync(publishedDir))) {
      console.log(chalk.redBright(`you must have both a branchDir ${branchDir} and baseDir ${publishedDir}`));
      return;
    }

    let branchAPIs = fg.sync(`${branchDir}/**/api.json`);
    let publishedAPIs = fg.sync(`${publishedDir}/**/api.json`);

    // find all matching pairs based on what's been published
    for (let pubApi of publishedAPIs) {
      let pubApiPath = pubApi.split(path.sep);
      let pkgJson = readJsonSync(path.join('/', ...pubApiPath.slice(0, pubApiPath.length - 2), 'package.json'));
      let name = pkgJson.name;
      let sharedPath = path.join(name, 'dist', 'api.json');
      let found = false;
      for (let branchApi of branchAPIs) {
        if (branchApi.includes(sharedPath)) {
          found = true;
          pairs.push({pubApi, branchApi});
          break;
        }
      }
      if (!found) {
        pairs.push({pubApi, branchApi: null});
      }
    }

    // don't care about private APIs, but we do care if we're about to publish a new one
    for (let branchApi of branchAPIs) {
      let branchApiPath = branchApi.split(path.sep);
      let pkgJson = readJsonSync(path.join('/', ...branchApiPath.slice(0, branchApiPath.length - 2), 'package.json'));
      let name = pkgJson.name;
      let sharedPath = path.join(name, 'dist', 'api.json');
      let found = false;
      for (let pubApi of publishedAPIs) {
        if (pubApi.includes(sharedPath)) {
          found = true;
          break;
        }
      }
      let json = readJsonSync(path.join(branchApi, '..', '..', 'package.json'));
      if (!found && !json.private) {
        pairs.push({pubApi: null, branchApi});
      }
    }
  }

  let allDiffs = {};
  let skippedComparisons = [];
  for (let pair of pairs) {
    let result = getDiff(pair);
    if (result.skipped) {
      skippedComparisons.push({
        name: result.name,
        reason: result.reason,
        componentName: pair.componentName,
        v3Package: pair.v3PackageName
      });
    } else if (result.diffs && result.diffs.length > 0) {
      allDiffs[result.name] = result.diffs;
    }
  }

  for (let [, diffs] of Object.entries(allDiffs)) {
    for (let {result: diff, simplifiedName} of diffs) {
      if (diff.length > 0) {
        if (allChanged.has(simplifiedName)) {
          console.log(simplifiedName, 'already in set');
        } else {
          allChanged.add(simplifiedName);
        }
      }
    }
  }
  let invertedDeps = invertDependencies();
  let messages = [];
  for (let [name, diffs] of Object.entries(allDiffs)) {
    let changes = [];
    for (let {result: diff, simplifiedName} of diffs) {
      let changedByDeps = followDependencies(simplifiedName);
      if (diff.length > 0) {
        let affected = followInvertedDependencies(simplifiedName, invertedDeps);
        // combine export change messages
        // remove extra newline we added between the name of the interface and the properties to make the diffs easier to read
        changes.push(`
#### ${simplifiedName}
${changedByDeps.length > 0 ? `changed by:
 - ${changedByDeps.join('\n - ')}\n\n` : ''}${diff.split('\n').filter(line => line !== ' ').join('\n')}${
// eslint-disable-next-line no-nested-ternary
affected.length > 0 ?
args.values.isCI ? `
<details>
  <summary>it changed</summary>
   <ul>
     <li>${affected.join('</li>\n<li>')}</li>
   </ul>
</details>
`
  : `
it changed:
 - ${affected.join('\n - ')}
` : ''}
`);
      }
    }
    if (changes.length > 0) {
      // combine the package change messages
      messages.push(`
### ${name.replace('/dist/api.json', '').replace(/^\//, '')}
${changes.join('\n')}
-----------------------------------
`
      );
    }
  }
  if (messages.length) {
    messages.forEach(message => {
      console.log(message);
    });
  }

  // Report skipped comparisons
  if (skippedComparisons.length > 0) {
    console.log('\n' + chalk.yellow('='.repeat(60)));
    console.log(chalk.yellow.bold('Skipped Comparisons Report'));
    console.log(chalk.yellow('='.repeat(60)));
    console.log(chalk.yellow(`\n${skippedComparisons.length} component(s) could not be compared:\n`));

    skippedComparisons.forEach(({componentName, v3Package, reason}) => {
      console.log(chalk.cyan(`  ${componentName}:`));
      console.log(chalk.gray(`    v3 package: ${v3Package}`));
      console.log(chalk.gray(`    reason: ${reason}`));
      console.log('');
    });

    console.log(chalk.yellow('='.repeat(60)) + '\n');
  }
}

// takes an interface name and follows all the interfaces dependencies to
// see if the interface changed as a result of a dependency changing
function followDependencies(iname) {
  let visited = new Set();
  let changedDeps = [];
  function visit(iname) {
    if (visited.has(iname)) {
      return;
    }
    visited.add(iname);
    let dependencies = dependantOnLinks.get(iname);
    if (dependencies && dependencies.length > 0) {
      for (let dep of dependencies) {
        if (allChanged.has(dep)) {
          changedDeps.push(dep);
        }
        visit(dep);
      }
    }
  }
  visit(iname);
  return changedDeps;
}

function invertDependencies() {
  let changedUpstream = new Map();
  for (let [key, value] of dependantOnLinks.entries()) {
    for (let name of value) {
      if (changedUpstream.has(name)) {
        changedUpstream.get(name).push(key);
      } else {
        changedUpstream.set(name, [key]);
      }
    }
  }

  return changedUpstream;
}

// takes an interface name and follows all the interfaces dependencies to
// see if the interface changed as a result of a dependency changing
function followInvertedDependencies(iname, deps) {
  let visited = new Set();
  let affectedInterfaces = [];
  function visit(iname) {
    if (visited.has(iname)) {
      return;
    }
    visited.add(iname);
    if (deps.has(iname)) {
      let affected = deps.get(iname);
      if (affected && affected.length > 0) {
        for (let dep of affected) {
          affectedInterfaces.push(dep);
          visit(dep);
        }
      }
    }
  }
  visit(iname);
  return affectedInterfaces;
}

function getAPI(filePath) {
  let json = readJsonSync(filePath);

  return json;
}

// bulk of the logic, read the api files, rebuild the interfaces, diff those reconstructions
function getDiff(pair) {
  let name;
  let publishedApi, branchApi, allExportNames;

  if (args.values['compare-v3-s2']) {
    // v3 vs s2 comparison
    name = `${pair.componentName} (v3: ${pair.v3PackageName} vs s2)`;

    if (args.values.package && !args.values.package.includes(pair.componentName)) {
      return {diffs: [], name};
    }

    if (args.values.verbose) {
      console.log(`diffing ${name}`);
    }

    console.log(chalk.blue(`\nComparing ${pair.componentName}:`));
    console.log(chalk.gray(`  v3 API: ${pair.v3Api}`));
    console.log(chalk.gray(`  s2 API: ${pair.s2Api}`));

    // Get the v3 component API
    let v3ApiData = getAPI(pair.v3Api);
    // Get the s2 API and extract just the specific component
    let s2ApiData = getAPI(pair.s2Api);

    // Create filtered APIs with only the component we care about
    publishedApi = {
      exports: {},
      links: v3ApiData.links || {}
    };
    branchApi = {
      exports: {},
      links: s2ApiData.links || {}
    };

    // Find the main export in v3 (usually the component name)
    // In v3, the component might be the default export or match the package name
    let v3ComponentName = pair.v3ComponentName || pair.componentName;
    let v3ComponentData = null;

    console.log(chalk.gray(`  Looking for v3 component: ${v3ComponentName}`));
    console.log(chalk.gray(`  Available v3 exports: ${Object.keys(v3ApiData.exports).join(', ')}`));

    if (v3ApiData.exports[v3ComponentName]) {
      v3ComponentData = v3ApiData.exports[v3ComponentName];
      console.log(chalk.green(`  ✓ Found v3 component: ${v3ComponentName} (type: ${v3ComponentData?.type})`));
    } else {
      console.log(chalk.red(`  ✗ v3 component ${v3ComponentName} not found - skipping comparison`));
      // Return empty diffs to skip this comparison
      return {diffs: [], name, skipped: true, reason: 'v3 component not found'};
    }

    // Use a common key for comparison (the S2 component name)
    // Normalize the component name so both v3 and s2 use the same name
    if (v3ComponentData) {
      // Clone the component data and set the name to match the S2 component name
      v3ComponentData = JSON.parse(JSON.stringify(v3ComponentData));
      v3ComponentData.name = pair.componentName;
      publishedApi.exports[pair.componentName] = v3ComponentData;
    }

    // Get the s2 component - also clone and normalize the name
    console.log(chalk.gray(`  Looking for s2 component: ${pair.componentName}`));
    let s2ComponentData = s2ApiData.exports[pair.componentName];
    if (s2ComponentData) {
      console.log(chalk.green(`  ✓ Found s2 component: ${pair.componentName} (type: ${s2ComponentData?.type})`));
      s2ComponentData = JSON.parse(JSON.stringify(s2ComponentData));
      s2ComponentData.name = pair.componentName;
      branchApi.exports[pair.componentName] = s2ComponentData;
    } else {
      console.log(chalk.red(`  ✗ s2 component ${pair.componentName} not found - skipping comparison`));
      // Return empty diffs to skip this comparison
      return {diffs: [], name, skipped: true, reason: 's2 component not found'};
    }

    allExportNames = [pair.componentName];
  } else {
    // Original branch vs published comparison
    if (pair.branchApi) {
      name = pair.branchApi.replace(/.*branch-api/, '');
    } else {
      name = pair.pubApi.replace(/.*published-api/, '');
    }

    if (args.values.package && !args.values.package.includes(name)) {
      return {diffs: [], name};
    }
    if (args.values.verbose) {
      console.log(`diffing ${name}`);
    }
    publishedApi = pair.pubApi === null ? {exports: {}} : getAPI(pair.pubApi);
    branchApi = pair.branchApi === null ? {exports: {}} : getAPI(pair.branchApi);
    allExportNames = [...new Set([...Object.keys(publishedApi.exports), ...Object.keys(branchApi.exports)])];
  }

  let publishedInterfaces = rebuildInterfaces(publishedApi);
  let branchInterfaces = rebuildInterfaces(branchApi);
  let allInterfaces = [...new Set([...Object.keys(publishedInterfaces), ...Object.keys(branchInterfaces)])];
  let formattedPublishedInterfaces = '';
  let formattedBranchInterfaces = '';
  formattedPublishedInterfaces = formatInterfaces(publishedInterfaces, allInterfaces);
  formattedBranchInterfaces = formatInterfaces(branchInterfaces, allInterfaces);

  let diffs = [];
  allInterfaces.forEach((iname, index) => {
    if (args.values.interface && args.values.interface !== iname) {
      return;
    }
    let simplifiedName = allExportNames[index] || iname;
    let codeDiff = Diff.structuredPatch(iname, iname, formattedPublishedInterfaces[index], formattedBranchInterfaces[index], {newlineIsToken: true});
    if (args.values.verbose) {
      console.log(util.inspect(codeDiff, {depth: null}));
    }
    let result = [];
    let prevEnd = 1; // diff lines are 1 indexed
    let lines = formattedPublishedInterfaces[index].split('\n');
    codeDiff.hunks.forEach(hunk => {
      if (hunk.oldStart > prevEnd) {
        result = [...result, ...lines.slice(prevEnd - 1, hunk.oldStart - 1).map(item => ` ${item}`)];
      }
      if (args.values.isCI) {
        result = [...result, ...hunk.lines];
      } else {
        result = [...result, ...hunk.lines.map(line => {
          if (line.startsWith('+')) {
            return chalk.whiteBright.bgRgb(0, 60, 0)(line);
          } else if (line.startsWith('-')) {
            return chalk.whiteBright.bgRed(line);
          }
          return line;
        })];
      }
      prevEnd = hunk.oldStart + hunk.oldLines;
    });
    let joinedResult = '';
    if (codeDiff.hunks.length > 0) {
      joinedResult = [...result, ...lines.slice(prevEnd).map(item => ` ${item}`)].join('\n');
    }
    if (args.values.isCI && result.length > 0) {
      joinedResult = `\`\`\`diff
${joinedResult}
\`\`\``;
    }

    let diffSimplifiedName = args.values['compare-v3-s2']
      ? `${pair.componentName}`
      : `${name.replace('/dist/api.json', '')}:${simplifiedName}`;
    diffs.push({iname, result: joinedResult, simplifiedName: diffSimplifiedName});
  });

  return {diffs, name};
}

// mirrors dev/docs/src/types.js for the most part
// "rendering" our types to a string instead of React components
function processType(value) {
  if (!value) {
    console.trace('UNTYPED', value);
    return 'UNTYPED';
  }
  if (Object.keys(value).length === 0) {
    return '{}';
  }
  if (value.type === 'any') {
    return 'any';
  }
  if (value.type === 'null') {
    return 'null';
  }
  if (value.type === 'undefined') {
    return 'undefined';
  }
  if (value.type === 'void') {
    return 'void';
  }
  if (value.type === 'unknown') {
    return 'unknown';
  }
  if (value.type === 'never') {
    return 'never';
  }
  if (value.type === 'this') {
    return 'this';
  }
  if (value.type === 'symbol') {
    return 'symbol';
  }
  if (value.type === 'identifier') {
    return value.name;
  }
  if (value.type === 'string') {
    if (value.value) {
      return `'${value.value}'`;
    }
    return 'string';
  }
  if (value.type === 'number') {
    return 'number';
  }
  if (value.type === 'boolean') {
    return 'boolean';
  }
  if (value.type === 'union') {
    // Sort union elements alphabetically for consistent output, with functions last
    let elements = value.elements.map(processType);
    elements.sort((a, b) => {
      let aIsFunction = a.startsWith('(') && a.includes('=>');
      let bIsFunction = b.startsWith('(') && b.includes('=>');
      if (aIsFunction && !bIsFunction) {
        return 1; // a comes after b
      }
      if (!aIsFunction && bIsFunction) {
        return -1; // a comes before b
      }
      return a.localeCompare(b); // alphabetical if both are or aren't functions
    });
    return elements.join(' | ');
  }
  if (value.type === 'intersection') {
    // Sort intersection types alphabetically for consistent output, with functions last
    let types = value.types.map(processType);
    types.sort((a, b) => {
      let aIsFunction = a.startsWith('(') && a.includes('=>');
      let bIsFunction = b.startsWith('(') && b.includes('=>');
      if (aIsFunction && !bIsFunction) {
        return 1; // a comes after b
      }
      if (!aIsFunction && bIsFunction) {
        return -1; // a comes before b
      }
      return a.localeCompare(b); // alphabetical if both are or aren't functions
    });
    return `(${types.join(' & ')})`;
  }
  if (value.type === 'application') {
    let name = value.base.name;
    if (!name) {
      name = processType(value.base);
    }
    return `${name}<${value.typeParameters.map(processType).join(', ')}>`;
  }
  if (value.type === 'template') {
    return `\`${value.elements.map(element => element.type === 'string' ? element.value : `\${${processType(element)}}`).join('')}\``;
  }
  if (value.type === 'infer') {
    return `infer ${value.value}`;
  }
  if (value.type === 'typeOperator') {
    return `${value.operator} ${processType(value.value)}`;
  }
  if (value.type === 'function') {
    return `(${value.parameters.map(processType).join(', ')}) => ${value.return ? processType(value.return) : 'void'}`;
  }
  if (value.type === 'parameter') {
    return processType(value.value);
  }
  if (value.type === 'link' && value.id) {
    let name = value.id.substr(value.id.lastIndexOf(':') + 1);
    if (dependantOnLinks.has(currentlyProcessing)) {
      let foo = dependantOnLinks.get(currentlyProcessing);
      if (!foo.includes(name)) {
        foo.push(name);
      }
    } else {
      dependantOnLinks.set(currentlyProcessing, [name]);
    }
    return name;
  }
  if (value.type === 'mapped') {
    return `${value.readonly === '-' ? '-readonly' : ''}${processType(value.typeParameter)}: ${processType(value.typeAnnotation)}`;
  }
  // interface still needed if we have it at top level?
  if (value.type === 'object') {
    if (value.properties) {
      return `${value.exact ? '{\\' : '{'}
  ${Object.values(value.properties).map(property => {
    depth += 2;
    let result = ' '.repeat(depth);
    result = `${result}${property.indexType ? '[' : ''}${property.name}${property.indexType ? `: ${processType(property.indexType)}]` : ''}${property.optional ? '?' : ''}: ${processType(property.value)}`;
    depth -= 2;
    return result;
  }).join('\n')}
${value.exact ? '\\}' : '}'}`;
    }
    return '{}';
  }
  if (value.type === 'alias') {
    return `type ${value.name} = {
  ${processType(value.value)}
}`;
  }
  if (value.type === 'array') {
    return `Array<${processType(value.elementType)}>`;
  }
  if (value.type === 'tuple') {
    return `[${value.elements.map(processType).join(', ')}]`;
  }
  if (value.type === 'typeParameter') {
    let typeParam = value.name;
    if (value.constraint) {
      typeParam = typeParam + ` extends ${processType(value.constraint)}`;
    }
    if (value.default) {
      typeParam = typeParam + ` = ${processType(value.default)}`;
    }
    return typeParam;
  }
  if (value.type === 'component') {
    let props = value.props;
    if (props.type === 'application') {
      props = props.base;
    }
    if (props.type === 'link') {
      // create links provider
      // props = links[props.id];
    }
    return processType(props);
  }
  if (value.type === 'conditional') {
    return `${processType(value.checkType)} extends ${processType(value.extendsType)} ? ${processType(value.trueType)}${value.falseType.type === 'conditional' ? ' :\n' : ' : '}${processType(value.falseType)}`;
  }
  if (value.type === 'indexedAccess') {
    return `${processType(value.objectType)}[${processType(value.indexType)}]`;
  }
  if (value.type === 'keyof') {
    return `keyof ${processType(value.keyof)}`;
  }

  return `UNKNOWN: ${value.type}`;
}

// Helper to find a type by name in links or exports
function findTypeByName(name, json) {
  if (json.links) {
    for (let linkId in json.links) {
      if (json.links[linkId].name === name) {
        return json.links[linkId];
      }
    }
  }
  if (json.exports && json.exports[name]) {
    return json.exports[name];
  }
  return null;
}

// Helper function to resolve a props type by following links, identifiers, and applications
function resolvePropsType(propsType, json) {
  let maxDepth = 10;
  let depth = 0;

  while (depth < maxDepth) {
    depth++;

    // If it's a link, resolve it
    if (propsType.type === 'link' && propsType.id && json.links && json.links[propsType.id]) {
      propsType = json.links[propsType.id];
      continue;
    }

    // If it's an application (like ItemProps<T>), try to get the base type
    if (propsType.type === 'application' && propsType.base) {
      if (propsType.base.type === 'link' && propsType.base.id && json.links && json.links[propsType.base.id]) {
        propsType = json.links[propsType.base.id];
        continue;
      }
      if (propsType.base.type === 'identifier' && propsType.base.name) {
        let resolved = findTypeByName(propsType.base.name, json);
        if (resolved) {
          propsType = resolved;
          continue;
        }
      }
    }

    // If the resolved type is a component, extract props from it
    if (propsType.type === 'component' && propsType.props) {
      propsType = propsType.props;
      continue;
    }

    // If it's an identifier, try to resolve it
    if (propsType.type === 'identifier' && propsType.name) {
      let resolved = findTypeByName(propsType.name, json);
      if (resolved) {
        propsType = resolved;
        continue;
      }
    }

    // If we have properties, we're done
    if ((propsType.type === 'object' || propsType.type === 'interface') && propsType.properties) {
      break;
    }

    // Can't resolve further
    break;
  }

  return propsType;
}

function rebuildInterfaces(json) {
  let exports = {};
  if (!json.exports) {
    return exports;
  }
  Object.keys(json.exports).forEach((key) => {
    currentlyProcessing = key;
    if (key === 'links') {
      console.log('skipping links');
      return;
    }
    let item = json.exports[key];
    if (item?.type == null) {
      // todo what to do here??
      exports[item.name] = 'UNTYPED';
      return;
    }
    if (item.props?.type === 'identifier') {
      // todo what to do here??
      exports[item.name] = 'UNTYPED';
      return;
    }
    if (item.type === 'component') {
      let compInterface = {};
      if (item.props && item.props.properties) {
        Object.entries(item.props.properties).sort((([keyA], [keyB]) => keyA > keyB ? 1 : -1)).forEach(([, prop]) => {
          if (prop.access === 'private') {
            return;
          }
          // Skip style props from baseStyleProps and viewStyleProps
          if (stylePropsToExclude.has(prop.name)) {
            if (args.values.verbose) {
              console.log(chalk.gray(`  [FILTERED] Skipping style prop: ${prop.name} from ${key}`));
            }
            return;
          }
          let name = prop.name;
          if (item.name === null) {
            name = key;
          }
          let optional = prop.optional;
          let defaultVal = prop.default;
          let value = processType(prop.value);
          compInterface[name] = {optional, defaultVal, value};
        });
      } else if (item.props && item.props.type === 'link') {
        let prop = item.props;
        let name = item.name;
        if (item.name === null) {
          name = key;
        }
        let optional = prop.optional;
        let defaultVal = prop.default;
        let value = processType(prop);
        compInterface[name] = {optional, defaultVal, value};
      }
      let name = item.name ?? key;
      if (item.typeParameters?.length > 0) {
        compInterface['typeParameters'] = `<${item.typeParameters.map(processType).sort().join(', ')}>`;
      }
      if (item.props?.extends?.length > 0) {
        compInterface['extend'] = `extends ${item.props.extends.map(processType).sort().join(', ')}`;
      }
      exports[name] = compInterface;
    } else if (item.type === 'function') {
      let funcInterface = {};

      // Check if this is a React component function with a props parameter
      // In that case, extract the props from the parameter type instead of treating it as a function
      let isReactComponent = false;
      let propsParam = null;

      if (item.parameters && item.parameters.length > 0) {
        let firstParam = item.parameters[0];
        // Check if it's a props parameter (has a value that's a link/identifier/object/application)
        if (firstParam && firstParam.value &&
            (firstParam.value.type === 'link' ||
             firstParam.value.type === 'identifier' ||
             firstParam.value.type === 'object' ||
             firstParam.value.type === 'application')) {
          isReactComponent = true;
          propsParam = firstParam;
        }
      }

      if (isReactComponent && propsParam) {
        // Extract props from the parameter type
        let propsType = resolvePropsType(propsParam.value, json);

        // If it's an object or interface type, extract properties
        if (propsType.type === 'object' && propsType.properties) {
          Object.entries(propsType.properties).sort((([keyA], [keyB]) => keyA > keyB ? 1 : -1)).forEach(([, prop]) => {
            if (prop.access === 'private') {
              return;
            }
            // Skip style props from baseStyleProps and viewStyleProps
            if (stylePropsToExclude.has(prop.name)) {
              return;
            }
            let name = prop.name;
            let optional = prop.optional;
            let defaultVal = prop.default;
            let value = processType(prop.value);
            funcInterface[name] = {optional, defaultVal, value};
          });
        } else if (propsType.type === 'interface' && propsType.properties) {
          Object.entries(propsType.properties).sort((([keyA], [keyB]) => keyA > keyB ? 1 : -1)).forEach(([, prop]) => {
            if (prop.access === 'private' || prop.access === 'protected') {
              return;
            }
            // Skip style props from baseStyleProps and viewStyleProps
            if (stylePropsToExclude.has(prop.name)) {
              return;
            }
            let name = prop.name;
            let optional = prop.optional;
            let defaultVal = prop.default;
            let value = processType(prop.value);
            funcInterface[name] = {optional, defaultVal, value};
          });
        } else {
          // Fallback: treat as regular function parameter
          let name = propsParam.name;
          let optional = propsParam.optional;
          let defaultVal = propsParam.default;
          let value = processType(propsParam.value);
          funcInterface[name] = {optional, defaultVal, value};
        }

        // Add type parameters if present
        if (item.typeParameters?.length > 0) {
          funcInterface['typeParameters'] = `<${item.typeParameters.map(processType).sort().join(', ')}>`;
        }
      } else {
        // Regular function: process all parameters
        Object.entries(item.parameters).sort((([keyA], [keyB]) => keyA > keyB ? 1 : -1)).forEach(([, param]) => {
          if (param.access === 'private') {
            return;
          }
          let name = param.name;
          let optional = param.optional;
          let defaultVal = param.default;
          let value = processType(param.value);
          funcInterface[name] = {optional, defaultVal, value};
        });
        let returnVal = processType(item.return);
        funcInterface['returnVal'] = returnVal;
        if (item.typeParameters?.length > 0) {
          funcInterface['typeParameters'] = `<${item.typeParameters.map(processType).sort().join(', ')}>`;
        }
      }

      let name = item.name ?? key;
      exports[name] = funcInterface;
    } else if (item.type === 'interface') {
      let funcInterface = {};
      Object.entries(item.properties).sort((([keyA], [keyB]) => keyA > keyB ? 1 : -1)).forEach(([, property]) => {
        if (property.access === 'private' || property.access === 'protected') {
          return;
        }
        // Skip style props from baseStyleProps and viewStyleProps
        if (stylePropsToExclude.has(property.name)) {
          if (args.values.verbose) {
            console.log(chalk.gray(`  [FILTERED] Skipping style prop: ${property.name} from ${key}`));
          }
          return;
        }
        let name = property.name;
        let optional = property.optional;
        let defaultVal = property.default;
        // this needs to handle types like spreads, but need to build that into the build API's first
        if (!property.value) {
          name = 'UNKNOWN';
          let i = 0;
          while (funcInterface[name]) {
            i++;
            name = 'UNKNOWN' + String(i);
          }
          funcInterface[name] = {optional, defaultVal, value: property.type};
        } else {
          let value = processType(property.value);
          // TODO: what to do with defaultVal and optional
          funcInterface[name] = {optional, defaultVal, value};
        }
      });
      let name = item.name ?? key;
      if (item.typeParameters?.length > 0) {
        funcInterface['typeParameters'] = `<${item.typeParameters.map(processType).sort().join(', ')}>`;
      }
      exports[name] = funcInterface;
    } else if (item.type === 'link') {
      let links = json.links;
      if (links[item.id]) {
        let link = links[item.id];

        let name = link.name;
        let optional = link.optional;
        let defaultVal = link.default;
        let value = processType(link.value);
        let isType = true;
        exports[name] = {isType, optional, defaultVal, value};
      }
    } else {
      exports[key] = 'UNTYPED';
      // console.log('unknown top level export', key, item);
    }
  });
  return exports;
}

function formatProp([name, prop]) {
  let defaultValue = '';
  if (prop.defaultVal != null) {
    // Normalize default values to use single quotes instead of double quotes
    let normalizedDefault = String(prop.defaultVal).replace(/"/g, "'");
    defaultValue = ` = ${normalizedDefault}`;
  }
  return `  ${name}${prop.optional ? '?' : ''}: ${prop.value}${defaultValue}`;
}

function formatInterfaces(interfaces, allInterfaces) {
  return allInterfaces.map(name => {
    let interfaceO = interfaces[name];
    if (interfaceO && interfaceO !== 'UNTYPED') {
      let output = `${name}`;
      if (interfaceO.typeParameters) {
        output += ` ${interfaceO.typeParameters}`;
        delete interfaceO.typeParameters;
      }
      if (interfaceO.extend) {
        output += ` ${interfaceO.extend}`;
        delete interfaceO.extend;
      }
      // include extra newline so that the names of the interface are always compared
      output += ' {\n\n';
      output += interfaces[name].isType ? formatProp(name, interfaceO) : Object.entries(interfaceO).map(formatProp).join('\n');
      return `${output}\n}\n`;
    } else if (interfaceO === 'UNTYPED') {
      // include extra newline so that the names of the interface are always compared
      return `${name} {\n\n  UNTYPED\n}\n`;
    } else {
      return '\n';
    }
  });
}
