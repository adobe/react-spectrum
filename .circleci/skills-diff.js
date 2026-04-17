#!/usr/bin/env node
// Generate a reviewer-friendly markdown diff between two agent-skill trees.
// Usage: node skills-diff.js <mainDir> <branchDir> > skills-diff.md
const fs = require('fs');
const path = require('path');

const MAX_OUTPUT_CHARS = 60000;
const MAX_FILE_DIFF_LINES = 400;
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

// Minimal LCS-based unified diff — avoids any runtime deps (Octokit aside,
// this script runs before `yarn install` results are guaranteed to have
// extra libraries beyond what's already pinned).
function diffLines(a, b) {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const n = aLines.length;
  const m = bLines.length;
  // LCS length table
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

function truncateDiff(lines) {
  if (lines.length <= MAX_FILE_DIFF_LINES) {
    return {lines, truncated: false};
  }
  return {
    lines: lines.slice(0, MAX_FILE_DIFF_LINES),
    truncated: true,
    omitted: lines.length - MAX_FILE_DIFF_LINES
  };
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
      // Both exist — compare bytes first (fast path).
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
    // Empty file signals "no changes" to the PR comment script.
    process.stdout.write('');
    return;
  }

  const parts = [];
  parts.push('### Summary');
  parts.push('');
  parts.push(`- **Added:** ${added.length}`);
  parts.push(`- **Removed:** ${removed.length}`);
  parts.push(`- **Modified:** ${modified.length}`);
  parts.push('');

  const listFiles = (label, files) => {
    if (!files.length) {
      return;
    }
    parts.push(`<details><summary>${label} (${files.length})</summary>`);
    parts.push('');
    for (const f of files) {
      parts.push(`- \`${f}\``);
    }
    parts.push('');
    parts.push('</details>');
    parts.push('');
  };

  listFiles('Added', added);
  listFiles('Removed', removed);

  if (modified.length) {
    parts.push('### Modified files');
    parts.push('');
    for (const rel of modified) {
      const ext = path.extname(rel).toLowerCase();
      parts.push(`<details><summary><code>${rel}</code></summary>`);
      parts.push('');
      if (!TEXT_EXTS.has(ext)) {
        parts.push('_Binary or non-text file — diff omitted._');
      } else {
        const a = readMaybeText(mainFiles.get(rel));
        const b = readMaybeText(branchFiles.get(rel));
        if (a === null || b === null) {
          parts.push('_Binary content detected — diff omitted._');
        } else {
          const diff = diffLines(a, b);
          const onlyContext = diff.every(l => l.startsWith(' '));
          if (onlyContext) {
            parts.push('_Trailing-whitespace or encoding-only change._');
          } else {
            const {lines, truncated, omitted} = truncateDiff(diff);
            parts.push('```diff');
            parts.push(lines.join('\n'));
            parts.push('```');
            if (truncated) {
              parts.push('');
              parts.push(`_… ${omitted} more diff lines truncated. See the \`skills-diff.md\` workflow artifact for the full diff._`);
            }
          }
        }
      }
      parts.push('');
      parts.push('</details>');
      parts.push('');
    }
  }

  let out = parts.join('\n');
  if (out.length > MAX_OUTPUT_CHARS) {
    out = out.slice(0, MAX_OUTPUT_CHARS) +
      '\n\n_… output truncated to fit GitHub comment size limit. See the `skills-diff.md` workflow artifact for the full diff._\n';
  }
  process.stdout.write(out);
}

main();
