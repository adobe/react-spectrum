import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
// oxlint-disable-next-line rsp-rules/imports -- node:test is a built-in module.
import test from 'node:test';

const script = fileURLToPath(new URL('./packageStarter.mjs', import.meta.url));
const rootPackageJSON = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

test('starter archives pin the root Yarn without modifying the source project', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'package-starter-test-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));

  const source = JSON.stringify({
    name: 'starter',
    private: true,
    scripts: {start: 'storybook dev'}
  });
  fs.writeFileSync(path.join(dir, 'package.json'), source);
  fs.writeFileSync(path.join(dir, '.yarnrc.yml'), 'nodeLinker: node-modules\n');
  fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
  fs.writeFileSync(path.join(dir, 'index.js'), 'export default {};\n');
  fs.writeFileSync(path.join(dir, '.gitignore'), 'node_modules\n');
  fs.writeFileSync(path.join(dir, '.DS_Store'), '');
  for (const excluded of ['node_modules', 'storybook-static']) {
    fs.mkdirSync(path.join(dir, excluded));
    fs.writeFileSync(path.join(dir, excluded, 'excluded.txt'), '');
  }

  const pack = () => execFileSync(process.execPath, [script, 'starter.zip'], {cwd: dir});
  const read = file =>
    execFileSync('unzip', ['-p', path.join(dir, 'starter.zip'), file], {encoding: 'utf8'});
  pack();
  assert.deepEqual(JSON.parse(read('package.json')), {
    ...JSON.parse(source),
    packageManager: rootPackageJSON.packageManager
  });
  assert.equal(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'), source);
  assert.equal(read('.yarnrc.yml'), 'nodeLinker: node-modules\n');
  assert.equal(read('index.js'), 'export default {};\n');

  fs.unlinkSync(path.join(dir, 'index.js'));
  pack();
  const entries = execFileSync('unzip', ['-Z1', path.join(dir, 'starter.zip')], {
    encoding: 'utf8'
  })
    .trim()
    .split('\n');
  assert.deepEqual(entries.sort(), ['.yarnrc.yml', 'package.json', 'yarn.lock']);
});
