/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');

const corePromise = import(
  pathToFileURL(path.join(REPO_ROOT, 'packages/dev/cli/s2/dist/agent-docs-core/src/index.js')).href
);
const tarModPromise = import(
  pathToFileURL(path.join(REPO_ROOT, 'packages/dev/s2-docs/scripts/lib/tarArchive.mjs')).href
);

/**
 * Builds a minimal self-contained synthetic snapshot source directory with multiple snapshots
 * (`s2@1.2.0`, `s2@1.8.2` + `rac@1.22.1`, `rac@1.4.0`) and optional verified patch equivalence.
 */
async function createSyntheticSnapshotRepo(rootDir) {
  const {packTarGz} = await tarModPromise;
  const snapshotsDir = path.join(rootDir, 'snapshots');
  fs.mkdirSync(snapshotsDir, {recursive: true});

  const makeSlice = (snapshotId, pkgName, pkgVer, library, entryIds, extraPatch = []) => {
    const safeName = pkgName.replace(/^@/, '').replace(/\//g, '__');
    const archiveEntries = [];

    const searchRecords = [];
    for (const slug of entryIds) {
      const id = `${library}:${slug}`;
      const mdRel = `docs/${library}/${slug}.md`;
      const jsonRel = `docs/${library}/${slug}.json`;
      archiveEntries.push({
        path: mdRel,
        content: `# ${slug}\n\nDocs for ${slug} (${pkgVer}).\n`
      });
      archiveEntries.push({
        path: jsonRel,
        content: JSON.stringify({
          schemaVersion: 1,
          id,
          slug,
          library,
          kind: 'component',
          title: slug,
          packageName: pkgName,
          packageVersion: pkgVer,
          summary: `${slug} summary (${pkgVer})`,
          keywords: [slug.toLowerCase()],
          imports: [`import {${slug}} from '${pkgName}';`],
          compositionRules: [],
          sections: {usage: `Usage for ${slug} in ${pkgVer}`},
          exports: [
            {
              name: slug,
              kind: 'component',
              props: [
                {
                  name: 'isDisabled',
                  type: 'boolean',
                  required: false,
                  default: null,
                  description: 'Disables the control.'
                }
              ],
              events: [],
              renderProps: [],
              slots: [],
              typeParameters: [],
              overloads: [],
              inheritsFrom: []
            }
          ],
          sourceUrl: `https://example.com/${library}/${slug}`,
          markdownRelPath: mdRel,
          jsonRelPath: jsonRel
        })
      });
      searchRecords.push({
        id,
        slug,
        library,
        kind: 'component',
        title: slug,
        packageName: pkgName,
        packageVersion: pkgVer,
        summary: `${slug} summary (${pkgVer})`,
        keywords: [slug.toLowerCase()],
        propNames: ['isDisabled']
      });
    }

    archiveEntries.push({
      path: 'search-index.json',
      content: JSON.stringify(searchRecords)
    });
    archiveEntries.push({
      path: 'slice-manifest.json',
      content: JSON.stringify({
        schemaVersion: 1,
        snapshotId,
        packageName: pkgName,
        packageVersion: pkgVer,
        libraries: [library],
        entryCount: entryIds.length
      })
    });

    const outRel = `by-id/${snapshotId}/packages/${safeName}.tar.gz`;
    const outAbs = path.join(snapshotsDir, outRel);
    fs.mkdirSync(path.dirname(outAbs), {recursive: true});
    const gzBuf = packTarGz(archiveEntries);
    fs.writeFileSync(outAbs, gzBuf);
    const sha256 = crypto.createHash('sha256').update(gzBuf).digest('hex');

    return {
      snapshotId,
      packageVersion: pkgVer,
      sliceRelPath: outRel,
      sliceSha256: sha256,
      sliceBytes: gzBuf.length,
      entryCount: entryIds.length,
      verifiedEquivalentPatches: extraPatch
    };
  };

  const s2Old = makeSlice(
    'snap-s2-1.2.0',
    '@react-spectrum/s2',
    '1.2.0',
    's2',
    ['Button'],
    ['1.2.2']
  );
  const s2New = makeSlice('snap-head', '@react-spectrum/s2', '1.8.2', 's2', ['Button', 'SideNav']);
  const racOld = makeSlice('snap-rac-1.4.0', 'react-aria-components', '1.4.0', 'rac', ['Button']);
  const racNew = makeSlice('snap-head', 'react-aria-components', '1.22.1', 'rac', [
    'Button',
    'Autocomplete'
  ]);

  const index = {
    schemaVersion: 1,
    updatedAt: '2026-04-20T00:00:00.000Z',
    latest: {
      '@react-spectrum/s2': {version: '1.8.2', snapshotId: 'snap-head'},
      'react-aria-components': {version: '1.22.1', snapshotId: 'snap-head'}
    },
    packages: {
      '@react-spectrum/s2': {
        '1.2.0': s2Old,
        '1.8.2': s2New
      },
      'react-aria-components': {
        '1.4.0': racOld,
        '1.22.1': racNew
      }
    },
    snapshots: {
      'snap-s2-1.2.0': {
        snapshotId: 'snap-s2-1.2.0',
        gitRef: '@react-spectrum/s2@1.2.0',
        gitSha: '111111111111',
        extractorVersion: '0.1.0',
        manifestRelPath: 'by-id/snap-s2-1.2.0/manifest.json',
        manifestSha256: 'a'.repeat(64),
        packages: {'@react-spectrum/s2': '1.2.0'}
      },
      'snap-rac-1.4.0': {
        snapshotId: 'snap-rac-1.4.0',
        gitRef: 'react-aria-components@1.4.0',
        gitSha: '222222222222',
        extractorVersion: '0.1.0',
        manifestRelPath: 'by-id/snap-rac-1.4.0/manifest.json',
        manifestSha256: 'b'.repeat(64),
        packages: {'react-aria-components': '1.4.0'}
      },
      'snap-head': {
        snapshotId: 'snap-head',
        gitRef: 'HEAD',
        gitSha: '333333333333',
        extractorVersion: '0.1.0',
        manifestRelPath: 'by-id/snap-head/manifest.json',
        manifestSha256: 'c'.repeat(64),
        packages: {
          '@react-spectrum/s2': '1.8.2',
          'react-aria-components': '1.22.1'
        }
      }
    }
  };

  fs.writeFileSync(path.join(snapshotsDir, 'index.json'), JSON.stringify(index, null, 2));
  return snapshotsDir;
}

test('resolves workspace dependencies across npm v3, Yarn Berry, Yarn Classic, pnpm v9 monorepo, and rejects unsupported lockfiles', async () => {
  const {resolveFromWorkspaceLockfile, resolveWorkspace} = await corePromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-locks-'));
  try {
    const snapshotSource = await createSyntheticSnapshotRepo(path.join(tmp, 'repo'));
    const cacheDir = path.join(tmp, 'cache');

    // 1. npm package-lock.json v3 monorepo workspace
    const npmRoot = path.join(tmp, 'npm-mono');
    const npmApp = path.join(npmRoot, 'apps/web');
    fs.mkdirSync(npmApp, {recursive: true});
    fs.writeFileSync(
      path.join(npmRoot, 'package.json'),
      JSON.stringify({name: 'npm-mono', private: true, workspaces: ['apps/*']})
    );
    fs.writeFileSync(
      path.join(npmApp, 'package.json'),
      JSON.stringify({
        name: 'web',
        dependencies: {'@react-spectrum/s2': '^1.2.0', 'react-aria-components': '^1.22.0'}
      })
    );
    fs.writeFileSync(
      path.join(npmRoot, 'package-lock.json'),
      JSON.stringify({
        name: 'npm-mono',
        lockfileVersion: 3,
        packages: {
          '': {workspaces: ['apps/*']},
          'apps/web': {
            dependencies: {'@react-spectrum/s2': '^1.2.0', 'react-aria-components': '^1.22.0'}
          },
          'node_modules/@react-spectrum/s2': {version: '1.2.0'},
          'node_modules/react-aria-components': {version: '1.22.1'},
          'node_modules/@react-spectrum/s2/node_modules/react-aria-components': {version: '1.4.0'}
        }
      })
    );

    const npmRes = await resolveWorkspace({cwd: npmApp, snapshotSource, cacheDir});
    assert.equal(npmRes.packages['@react-spectrum/s2'].packageVersion, '1.2.0');
    assert.equal(npmRes.packages['@react-spectrum/s2'].snapshotId, 'snap-s2-1.2.0');
    assert.equal(npmRes.packages['react-aria-components'].packageVersion, '1.22.1');
    assert.equal(npmRes.packages['react-aria-components'].snapshotId, 'snap-head');
    assert.ok(
      npmRes.warnings.some(w => w.code === 'WARN_MULTIPLE_PACKAGE_INSTANCES'),
      'Expected nested RAC divergence warning from npm lockfile'
    );

    // 2. Yarn Berry lockfile
    const berryDir = path.join(tmp, 'berry-app');
    fs.mkdirSync(berryDir, {recursive: true});
    fs.writeFileSync(
      path.join(berryDir, 'package.json'),
      JSON.stringify({name: 'berry-app', dependencies: {'@react-spectrum/s2': '^1.8.0'}})
    );
    fs.writeFileSync(
      path.join(berryDir, 'yarn.lock'),
      [
        '__metadata:',
        '  version: 8',
        '',
        '"@react-spectrum/s2@npm:^1.8.0":',
        '  version: 1.8.2',
        '  resolution: "@react-spectrum/s2@npm:1.8.2"'
      ].join('\n')
    );
    const berryLock = resolveFromWorkspaceLockfile(berryDir, {'@react-spectrum/s2': '^1.8.0'}, [
      '@react-spectrum/s2'
    ]);
    assert.equal(berryLock?.lockfileKind, 'yarn-berry');
    assert.equal(berryLock?.workspacePackages['@react-spectrum/s2'], '1.8.2');

    // 3. Yarn Classic v1 lockfile
    const classicDir = path.join(tmp, 'classic-app');
    fs.mkdirSync(classicDir, {recursive: true});
    fs.writeFileSync(
      path.join(classicDir, 'package.json'),
      JSON.stringify({name: 'classic-app', dependencies: {'react-aria-components': '^1.4.0'}})
    );
    fs.writeFileSync(
      path.join(classicDir, 'yarn.lock'),
      [
        '# yarn lockfile v1',
        '',
        'react-aria-components@^1.4.0:',
        '  version "1.4.0"',
        '  resolved "https://registry.yarnpkg.com/react-aria-components/-/react-aria-components-1.4.0.tgz"'
      ].join('\n')
    );
    const classicLock = resolveFromWorkspaceLockfile(
      classicDir,
      {'react-aria-components': '^1.4.0'},
      ['react-aria-components']
    );
    assert.equal(classicLock?.lockfileKind, 'yarn-classic');
    assert.equal(classicLock?.workspacePackages['react-aria-components'], '1.4.0');

    // 4. pnpm v9 monorepo `importers:` lockfile (only resolves target workspace importer, not sibling!)
    const pnpmRoot = path.join(tmp, 'pnpm-mono');
    const pnpmTarget = path.join(pnpmRoot, 'packages/dashboard');
    fs.mkdirSync(pnpmTarget, {recursive: true});
    fs.writeFileSync(path.join(pnpmTarget, 'package.json'), JSON.stringify({name: 'dashboard'}));
    fs.writeFileSync(
      path.join(pnpmRoot, 'pnpm-lock.yaml'),
      [
        "lockfileVersion: '9.0'",
        'importers:',
        '  packages/legacy:',
        '    dependencies:',
        "      '@react-spectrum/s2':",
        '        specifier: ^1.2.0',
        '        version: 1.2.0(react@19.0.0)',
        '  packages/dashboard:',
        '    dependencies:',
        "      '@react-spectrum/s2':",
        '        specifier: ^1.8.0',
        '        version: 1.8.2(react@19.0.0)'
      ].join('\n')
    );
    const pnpmLock = resolveFromWorkspaceLockfile(pnpmTarget, {'@react-spectrum/s2': '^1.8.0'}, [
      '@react-spectrum/s2'
    ]);
    assert.equal(pnpmLock?.lockfileKind, 'pnpm');
    assert.equal(pnpmLock?.workspacePackages['@react-spectrum/s2'], '1.8.2');

    // 5. Unsupported Bun lockfile surfaces explicit unsupported-lockfile diagnostic instead of guessing
    const bunDir = path.join(tmp, 'bun-app');
    fs.mkdirSync(bunDir, {recursive: true});
    fs.writeFileSync(
      path.join(bunDir, 'package.json'),
      JSON.stringify({name: 'bun-app', dependencies: {'@react-spectrum/s2': '^1.8.0'}})
    );
    fs.writeFileSync(path.join(bunDir, 'bun.lock'), '{}');
    const bunLock = resolveFromWorkspaceLockfile(bunDir, {'@react-spectrum/s2': '^1.8.0'}, [
      '@react-spectrum/s2'
    ]);
    assert.equal(bunLock?.lockfileKind, 'unsupported');

    // 6. Lockfiles in ancestor directories that don't cover the workspace are ignored
    const strayRoot = path.join(tmp, 'stray');
    const strayApp = path.join(strayRoot, 'projects/app');
    fs.mkdirSync(strayApp, {recursive: true});
    fs.writeFileSync(path.join(strayApp, 'package.json'), JSON.stringify({name: 'app'}));
    fs.writeFileSync(
      path.join(strayRoot, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: {'': {}, 'node_modules/@react-spectrum/s2': {version: '1.0.0'}}
      })
    );
    assert.equal(
      resolveFromWorkspaceLockfile(strayApp, {}, ['@react-spectrum/s2']),
      null,
      'npm lockfile without the workspace in `packages` must be ignored'
    );
    fs.rmSync(path.join(strayRoot, 'package-lock.json'));
    fs.writeFileSync(path.join(strayRoot, 'package.json'), JSON.stringify({name: 'stray'}));
    fs.writeFileSync(
      path.join(strayRoot, 'yarn.lock'),
      ['# yarn lockfile v1', '', '"@react-spectrum/s2@^1.0.0":', '  version "1.0.0"'].join('\n')
    );
    assert.equal(
      resolveFromWorkspaceLockfile(strayApp, {'@react-spectrum/s2': '^1.0.0'}, [
        '@react-spectrum/s2'
      ]),
      null,
      'yarn lockfile in a non-workspace ancestor must be ignored'
    );
    await assert.rejects(
      () => resolveWorkspace({cwd: bunDir, snapshotSource, cacheDir}),
      err => err.code === 'ERR_UNSUPPORTED_LOCKFILE' && err.message.includes('bun.lock')
    );
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('distinguishes unverified patch releases from verified surface-equivalent patches and detects lockfile mismatch', async () => {
  const {resolveWorkspace} = await corePromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-patches-'));
  try {
    const snapshotSource = await createSyntheticSnapshotRepo(path.join(tmp, 'repo'));
    const cacheDir = path.join(tmp, 'cache');

    // 1. Unverified patch 1.2.1 reports WARN_EXACT_PATCH_UNAVAILABLE (exactMatch=false) by default, and throws ERR_EXACT_PATCH_UNAVAILABLE under strictVersion!
    const unverifiedApp = path.join(tmp, 'app-121');
    fs.mkdirSync(path.join(unverifiedApp, 'node_modules/@react-spectrum/s2'), {recursive: true});
    fs.writeFileSync(
      path.join(unverifiedApp, 'package.json'),
      JSON.stringify({name: 'app-121', dependencies: {'@react-spectrum/s2': '1.2.1'}})
    );
    fs.writeFileSync(
      path.join(unverifiedApp, 'node_modules/@react-spectrum/s2/package.json'),
      JSON.stringify({name: '@react-spectrum/s2', version: '1.2.1'})
    );
    const nonStrictUnverified = await resolveWorkspace({
      cwd: unverifiedApp,
      snapshotSource,
      cacheDir
    });
    assert.equal(nonStrictUnverified.packages['@react-spectrum/s2'].exactMatch, false);
    const patchWarning = nonStrictUnverified.warnings.find(
      w => w.code === 'WARN_EXACT_PATCH_UNAVAILABLE'
    );
    assert.ok(patchWarning);
    assert.equal(patchWarning.details?.fallbackVersion, '1.2.0');

    await assert.rejects(
      () => resolveWorkspace({cwd: unverifiedApp, snapshotSource, cacheDir, strictVersion: true}),
      err => err.code === 'ERR_EXACT_PATCH_UNAVAILABLE'
    );

    // 2. Verified surface-equivalent patch 1.2.2 resolves cleanly with exactMatch=true AND passes strictVersion!
    const verifiedApp = path.join(tmp, 'app-122');
    fs.mkdirSync(path.join(verifiedApp, 'node_modules/@react-spectrum/s2'), {recursive: true});
    fs.writeFileSync(
      path.join(verifiedApp, 'package.json'),
      JSON.stringify({name: 'app-122', dependencies: {'@react-spectrum/s2': '^1.2.0'}})
    );
    fs.writeFileSync(
      path.join(verifiedApp, 'node_modules/@react-spectrum/s2/package.json'),
      JSON.stringify({name: '@react-spectrum/s2', version: '1.2.2'})
    );
    // Also place a conflicting lockfile (1.8.2) to verify installed wins + WARN_LOCKFILE_MISMATCH!
    fs.writeFileSync(
      path.join(verifiedApp, 'package-lock.json'),
      JSON.stringify({
        name: 'app-122',
        lockfileVersion: 3,
        packages: {
          '': {dependencies: {'@react-spectrum/s2': '^1.2.0'}},
          'node_modules/@react-spectrum/s2': {version: '1.8.2'}
        }
      })
    );

    const res = await resolveWorkspace({
      cwd: verifiedApp,
      snapshotSource,
      cacheDir,
      strictVersion: true
    });
    const prov = res.packages['@react-spectrum/s2'];
    assert.equal(prov.requestedVersion, '1.2.2');
    assert.equal(prov.packageVersion, '1.2.0');
    assert.equal(prov.snapshotId, 'snap-s2-1.2.0');
    assert.equal(prov.exactMatch, true);
    assert.ok(res.warnings.some(w => w.code === 'WARN_LOCKFILE_MISMATCH'));
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('does not replace unavailable installed or locked auxiliary versions with component snapshot versions', async () => {
  const {resolveWorkspace} = await corePromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-aux-versions-'));
  try {
    const snapshotSource = path.join(tmp, 'snapshots');
    fs.mkdirSync(snapshotSource);
    const pointer = packageVersion => ({
      packageVersion,
      snapshotId: 'snapshot',
      sliceRelPath: 'unused',
      sliceSha256: 'unused'
    });
    fs.writeFileSync(
      path.join(snapshotSource, 'index.json'),
      JSON.stringify({
        schemaVersion: 1,
        latest: {},
        packages: {
          'react-aria-components': {'1.0.0': pointer('1.0.0')},
          '@internationalized/date': {'3.8.0': pointer('3.8.0')}
        },
        snapshots: {
          snapshot: {
            snapshotId: 'snapshot',
            packages: {
              'react-aria-components': '1.0.0',
              '@internationalized/date': '3.8.0'
            }
          }
        }
      })
    );
    for (const source of ['installed', 'lockfile']) {
      const app = path.join(tmp, source);
      fs.mkdirSync(app);
      const opts = {cwd: app, snapshotSource, cacheDir: path.join(tmp, 'cache')};
      for (const version of ['3.8.1', '3.9.0']) {
        const dependencies = {'react-aria-components': '1.0.0', '@internationalized/date': version};
        fs.writeFileSync(
          path.join(app, 'package.json'),
          JSON.stringify({name: 'app', dependencies})
        );
        const packages = {'': {dependencies}};
        for (const [name, version] of Object.entries(dependencies)) {
          packages[`node_modules/${name}`] = {version};
        }
        const installed = source === 'installed' ? Object.entries(dependencies) : [];
        for (const [name, version] of installed) {
          const dir = path.join(app, 'node_modules', name);
          fs.mkdirSync(dir, {recursive: true});
          fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({name, version}));
        }
        fs.writeFileSync(
          path.join(app, 'package-lock.json'),
          JSON.stringify({lockfileVersion: 3, packages})
        );
        await assert.rejects(
          () => resolveWorkspace({...opts, strictVersion: true}),
          err => err.code === 'ERR_EXACT_PATCH_UNAVAILABLE'
        );
        const result = await resolveWorkspace(opts);
        const date = result.packages['@internationalized/date'];
        if (version === '3.8.1') {
          assert.equal(date.requestedVersion, version);
          assert.equal(date.exactMatch, false);
        } else {
          assert.equal(date, undefined);
          assert.ok(result.warnings.some(w => w.code === 'WARN_AUX_PACKAGE_SLICE_UNAVAILABLE'));
        }
      }
    }
    const emptyApp = path.join(tmp, 'no-aux');
    fs.mkdirSync(emptyApp);
    fs.writeFileSync(path.join(emptyApp, 'package.json'), '{"name":"app"}');
    const fallback = await resolveWorkspace({
      cwd: emptyApp,
      snapshotSource,
      cacheDir: path.join(tmp, 'cache'),
      versionOverride: 'react-aria-components@1.0.0'
    });
    assert.equal(fallback.packages['@internationalized/date'].packageVersion, '3.8.0');
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('allows --snapshot override for a historical S2-only snapshot inside a workspace with nested RAC', async () => {
  const {resolveWorkspace} = await corePromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-hist-snap-'));
  try {
    const snapshotSource = await createSyntheticSnapshotRepo(path.join(tmp, 'repo'));
    // Write manifest for snap-s2-1.2.0 (S2-only historical snapshot)
    const idxPath = path.join(snapshotSource, 'index.json');
    const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
    const s2Ptr = idx.packages['@react-spectrum/s2']['1.2.0'];
    const manifestRel = 'by-id/snap-s2-1.2.0/manifest.json';
    const manifestAbs = path.join(snapshotSource, manifestRel);
    const manifestBuf = Buffer.from(
      JSON.stringify({
        schemaVersion: 1,
        minReaderSchemaVersion: 1,
        snapshotId: 'snap-s2-1.2.0',
        slices: {'@react-spectrum/s2': s2Ptr}
      })
    );
    fs.mkdirSync(path.dirname(manifestAbs), {recursive: true});
    fs.writeFileSync(manifestAbs, manifestBuf);
    idx.snapshots['snap-s2-1.2.0'].manifestPath = manifestRel;
    idx.snapshots['snap-s2-1.2.0'].manifestSha256 = crypto
      .createHash('sha256')
      .update(manifestBuf)
      .digest('hex');
    idx.snapshots['snap-s2-1.2.0'].manifestBytes = manifestBuf.length;
    fs.writeFileSync(idxPath, JSON.stringify(idx, null, 2));

    // Create an S2 workspace that also has nested react-aria-components inside node_modules/@react-spectrum/s2
    const appDir = path.join(tmp, 's2-app');
    const s2Dir = path.join(appDir, 'node_modules/@react-spectrum/s2');
    const nestedRacDir = path.join(s2Dir, 'node_modules/react-aria-components');
    fs.mkdirSync(nestedRacDir, {recursive: true});
    fs.writeFileSync(
      path.join(appDir, 'package.json'),
      JSON.stringify({name: 's2-app', dependencies: {'@react-spectrum/s2': '1.8.2'}})
    );
    fs.writeFileSync(
      path.join(s2Dir, 'package.json'),
      JSON.stringify({name: '@react-spectrum/s2', version: '1.8.2'})
    );
    fs.writeFileSync(
      path.join(nestedRacDir, 'package.json'),
      JSON.stringify({name: 'react-aria-components', version: '1.22.1'})
    );

    const res = await resolveWorkspace({
      cwd: appDir,
      snapshotSource,
      cacheDir: path.join(tmp, 'cache'),
      snapshotOverride: 'snap-s2-1.2.0'
    });
    assert.equal(res.packages['@react-spectrum/s2']?.snapshotId, 'snap-s2-1.2.0');
    assert.equal(res.packages['react-aria-components'], undefined);
    assert.ok(
      res.warnings.some(
        w =>
          w.code === 'WARN_AUX_PACKAGE_SLICE_UNAVAILABLE' &&
          w.packageName === 'react-aria-components'
      )
    );
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('resolves nested RAC and @internationalized/* dependencies for Yarn Berry, Yarn Classic, and pnpm lockfiles', async () => {
  const {resolveFromWorkspaceLockfile, resolveWorkspace} = await corePromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-nested-lockfiles-'));
  try {
    const candidates = ['@react-spectrum/s2', 'react-aria-components', '@internationalized/date'];

    // 1. Yarn Berry: S2 nests RAC 1.22.1 and @internationalized/date 3.8.0 while workspace uses RAC 1.4.0
    const berryDir = path.join(tmp, 'berry-nested');
    fs.mkdirSync(berryDir, {recursive: true});
    fs.writeFileSync(
      path.join(berryDir, 'yarn.lock'),
      [
        '__metadata:',
        '  version: 8',
        '',
        '"@react-spectrum/s2@npm:^1.8.0":',
        '  version: 1.8.2',
        '  resolution: "@react-spectrum/s2@npm:1.8.2"',
        '  dependencies:',
        '    react-aria-components: "npm:^1.22.0"',
        '    "@internationalized/date": ^3.8.0',
        '',
        '"react-aria-components@npm:^1.22.0":',
        '  version: 1.22.1',
        '',
        '"react-aria-components@npm:^1.4.0":',
        '  version: 1.4.0',
        '',
        '"@internationalized/date@npm:^3.8.0":',
        '  version: 3.8.0'
      ].join('\n')
    );
    const berryLock = resolveFromWorkspaceLockfile(
      berryDir,
      {'@react-spectrum/s2': '^1.8.0', 'react-aria-components': '^1.4.0'},
      candidates
    );
    assert.equal(
      berryLock?.nestedPackages['@react-spectrum/s2']?.['react-aria-components'],
      '1.22.1'
    );
    assert.equal(
      berryLock?.nestedPackages['@react-spectrum/s2']?.['@internationalized/date'],
      '3.8.0'
    );

    // 2. Yarn Classic v1 nested dependencies
    const classicDir = path.join(tmp, 'classic-nested');
    fs.mkdirSync(classicDir, {recursive: true});
    fs.writeFileSync(
      path.join(classicDir, 'yarn.lock'),
      [
        '# yarn lockfile v1',
        '',
        '"@react-spectrum/s2@^1.8.0":',
        '  version "1.8.2"',
        '  dependencies:',
        '    react-aria-components "^1.22.0"',
        '    "@internationalized/date" "^3.8.0"',
        '',
        'react-aria-components@^1.22.0:',
        '  version "1.22.1"',
        '',
        '"@internationalized/date@^3.8.0":',
        '  version "3.8.0"'
      ].join('\n')
    );
    const classicLock = resolveFromWorkspaceLockfile(
      classicDir,
      {'@react-spectrum/s2': '^1.8.0'},
      candidates
    );
    assert.equal(
      classicLock?.nestedPackages['@react-spectrum/s2']?.['react-aria-components'],
      '1.22.1'
    );
    assert.equal(
      classicLock?.nestedPackages['@react-spectrum/s2']?.['@internationalized/date'],
      '3.8.0'
    );

    // 3. pnpm v9 snapshots: nested dependencies + peer-qualified exact match
    const pnpmV9Dir = path.join(tmp, 'pnpm-v9-nested');
    fs.mkdirSync(pnpmV9Dir, {recursive: true});
    fs.writeFileSync(
      path.join(pnpmV9Dir, 'pnpm-lock.yaml'),
      [
        "lockfileVersion: '9.0'",
        'importers:',
        '  .:',
        '    dependencies:',
        "      '@react-spectrum/s2':",
        '        specifier: ^1.8.0',
        '        version: 1.8.2(react@19.0.0)',
        'snapshots:',
        "  '@react-spectrum/s2@1.8.2(react@18.0.0)':",
        '    dependencies:',
        '      react-aria-components: 1.4.0(react@18.0.0)',
        "  '@react-spectrum/s2@1.8.2(react@19.0.0)':",
        '    dependencies:',
        '      react-aria-components: 1.22.1(react@19.0.0)',
        "      '@internationalized/date': 3.8.0"
      ].join('\n')
    );
    const pnpmV9Lock = resolveFromWorkspaceLockfile(
      pnpmV9Dir,
      {'@react-spectrum/s2': '^1.8.0'},
      candidates
    );
    assert.equal(
      pnpmV9Lock?.nestedPackages['@react-spectrum/s2']?.['react-aria-components'],
      '1.22.1'
    );
    assert.equal(
      pnpmV9Lock?.nestedPackages['@react-spectrum/s2']?.['@internationalized/date'],
      '3.8.0'
    );

    // 4. pnpm v8 packages: fallback
    const pnpmV8Dir = path.join(tmp, 'pnpm-v8-nested');
    fs.mkdirSync(pnpmV8Dir, {recursive: true});
    fs.writeFileSync(
      path.join(pnpmV8Dir, 'pnpm-lock.yaml'),
      [
        "lockfileVersion: '6.0'",
        'dependencies:',
        "  '@react-spectrum/s2':",
        '    specifier: ^1.8.0',
        '    version: 1.8.2(react@19.0.0)',
        'packages:',
        '  /@react-spectrum/s2@1.8.2(react@19.0.0):',
        '    dependencies:',
        '      react-aria-components: 1.22.1(react@19.0.0)'
      ].join('\n')
    );
    const pnpmV8Lock = resolveFromWorkspaceLockfile(
      pnpmV8Dir,
      {'@react-spectrum/s2': '^1.8.0'},
      candidates
    );
    assert.equal(
      pnpmV8Lock?.nestedPackages['@react-spectrum/s2']?.['react-aria-components'],
      '1.22.1'
    );

    // 5. End-to-end resolveWorkspace:
    //    (a) Lockfile-only S2 workspace without direct RAC resolves transitive RAC from Yarn Classic lockfile
    //    (b) Direct RAC differing from S2 nested RAC emits WARN_MULTIPLE_PACKAGE_INSTANCES
    const snapshotSource = await createSyntheticSnapshotRepo(tmp);
    fs.writeFileSync(
      path.join(classicDir, 'package.json'),
      JSON.stringify({name: 's2-only-classic', dependencies: {'@react-spectrum/s2': '^1.8.0'}})
    );
    const transitiveRes = await resolveWorkspace({
      cwd: classicDir,
      snapshotSource,
      cacheDir: path.join(tmp, 'cache-transitive'),
      defaultLibrary: 's2'
    });
    assert.equal(transitiveRes.packages['react-aria-components']?.packageVersion, '1.22.1');
    assert.equal(transitiveRes.packages['react-aria-components']?.importer, '@react-spectrum/s2');

    fs.writeFileSync(
      path.join(berryDir, 'package.json'),
      JSON.stringify({
        name: 's2-divergent-berry',
        dependencies: {'@react-spectrum/s2': '^1.8.0', 'react-aria-components': '^1.4.0'}
      })
    );
    const divergentRes = await resolveWorkspace({
      cwd: berryDir,
      snapshotSource,
      cacheDir: path.join(tmp, 'cache-divergent'),
      defaultLibrary: 's2'
    });
    assert.equal(divergentRes.packages['react-aria-components']?.packageVersion, '1.4.0');
    assert.ok(
      divergentRes.warnings.some(
        w =>
          w.code === 'WARN_MULTIPLE_PACKAGE_INSTANCES' &&
          w.packageName === 'react-aria-components' &&
          w.details?.nestedVersion === '1.22.1'
      )
    );
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('ranks SemVer prereleases below stable releases and compares numeric prerelease identifiers numerically', async () => {
  const {compareSemverAsc, compareSemverDesc} = await corePromise;
  const versions = ['1.2.0', '1.2.0-beta.2', '1.2.0-beta.10', '1.2.0-alpha.1', '1.2.1-rc.1'];
  assert.deepEqual([...versions].sort(compareSemverAsc), [
    '1.2.0-alpha.1',
    '1.2.0-beta.2',
    '1.2.0-beta.10',
    '1.2.0',
    '1.2.1-rc.1'
  ]);
  assert.deepEqual([...versions].sort(compareSemverDesc), [
    '1.2.1-rc.1',
    '1.2.0',
    '1.2.0-beta.10',
    '1.2.0-beta.2',
    '1.2.0-alpha.1'
  ]);
});
