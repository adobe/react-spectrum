
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const folderPath = path.join(process.cwd(), 'react-spectrum', '../packages/@react-spectrum/');
console.log(folderPath);

const isFolder = fileName => {
  return !fs.lstatSync(fileName).isFile();
};

try {
  let pkgs = fs.readdirSync(folderPath)
    .map(fileName => {
      return path.join(folderPath, fileName);
    })
    .filter(isFolder);
  for (let pkg of pkgs) {
    let chromaticDir = path.join(pkg, 'chromatic');
    if (fs.existsSync(chromaticDir)) {
      let files = fs.readdirSync(chromaticDir);
      let chromatics = [];
      let hcms = [];
      for (let file of files) {
        if (file.includes('chromatic-fc')) {
          hcms.push(file);
        } else if (file.includes('chromatic')) {
          chromatics.push(file);
        }
      }
      if (hcms.length > 0 && !fs.existsSync(path.join(pkg, 'chromatic-fc'))) {
        fs.mkdirSync(path.join(pkg, 'chromatic-fc'));
      }
      for (let hcm of hcms) {
        let oldFile = path.join(pkg, 'chromatic', hcm);
        let newFile = path.join(pkg, 'chromatic-fc', hcm.replace('chromatic-fc', 'stories'));
        fs.copyFileSync(oldFile, newFile);
        fs.rmSync(oldFile);
      }
      for (let chromatic of chromatics) {
        let oldFile = path.join(pkg, 'chromatic', chromatic);
        let newFile = path.join(pkg, 'chromatic', chromatic.replace('chromatic', 'stories'));
        fs.copyFileSync(oldFile, newFile);
        fs.rmSync(oldFile);
      }
    }
  }
} catch (err) {
  console.error(err);
}

