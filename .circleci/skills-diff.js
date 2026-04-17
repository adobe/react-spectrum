#!/usr/bin/env node
// Generate a reviewer-friendly markdown diff between two agent-skill trees.
// Usage: node skills-diff.js <mainDir> <branchDir> > skills-diff.md
const fs = require('fs');
const path = require('path');

const MAX_OUTPUT_CHARS = 60000;
const TEXT_EXTS = new Set(['.md', '.json', '.txt']);

function walk(root) {
  const out = new Map();
  if (!fs.existsSync(root)) {
    return out;
  }
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        out.set(path.relative(root, full), full);
      }
    }
  }
  return out;
}

function readMaybeText(p) {
  const buf = fs.readFileSync(p);
  // Heuristic: treat files with a NUL byte in the first 4KB as binary.
  const sample = buf.slice(0, Math.min(buf.length, 4096));
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 0) {
      return null;
    }
  }
  return buf.toString('utf8');
}

// Minimal LCS-based unified diff — avoids any runtime deps.
function diffLines(a, b) {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const n = aLines.length;
  const m = bLines.length;
  const dp = Array.from({length: n + 1}, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (aLines[i] === bLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aLines[i] === bLines[j]) {
      out.push(' ');
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push('-');
      i++;
    } else {
      out.push('+');
      j++;
    }
  }
  while (i < n) { out.push('-'); i++; }
  while (j < m) { out.push('+'); j++; }
  return out;
}

function countLines(s) {
  if (s.length === 0) {
    return 0;
  }
  // A final newline doesn't add a line.
  return s.split('\n').length - (s.endsWith('\n') ? 1 : 0);
}

function countChanges(mainPath, branchPath) {
  const ext = path.extname(branchPath || mainPath).toLowerCase();
  if (!TEXT_EXTS.has(ext)) {
    return null;
  }
  const a = mainPath ? readMaybeText(mainPath) : '';
  const b = branchPath ? readMaybeText(branchPath) : '';
  if (a === null || b === null) {
    return null;
  }
  if (mainPath && !branchPath) {
    return {added: 0, removed: countLines(a)};
  }
  if (!mainPath && branchPath) {
    return {added: countLines(b), removed: 0};
  }
  let added = 0;
  let removed = 0;
  for (const op of diffLines(a, b)) {
    if (op === '+') {
      added++;
    } else if (op === '-') {
      removed++;
    }
  }
  return {added, removed};
}

// GitHub renders $\color{...}$ math spans in comments, which is the only
// reliable way to get inline red/green text without images.
function colorCounts(counts) {
  if (!counts) {
    return '';
  }
  const parts = [];
  if (counts.added) {
    parts.push(`$\\color{green}{+${counts.added}}$`);
  }
  if (counts.removed) {
    parts.push(`$\\color{red}{-${counts.removed}}$`);
  }
  return parts.join(' ');
}

function classify(mainFiles, branchFiles) {
  const added = [];
  const removed = [];
  const modified = [];
  const allKeys = new Set([...mainFiles.keys(), ...branchFiles.keys()]);
  for (const key of [...allKeys].sort()) {
    const mainPath = mainFiles.get(key);
    const branchPath = branchFiles.get(key);
    if (mainPath && !branchPath) {
      removed.push(key);
    } else if (!mainPath && branchPath) {
      added.push(key);
    } else {
      const a = fs.readFileSync(mainPath);
      const b = fs.readFileSync(branchPath);
      if (!a.equals(b)) {
        modified.push(key);
      }
    }
  }
  return {added, removed, modified};
}

function main() {
  const [, , mainDir, branchDir] = process.argv;
  if (!mainDir || !branchDir) {
    console.error('usage: skills-diff.js <mainDir> <branchDir>');
    process.exit(1);
  }

  const mainFiles = walk(mainDir);
  const branchFiles = walk(branchDir);
  const {added, removed, modified} = classify(mainFiles, branchFiles);

  if (added.length === 0 && removed.length === 0 && modified.length === 0) {
    process.stdout.write('');
    return;
  }

  const parts = [];

  const listSection = (label, files, getCounts) => {
    if (!files.length) {
      return;
    }
    parts.push(`<details><summary>${label} (${files.length})</summary>`);
    parts.push('');
    for (const f of files) {
      const counts = getCounts ? getCounts(f) : null;
      const suffix = counts ? ` ${colorCounts(counts)}` : '';
      parts.push(`- \`${f}\`${suffix}`);
    }
    parts.push('');
    parts.push('</details>');
    parts.push('');
  };

  listSection('Added', added, f => countChanges(null, branchFiles.get(f)));
  listSection('Removed', removed);
  listSection('Modified', modified, f => countChanges(mainFiles.get(f), branchFiles.get(f)));

  const buildUrl = process.env.CIRCLE_BUILD_URL;
  if (buildUrl) {
    parts.push(`[View full skills diff](${buildUrl}#artifacts)`);
    parts.push('');
  }

  let out = parts.join('\n');
  if (out.length > MAX_OUTPUT_CHARS) {
    out = out.slice(0, MAX_OUTPUT_CHARS) +
      '\n\n_… output truncated to fit GitHub comment size limit._\n';
  }
  process.stdout.write(out);
}

main();
