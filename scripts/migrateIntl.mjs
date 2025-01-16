import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

let mapToNewKeys = {
  'inlinealert.info': 'inlinealert.informative',
};

let stringsToAllow = new Set([
  'actionbar.actions',
  'actionbar.actionsAvailable',
  'actionbar.clearSelection',
  'actionbar.selected',
  'actionbar.selectedAll',
  'breadcrumbs.more',
  'button.pending',
  'menu.moreActions',
  'dialog.alert',
  'contextualhelp.info',
  'contextualhelp.help',
  'dialog.dismiss',
  'dropzone.replaceMessage',
  'label.(required)',
  'label.(optional)',
  'inlinealert.informative',
  'inlinealert.negative',
  'inlinealert.notice',
  'inlinealert.positive',
  'picker.placeholder',
  'slider.minimum',
  'slider.maximum',
  'table.loading',
  'table.loadingMore',
  'table.sortAscending',
  'table.sortDescending',
  'table.resizeColumn',
  'tag.actions',
  'tag.showAllButtonLabel',
  'tag.hideButtonLabel',
  'tag.noTags'
]);

function prefixKeys(obj, prefix) {
  let newObj = {};
  for (let [key, value] of Object.entries(obj)) {
    let newKey = `${prefix}.${key}`;
    if (mapToNewKeys[newKey]) {
      newKey = mapToNewKeys[newKey];
    }
    newObj[newKey] = value;
  }
  return newObj;
}

// remove properties from an object if they are not in the set of strings to allow
function filterKeys(obj) {
  let newObj = {};
  for (let [key, value] of Object.entries(obj)) {
    if (stringsToAllow.has(key)) {
      newObj[key] = value;
    }
  }
  return newObj;
}

let rspIntlPackages = glob.sync('../packages/**/intl/en-US.json', {cwd: __dirname, absolute: true});
let dest = path.join(__dirname, '../packages/@react-spectrum/s2/intl')
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, {recursive: true});
}
let packs = new Map();
for (let intlPkg of rspIntlPackages) {
  if (intlPkg.includes('react-aria-components') || intlPkg.includes('react-stately') || intlPkg.includes('react-aria')) {
    continue;
  }
  let matches = intlPkg.match(/packages\/(.*)\/intl\/en-US.json/);
  // use the match as a package name and copy
  // the entire intl directory to the @react-spectrum/s2/messages directory
  let pkgName = matches[1].split('/')[1];
  let locales = glob.sync(path.join(path.dirname(intlPkg), '*.json'));
  for (let locale of locales) {
    let localeName = path.basename(locale).split('.')[0];
    let messages = fs.readJsonSync(locale);
    if (!packs.has(localeName)) {
      packs.set(localeName, filterKeys(prefixKeys(messages, pkgName)));
    } else {
      let existing = packs.get(localeName);
      let duplicates = new Map();
      for (let [key, value] of Object.entries(messages)) {
        duplicates.set(key, {locale, value});
      }
      for (let [key, value] of Object.entries(existing)) {
        if (duplicates.has(key)) {
          if (value !== duplicates.get(key).value) {
            console.log(`Key collision: ${key} - ${duplicates.get(key).value} - ${value}\nfrom ${duplicates.get(key).locale} - ${locale}`);
          }
        }
      }
      let concat = {...existing, ...filterKeys(prefixKeys(messages, pkgName))};

      packs.set(localeName, concat);
    }
  }

  // let dest = path.join(__dirname, '../packages/@react-spectrum/s2/messages', pkgName);
  // // make sure the destination directory exists

  // fs.copySync(path.dirname(intlPkg), dest);
}
console.log(packs)

for (let [key, value] of packs) {
  let dest = path.join(__dirname, '../packages/@react-spectrum/s2/intl', `${key}.json`);
  if (fs.existsSync(dest)) {
    let translations = fs.readJsonSync(dest);
    for (let [name, message] of Object.entries(translations)) {
      if (!value[name]) {
        value[name] = message;
      }
    }
  }
  fs.writeFile(dest, JSON.stringify(value, null, 2));
}

/**
 * Removed strings
 * actionbar
 * autocomplete
 * button
 * calendar
 * card
 * color
 * combobox
 * datepicker
 * list
 * listbox
 * pagination
 * searchwithin
 * steplist
 * table - coming soon
 * toast
 *
 */
