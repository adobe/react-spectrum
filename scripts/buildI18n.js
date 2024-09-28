const glob = require('glob').sync;
const fs = require('fs');
const {compileStrings} = require('@internationalized/string-compiler');
const {minifySync} = require('@swc/core');

function build(scope, dist = scope.slice(1)) {
  let languages = {};
  let deps = {};
  for (let file of glob(`packages/${scope}/intl/*.json`)) {
    let parts = file.split('/');
    let lang = parts.at(-1).slice(0, -5);
    let pkg = parts[1].startsWith('@') ? parts.slice(1, 3).join('/') : parts[1];
    if (pkg === '@react-spectrum/s2') {
      continue;
    }
  
    let compiled = compileStrings(JSON.parse(fs.readFileSync(file, 'utf8'))).replace('module.exports = ', '');
    let pkgJson = JSON.parse(fs.readFileSync(`packages/${pkg}/package.json`, 'utf8'));

    if (!languages[lang]) {
      languages[lang] = {};
    }

    languages[lang][pkg] = compiled;
    deps[pkg] = Object.keys(pkgJson.dependencies);
  }

  for (let pkg in deps) {
    deps[pkg] = deps[pkg].filter(dep => !!deps[dep]);
  }

  for (let pkg in deps) {
    if (deps[pkg].length === 0) {
      delete deps[pkg];
    }
  }

  fs.mkdirSync(`packages/${dist}/i18n`, {recursive: true});
  for (let lang in languages) {
    let serialized = '{\n';
    for (let pkg in languages[lang]) {
      serialized += `  "${pkg}": ${languages[lang][pkg]},\n`;
    }
    serialized += '};\n';

    fs.writeFileSync(`packages/${dist}/i18n/${lang}.js`,  minifySync(`module.exports = ${serialized}`).code);
    fs.writeFileSync(`packages/${dist}/i18n/${lang}.mjs`,  minifySync(`export default ${serialized}`, {module: true}).code);
  }

  fs.writeFileSync(`packages/${dist}/i18n/lang.d.ts`, `import type {LocalizedString} from '@internationalized/string';

type PackageLocalizedStrings = {
  [packageName: string]: Record<string, LocalizedString>
}

export default PackageLocalizedStrings;
`);

  // Generate index files.
  for (let ext of ['.js', '.mjs']) {
    let generateImport = (exports, from) => ext === '.mjs' ? `import ${exports} from '${from}'` : `let ${exports} = require('${from}')`;
    let index = generateImport('{PackageLocalizationProvider, getPackageLocalizationScript}', '@react-aria/i18n/server') + ';\n';
    index += generateImport('{LocalizedStringDictionary}', '@internationalized/string') + ';\n';
    index += generateImport('{createElement}', 'react') + ';\n';
    for (let lang in languages) {
      index += generateImport(lang.replace('-', '_'), `./${lang}${ext}`) + ';\n';
    }

    index += '\nlet dictionary = new LocalizedStringDictionary({\n';
    for (let lang in languages) {
      index += `  "${lang}": ${lang.replace('-', '_')},\n`;
    }

    index += `});

function LocalizedStringProvider({locale, dictionary: dict = dictionary, nonce}) {
  let strings = dict.getStringsForLocale(locale);
  return createElement(PackageLocalizationProvider, {locale, strings, nonce});
}

function getLocalizationScript(locale, dict = dictionary) {
  let strings = dict.getStringsForLocale(locale);
  return getPackageLocalizationScript(locale, strings);
}

let deps = ${JSON.stringify(deps)};

function createLocalizedStringDictionary(packages) {
  let strings = {};
  let seen = new Set();
  let addPkg = (pkg) => {
    if (seen.has(pkg)) {
      return;
    }
    seen.add(pkg);

    for (let lang in dictionary.strings) {
      strings[lang] ??= {};
      strings[lang][pkg] = dictionary.strings[lang][pkg];
    }

    for (let dep of deps[pkg] || []) {
      addPkg(dep);
    }
  };

  ${dist === 'react-aria-components' ? "addPkg('react-aria-components');\n" : ''}
  for (let pkg of packages) {
    addPkg(pkg);
  }

  return new LocalizedStringDictionary(strings);
}
`;

    if (ext === '.mjs') {
      index += 'export {LocalizedStringProvider, getLocalizationScript, dictionary, createLocalizedStringDictionary};\n';
    } else {
      index += 'exports.LocalizedStringProvider = LocalizedStringProvider;\n';
      index += 'exports.getLocalizationScript = getLocalizationScript;\n';
      index += 'exports.dictionary = dictionary;\n';
      index += 'exports.createLocalizedStringDictionary = createLocalizedStringDictionary;\n';
    }

    fs.writeFileSync(`packages/${dist}/i18n/index${ext}`, index);
  }

  fs.writeFileSync(`packages/${dist}/i18n/index.d.ts`, `import React from 'react';
import type {LocalizedStringDictionary} from '@internationalized/string';

interface LocalizedStringProviderProps {
  locale: string,
  dictionary?: LocalizedStringDictionary,
  nonce?: string
}

export declare function LocalizedStringProvider(props: LocalizedStringProviderProps): React.JSX.Element;
export declare function getLocalizationScript(locale: string, dictionary?: LocalizedStringDictionary): string;
export declare const dictionary: LocalizedStringDictionary;
export declare function createLocalizedStringDictionary(packages: string[]): LocalizedStringDictionary;
`);
}

build('{@react-aria/*,@react-stately/*,@react-spectrum/*,react-aria-components}', '@adobe/react-spectrum');
build('{@react-aria/*,@react-stately/*,react-aria-components}', 'react-aria-components');
build('{@react-aria,@react-stately}/*', 'react-aria');
