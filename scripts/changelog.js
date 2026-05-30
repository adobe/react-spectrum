const exec = require('child_process').execSync;
const spawn = require('child_process').spawnSync;
const fs = require('fs');
const path = require('path');
const Octokit = require('@octokit/rest');

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
});

const LIBRARY_ORDER = ['React Aria Components', 'Spectrum 2'];

const LIBRARY_CONFIG = {
  'React Aria Components': {
    releasesDir: 'packages/dev/s2-docs/pages/react-aria/releases',
    tag: 'React Aria',
    docsDir: 'packages/dev/s2-docs/pages/react-aria'
  },
  'Spectrum 2': {
    releasesDir: 'packages/dev/s2-docs/pages/s2/releases',
    tag: 'S2',
    docsDir: 'packages/dev/s2-docs/pages/s2'
  }
};

function packageToLibrary(name) {
  // Skip this package
  if (name.startsWith('@spectrum-icons/')) {
    return null;
  }
  if (
    name.startsWith('@internationalized/') ||
    name === 'react-stately' ||
    name.startsWith('@react-stately/') ||
    name === 'react-aria' ||
    name.startsWith('@react-aria/') ||
    name === 'react-aria-components' ||
    name === 'tailwindcss-react-aria-components' ||
    name.startsWith('@react-types/')
  ) {
    return 'React Aria Components';
  }
  if (name === '@react-spectrum/s2') {
    return 'Spectrum 2';
  }
  // V3 has no LIBRARY_CONFIG entry. Its commits are collected but only printed
  // as a warning, never written to a file. See the v3Bucket handling at the end of run().
  if (name === '@adobe/react-spectrum' || name.startsWith('@react-spectrum/')) {
    return 'React Spectrum';
  }
  return null;
}

function nextVersionFilename(releasesDir) {
  let entries = fs.readdirSync(releasesDir);
  let versions = [];
  for (let entry of entries) {
    let m = entry.match(/^v(\d+)-(\d+)-(\d+)\.mdx$/);
    if (m) {
      versions.push([Number(m[1]), Number(m[2]), Number(m[3])]);
    }
  }
  if (versions.length === 0) {
    return {filename: 'v1-0-0.mdx', version: '1.0.0'};
  }
  versions.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  let [major, minor] = versions[0];
  let nextMinor = minor + 1;
  // Always produces a minor bump (x.N+1.0)
  return {filename: `v${major}-${nextMinor}-0.mdx`, version: `${major}.${nextMinor}.0`};
}

function todayYMD() {
  let d = new Date();
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, '0');
  let day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function prettyDate(ymd) {
  let [y, m, d] = ymd.split('-').map(Number);
  let months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

function licenseHeader(year) {
  return `{/* Copyright ${year} Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. */}`;
}

function scaffoldS2Docs({version, dateYMD, tag, body, commitCount}) {
  let year = new Date().getFullYear();
  return `${licenseHeader(year)}

import {InstallCommand} from '../../../src/InstallCommand';

import {Layout} from '../../../src/Layout';
export default Layout;

import docs from 'docs:@react-spectrum/s2';

export const hideNav = true;
export const section = 'Releases';
export const tags = ['release', '${tag}'];
export const date = '${prettyDate(dateYMD)}';
export const title = 'v${version}';
export const description = '[TODO: 1–2 sentence highlights summary]';
export const isSubpage = true;

# v${version}

[TODO: intro paragraph]

{/* Commits: ${commitCount} */}
## Changelog

${body}

## Released packages

\`\`\`
[TODO: paste output of yarn bumpVersions here]
\`\`\`
`;
}

function resolveTag(pkgName, pkgVersion) {
  let exact = `${pkgName}@${pkgVersion}`;
  let check = spawn('git', ['rev-parse', '--verify', exact], {encoding: 'utf8'});
  if (check.status === 0) {
    return exact;
  }
  // Exact tag doesn't exist (e.g. a patch bump without a new tag) — fall back to the
  // most recent tag for this package using git's version sort.
  let list = spawn('git', ['tag', '-l', '--sort=version:refname', `${pkgName}@*`], {
    encoding: 'utf8'
  });
  let tags = list.stdout.trim().split('\n').filter(Boolean);
  return tags.length > 0 ? tags[tags.length - 1] : null;
}

async function renderCommitLine(commit) {
  let message = '';
  let user = '';
  let pr;

  // commit fields: [0] hash, [1] ISO date, [2] author name, [3] subject (from --pretty format)
  let m = commit[3].match(/(.*?) \(#(\d+)\)$/);

  if (m) {
    let prId = m[2];
    message = m[1];

    try {
      let res = await octokit.request('GET /repos/adobe/react-spectrum/pulls/{pull}', {pull: prId});
      user = `[@${res.data.user.login}](${res.data.user.html_url})`;
      pr = `https://github.com/adobe/react-spectrum/pull/${prId}`;
    } catch (e) {
      console.warn(
        `⚠ Could not fetch PR #${prId} from GitHub (${e.message}) — falling back to git author`
      );
      user = commit[2];
    }
  } else {
    message = commit[3];
    user = commit[2];
  }

  return `* ${message} - ${user}` + (pr ? ` - [PR](${pr})` : '');
}

run();

async function run() {
  let packages = exec('yarn workspaces list --json')
    .toString()
    .split(require('os').EOL)
    .filter(Boolean)
    .map(x => JSON.parse(x));

  let commitsByLibrary = new Map();
  let libraryTags = new Map();

  for (let {location} of packages) {
    let filePath = location + '/package.json';
    let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (pkg.private) {
      continue;
    }

    let library = packageToLibrary(pkg.name);
    if (!library) {
      if (!pkg.name.startsWith('@spectrum-icons/')) {
        console.warn(`⚠ No library mapping for ${pkg.name} — skipped`);
      }
      continue;
    }

    let tag = resolveTag(pkg.name, pkg.version);
    if (!tag) {
      console.warn(`⚠ No tag found for ${pkg.name}@${pkg.version} — skipped`);
      continue;
    }

    // Track the first tag seen per library as the anchor for git log ranges.
    if (!libraryTags.has(library)) {
      libraryTags.set(library, tag);
    }

    let args = [
      'log',
      `${tag}..HEAD`,
      '--pretty="%H%x00%aI%x00%an%x00%s"',
      location,

      // filter out non-code changes
      ':!**/test/**',
      ':!**/stories/**',
      ':!**/chromatic/**'
    ];

    let res = spawn('git', args, {encoding: 'utf8'});
    if (res.stdout.length === 0) {
      continue;
    }

    if (!commitsByLibrary.has(library)) {
      commitsByLibrary.set(library, new Map());
    }
    let bucket = commitsByLibrary.get(library);

    for (let line of res.stdout.split('\n')) {
      if (line === '') {
        continue;
      }

      let info = line.replace(/^"|"$/g, '').split('\0');
      if (info[3] === 'Publish') {
        // skip Publish commits
        continue;
      }
      bucket.set(info[0], info); // keyed by hash — deduplicates commits touching multiple packages
    }
  }

  // Scan docs directories for docs-only commits
  // These live in private packages skipped by the main loop above.
  for (let [library, config] of Object.entries(LIBRARY_CONFIG)) {
    if (!config.docsDir) continue;
    let tag = libraryTags.get(library);
    if (!tag) continue;

    let args = [
      'log',
      `${tag}..HEAD`,
      '--pretty="%H%x00%aI%x00%an%x00%s"',
      config.docsDir,
      ':!**/releases/**' // don't include the release note files themselves
    ];

    let res = spawn('git', args, {encoding: 'utf8'});
    if (!res.stdout || res.stdout.length === 0) continue;

    if (!commitsByLibrary.has(library)) {
      commitsByLibrary.set(library, new Map());
    }
    let bucket = commitsByLibrary.get(library);

    for (let line of res.stdout.split('\n')) {
      if (line === '') continue;
      let info = line.replace(/^"|"$/g, '').split('\0');
      if (info[3] === 'Publish') continue;
      bucket.set(info[0], info); // keyed by hash — deduplicates with source commits
    }
  }

  // Handle commits under RAC and S2
  for (let library of LIBRARY_ORDER) {
    let bucket = commitsByLibrary.get(library);
    if (!bucket || bucket.size === 0) {
      continue;
    }

    let sorted = [...bucket.values()].sort((a, b) => (a[1] < b[1] ? -1 : 1));
    let lines = await Promise.all(sorted.map(renderCommitLine));
    let body = lines.join('\n');

    let config = LIBRARY_CONFIG[library];
    let dir = config.releasesDir;
    let outPath;
    let content;

    let {filename, version} = nextVersionFilename(dir);
    outPath = path.join(dir, filename);
    content = scaffoldS2Docs({
      version,
      dateYMD: todayYMD(),
      tag: config.tag,
      body,
      commitCount: lines.length
    });

    if (fs.existsSync(outPath)) {
      console.warn(
        `⚠ ${outPath} already exists — skipping (${bucket.size} commits not written). Printing to stdout instead:\n`
      );
      console.log(`# ${library}\n`);
      console.log(body);
      console.log();
      continue;
    }

    fs.writeFileSync(outPath, content);
    console.log(`✓ Wrote ${outPath} (${bucket.size} commits)`);
  }

  // Handle commits in V3
  let v3Bucket = commitsByLibrary.get('React Spectrum');
  if (v3Bucket && v3Bucket.size > 0) {
    console.warn(
      `\nℹ ${v3Bucket.size} React Spectrum (v3) commit(s) were not written to a file. Review them manually if needed:\n`
    );
    let sorted = [...v3Bucket.values()].sort((a, b) => (a[1] < b[1] ? -1 : 1));
    for (let commit of sorted) {
      console.warn(`  ${commit[3]}`);
    }
    console.warn();
  }
}
