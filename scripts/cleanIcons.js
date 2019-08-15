import path from 'path';
import recursive from 'recursive-readdir';
import rimraf from 'rimraf';

let topPaths = ['ui', 'workflow', 'color'].map(name => path.resolve(path.join(__dirname, '..', 'packages', '@spectrum-icons', name)));
topPaths.forEach((rootPath) => {
  recursive(rootPath, (err, files) => {
    let filteredFiles = files.filter(filePath => /\/src\//.test(filePath));
    filteredFiles.forEach(filePath => {
      if (filePath.endsWith('.ts')) {
        return;
      }
      let toRemove = path.basename(filePath, '.tsx');
      rimraf(path.join(rootPath, `${toRemove}.js`), [], () => {});
      rimraf(path.join(rootPath, `${toRemove}.d.ts`), [], () => {});
      rimraf(path.join(rootPath, `${toRemove}.d.ts.map`), [], () => {});
      rimraf(filePath, [], () => {});
    });
    rimraf(path.join(rootPath, 'src'), [], () => {});
  });
});
