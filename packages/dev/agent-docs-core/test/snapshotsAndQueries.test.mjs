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
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';

const {generateSnapshotFromTarget, updateSnapshotsIndex} = await import(
  new URL('../../s2-docs/scripts/lib/snapshotExtractor.mjs', import.meta.url).href
);
const {createLocalBucketStorage, publishStagedSnapshots} = await import(
  new URL('../../s2-docs/scripts/publishSnapshots.mjs', import.meta.url).href
);
const {loadSnapshotIndex, prefetchDocs, queryApi, readDocs, resolveWorkspace, searchDocs} =
  await import(new URL('../../cli/s2/dist/agent-docs-core/src/index.js', import.meta.url).href);
const {extractGitRefSnapshot} = await import(
  new URL('../../s2-docs/scripts/generateDocSnapshots.mjs', import.meta.url).href
);
const {runBackfill} = await import(
  new URL('../../s2-docs/scripts/backfillSnapshots.mjs', import.meta.url).href
);

const PACKAGE = '@react-spectrum/s2';
const PACKAGE_DIR = 'packages/@react-spectrum/s2';
const SOURCE = `
export interface ButtonProps<T extends object = {id: string}> {
  /** Current value. */
  value?: T;
  /** Initial value. */
  defaultValue?: T;
  /** Called when the value changes. */
  onChange?: (value: T) => void;
  /**
   * Size of the button.
   * @default 'M'
   */
  size?: 'S' | 'M';
}
export interface ButtonRenderProps {
  /**
   * Whether the button is pressed.
   * @selector [data-pressed]
   */
  isPressed: boolean;
}
export function Button<T extends object = {id: string}>(props: ButtonProps<T>): void {}
export function useButton(options: ButtonProps, ref: object): boolean;
export function useButton(options: ButtonProps): boolean;
export function useButton(options: ButtonProps, ref?: object): boolean { return true; }
`;
const PAGE = `# Button

A fixture button.

## Usage

Revision one.

\`\`\`tsx
import {Button} from '@react-spectrum/s2';
<Button />;
\`\`\`

## Styling

Styling-only content.
`;

function write(root, file, content) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
}

function createTarget(root, version = '1.0.0') {
  write(root, 'package.json', JSON.stringify({name: 'agent-docs-fixture', private: true}));
  write(
    root,
    `${PACKAGE_DIR}/package.json`,
    JSON.stringify({
      name: PACKAGE,
      version,
      source: 'src/index.ts'
    })
  );
  write(root, `${PACKAGE_DIR}/src/index.ts`, SOURCE);
  write(root, 'packages/dev/s2-docs/pages/s2/Button.mdx', PAGE);
  write(root, 'packages/dev/s2-docs/pages/s2/useButton.mdx', '# useButton\n\nUse a button hook.\n');
}

async function generate(targetRoot, outRoot, snapshotId, docRevision = 1) {
  const result = await generateSnapshotFromTarget({
    targetRoot,
    repoRoot: targetRoot,
    outRoot,
    snapshotId,
    docRevision,
    sourceCommit: 'fixture',
    extractorCommit: 'fixture',
    libraries: ['s2'],
    filterSlugs: ['s2:Button', 's2:useButton']
  });
  updateSnapshotsIndex(outRoot, [result], {markAsLatest: true});
  return result;
}

test('renders extracted APIs and applies the same member and section filters to Markdown and JSON', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-api-ir-'));
  try {
    const target = path.join(tmp, 'target');
    const snapshots = path.join(tmp, 'snapshots');
    createTarget(target);
    await generate(target, snapshots, 'api');
    const opts = {
      cwd: target,
      snapshotSource: snapshots,
      cacheDir: path.join(tmp, 'cache'),
      versionOverride: '1.0.0'
    };
    const component = await queryApi({...opts, id: 's2:Button'});
    assert.match(component.markdown, /Button<T extends object = \{id: string\}>.*\(component\)/);
    assert.match(component.markdown, /Pass either `value`/);
    assert.match(component.markdown, /\| `size` .*'M'/);
    assert.match(component.markdown, /\[data-pressed\]/);
    assert.doesNotMatch(component.markdown, /\(undefined\)|\[object Object\]/);

    const hook = await queryApi({...opts, id: 's2:useButton'});
    assert.equal(hook.exports[0].callSignatures.length, 2);
    for (const signature of hook.exports[0].callSignatures) {
      assert.ok(hook.markdown.includes(signature.signature));
    }

    const focused = await queryApi({...opts, id: 's2:Button', propFilter: 'size'});
    assert.deepEqual(
      focused.exports[0].props.map(prop => prop.name),
      ['size']
    );
    assert.equal(focused.exports[0].events.length, 0);
    const events = await queryApi({...opts, id: 's2:Button', eventsOnly: true});
    assert.equal(events.exports[0].props.length, 0);
    assert.equal(events.exports[0].renderProps.length, 0);
    assert.deepEqual(
      events.exports[0].events.map(event => event.name),
      ['onChange']
    );
    const renderProps = await queryApi({...opts, id: 's2:Button', renderPropsOnly: true});
    assert.equal(renderProps.exports[0].props.length, 0);
    assert.equal(renderProps.exports[0].events.length, 0);
    assert.match(renderProps.markdown, /\[data-pressed\]/);

    const usage = await readDocs({...opts, ids: ['s2:Button'], sections: ['usage']});
    assert.ok(usage.results[0].entry.sections.every(section => section.category === 'usage'));
    assert.equal(usage.results[0].entry.exports.length, 0);
    assert.ok(!JSON.stringify(usage).includes('Styling-only content'));
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('rebuilds publish idempotently and old pins and resolutions retain their original content', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-snapshot-pins-'));
  let server;
  try {
    const target = path.join(tmp, 'target');
    const snapshots = path.join(tmp, 'snapshots');
    createTarget(target);
    const first = await generate(target, snapshots, 'revision-1');
    const storage = createLocalBucketStorage(path.join(tmp, 'bucket'));
    await publishStagedSnapshots({stagedDir: snapshots, storage});
    const manifestPath = path.join(snapshots, 'by-id/revision-1/manifest.json');
    const originalManifest = fs.readFileSync(manifestPath);
    await new Promise(resolve => setTimeout(resolve, 10));
    const rebuilt = await generate(target, snapshots, 'revision-1');
    assert.deepEqual(rebuilt.manifest.files, first.manifest.files);
    assert.deepEqual(fs.readFileSync(manifestPath), originalManifest);
    await publishStagedSnapshots({stagedDir: snapshots, storage});

    const opts = {
      cwd: target,
      snapshotSource: snapshots,
      cacheDir: path.join(tmp, 'cache'),
      versionOverride: '1.0.0'
    };
    const resolution = await resolveWorkspace(opts);
    server = createServer((request, response) => {
      const file = path.join(snapshots, new URL(request.url, 'http://localhost').pathname);
      if (!fs.existsSync(file)) {
        response.writeHead(404).end();
        return;
      }
      response.end(fs.readFileSync(file));
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const remoteOpts = {
      ...opts,
      snapshotSource: `http://127.0.0.1:${server.address().port}`,
      cacheDir: path.join(tmp, 'remote-cache')
    };
    const remoteResolution = await resolveWorkspace(remoteOpts);
    await prefetchDocs({...remoteOpts, resolution: remoteResolution});
    write(
      target,
      'packages/dev/s2-docs/pages/s2/Button.mdx',
      PAGE.replace('Revision one.', 'Revision two.')
    );
    await generate(target, snapshots, 'revision-2', 2);
    const latest = await readDocs({...opts, ids: ['s2:Button']});
    assert.match(latest.results[0].markdown, /Revision two/);
    await loadSnapshotIndex({...remoteOpts, forceRefreshIndex: true});
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    for (const selection of [{resolution: remoteResolution}, {snapshotOverride: 'revision-1'}]) {
      const offline = await readDocs({
        ...remoteOpts,
        ...selection,
        ids: ['s2:Button'],
        offline: true
      });
      assert.match(offline.results[0].markdown, /Revision one/);
      assert.equal(offline.results[0].provenance.snapshotId, 'revision-1');
    }

    for (const selection of [
      {resolution},
      {snapshotOverride: 'revision-1', versionOverride: undefined}
    ]) {
      const read = await readDocs({...opts, ...selection, ids: ['s2:Button']});
      assert.equal(read.results[0].provenance.snapshotId, 'revision-1');
      assert.match(read.results[0].markdown, /Revision one/);
      assert.doesNotMatch(read.results[0].markdown, /Revision two/);
      const search = await searchDocs({...opts, ...selection, query: 'Button'});
      assert.ok(search.results.every(hit => hit.provenance.snapshotId === 'revision-1'));
      const prefetch = await prefetchDocs({...opts, ...selection});
      assert.equal(prefetch.prefetchedSlices[0].snapshotId, 'revision-1');
      const offline = await readDocs({...opts, ...selection, ids: ['s2:Button'], offline: true});
      assert.match(offline.results[0].markdown, /Revision one/);
    }
    const tampered = structuredClone(resolution);
    tampered.packages[PACKAGE].sliceSha256 = 'f'.repeat(64);
    await assert.rejects(() => readDocs({...opts, resolution: tampered, ids: ['s2:Button']}), {
      code: 'ERR_CACHE_INTEGRITY'
    });
    await assert.rejects(
      () => readDocs({...opts, snapshotOverride: 'missing', ids: ['s2:Button']}),
      {code: 'ERR_SNAPSHOT_NOT_FOUND'}
    );
    fs.appendFileSync(manifestPath, '\n');
    await assert.rejects(
      () =>
        readDocs({
          ...opts,
          snapshotOverride: 'revision-1',
          cacheDir: path.join(tmp, 'cold-cache'),
          ids: ['s2:Button']
        }),
      {code: 'ERR_CACHE_INTEGRITY'}
    );
  } finally {
    if (server?.listening) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('backfills equivalent patches and dedicated API or documentation changes from release tags', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-backfill-'));
  try {
    const repoRoot = path.join(tmp, 'repo');
    createTarget(repoRoot);
    const git = (...args) =>
      execFileSync(
        'git',
        ['-c', 'user.name=Agent Docs Test', '-c', 'user.email=agent-docs@example.invalid', ...args],
        {cwd: repoRoot, stdio: 'pipe'}
      );
    git('init', '--quiet');
    for (const [version, source, page] of [
      ['1.0.0', SOURCE, PAGE],
      ['1.0.1', SOURCE, PAGE],
      ['1.0.2', SOURCE.replace("'S' | 'M'", "'S' | 'M' | 'L'"), PAGE],
      ['1.0.3', SOURCE, PAGE.replace('Revision one.', 'Changed documentation.')]
    ]) {
      write(
        repoRoot,
        `${PACKAGE_DIR}/package.json`,
        JSON.stringify({name: PACKAGE, version, source: 'src/index.ts'})
      );
      write(repoRoot, `${PACKAGE_DIR}/src/index.ts`, source);
      write(repoRoot, 'packages/dev/s2-docs/pages/s2/Button.mdx', page);
      git('add', '.');
      git('commit', '--quiet', '-m', version);
      git('tag', `${PACKAGE}@${version}`);
    }
    const outRoot = path.join(tmp, 'snapshots');
    const result = await runBackfill({repoRoot, outRoot});
    assert.deepEqual(result.verifiedPatches, [{tag: `${PACKAGE}@1.0.1`, equivalentTo: '1.0.0'}]);
    assert.deepEqual(
      result.dedicatedPatchSnapshots.map(snapshot => snapshot.tag),
      [`${PACKAGE}@1.0.2`, `${PACKAGE}@1.0.3`]
    );
    const index = JSON.parse(fs.readFileSync(path.join(outRoot, 'index.json'), 'utf8'));
    for (const snapshot of [...result.extractedSnapshots, ...result.dedicatedPatchSnapshots]) {
      assert.ok(index.snapshots[snapshot.snapshotId]);
    }
    assert.deepEqual(index.packages[PACKAGE]['1.0.0'].verifiedEquivalentPatches, ['1.0.1']);
    const firstHead = await extractGitRefSnapshot({
      gitRef: 'HEAD',
      repoRoot,
      outRoot,
      libraries: ['s2']
    });
    const secondHead = await extractGitRefSnapshot({
      gitRef: 'HEAD',
      repoRoot,
      outRoot,
      libraries: ['s2']
    });
    assert.deepEqual(firstHead.manifest, secondHead.manifest);
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('preserves current MDX API references and VisualExample starter implementations', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-mdx-components-'));
  try {
    const target = path.join(tmp, 'target');
    const snapshots = path.join(tmp, 'snapshots');
    createTarget(target);
    write(
      target,
      'packages/react-stately/package.json',
      JSON.stringify({
        name: 'react-stately',
        version: '1.0.0',
        source: 'src/index.ts'
      })
    );
    write(
      target,
      'packages/react-stately/src/index.ts',
      `
export interface ListState { selectedKey: string; }
export function useListState(): ListState { return {selectedKey: ''}; }
`
    );
    write(
      target,
      'starters/docs/src/Button.tsx',
      "import './Button.css';\nexport const starterButton = 'vanilla implementation';"
    );
    write(
      target,
      'starters/docs/src/Helper.tsx',
      "export const helper = 'supporting implementation';"
    );
    write(
      target,
      'starters/tailwind/src/Button.tsx',
      "export const alternative = 'tailwind implementation';"
    );
    write(
      target,
      'packages/dev/s2-docs/pages/s2/Button.mdx',
      `
import docs from 'docs:@react-spectrum/s2';
import state from 'docs:react-stately';

# Button

<ExampleSwitcher examples={['Vanilla CSS', 'Tailwind']}>
  <VisualExample files={["starters/docs/src/Button.tsx", "starters/docs/src/Button.css", "starters/docs/src/Helper.tsx"]} />
  <VisualExample files={["starters/tailwind/src/Button.tsx"]} />
</ExampleSwitcher>

## API

<FunctionAPI function={docs.exports.useButton} />
<FunctionAPIGroup functions={[
  {function: state.exports.useListState, links: state.links},
  {function: docs.exports.useButton, links: docs.links}
]} />
<InterfaceType {...state.exports.ListState} links={state.links} />
`
    );
    await generate(target, snapshots, 'mdx');
    const opts = {
      cwd: target,
      snapshotSource: snapshots,
      cacheDir: path.join(tmp, 'cache'),
      versionOverride: '1.0.0'
    };
    const api = await queryApi({...opts, id: 's2:Button'});
    assert.deepEqual(api.exports.map(exp => exp.name).sort(), [
      'Button',
      'ListState',
      'useButton',
      'useListState'
    ]);
    const state = await queryApi({...opts, id: 's2:Button', exportName: 'ListState'});
    assert.deepEqual(
      state.exports[0].props.map(prop => prop.name),
      ['selectedKey']
    );
    const read = await readDocs({...opts, ids: ['s2:Button']});
    assert.match(read.results[0].markdown, /vanilla implementation/);
    assert.match(read.results[0].markdown, /supporting implementation/);
    assert.doesNotMatch(
      read.results[0].markdown,
      /tailwind implementation|import '\.\/Button\.css'/
    );
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});
