
let fs = require('fs');
let path = require('path');
let child_process = require('child_process');
let rimraf = require('rimraf');
let commandLineArgs = require('command-line-args');
let process = require('process');
let fg = require('fast-glob');
let TextFileDiff = require('text-file-diff').default;
let {parse} = require('@babel/parser');
let traverse = require('@babel/traverse').default;
let t = require('@babel/types');
let readPkgUp = require('read-pkg-up');
let esquery = require('esquery');

let optionDefinitions = [
  {name: 'verbose', alias: 'v', type: Boolean},
  {name: 'ignore-install', alias: 'i', type: Boolean},
  {name: 'files', alias: 'f', type: String, description: 'A glob pattern relative to the project root. Defaults to "**/*.d.ts"'}
];

let diff = '';
let m = new TextFileDiff();
m.on('compared', (line1, line2, compareResult, lineReader1, lineReader2) => {
  // event triggered immediately after line comparison
  // but before +- event
});

m.on('-', line => {
  // when a line is in file1 but not in file2
  diff += '-' + line + '\n';
});

m.on('+', line => {
  // when a line is in file2 but not in file1
  diff += '+' + line + '\n';
});

function main() {
  let options = commandLineArgs(optionDefinitions);

  let setupResolve;
  let setupReject;
  let setupPromise = new Promise(function (resolve, reject) {
    setupResolve = resolve;
    setupReject = reject;
  });
  if (!options['ignore-install']) {
    rimraf(path.join(__dirname, 'temp'), function () {
      installLatestRelease()
        .then(function () {
          setupResolve();
        });
    });
  } else {
    setupResolve();
  }

  setupPromise.then(function () {
    let filesGlob = options.files;
    let branchFiles = fg.sync(`packages/${filesGlob}`);
    let files = branchFiles.filter((file) => {
      return !readPkgUp.sync({cwd: path.dirname(file)}).private;
    });
    console.log(files);
    // be smarter about this, maybe look at all of our scopes from 'branchFiles' to build this?
    let publishedFiles = fg.sync(`scripts/diffTS/temp/node_modules/(@react-aria|@react-spectrum|@react-stately|@internationalized|@react-types|@spectrum-icons)/${filesGlob}`);
    for (let i = 0; i < files.length; i++) {
      let srcFile = files[i];
      let publishedFile = path.join('scripts/diffTS/temp/node_modules', files[i].replace('packages/', ''));
      compareFiles(path.join(__dirname, '../..', srcFile), path.join(__dirname, '../..', publishedFile));
    }
  });
}

function installLatestRelease() {
  fs.mkdirSync(path.join(__dirname, 'temp'));
  fs.writeFileSync(path.join(__dirname, 'temp', 'package.json'), '{"name": "temp"}');
  let installResolve;
  let installReject;
  let installPromise = new Promise(function (resolve, reject) {
    installResolve = resolve;
    installReject = reject;
  });
  child_process.exec('npm install @adobe/react-spectrum', {cwd: path.join(__dirname, 'temp')}, function (err) {
    if (err) {
      console.log('error installing latest version', err);
      installReject();
    } else {
      console.log('done installing latest version');
      installResolve();
    }
  });
  return installPromise;
}

function diffFiles(srcFile, publishedFile) {
  return m.diff(publishedFile, srcFile)
    .then(function (result) {
      console.log(diff);
    });
}

function compareFiles(srcFile, publishedFile) {
  let opts = {
    filename: this.name,
    allowReturnOutsideFunction: true,
    strictMode: false,
    sourceType: 'module',
    plugins: ['classProperties', 'exportDefaultFrom', 'exportNamespaceFrom', 'dynamicImport', 'typescript', 'jsx']
  };
  if (!fs.existsSync(publishedFile)) {
    console.warn(`module added ${srcFile}`);
    return;
  }
  if (!fs.existsSync(srcFile)) {
    console.error(`module removed ${srcFile}`);
    return;
  }
  let branchSource = fs.readFileSync(srcFile, {encoding: 'utf8'});
  let publishedSource = fs.readFileSync(publishedFile, {encoding: 'utf8'});
  let branchAST = parse(branchSource, opts);
  let publishedAST = parse(publishedSource, opts);
  let matches = esquery(branchAST, 'ExportNamedDeclaration');
  console.log(matches);
  // find things added or changed
  traverse(branchAST, {
    TSInterfaceDeclaration(path) {
      //console.log(path.node.id.name);
    },
    // we want to know if we've added a named export
    ExportNamedDeclaration(path) {
      let names;
      if (path.node.specifiers) {
        names = path.node.specifiers.map(specifier => specifier.exported.name);
      } else if (path.node.declaration.type === 'TSTypeAliasDeclaration' || path.node.declaration.type === 'ClassDeclaration' || path.node.declaration.type === 'TSDeclareFunction') {
        names = [path.node.declaration.id.name];
      } else if (path.node.declaration.type === 'VariableDeclarator') {
        names = [path.node.declaration.declarations[0].id.name];
      }
      if (names) {
        let found = false;
        traverse(publishedAST, {
          ExportNamedDeclaration(path) {
            if (path.node.specifiers && path.node.specifiers.filter(specifier => names.includes(specifier.exported.name)).length === 0) {
              found = true;
            } else if ((path.node.declaration.type === 'TSTypeAliasDeclaration' || path.node.declaration.type === 'ClassDeclaration' || path.node.declaration.type === 'TSDeclareFunction') && path.node.declaration.id.name === names[0]) {
              found = true;
            } else if (path.node.declaration.type === 'VariableDeclarator' && path.node.declaration.declarations[0].id.name === name[0]) {
              found = true;
            }
          }
        });
        if (!found) {
          console.warn(`named export ${names} added in ${srcFile}`);
        }
      }
    }
  });

  // find things removed
  traverse(publishedAST, {
    TSInterfaceDeclaration(path) {
      //console.log(path.node.id.name);
    },
    // we know we don't want any named exports to be missing in the branch
    ExportNamedDeclaration(path) {
      let name;
      if (path.node.declaration.type === 'TSTypeAliasDeclaration' || path.node.declaration.type === 'ClassDeclaration' || path.node.declaration.type === 'TSDeclareFunction') {
        name = path.node.declaration.id.name;
      } else if (path.node.declaration.type === 'VariableDeclarator') {
        name = path.node.declaration.declarations[0].id.name;
      }
      if (name) {
        let found = false;
        traverse(branchAST, {
          ExportNamedDeclaration(path) {
            if ((path.node.declaration.type === 'TSTypeAliasDeclaration' || path.node.declaration.type === 'ClassDeclaration' || path.node.declaration.type === 'TSDeclareFunction') && path.node.declaration.id.name === name) {
              found = true;
            } else if (path.node.declaration.type === 'VariableDeclarator' && path.node.declaration.declarations[0].id.name === name) {
              found = true;
            }
          }
        });
        if (!found) {
          console.error(`named export ${name} removed in ${srcFile}`);
        }
      }
    }
  });
}

main();
