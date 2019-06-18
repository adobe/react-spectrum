import fs from 'fs';
import path from 'path';
import recursive from 'recursive-readdir';

let fileTypes = [/js$/, /css$/, /styl$/];
let license = fs.readFileSync(path.join(__dirname, '..', 'v2-license.txt'));

function generateCopyrightRecursively(dirPath) {
  recursive(dirPath, function (err, files) {
    // `files` is an array of file paths
    let sourceFiles = files.filter(file => fileTypes.some(ext => ext.test(file)));
    sourceFiles.forEach(file => {
      fs.readFile(file, 'utf8', (err, contents) => {
        if (contents.includes(license)) {
          return;
        }
        let data = `${license}\n${contents}`;
        let buffer = new Buffer(data);
        fs.writeFile(file, buffer, (err) => {
          if (err) {
            throw 'error writing file: ' + err;
          }
          console.log(`wrote: ${file}`);
        });
      });
    });
  });
};

generateCopyrightRecursively('src');
generateCopyrightRecursively('stories');
generateCopyrightRecursively('test');
