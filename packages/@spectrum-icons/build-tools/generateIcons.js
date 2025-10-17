/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import fs from 'fs';
import path from 'path';

function writeToFile(filepath, data) {
  let buffer = Buffer.from(data);
  fs.writeFileSync(filepath, buffer);
}

/**
 * Takes an icon directory and outputs React Spectrum wrapped icons to the output directory.
 * @param iconDir Source directory.
 * @param outputDir Output directory.
 * @param nameRegex A regex to pull out the icon name from the filename.
 * @param template Template for output file, should take a name from the regex.
 */
export function generateIcons(iconDir, outputDir, nameRegex, template) {
  fs.mkdirSync(outputDir, {recursive: true});
  fs.readdir(iconDir, (err, items) => {
    let ignoreList = ['index.js', 'util.js'];
    // get all icon files
    let iconFiles = items.filter(item => !!item.endsWith('.js')).filter(item => !ignoreList.includes(item));

    // generate all icon files
    iconFiles.forEach(icon => {
      fs.readFile(path.resolve(iconDir, icon), 'utf8', (err, contents) => {
        let matches = contents.match(nameRegex).groups;
        let iconName = matches.name;
        let newFile = template(iconName);

        let iconFileName = path.basename(icon).substring(0, icon.length - 3);
        let filepath = `${outputDir}/${iconFileName}.tsx`;
        writeToFile(filepath, newFile);
      });
    });

    // generate index barrel
    let indexFile = iconFiles.map(icon => {
      let iconName = icon.substring(0, icon.length - 3);
      return `export * as ${isNaN(Number(iconName[0])) ? iconName : `_${iconName}`} from './${iconName}';\n`;
    }).join('');

    let indexFilepath = `${outputDir}/index.ts`;
    writeToFile(indexFilepath, indexFile);
  });
}
