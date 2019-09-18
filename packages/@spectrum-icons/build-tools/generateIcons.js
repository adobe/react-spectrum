import fs from 'fs-extra';
import path from 'path';

function writeToFile(filepath, data) {
  let buffer = new Buffer(data);
  fs.writeFile(filepath, buffer);
}

export function generateIcons(iconDir, outputDir, nameRegex, template) {
  fs.ensureDirSync(outputDir);
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
      return `export * from './${iconName}';\n`;
    }).join('');
    let indexFilepath = `${outputDir}/index.ts`;
    writeToFile(indexFilepath, indexFile);
  });
}
