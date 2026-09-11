#!/usr/bin/env node
'use strict';

// Seeds a Verdaccio 6 local-storage folder directly, without running the Verdaccio
// server or issuing `npm publish` for each package.
//
// Storage layout (validated against verdaccio@6.0.5 / @verdaccio/local-storage-legacy):
//   <storage>/.verdaccio-db.json          { list: [...names], secret }
//   <storage>/<name>/<unscopedName>-<version>.tgz
//   <storage>/<name>/package.json         the verdaccio "packument"
//
// Usage:
//   yarn workspaces list --json --no-private | node ./scripts/verdaccio-seed.js [storagePath]
//
// storagePath defaults to $VERDACCIO_STORAGE_PATH or /tmp/verdaccio-workspace/storage.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const packlist = require('npm-packlist');
const tar = require('tar');

const REGISTRY = process.env.SEED_REGISTRY || 'http://localhost:4000';
const CONCURRENCY = Number(process.env.SEED_CONCURRENCY) || 16;

function unscoped(name) {
  return name.startsWith('@') ? name.slice(name.indexOf('/') + 1) : name;
}

function tarballBuffer(dir, files) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    tar
      .create({cwd: dir, gzip: true, portable: true, prefix: 'package/'}, files)
      .on('data', c => chunks.push(c))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject);
  });
}

async function seedOne(storagePath, location) {
  const dir = path.resolve(process.cwd(), location);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  if (manifest.private) {
    return null;
  }
  const {name, version} = manifest;
  if (!name || !version) {
    throw new Error(`Workspace at ${location} is missing name or version`);
  }

  const files = await packlist({path: dir});
  const buf = await tarballBuffer(dir, files);

  const shasum = crypto.createHash('sha1').update(buf).digest('hex');
  const integrity = 'sha512-' + crypto.createHash('sha512').update(buf).digest('base64');
  const tgzName = `${unscoped(name)}-${version}.tgz`;

  const pkgDir = path.join(storagePath, name);
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(path.join(pkgDir, tgzName), buf);

  const now = new Date().toISOString();
  const versionManifest = Object.assign({}, manifest, {
    _id: `${name}@${version}`,
    dist: {integrity, shasum, tarball: `${REGISTRY}/${name}/-/${tgzName}`}
  });
  const packument = {
    name,
    versions: {[version]: versionManifest},
    time: {modified: now, created: now, [version]: now},
    users: {},
    'dist-tags': {latest: version},
    _uplinks: {},
    _distfiles: {},
    _attachments: {[tgzName]: {shasum, version}},
    _rev: '1-' + crypto.randomBytes(8).toString('hex'),
    _id: name,
    readme: manifest.readme || 'ERROR: No README data found!'
  };
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(packument));
  return name;
}

async function readWorkspaceLocations() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return chunks
    .join('')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
    .filter(ws => ws.name && ws.location && ws.location !== '.')
    .map(ws => ws.location);
}

async function pool(items, worker, size) {
  const results = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({length: Math.min(size, items.length)}, run));
  return results;
}

async function main() {
  const storagePath = path.resolve(
    process.argv[2] || process.env.VERDACCIO_STORAGE_PATH || '/tmp/verdaccio-workspace/storage'
  );
  fs.mkdirSync(storagePath, {recursive: true});

  const locations = await readWorkspaceLocations();
  const start = Date.now();
  const seeded = await pool(locations, loc => seedOne(storagePath, loc), CONCURRENCY);
  const names = seeded.filter(Boolean);

  const dbPath = path.join(storagePath, '.verdaccio-db.json');
  let db = {list: [], secret: crypto.randomBytes(16).toString('hex')};
  if (fs.existsSync(dbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      // corrupt/empty db, start fresh
    }
  }
  db.list = Array.from(new Set([...(db.list || []), ...names]));
  fs.writeFileSync(dbPath, JSON.stringify(db));

  console.log(
    `Seeded ${names.length} packages into ${storagePath} in ${((Date.now() - start) / 1000).toFixed(1)}s`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
