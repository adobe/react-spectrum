#!/usr/bin/env node
// Generate a reviewer-friendly markdown diff between two agent-skill trees.
//
// Usage:
//   node skills-diff.js <mainDir> <branchDir> > skills-diff.md
//
// Writes a short summary (file list with +/- counts) to stdout. Per-file
// bullets and install commands link to the deployed branch build.
const fs = require('fs');
const path = require('path');

const MAX_SUMMARY_CHARS = 60000;
const TEXT_EXTS = new Set(['.md', '.json', '.txt']);

const S2_BASE = 'https://d1pzu54gtk2aed.cloudfront.net';
const RAC_BASE = 'https://d5iwopk28bdhl.cloudfront.net';

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
      out.push(' ' + aLines[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push('-' + aLines[i]);
      i++;
    } else {
      out.push('+' + bLines[j]);
      j++;
    }
  }
  while (i < n) {
    out.push('-' + aLines[i++]);
  }
  while (j < m) {
    out.push('+' + bLines[j++]);
  }
  return out;
}

function countLines(s) {
  if (s.length === 0) {
    return 0;
  }
  return s.split('\n').length - (s.endsWith('\n') ? 1 : 0);
}

function changeStats(diff) {
  let added = 0;
  let removed = 0;
  for (const line of diff) {
    const c = line.charAt(0);
    if (c === '+') {
      added++;
    } else if (c === '-') {
      removed++;
    }
  }
  return {added, removed};
}

function countChanges(mainPath, branchPath) {
  const ext = path.extname(branchPath || mainPath).toLowerCase();
  if (!TEXT_EXTS.has(ext)) {
    return null;
  }
  if (mainPath && !branchPath) {
    const a = readMaybeText(mainPath);
    if (a === null) {
      return null;
    }
    return {added: 0, removed: countLines(a)};
  }
  if (!mainPath && branchPath) {
    const b = readMaybeText(branchPath);
    if (b === null) {
      return null;
    }
    return {added: countLines(b), removed: 0};
  }
  const a = readMaybeText(mainPath);
  const b = readMaybeText(branchPath);
  if (a === null || b === null) {
    return null;
  }
  return changeStats(diffLines(a, b));
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

// Map "s2/skills/<rest>" / "react-aria/skills/<rest>" (the layout produced
// by build-skills.sh) to a cloudfront URL on the branch build.
function fileUrl(relPath, sha) {
  if (!sha) {
    return null;
  }
  const parts = relPath.split(path.sep);
  const lib = parts[0];
  const rest = parts.slice(1).join('/');
  // `rest` starts with "skills/...", the deploy lands it under /.well-known/
  let base;
  if (lib === 's2') {
    base = S2_BASE;
  } else if (lib === 'react-aria') {
    base = RAC_BASE;
  } else {
    return null;
  }
  return `${base}/pr/${sha}/.well-known/${rest}`;
}

function bulletLabel(relPath, sha) {
  const url = fileUrl(relPath, sha);
  return url ? `[\`${relPath}\`](${url})` : `\`${relPath}\``;
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

function renderSummary({added, removed, modified, mainFiles, branchFiles, sha}) {
  const parts = [];

  const listSection = (label, files, linkable, getCounts) => {
    if (!files.length) {
      return;
    }
    parts.push(`<details><summary>${label} (${files.length})</summary>`);
    parts.push('');
    for (const f of files) {
      const labelMd = linkable ? bulletLabel(f, sha) : `\`${f}\``;
      const counts = getCounts ? getCounts(f) : null;
      const suffix = counts ? ` ${colorCounts(counts)}` : '';
      parts.push(`- ${labelMd}${suffix}`);
    }
    parts.push('');
    parts.push('</details>');
    parts.push('');
  };

  listSection('Added', added, true, f => countChanges(null, branchFiles.get(f)));
  listSection('Removed', removed, false);
  listSection('Modified', modified, true, f => countChanges(mainFiles.get(f), branchFiles.get(f)));

  if (sha) {
    parts.push('<details><summary>Install</summary>');
    parts.push('');
    parts.push('React Spectrum S2:');
    parts.push('');
    parts.push('```');
    parts.push(`npx skills add ${S2_BASE}/pr/${sha}/`);
    parts.push('```');
    parts.push('');
    parts.push('React Aria:');
    parts.push('');
    parts.push('```');
    parts.push(`npx skills add ${RAC_BASE}/pr/${sha}/`);
    parts.push('```');
    parts.push('');
    parts.push('</details>');
    parts.push('');
  }

  let out = parts.join('\n');
  if (out.length > MAX_SUMMARY_CHARS) {
    out =
      out.slice(0, MAX_SUMMARY_CHARS) +
      '\n\n_… output truncated to fit GitHub comment size limit._\n';
  }
  return out;
}

function main() {
  const [mainDir, branchDir] = process.argv.slice(2);
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

  const sha = process.env.CIRCLE_SHA1 || '';
  process.stdout.write(
    renderSummary({
      added,
      removed,
      modified,
      mainFiles,
      branchFiles,
      sha
    })
  );
}

main();
