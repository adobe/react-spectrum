#!/usr/bin/env node
// Diff two yarn v8 lockfiles by descriptor → version, printing a readable
// summary to stdout. No external dependencies so it runs anywhere in CI.

const fs = require('fs');

function parseLockfile(path) {
  const text = fs.readFileSync(path, 'utf8');
  const lines = text.split('\n');
  const entries = new Map(); // descriptor string → version
  let pendingDescriptors = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith('#') || line.startsWith('__metadata')) {
      pendingDescriptors = null;
      continue;
    }
    if (line[0] !== ' ' && line.endsWith(':')) {
      // A top-level key line. Strip the trailing ':' and split on ', ' for
      // multi-descriptor entries. Each descriptor may be wrapped in quotes.
      const raw = line.slice(0, -1);
      pendingDescriptors = raw.split(/,\s*/).map((d) => d.replace(/^"|"$/g, ''));
      continue;
    }
    if (pendingDescriptors && line.startsWith('  version:')) {
      const version = line.slice('  version:'.length).trim().replace(/^"|"$/g, '');
      for (const d of pendingDescriptors) entries.set(d, version);
      pendingDescriptors = null;
    }
  }
  return entries;
}

function descriptorName(descriptor) {
  // Strip "@npm:..." / "@workspace:..." / "@patch:..." suffix to get the package name.
  const at = descriptor.lastIndexOf('@');
  return at > 0 ? descriptor.slice(0, at) : descriptor;
}

const [, , beforePath, afterPath] = process.argv;
if (!beforePath || !afterPath) {
  console.error('usage: verdaccio-lockfile-diff.js <before-lock> <after-lock>');
  process.exit(2);
}

const before = parseLockfile(beforePath);
const after = parseLockfile(afterPath);

const added = [];
const removed = [];
const changed = [];

for (const [descriptor, version] of after) {
  if (!before.has(descriptor)) {
    added.push({descriptor, version});
  } else if (before.get(descriptor) !== version) {
    changed.push({descriptor, from: before.get(descriptor), to: version});
  }
}
for (const [descriptor, version] of before) {
  if (!after.has(descriptor)) removed.push({descriptor, version});
}

const byName = (a, b) => descriptorName(a.descriptor).localeCompare(descriptorName(b.descriptor)) || a.descriptor.localeCompare(b.descriptor);
added.sort(byName);
removed.sort(byName);
changed.sort(byName);

console.log('===== yarn.lock diff =====');
console.log(`before: ${beforePath}`);
console.log(`after:  ${afterPath}`);
console.log(`changed: ${changed.length}  added: ${added.length}  removed: ${removed.length}`);
console.log('');

if (changed.length) {
  console.log('--- version changed ---');
  for (const e of changed) console.log(`  ${e.descriptor}  ${e.from} -> ${e.to}`);
  console.log('');
}
if (added.length) {
  console.log('--- added descriptors ---');
  for (const e of added) console.log(`  ${e.descriptor}  @ ${e.version}`);
  console.log('');
}
if (removed.length) {
  console.log('--- removed descriptors ---');
  for (const e of removed) console.log(`  ${e.descriptor}  @ ${e.version}`);
  console.log('');
}

console.log('--- distinct package names with any change ---');
const names = new Set();
for (const e of [...changed, ...added, ...removed]) names.add(descriptorName(e.descriptor));
for (const n of [...names].sort()) console.log(`  ${n}`);
console.log('===== end yarn.lock diff =====');
