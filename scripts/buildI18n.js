const glob = require('glob').sync;
const fs = require('fs');
const {compileStrings} = require('@internationalized/string-compiler');
const {minifySync} = require('@swc/core');

function build(scope, dist = scope.slice(1)) {
  let languages = {};
  for (let file of glob(`packages/${scope}/intl/*.json`)) {
    let parts = file.split('/');
    let lang = parts.at(-1).slice(0, -5);
    let pkg = parts[1].startsWith('@') ? parts.slice(1, 3).join('/') : parts[1];
    let compiled = compileStrings(JSON.parse(fs.readFileSync(file, 'utf8'))).replace('module.exports = ', '');

    if (!languages[lang]) {
      languages[lang] = {};
    }

    languages[lang][pkg] = compiled;
  }

  fs.mkdirSync(`packages/${dist}/i18n`, {recursive: true});
  for (let lang in languages) {
    let serialized = '{\n';
    for (let pkg in languages[lang]) {
      serialized += `  "${pkg}": ${languages[lang][pkg]},\n`;
    }
    serialized += '};\n';

    fs.writeFileSync(`packages/${dist}/i18n/${lang}.js`,  minifySync(`module.exports = ${serialized}`).code);
    fs.writeFileSync(`packages/${dist}/i18n/${lang}.mjs`,  minifySync(`export default ${serialized}`).code);
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

function LocalizedStringProvider({locale}) {
  let strings = dictionary.getStringsForLocale(locale);
  return createElement(PackageLocalizationProvider, {locale, strings});
}

function getLocalizationScript(locale) {
  let strings = dictionary.getStringsForLocale(locale);
  return getPackageLocalizationScript(locale, strings);
}

`;

    if (ext === '.mjs') {
      index += 'export {LocalizedStringProvider, getLocalizationScript, dictionary};\n';
    } else {
      index += 'exports.LocalizedStringProvider = LocalizedStringProvider;\n';
      index += 'exports.getLocalizationScript = getLocalizationScript;\n';
      index += 'exports.dictionary = dictionary;\n';
    }

    fs.writeFileSync(`packages/${dist}/i18n/index${ext}`, index);
  }

  fs.writeFileSync(`packages/${dist}/i18n/index.d.ts`, `import React from 'react';
import type {LocalizedStringDictionary} from '@internationalized/string';

interface LocalizedStringProviderProps {
  locale: string
}

export declare function LocalizedStringProvider(props: LocalizedStringProviderProps): React.JSX.Element;
export declare function getLocalizationScript(locale: string): string;
export declare const dictionary: LocalizedStringDictionary;
`);
}

build('{@react-aria,@react-stately,@react-spectrum}/*', '@adobe/react-spectrum');
build('{@react-aria/*,@react-stately/*,react-aria-components}', 'react-aria-components');
build('{@react-aria,@react-stately}/*', 'react-aria');
