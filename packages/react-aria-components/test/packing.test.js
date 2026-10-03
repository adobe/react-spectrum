const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');
const tar = require('tar');

const root = path.resolve(__dirname, '../../..');
const yarn = path.join(root, '.yarn/releases/yarn-4.18.0.cjs');
const helper = path.join(root, 'scripts/prepareForPublish.js');
const names = ['react-aria', 'react-stately', 'react-aria-components'];
let fixture;
const originals = new Map();

beforeAll(() => {
  fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'spectrum-pack-'));
  fs.writeFileSync(
    path.join(fixture, 'package.json'),
    JSON.stringify({private: true, workspaces: ['packages/*']})
  );
  for (let name of names) {
    let manifest = JSON.parse(fs.readFileSync(path.join(root, 'packages', name, 'package.json')));
    delete manifest.dependencies;
    delete manifest.devDependencies;
    delete manifest.peerDependencies;
    manifest.scripts = {
      prepack: `node "${helper}" prepare`,
      postpack: `node "${helper}" restore`
    };
    let dir = path.join(fixture, 'packages', name);
    fs.mkdirSync(path.join(dir, 'exports'), {recursive: true});
    fs.mkdirSync(path.join(dir, 'src'));
    fs.mkdirSync(path.join(dir, 'dist/exports'), {recursive: true});
    fs.writeFileSync(path.join(dir, 'exports/index.ts'), 'export const source = true;');
    fs.writeFileSync(path.join(dir, 'src/index.ts'), 'export const source = true;');
    fs.writeFileSync(path.join(dir, 'dist/exports/index.mjs'), 'export const built = true;');
    let contents = JSON.stringify(manifest, null, 2) + '\n';
    originals.set(name, contents);
    fs.writeFileSync(path.join(dir, 'package.json'), contents);
  }
  execFileSync(process.execPath, [yarn, 'install', '--mode=skip-build'], {
    cwd: fixture,
    stdio: 'inherit'
  });
}, 120000);

afterAll(() => {
  fs.rmSync(fixture, {recursive: true, force: true});
});

async function checkArchive(name, archive) {
  let entries = [];
  await tar.list({file: archive, onReadEntry: entry => entries.push(entry.path)});
  expect(entries.some(entry => /^package\/(src|exports)\//.test(entry))).toBe(false);
  let destination = fs.mkdtempSync(path.join(fixture, 'unpacked-'));
  await tar.extract({file: archive, cwd: destination});
  let manifest = JSON.parse(fs.readFileSync(path.join(destination, 'package/package.json')));
  let original = JSON.parse(originals.get(name));
  expect(manifest.source).toBeUndefined();
  for (let [key, conditions] of Object.entries(original.exports)) {
    if (conditions && typeof conditions === 'object') {
      let expected = {...conditions};
      delete expected.source;
      expect(manifest.exports[key]).toEqual(expected);
    } else {
      expect(manifest.exports[key]).toEqual(conditions);
    }
  }
  expect(fs.readFileSync(path.join(fixture, 'packages', name, 'package.json'), 'utf8')).toBe(
    originals.get(name)
  );
  expect(
    fs.existsSync(path.join(fixture, 'packages', name, 'exports/.package-json-before-pack'))
  ).toBe(false);
}

test.each(names)(
  'npm packing %s omits source references and restores local resolution',
  async name => {
    let dir = path.join(fixture, 'packages', name);
    execFileSync('npm', ['pack', '--pack-destination', dir], {cwd: dir});
    let archive = fs.readdirSync(dir).find(file => file.endsWith('.tgz'));
    await checkArchive(name, path.join(dir, archive));
    fs.unlinkSync(path.join(dir, archive));
  },
  120000
);

test.each(names)(
  'Yarn packing %s omits source references and restores local resolution',
  async name => {
    let dir = path.join(fixture, 'packages', name);
    let archive = path.join(fixture, `${name}-yarn.tgz`);
    execFileSync(process.execPath, [yarn, 'pack', '--out', archive], {cwd: dir});
    await checkArchive(name, archive);
  },
  120000
);

test('direct Verdaccio seeding strips source in tarballs and registry manifests', async () => {
  let storage = path.join(fixture, 'storage');
  let input = names.map(name => JSON.stringify({name, location: `packages/${name}`})).join('\n');
  execFileSync(process.execPath, [path.join(root, 'scripts/verdaccio-seed.js'), storage], {
    cwd: fixture,
    input
  });
  for (let name of names) {
    let dir = path.join(storage, name);
    let archive = fs.readdirSync(dir).find(file => file.endsWith('.tgz'));
    await checkArchive(name, path.join(dir, archive));
    let registry = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')));
    let manifest = Object.values(registry.versions)[0];
    expect(manifest.source).toBeUndefined();
    expect(manifest.exports['.'].source).toBeUndefined();
    expect(manifest.exports['./*'].source).toBeUndefined();
  }
}, 120000);
