
let fs = require('fs');
let path = require('path');
let child_process = require('child_process');
let rimraf = require('rimraf');
let commandLineArgs = require('command-line-args');
let process = require('process');
// let fg = require('fast-glob');
let TextFileDiff = require('text-file-diff').default;
const {parse} = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

let optionDefinitions = [
  {name: 'verbose', alias: 'v', type: Boolean},
  {name: 'ignore-install', alias: 'i', type: Boolean},
  {name: 'files', alias: 'f', multiple: true, type: String, description: 'A glob pattern relative to the project root.'}
];

let diff = ''
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

  setupPromise.then(async function () {
    process.chdir('..');
    let files = options.files;
    for (let i = 0; i < files.length; i++) {
      let srcFile = files[i];
      let publishedFile = path.join('scripts/diffTS/temp/node_modules', files[i].replace('packages/', ''));
      console.log(srcFile, publishedFile);
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
  let branchSource = fs.readFileSync(srcFile, {encoding: 'utf8'});
  let publishedSource = fs.readFileSync(publishedFile, {encoding: 'utf8'});
  let branchAST = parse(branchSource, opts);
  let publishedAST = parse(publishedSource, opts);
  // find things added
  traverse(branchAST, {
    TSInterfaceDeclaration(path) {
      console.log(path.node.id.name);
    },
    // we want to know if we've added a named export
    ExportNamedDeclaration(path) {
      console.log(path.node.declaration.declarations[0].id.name);
      let name = path.node.declaration.declarations[0].id.name;
      let found = false;
      traverse(publishedAST, {
        ExportNamedDeclaration(path) {
          if (path.node.declaration.declarations[0].id.name === name) {
            found = true;
          }
        }
      });
      if (!found) {
        console.warn(`named export ${name} added in ${srcFile}`);
      }
    }
  });

  // find things removed
  traverse(publishedAST, {
    TSInterfaceDeclaration(path) {
      console.log(path.node.id.name);
    },
    // we know we don't want any named exports to be missing in the branch
    ExportNamedDeclaration(path) {
      console.log(path.node.declaration.declarations[0].id.name);
      let name = path.node.declaration.declarations[0].id.name;
      let found = false;
      traverse(branchAST, {
        ExportNamedDeclaration(path) {
          if (path.node.declaration.declarations[0].id.name === name) {
            found = true;
          }
        }
      });
      if (!found) {
        console.error(`named export ${name} removed in ${srcFile}`);
      }
    }
  });
}

main();
