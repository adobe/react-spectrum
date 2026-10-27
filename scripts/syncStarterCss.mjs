import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = path.join(rootDir, 'starters/docs/src');
const hooksDir = path.join(rootDir, 'starters/hooks/src');

// These components intentionally use different CSS because their hooks implementations
// have different markup or behavior from their RAC counterparts.
const exceptions = new Set(['Modal.css', 'RangeCalendar.css', 'Tooltip.css']);

let args = process.argv.slice(2);
let check = args.length === 1 && args[0] === '--check';
if (args.length > 0 && !check) {
  console.error('Usage: node scripts/syncStarterCss.mjs [--check]');
  process.exit(1);
}

let docsFiles = getCssFiles(docsDir);
let hooksFiles = getCssFiles(hooksDir);
let sharedFiles = [...hooksFiles].filter(file => docsFiles.has(file)).sort();
let staleExceptions = [...exceptions].filter(
  file =>
    !docsFiles.has(file) ||
    !hooksFiles.has(file) ||
    fs.readFileSync(path.join(docsDir, file)).equals(fs.readFileSync(path.join(hooksDir, file)))
);

if (staleExceptions.length > 0) {
  console.error(
    `CSS sync exceptions are missing or no longer differ:\n${staleExceptions
      .map(file => `  ${file}`)
      .join('\n')}`
  );
  process.exit(1);
}

let drifted = [];
for (let file of sharedFiles) {
  if (exceptions.has(file)) {
    continue;
  }

  let source = path.join(docsDir, file);
  let destination = path.join(hooksDir, file);
  if (!fs.readFileSync(source).equals(fs.readFileSync(destination))) {
    drifted.push(file);
    if (!check) {
      fs.copyFileSync(source, destination);
    }
  }
}

if (check && drifted.length > 0) {
  console.error(
    `Hook starter CSS is out of date:\n${drifted
      .map(file => `  ${file}`)
      .join('\n')}\nRun: yarn sync:starter-css`
  );
  process.exit(1);
}

if (check) {
  console.log(`Checked ${sharedFiles.length - exceptions.size} synchronized CSS files.`);
} else if (drifted.length > 0) {
  console.log(`Synchronized ${drifted.length} CSS files.`);
} else {
  console.log('Starter CSS is already synchronized.');
}

function getCssFiles(directory) {
  return new Set(fs.readdirSync(directory).filter(file => file.endsWith('.css')));
}
