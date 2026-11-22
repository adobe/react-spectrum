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
import {execFileSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');

const SNAPSHOT_SOURCE = process.env.RSP_AGENT_DOCS_TEST_SNAPSHOT_SOURCE;
assert.ok(SNAPSHOT_SOURCE, 'Run yarn test:agent-docs to build binaries and test snapshots first.');

const pluginModPromise = import(
  pathToFileURL(path.join(REPO_ROOT, 'scripts/generateAgentPlugins.mjs')).href
);
const corePromise = import(
  pathToFileURL(path.join(REPO_ROOT, 'packages/dev/cli/s2/dist/agent-docs-core/src/index.js')).href
);

function currentCli(t, brand = 's2') {
  const bin = path.join(REPO_ROOT, `packages/dev/cli/${brand}/dist/cli/${brand}/src/index.js`);
  const cache = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-cli-'));
  t.after(() => fs.rmSync(cache, {recursive: true, force: true}));
  return (...args) =>
    execFileSync(
      process.execPath,
      [bin, ...(args.includes('--version') ? [] : ['--version', 'latest']), ...args],
      {
        cwd: REPO_ROOT,
        env: {
          ...process.env,
          RSP_AGENT_DOCS_SNAPSHOT_SOURCE: SNAPSHOT_SOURCE,
          RSP_AGENT_DOCS_CACHE_DIR: cache
        },
        encoding: 'utf8'
      }
    );
}

test('CLI finds documented exports by name and offers choices for ambiguous exports', t => {
  const run = currentCli(t, 'react-aria');
  const option = JSON.parse(run('api', 'useOption', '--json'));
  assert.equal(option.resolvedId, 'react-aria:ListBox/useListBox');
  assert.deepEqual(
    option.exports.map(item => item.name),
    ['useOption']
  );
  assert.ok(option.exports[0].callSignatures.length > 0);
  assert.match(option.markdown, /useOption\(/);
  assert.deepEqual(option.imports, ["import {useOption} from 'react-aria';"]);

  const ariaOption = JSON.parse(run('api', 'react-aria:useOption', '--json'));
  assert.equal(ariaOption.resolvedId, option.resolvedId);
  assert.deepEqual(ariaOption.exports, option.exports);
  assert.throws(
    () => run('api', 'MenuItem', '--json'),
    err => {
      assert.equal(err.status, 3);
      const {error} = JSON.parse(err.stdout);
      assert.match(error.message, /MenuItem.*more than one/);
      assert.ok(error.suggestions.includes('rac:Menu'));
      assert.ok(error.suggestions.includes('s2:Menu'));
      return true;
    }
  );
  const s2Item = JSON.parse(run('api', 's2:ComboBoxItem', '--json'));
  assert.equal(s2Item.resolvedId, 's2:ComboBox');
  assert.deepEqual(
    s2Item.exports.map(item => item.name),
    ['ComboBoxItem']
  );
});

test('CLI routes Stately utility pages to versioned Stately search, read, and API results', t => {
  const run = currentCli(t, 'react-aria');
  const {version} = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'packages/react-stately/package.json'), 'utf8')
  );
  for (const name of ['useListData', 'useTreeData', 'useAsyncList']) {
    const id = `react-stately:${name}`;
    const search = JSON.parse(run('search', name, '--library', 'react-stately', '--json'));
    assert.equal(search.results[0].id, id);
    assert.equal(search.results[0].provenance.packageVersion, version);
    const read = JSON.parse(run('read', id, '--json')).results[0];
    assert.ok(read.ok);
    assert.equal(read.entry.packageName, 'react-stately');
    assert.equal(read.provenance.packageVersion, version);
    const api = JSON.parse(run('api', id, '--export', name, '--json'));
    assert.equal(api.provenance.packageVersion, version);
    assert.ok(api.exports[0].callSignatures.length > 0);
  }

  const exact = JSON.parse(run('search', 'useListData', '--json'));
  assert.equal(exact.results[0].id, 'react-stately:useListData');
  const mixed = JSON.parse(
    run('api', 'react-aria:ListBox/useListBox', '--export', 'useListBox', '--json')
  );
  assert.equal(mixed.provenance.packageName, 'react-aria');

  const related = JSON.parse(run('search', 'useList', '--library', 'react-stately', '--json'));
  assert.ok(related.results.length > 0);
  assert.ok(related.warnings.some(w => w.code === 'WARN_NO_EXACT_HOOK_MATCH'));
  const undocumented = JSON.parse(run('search', 'react-stately:useNoSuchHook', '--json'));
  assert.deepEqual(undocumented.results, []);
  assert.deepEqual(undocumented.warnings, []);
});

test('CLI resolves Stately from a matching React Aria snapshot and explains absent coverage', t => {
  const run = currentCli(t, 'react-aria');
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-stately-'));
  t.after(() => fs.rmSync(cwd, {recursive: true, force: true}));
  const search = version =>
    JSON.parse(
      run('search', 'react-stately:useListData', '--cwd', cwd, '--version', version, '--json')
    );
  const available = search('react-aria@latest');
  assert.equal(available.libraryFilter, 'react-stately');
  assert.equal(available.results[0].id, 'react-stately:useListData');

  const missing = search('@internationalized/date@latest');
  assert.deepEqual(missing.results, []);
  assert.ok(
    missing.warnings.some(
      w => w.code === 'WARN_LIBRARY_UNAVAILABLE' && w.packageName === 'react-stately'
    )
  );
  for (const command of ['read', 'api']) {
    assert.throws(
      () =>
        run(
          command,
          'react-stately:useListData',
          '--cwd',
          cwd,
          '--version',
          '@internationalized/date@latest',
          '--json'
        ),
      err => {
        assert.equal(err.status, 3);
        const response = JSON.parse(err.stdout);
        assert.equal((response.error ?? response.results[0].error).code, 'ERR_SNAPSHOT_NOT_FOUND');
        return true;
      }
    );
  }
});

test('CLI suggests nearby IDs and ranks results that cover the query intent', t => {
  const run = currentCli(t);
  assert.throws(
    () => run('read', 's2:Buton', 's2:Mneu', '--json'),
    err => {
      assert.equal(err.status, 3);
      const {results} = JSON.parse(err.stdout);
      assert.deepEqual(
        results.map(miss => miss.error.suggestions[0]),
        ['s2:Button', 's2:Menu']
      );
      for (const miss of results) {
        assert.ok(miss.error.suggestions.every(id => id.startsWith('s2:')));
      }
      return true;
    }
  );
  const dropdown = JSON.parse(run('search', 'searchable dropdown', '--json'));
  assert.equal(dropdown.results[0].id, 's2:ComboBox');
  assert.ok(dropdown.results.some(hit => hit.id === 'rac:Select'));
  const currency = JSON.parse(run('search', 'format currency', '--json'));
  assert.equal(currency.results[0].id, 'internationalized:number/NumberFormatter');
  assert.ok(currency.results.some(hit => hit.id === 'internationalized:date/DateFormatter'));
});

test('CLI surfaces complete summaries and consolidates example imports', t => {
  const run = currentCli(t);
  const actionMenu = JSON.parse(run('read', 's2:ActionMenu', '--json')).results[0].entry;
  assert.equal(
    actionMenu.summary,
    'Combines an ActionButton with a Menu for simple "more actions" use cases.'
  );
  const combo = JSON.parse(run('read', 's2:ComboBox', '--json')).results[0].entry;
  const comboImports = combo.imports.filter(line => line.includes('@react-spectrum/s2/ComboBox'));
  assert.equal(comboImports.length, 1);
  assert.equal([...comboImports[0].matchAll(/\bComboBoxItem\b/g)].length, 1);
  assert.match(comboImports[0], /ComboBoxSection/);
  assert.ok(combo.imports.some(line => line.includes('@react-spectrum/s2/Avatar')));
});

test('CLI reads the full ComboBox documentation by default and with --sections all', t => {
  const run = currentCli(t);
  const read = (...args) => run('read', 's2:ComboBox', ...args);
  const markdown = read();
  assert.equal(markdown, read('--sections', 'all'));
  const filtered = read('--sections', 'usage,api');
  assert.ok(Buffer.byteLength(filtered) <= Buffer.byteLength(markdown));
  assert.equal([...filtered.matchAll(/^## API$/gm)].length, 1);
  assert.match(markdown, /<ComboBoxSection/);
  assert.match(markdown, /onLoadMore=\{list\.loadMore\}/);
  assert.match(markdown, /### `ComboBoxItem/);
  const {
    results: [usage]
  } = JSON.parse(read('--sections', 'usage', '--json'));
  assert.ok(usage.ok);
  for (const heading of ['Asynchronous loading', 'Selection', 'Forms']) {
    const section = usage.entry.sections.find(section => section.heading === heading);
    assert.ok(section, `Expected the ComboBox usage section ${heading}`);
    assert.ok(markdown.includes(section.markdown), `Expected the full content for ${heading}`);
  }
});

test('CLI lists ComboBox headings and reads just the selected sections by heading or ID', t => {
  const run = currentCli(t);
  const read = (...args) => run('read', 's2:ComboBox', ...args);
  const outline = read('--list-sections');
  assert.match(outline, /Asynchronous loading \(`asynchronous-loading`\)/);
  assert.doesNotMatch(outline, /Star Wars Character Lookup|## Imports/);
  const {
    results: [index]
  } = JSON.parse(read('--list-sections', '--json'));
  assert.equal(index.entry, undefined);
  assert.equal(index.markdown, undefined);
  assert.ok(index.sectionIndex.some(section => section.id === 'api:ComboBoxItem'));
  const section = index.sectionIndex.find(section => section.heading === 'Asynchronous loading');
  assert.deepEqual(section, {
    id: 'asynchronous-loading',
    heading: 'Asynchronous loading',
    category: 'usage',
    level: 3
  });

  const markdown = read('--section', 'asynchronous loading');
  assert.match(markdown, /^### Asynchronous loading$/m);
  assert.match(markdown, /Star Wars Character Lookup/);
  assert.doesNotMatch(markdown, /^## (Forms|Imports|API)$/m);
  const {
    results: [byId]
  } = JSON.parse(read('--section', section.id, '--json'));
  assert.deepEqual(byId.includedSections, [section.id]);
  assert.deepEqual(
    byId.entry.sections.map(section => section.heading),
    ['Asynchronous loading']
  );
  assert.deepEqual(byId.entry.exports, []);

  const {
    results: [multiple]
  } = JSON.parse(read('--section', 'api:ComboBoxItem', '--section', 'Forms', '--json'));
  assert.deepEqual(multiple.includedSections, ['forms', 'api:ComboBoxItem']);
  assert.deepEqual(
    multiple.entry.exports.map(exp => exp.name),
    ['ComboBoxItem']
  );
  const {
    results: [apiIndex]
  } = JSON.parse(read('--sections', 'api', '--list-sections', '--json'));
  assert.ok(apiIndex.sectionIndex.length > 0);
  assert.ok(apiIndex.sectionIndex.every(section => section.category === 'api'));

  const selectionArgs = [
    '--section',
    'Asynchronous loading',
    '--section',
    'Forms',
    '--max-tokens',
    '470'
  ];
  const first = read(...selectionArgs);
  assert.ok(Buffer.byteLength(first) <= 470 * 4);
  assert.match(first, /Star Wars Character Lookup/);
  assert.doesNotMatch(first, /^## Forms$/m);
  assert.match(first, /--section 'Asynchronous loading' --section Forms/);
  const cursor = first.match(/--cursor ([\w.]+)/)?.[1];
  assert.ok(cursor);
  const next = read(...selectionArgs, '--cursor', cursor);
  assert.ok(Buffer.byteLength(next) <= 470 * 4);
  assert.match(next, /^## Forms$/m);
  assert.doesNotMatch(next, /Star Wars Character Lookup|--cursor/);

  assert.throws(
    () => read('--section', 'Asynchronous loadig', '--json'),
    err => {
      assert.equal(err.status, 3);
      const {
        results: [miss]
      } = JSON.parse(err.stdout);
      assert.equal(miss.error.code, 'ERR_SECTION_NOT_FOUND');
      assert.equal(miss.error.suggestions[0], 'asynchronous-loading');
      return true;
    }
  );
});

test('CLI budgets rendered Markdown and resumes filtered reads without repeating content', t => {
  const run = currentCli(t);
  const args = ['read', 's2:ComboBox', '--sections', 'usage,api'];
  const first = run(...args, '--max-tokens', '3000');
  assert.ok(Buffer.byteLength(first) <= 3000 * 4);
  assert.match(first, /Star Wars Character Lookup/);
  const cursor = first.match(/--cursor ([\w.]+)/)?.[1];
  assert.ok(cursor);
  const rest = run(...args, '--cursor', cursor);
  assert.match(rest, /### `ComboBoxItem/);
  assert.doesNotMatch(rest, /Star Wars Character Lookup|^## Imports$/m);

  const full = JSON.parse(run(...args, '--json'));
  assert.ok(full.results[0].entry);
  assert.equal(full.results[0].markdown, undefined);
  assert.equal(full.resolution, undefined);
  const boundedArgs = [...args, '--json', '--json-content', 'markdown', '--include-resolution'];
  const boundedRaw = run(...boundedArgs, '--max-tokens', '4000');
  assert.ok(Buffer.byteLength(boundedRaw) <= 4000 * 4);
  const bounded = JSON.parse(boundedRaw);
  const page = bounded.results[0];
  assert.ok(bounded.resolution.packages['@react-spectrum/s2']);
  assert.ok(page.markdown);
  assert.equal(page.entry, undefined);

  const seen = new Set();
  let current = page;
  for (let i = 0; i < 25; i++) {
    for (const id of current.includedSections) {
      assert.ok(!seen.has(id), `Repeated section ${id}`);
      seen.add(id);
    }
    if (!current.nextCursor) {
      break;
    }
    const raw = run(...boundedArgs, '--max-tokens', '4000', '--cursor', current.nextCursor);
    assert.ok(Buffer.byteLength(raw) <= 4000 * 4);
    current = JSON.parse(raw).results[0];
  }
  assert.equal(current.truncated, false);
  assert.deepEqual([...seen], full.results[0].includedSections);
  assert.throws(
    () => run('read', 's2:ComboBox', '--cursor', cursor, '--json'),
    err => err.status === 2 && /does not match/.test(JSON.parse(err.stdout).error.message)
  );
});

test('CLI reports missing auxiliary slices only when relevant to the query', t => {
  const run = currentCli(t);
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-cli-warnings-'));
  t.after(() => fs.rmSync(cwd, {recursive: true, force: true}));
  const stalePackage = path.join(cwd, 'node_modules', 'react-stately');
  fs.mkdirSync(stalePackage, {recursive: true});
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({name: 'app', dependencies: {'react-stately': '1.0.0'}})
  );
  fs.writeFileSync(
    path.join(stalePackage, 'package.json'),
    '{"name":"react-stately","version":"1.0.0"}'
  );
  const opts = ['--cwd', cwd, '--version', '@react-spectrum/s2@latest', '--json'];
  for (const args of [
    ['read', 's2:Button'],
    ['search', 'Button'],
    ['search', 'Button', '--library', 's2'],
    ['tokens', '--property', 'gap'],
    ['icons', 'Edit']
  ]) {
    const payload = JSON.parse(run(...args, ...opts));
    assert.ok(!payload.warnings.some(w => w.code === 'WARN_AUX_PACKAGE_SLICE_UNAVAILABLE'));
  }
  const resolve = JSON.parse(run('resolve', ...opts));
  assert.ok(
    resolve.warnings.some(
      w => w.packageName === 'react-stately' && w.code === 'WARN_AUX_PACKAGE_SLICE_UNAVAILABLE'
    )
  );
  const search = JSON.parse(run('search', 'collection', '--library', 'react-stately', ...opts));
  assert.ok(
    search.warnings.some(
      w => w.packageName === 'react-stately' && w.code === 'WARN_AUX_PACKAGE_SLICE_UNAVAILABLE'
    )
  );
});

test('CLI preserves API signatures and examples from real hook and class pages', t => {
  const run = currentCli(t, 'react-aria');
  const hook = run('api', 'react-aria:Button/useButton', '--export', 'useButton');
  assert.match(
    hook,
    /useButton\(props: AriaButtonOptions<"button">, ref: RefObject<HTMLButtonElement \| null>\): ButtonAria/
  );
  assert.match(hook, /AriaButtonOptions<"a">.*RefObject<HTMLAnchorElement \| null>/);
  const date = run('read', 'internationalized:date/CalendarDate');
  assert.match(date, /`CalendarDate` \(class\)/);
  assert.match(date, /new CalendarDate\(2022, 2, 3\)/);
  assert.match(date, /date\.add\(\{weeks: 1\}\)/);
  const dateApi = JSON.parse(run('api', 'internationalized:date/CalendarDate', '--json'));
  const calendarDateExport = dateApi.exports.find(e => e.name === 'CalendarDate');
  assert.ok(calendarDateExport);
  assert.ok(
    calendarDateExport.callSignatures.some(s => s.signature.startsWith('new CalendarDate('))
  );
  assert.ok(calendarDateExport.props.some(p => p.name === 'year'));
  assert.ok(calendarDateExport.props.some(p => p.name === 'add'));
});

test('CLI tokens show the documented numeric spacing scale for longhands and shorthands', t => {
  const run = currentCli(t);
  const tokens = (...args) => JSON.parse(run('tokens', '--json', ...args));
  const baseSpacing = [
    '0',
    '2',
    '4',
    '8',
    '12',
    '16',
    '20',
    '24',
    '28',
    '32',
    '36',
    '40',
    '44',
    '48',
    '56',
    '64',
    '80',
    '96'
  ];
  for (const property of ['padding', 'gap', 'scrollPadding']) {
    const {properties, markdown} = tokens('--property', property);
    const entry = properties.find(p => p.property === property);
    assert.deepEqual(
      entry.matchedValues.filter(value => /^\d+$/.test(value)),
      baseSpacing,
      property
    );
    assert.equal(entry.totalValueCount, entry.matchedValues.length);
    assert.ok(markdown.includes('`96`'));
    if (property === 'scrollPadding') {
      assert.equal(properties.length, 7);
      for (const item of properties) {
        assert.deepEqual(item.matchedValues, baseSpacing, item.property);
      }
    } else {
      assert.ok(entry.matchedValues.includes('edge-to-text'));
    }
  }
  const {
    properties: [pad]
  } = tokens('24', '--property', 'paddingTop');
  assert.deepEqual(pad.matchedValues, ['24']);
  const {
    properties: [margin]
  } = tokens('--property', 'marginTop', '--', '-24');
  assert.deepEqual(margin.matchedValues, ['-24']);
});

test('CLI icons resolve pencil to Edit and show import examples only for matches', t => {
  const run = currentCli(t);
  const icons = (...args) => JSON.parse(run('icons', '--json', ...args));
  const pencil = icons('pencil');
  assert.ok(pencil.matches.includes('Edit'));
  assert.equal(pencil.importExample, "import Edit from '@react-spectrum/s2/icons/Edit';");
  assert.ok(pencil.markdown.includes(pencil.importExample));

  for (const args of [[], ['--illustrations']]) {
    const missing = icons('zzzz-no-such-asset', ...args);
    assert.deepEqual(missing.matches, []);
    assert.equal(missing.importExample, '');
    assert.match(missing.markdown, /No matching names found/);
    assert.doesNotMatch(missing.markdown, /import |```/);
  }
});

test('CLI icons rank exact names first and report each unmatched term', t => {
  const run = currentCli(t);
  const edit = JSON.parse(run('icons', '--json', 'edit'));
  assert.equal(edit.matches[0], 'Edit');
  assert.ok(edit.matches.includes('CalendarEdit'));
  assert.equal(edit.importExample, "import Edit from '@react-spectrum/s2/icons/Edit';");
  assert.deepEqual(edit.unmatchedTerms, []);

  const mixed = JSON.parse(run('icons', '--json', 'pencil', 'zzzz-no-such-asset'));
  assert.ok(mixed.matches.includes('Edit'));
  assert.deepEqual(mixed.unmatchedTerms, ['zzzz-no-such-asset']);
  assert.match(mixed.markdown, /No matches for: `zzzz-no-such-asset`/);
});

test('CLI tokens match multi-word queries accurately and say when nothing matches', t => {
  const run = currentCli(t);
  const blue = JSON.parse(run('tokens', '--json', 'blue background'));
  const background = blue.properties.find(p => p.property === 'backgroundColor');
  assert.ok(background);
  assert.ok(background.matchedValues.length > 0);
  assert.ok(background.matchedValues.every(value => value.includes('blue')));

  // Multi-word value queries intersect on individual values ("blue subtle" -> blue-subtle, not red-subtle or blue)
  const blueSubtle = JSON.parse(
    run('tokens', '--json', 'blue subtle', '--property', 'backgroundColor')
  );
  assert.equal(blueSubtle.properties.length, 1);
  assert.deepEqual(blueSubtle.properties[0].matchedValues, ['blue-subtle']);
  assert.doesNotMatch(blueSubtle.markdown, /\(\+\d+ more\)/);

  const missing = JSON.parse(run('tokens', '--json', 'zzzz-no-such-token'));
  assert.deepEqual(missing.properties, []);
  assert.match(
    missing.markdown,
    /No style macro properties or values matched query `zzzz-no-such-token`/
  );
});

test('CLI api warns about each unique unmatched prop, omits empty exports, and prefers prop names over descriptions', t => {
  const run = currentCli(t);
  const args = ['api', 's2:ComboBox', '--prop', 'selectedKeyz,selectedKeyz,onInputChange'];
  const markdown = run(...args);
  assert.match(markdown, /\[WARN_PROP_NOT_FOUND\].*'selectedKeyz' \(did you mean `selectedKey`/);
  assert.match(markdown, /`onInputChange`/);

  const json = JSON.parse(run(...args, '--json'));
  const notFoundWarnings = json.warnings.filter(item => item.code === 'WARN_PROP_NOT_FOUND');
  assert.equal(notFoundWarnings.length, 1, 'Duplicate unmatched filters should warn once');
  assert.equal(notFoundWarnings[0].details.filter, 'selectedKeyz');
  assert.equal(notFoundWarnings[0].details.suggestions[0], 'selectedKey');
  assert.ok(
    json.exports.every(
      exp => exp.props.length > 0 || exp.events.length > 0 || exp.renderProps.length > 0
    ),
    'Filtered api output must omit exports with zero matching members'
  );
  assert.ok(
    !JSON.parse(run('api', 's2:ComboBox', '--prop', 'onInputChange', '--json')).warnings.length
  );

  // Prefix search supports s2:, rac:, aria:, i18n: uniformly
  const racPrefix = JSON.parse(run('search', 'rac:Button', '--limit', '3', '--json'));
  assert.ok(racPrefix.results.length > 0);
  assert.ok(racPrefix.results.every(hit => hit.library === 'rac'));
  const ariaPrefix = JSON.parse(run('search', 'aria:useButton', '--limit', '3', '--json'));
  assert.ok(ariaPrefix.results.length > 0);
  assert.ok(ariaPrefix.results.every(hit => hit.library === 'react-aria'));
});

test('CLI search states shared follow-up flags once in Markdown', t => {
  const run = currentCli(t);
  const markdown = run('search', 'combobox', '--limit', '3');
  assert.equal(markdown.match(/--version latest/g).length, 1);
  assert.match(markdown, /Append to every `Next` command below: `--cwd \S+ --version latest`/);
  assert.match(markdown, /Next: `spectrum read s2:ComboBox`/);

  const single = run('search', 'combobox', '--limit', '1');
  assert.doesNotMatch(single, /Append to every/);
  assert.match(single, /Next: `spectrum read s2:ComboBox --cwd \S+ --version latest`/);
});

test('CLI follow-up commands preserve version and workspace options', () => {
  const bin = path.join(REPO_ROOT, 'packages/dev/cli/s2/dist/cli/s2/src/index.js');
  const tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-cli-follow-up-')));
  try {
    const workspaceName = "team's app";
    const workspace = path.join(tmpDir, workspaceName);
    fs.mkdirSync(workspace);
    fs.writeFileSync(path.join(workspace, 'package.json'), '{"name":"test-app"}');
    const run = (...args) =>
      execFileSync(
        process.execPath,
        [
          bin,
          ...args,
          '--cwd',
          workspaceName,
          '--version',
          'latest',
          '--cache-dir',
          'cache',
          '--snapshot-source',
          SNAPSHOT_SOURCE,
          '--offline',
          '--json'
        ],
        {cwd: tmpDir, encoding: 'utf8'}
      );
    const {results} = JSON.parse(run('search', 'Select', '--library', 'rac'));
    const select = results.find(hit => hit.id === 'rac:Select');
    assert.ok(select);
    const workspaceFlags = `--cwd '${path.join(tmpDir, "team'\\''s app")}' --version latest`;
    const cacheFlags = `--cache-dir ${path.join(tmpDir, 'cache')} --snapshot-source ${SNAPSHOT_SOURCE} --offline`;
    assert.deepEqual(select.followUpCommands, [
      `spectrum read rac:Select ${workspaceFlags} ${cacheFlags}`,
      `spectrum api rac:Select ${workspaceFlags} ${cacheFlags}`
    ]);

    const {
      results: [item]
    } = JSON.parse(
      run('read', 's2:ComboBox', '--snapshot', 'test-current', '--max-tokens', '3000')
    );
    assert.ok(item.nextCursor);
    assert.equal(
      item.continueCommand,
      `spectrum read s2:ComboBox --cursor ${item.nextCursor} --max-tokens 3000 --json ${workspaceFlags} --snapshot test-current ${cacheFlags}`
    );
  } finally {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  }
});

test('CLI handles partial-batch resilience (exit code 0 with valid entries preserved), maxTokens continuation, tokens, and icons', () => {
  const s2CliBin = path.join(REPO_ROOT, 'packages/dev/cli/s2/dist/cli/s2/src/index.js');
  const racCliBin = path.join(
    REPO_ROOT,
    'packages/dev/cli/react-aria/dist/cli/react-aria/src/index.js'
  );
  const tmpCache = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-cli-cache-'));

  try {
    const env = {
      ...process.env,
      RSP_AGENT_DOCS_SNAPSHOT_SOURCE: SNAPSHOT_SOURCE,
      RSP_AGENT_DOCS_CACHE_DIR: tmpCache
    };

    // 1. Partial-batch read: 2 valid targets + 1 nonexistent target => exit 0 with WARN_PARTIAL_BATCH_MISS & valid entries intact;
    //    all-missing batch => exit 3 (EXIT_CODES.NOT_FOUND)!
    const partialStdout = execFileSync(
      process.execPath,
      [
        s2CliBin,
        'read',
        's2:Button',
        's2:DoesNotExistComponent',
        'rac:Button',
        '--version',
        'latest',
        '--json'
      ],
      {cwd: REPO_ROOT, env, encoding: 'utf8'}
    );
    const partialJson = JSON.parse(partialStdout);
    assert.ok(partialJson.warnings.some(w => w.code === 'WARN_PARTIAL_BATCH_MISS'));
    assert.equal(partialJson.results.length, 3);
    assert.equal(partialJson.results[0].ok, true);
    assert.equal(partialJson.results[0].entry.id, 's2:Button');
    assert.equal(partialJson.results[1].ok, false);
    assert.equal(partialJson.results[1].error.code, 'ERR_ENTRY_NOT_FOUND');
    assert.equal(partialJson.results[2].ok, true);
    assert.equal(partialJson.results[2].entry.id, 'rac:Button');

    let allMissingExit = 0;
    try {
      execFileSync(
        process.execPath,
        [s2CliBin, 'read', 's2:DoesNotExistComponent', '--version', 'latest', '--json'],
        {cwd: REPO_ROOT, env, encoding: 'utf8'}
      );
    } catch (err) {
      allMissingExit = err.status;
    }
    assert.equal(allMissingExit, 3, 'Expected exit code 3 (NOT_FOUND) when entire batch fails');

    // Unexpected failures are internal errors (exit 1), not invalid arguments
    const fileAsCacheDir = path.join(tmpCache, 'not-a-dir');
    fs.writeFileSync(fileAsCacheDir, '');
    let internalErr;
    try {
      execFileSync(
        process.execPath,
        [
          s2CliBin,
          'read',
          's2:Button',
          '--version',
          'latest',
          '--cache-dir',
          fileAsCacheDir,
          '--json'
        ],
        {cwd: REPO_ROOT, env, encoding: 'utf8'}
      );
    } catch (err) {
      internalErr = err;
    }
    assert.equal(internalErr?.status, 1);
    assert.equal(JSON.parse(internalErr.stdout).error.code, 'ERR_INTERNAL');

    // Path-traversal IDs are rejected per-entry without reading outside the slice
    const traversalJson = JSON.parse(
      execFileSync(
        process.execPath,
        [
          s2CliBin,
          'read',
          's2:../../../../../../package',
          'rac:..\\..\\index',
          's2:Button',
          '--version',
          'latest',
          '--json'
        ],
        {cwd: REPO_ROOT, env, encoding: 'utf8'}
      )
    );
    assert.equal(traversalJson.results[0].ok, false);
    assert.equal(traversalJson.results[0].error.code, 'ERR_INVALID_ID');
    assert.equal(traversalJson.results[1].ok, false);
    assert.equal(traversalJson.results[1].error.code, 'ERR_INVALID_ID');
    assert.equal(traversalJson.results[2].ok, true);

    // 2. Bounded maxTokens budget emits continuation instructions instead of crashing
    const boundedRaw = execFileSync(
      process.execPath,
      [
        s2CliBin,
        'read',
        's2:ComboBox',
        's2:TableView',
        '--max-tokens',
        '6000',
        '--version',
        'latest',
        '--json'
      ],
      {cwd: REPO_ROOT, env, encoding: 'utf8'}
    );
    const boundedJson = JSON.parse(boundedRaw);
    assert.ok(Math.ceil(Buffer.byteLength(boundedRaw) / 4) <= 6000);
    assert.ok(
      boundedJson.results.some(r => r.truncated && r.continueCommand?.includes('--cursor')),
      'Expected truncated result with an actionable cursor'
    );
    for (const result of boundedJson.results) {
      assert.ok(
        result.includedSections.every(section => !result.omittedSections.includes(section))
      );
      for (const exp of result.entry.exports) {
        assert.ok(result.includedSections.includes(`api:${exp.name}`));
      }
    }
    const singleBoundedRaw = execFileSync(
      process.execPath,
      [s2CliBin, 'read', 's2:ComboBox', '--max-tokens', '4000', '--version', 'latest', '--json'],
      {cwd: REPO_ROOT, env, encoding: 'utf8'}
    );
    assert.ok(Math.ceil(Buffer.byteLength(singleBoundedRaw) / 4) <= 4000);
    assert.equal(JSON.parse(singleBoundedRaw).results[0].truncated, true);

    // Malformed numeric flags, invalid per-subcommand flags/positionals, and S2-only commands in the react-aria CLI are invalid arguments
    for (const [bin, args] of [
      [s2CliBin, ['read', 's2:Button', '--max-tokens', 'abc']],
      [s2CliBin, ['read', 's2:Button', '--max-tokens', '1']],
      [s2CliBin, ['search', 'button', '--limit', '0']],
      [s2CliBin, ['search', 'button', '--events-only']],
      [s2CliBin, ['read', 's2:Button', '--property', 'gap']],
      [s2CliBin, ['resolve', 'extra-arg']],
      [s2CliBin, ['api', 's2:Button', 'extra-arg']],
      [racCliBin, ['tokens', 'padding']],
      [racCliBin, ['icons', 'Edit']]
    ]) {
      let invalidErr;
      try {
        execFileSync(process.execPath, [bin, ...args, '--version', 'latest', '--json'], {
          cwd: REPO_ROOT,
          env,
          encoding: 'utf8'
        });
      } catch (err) {
        invalidErr = err;
      }
      assert.equal(invalidErr?.status, 2, `Expected exit 2 for ${args.join(' ')}`);
      assert.equal(JSON.parse(invalidErr.stdout).error.code, 'ERR_INVALID_ARGS');
    }

    // 3. S2 tokens + icons + RAC api commands
    const tokensJson = JSON.parse(
      execFileSync(
        process.execPath,
        [s2CliBin, 'tokens', '--property', 'backgroundColor', '--version', 'latest', '--json'],
        {cwd: REPO_ROOT, env, encoding: 'utf8'}
      )
    );
    assert.ok(tokensJson.properties.some(p => p.property === 'backgroundColor'));

    const iconsJson = JSON.parse(
      execFileSync(process.execPath, [s2CliBin, 'icons', 'Edit', '--version', 'latest', '--json'], {
        cwd: REPO_ROOT,
        env,
        encoding: 'utf8'
      })
    );
    assert.ok((iconsJson.icons || iconsJson.matches || []).length > 0);

    const racApiJson = JSON.parse(
      execFileSync(
        process.execPath,
        [
          racCliBin,
          'api',
          'rac:ComboBox',
          '--prop',
          'allowsCustomValue,onInputChange',
          '--version',
          'latest',
          '--json'
        ],
        {cwd: REPO_ROOT, env, encoding: 'utf8'}
      )
    );
    const comboExport = racApiJson.exports.find(e => e.name === 'ComboBox');
    assert.ok(comboExport);
    assert.ok(comboExport.props.some(prop => prop.name === 'allowsCustomValue'));
    assert.ok(comboExport.events.some(event => event.name === 'onInputChange'));

    // Combining --events-only and --render-props returns both events and render props (union, not empty)
    const combinedApiJson = JSON.parse(
      execFileSync(
        process.execPath,
        [
          racCliBin,
          'api',
          'rac:ComboBox',
          '--export',
          'ComboBox',
          '--events-only',
          '--render-props',
          '--version',
          'latest',
          '--json'
        ],
        {cwd: REPO_ROOT, env, encoding: 'utf8'}
      )
    );
    assert.equal(combinedApiJson.exports[0].props.length, 0);
    assert.ok(combinedApiJson.exports[0].events.length > 0);
    assert.ok(combinedApiJson.exports[0].renderProps.length > 0);

    // Repeatable --version flags merge instead of dropping earlier flags
    const repeatableVerJson = JSON.parse(
      execFileSync(
        process.execPath,
        [
          s2CliBin,
          'resolve',
          '--version',
          '@react-spectrum/s2@latest',
          '--version',
          'react-aria-components@latest',
          '--json'
        ],
        {cwd: REPO_ROOT, env, encoding: 'utf8'}
      )
    );
    assert.ok(repeatableVerJson.resolution.packages['@react-spectrum/s2']);
    assert.ok(repeatableVerJson.resolution.packages['react-aria-components']);

    const missingPropArgs = [
      racCliBin,
      'api',
      'rac:ComboBox',
      '--export',
      'ComboBox',
      '--prop',
      'onInptChange',
      '--events-only',
      '--version',
      'latest'
    ];
    for (const json of [false, true]) {
      assert.throws(
        () =>
          execFileSync(process.execPath, [...missingPropArgs, ...(json ? ['--json'] : [])], {
            cwd: REPO_ROOT,
            env,
            encoding: 'utf8',
            stdio: 'pipe'
          }),
        err => {
          assert.equal(err.status, 3);
          if (json) {
            const {error} = JSON.parse(err.stdout);
            assert.equal(error.code, 'ERR_PROP_NOT_FOUND');
            assert.match(error.message, /onInptChange.*not found/);
            assert.equal(error.suggestions[0], 'onInputChange');
          } else {
            assert.match(err.stderr, /onInptChange.*not found/);
            assert.match(err.stderr, /suggested: onInputChange/);
            assert.equal(err.stdout, '');
          }
          return true;
        }
      );
    }
  } finally {
    fs.rmSync(tmpCache, {recursive: true, force: true});
  }
});

test('every CLI command documented in the generated SKILL.md files parses and runs', () => {
  const bins = {
    spectrum: path.join(REPO_ROOT, 'packages/dev/cli/s2/dist/cli/s2/src/index.js'),
    'react-aria': path.join(
      REPO_ROOT,
      'packages/dev/cli/react-aria/dist/cli/react-aria/src/index.js'
    )
  };
  const tmpCache = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-skill-cache-'));
  const env = {
    ...process.env,
    RSP_AGENT_DOCS_SNAPSHOT_SOURCE: SNAPSHOT_SOURCE,
    RSP_AGENT_DOCS_CACHE_DIR: tmpCache
  };
  try {
    const skillsDir = path.join(REPO_ROOT, 'packages/dev/agent-docs-core/skills');
    let count = 0;
    for (const skill of fs.readdirSync(skillsDir)) {
      const md = fs.readFileSync(path.join(skillsDir, skill, 'SKILL.md'), 'utf8');
      for (const line of md.split('\n')) {
        const bin = Object.keys(bins).find(b => line.startsWith(`${b} `));
        if (!bin) {
          continue;
        }
        const args = (line.slice(bin.length).match(/"[^"]*"|\S+/g) || [])
          .map(a => a.replace(/^"|"$/g, ''))
          .map(a => (a === '<app-dir>' ? REPO_ROOT : a));
        const stdout = execFileSync(
          process.execPath,
          [bins[bin], ...args, '--version', 'latest', '--json'],
          {cwd: REPO_ROOT, env, encoding: 'utf8'}
        );
        const results = args[0] === 'read' ? JSON.parse(stdout).results : [];
        for (const result of results) {
          assert.ok(result.ok, `${line}: ${result.requestedId} -> ${result.error?.code}`);
        }
        const guidance = results.find(
          result => result.requestedId === 's2:guide/implementation-guidance'
        );
        if (guidance) {
          assert.ok(
            guidance.entry.sections.length > 0,
            'Skill must include implementation guidance sections'
          );
          assert.ok(guidance.entry.sections.some(section => section.heading === 'Styling'));
        }
        count++;
      }
    }
    assert.ok(count >= 10, `Expected to exercise SKILL.md commands, ran ${count}`);
  } finally {
    fs.rmSync(tmpCache, {recursive: true, force: true});
  }
});

test('MCP v2 servers support roots/list workspace discovery, reusable resolution, batched reads, SEP-2640 skills resource, and drop legacy v1 tools', async () => {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {StdioClientTransport} = await import('@modelcontextprotocol/sdk/client/stdio.js');
  const {ListRootsRequestSchema} = await import('@modelcontextprotocol/sdk/types.js');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-mcp-roots-'));
  const serverStartDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-mcp-empty-cwd-'));
  const appWorkspaceDir = path.join(tmp, 'workspace-app');
  fs.mkdirSync(path.join(appWorkspaceDir, 'node_modules/react-aria-components'), {recursive: true});
  fs.writeFileSync(
    path.join(appWorkspaceDir, 'package.json'),
    JSON.stringify({name: 'workspace-app', dependencies: {'react-aria-components': '1.22.1'}})
  );
  fs.writeFileSync(
    path.join(appWorkspaceDir, 'node_modules/react-aria-components/package.json'),
    JSON.stringify({name: 'react-aria-components', version: '1.22.1'})
  );

  // Start `@react-spectrum/mcp` in an EMPTY directory (`serverStartDir`) with NO `--cwd`,
  // and provide the real workspace ONLY via MCP `roots/list` capability!
  const entry = path.join(REPO_ROOT, 'packages/dev/mcp/s2/dist/mcp/s2/src/index.js');
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [entry],
    cwd: serverStartDir,
    env: {
      ...process.env,
      RSP_AGENT_DOCS_SNAPSHOT_SOURCE: SNAPSHOT_SOURCE,
      RSP_AGENT_DOCS_CACHE_DIR: path.join(tmp, 'cache')
    }
  });
  const client = new Client(
    {name: 'mcp-v2-test-client', version: '1.0.0'},
    {capabilities: {roots: {listChanged: true}}}
  );

  let rootsRequestCount = 0;
  client.setRequestHandler(ListRootsRequestSchema, async () => {
    rootsRequestCount++;
    return {
      roots: [{uri: pathToFileURL(appWorkspaceDir).href, name: 'workspace-app'}]
    };
  });

  try {
    await client.connect(transport);

    // 1. Tool surface is cleanly v2 (legacy `list_s2_pages` / `get_s2_page` removed per User Correction #8)
    const {tools} = await client.listTools();
    const toolNames = new Set(tools.map(t => t.name));
    assert.deepEqual([...toolNames].sort(), [
      'get_component_api',
      'read_docs',
      'resolve_versions',
      'search_docs',
      'search_s2_icons',
      'search_s2_tokens'
    ]);
    assert.equal(toolNames.has('list_s2_pages'), false);
    assert.equal(toolNames.has('get_s2_page'), false);

    // 2. `resolve_versions` with NO `cwd` discovers `appWorkspaceDir` via `roots/list`!
    const resolveRes = await client.callTool({name: 'resolve_versions', arguments: {}});
    assert.ok(!resolveRes.isError, resolveRes.content?.[0]?.text);
    const resolvedPayload = JSON.parse(resolveRes.content[0].text);
    const resolvedState = resolvedPayload.resolution;
    assert.equal(resolvedState.workspacePackageName, 'workspace-app');
    assert.equal(resolvedState.packages['react-aria-components'].packageVersion, '1.22.1');

    // 3. Pass reusable `resolution` into batched `read_docs`
    const readRes = await client.callTool({
      name: 'read_docs',
      arguments: {
        ids: ['rac:Button', 'rac:ComboBox'],
        sections: ['usage'],
        format: 'json',
        resolution: resolvedState
      }
    });
    assert.ok(!readRes.isError, readRes.content?.[0]?.text);
    const readPayload = JSON.parse(readRes.content[0].text);
    assert.equal(readPayload.results.length, 2);
    assert.ok(readPayload.results.every(r => r.ok));
    const indexRes = await client.callTool({
      name: 'read_docs',
      arguments: {
        ids: 'rac:ComboBox',
        listSections: true,
        format: 'json',
        resolution: resolvedState
      }
    });
    assert.ok(!indexRes.isError, indexRes.content?.[0]?.text);
    const index = JSON.parse(indexRes.content[0].text).results[0];
    const section = index.sectionIndex.find(section => section.heading === 'Forms');
    assert.ok(section);
    assert.equal(index.entry, undefined);
    const sectionRes = await client.callTool({
      name: 'read_docs',
      arguments: {
        ids: 'rac:ComboBox',
        sectionHeadings: [section.id],
        format: 'json',
        resolution: resolvedState
      }
    });
    assert.ok(!sectionRes.isError, sectionRes.content?.[0]?.text);
    const focused = JSON.parse(sectionRes.content[0].text).results[0];
    assert.deepEqual(focused.includedSections, [section.id]);
    assert.equal(focused.entry.sections[0].heading, section.heading);

    const boundedRes = await client.callTool({
      name: 'read_docs',
      arguments: {ids: ['rac:ComboBox'], maxTokens: 4000, format: 'json', resolution: resolvedState}
    });
    assert.ok(!boundedRes.isError, boundedRes.content?.[0]?.text);
    assert.ok(Math.ceil(Buffer.byteLength(boundedRes.content[0].text) / 4) <= 4000);
    const firstPage = JSON.parse(boundedRes.content[0].text);
    const firstItem = firstPage.results[0];
    assert.equal(firstPage.resolution, undefined);
    assert.equal(firstItem.markdown, undefined);
    assert.ok(firstItem.nextCursor);
    const resumedRes = await client.callTool({
      name: 'read_docs',
      arguments: {
        ids: ['rac:ComboBox'],
        cursor: firstItem.nextCursor,
        format: 'json',
        jsonContent: 'markdown',
        includeResolution: true,
        resolution: resolvedState
      }
    });
    assert.ok(!resumedRes.isError, resumedRes.content?.[0]?.text);
    const resumedPage = JSON.parse(resumedRes.content[0].text);
    const resumedItem = resumedPage.results[0];
    assert.deepEqual(resumedPage.resolution, resolvedState);
    assert.ok(resumedItem.markdown);
    assert.equal(resumedItem.entry, undefined);
    assert.equal(resumedItem.truncated, false);
    assert.ok(resumedItem.includedSections.every(id => !firstItem.includedSections.includes(id)));

    // Malformed or conflicting `resolution` arguments are rejected with a clear error
    await assert.rejects(
      () =>
        client.callTool({
          name: 'read_docs',
          arguments: {ids: ['rac:Button'], resolution: {cwd: appWorkspaceDir}}
        }),
      /Invalid arguments for tool read_docs/
    );
    const conflictingRes = await client.callTool({
      name: 'read_docs',
      arguments: {ids: ['rac:Button'], resolution: resolvedState, version: 'latest'}
    });
    assert.equal(conflictingRes.isError, true);
    assert.match(conflictingRes.content[0].text, /cannot be combined/);

    // `read_docs` rejects jsonContent when format !== 'json', and returns isError: true when every requested ID fails
    const badJsonContentRes = await client.callTool({
      name: 'read_docs',
      arguments: {
        ids: ['rac:Button'],
        format: 'markdown',
        jsonContent: 'markdown',
        resolution: resolvedState
      }
    });
    assert.equal(badJsonContentRes.isError, true);
    assert.equal(JSON.parse(badJsonContentRes.content[0].text).error.code, 'ERR_INVALID_ARGS');

    const allMissingMcpRes = await client.callTool({
      name: 'read_docs',
      arguments: {ids: ['rac:NoSuchComponentXYZ'], format: 'json', resolution: resolvedState}
    });
    assert.equal(allMissingMcpRes.isError, true);
    assert.equal(
      JSON.parse(allMissingMcpRes.content[0].text).results[0].error.code,
      'ERR_ENTRY_NOT_FOUND'
    );

    // MCP v2 feature parity: `get_component_api` supports eventsOnly, renderPropsOnly, includeDeprecated,
    // and `resolve_versions` supports strictVersion and allowLatestFallback
    const eventsOnlyRes = await client.callTool({
      name: 'get_component_api',
      arguments: {
        id: 'rac:ComboBox',
        exportName: 'ComboBox',
        eventsOnly: true,
        renderPropsOnly: true,
        includeDeprecated: false,
        format: 'json',
        resolution: resolvedState
      }
    });
    assert.ok(!eventsOnlyRes.isError, eventsOnlyRes.content?.[0]?.text);
    const eventsOnlyPayload = JSON.parse(eventsOnlyRes.content[0].text);
    assert.equal(eventsOnlyPayload.exports[0].props.length, 0);
    assert.ok(eventsOnlyPayload.exports[0].events.length > 0);
    assert.ok(eventsOnlyPayload.exports[0].renderProps.length > 0);

    const allowLatestRes = await client.callTool({
      name: 'resolve_versions',
      arguments: {cwd: serverStartDir, allowLatestFallback: true}
    });
    assert.ok(!allowLatestRes.isError, allowLatestRes.content?.[0]?.text);
    const allowLatestPayload = JSON.parse(allowLatestRes.content[0].text);
    assert.ok(Object.keys(allowLatestPayload.resolution.packages).length > 0);

    // Error results surface `suggestions` when available (e.g. misspelled prop)
    const propErrRes = await client.callTool({
      name: 'get_component_api',
      arguments: {
        id: 'rac:ComboBox',
        exportName: 'ComboBox',
        props: ['onInptChange'],
        resolution: resolvedState
      }
    });
    assert.equal(propErrRes.isError, true);
    const propErrPayload = JSON.parse(propErrRes.content[0].text);
    assert.equal(propErrPayload.error.code, 'ERR_PROP_NOT_FOUND');
    assert.equal(propErrPayload.error.suggestions[0], 'onInputChange');

    // `roots/list` is cached across calls and re-fetched only after `notifications/roots/list_changed`
    assert.equal(rootsRequestCount, 1);
    await client.callTool({name: 'resolve_versions', arguments: {}});
    assert.equal(rootsRequestCount, 1, 'Expected cached MCP roots across tool calls');
    await client.sendRootsListChanged();
    await client.callTool({name: 'resolve_versions', arguments: {}});
    assert.equal(
      rootsRequestCount,
      2,
      'Expected roots cache invalidation after list_changed notification'
    );

    // 4. `SEP-2640` evergreen skill resource (`skills://react-spectrum-s2/SKILL.md`)
    const {resources} = await client.listResources();
    assert.ok(resources.some(r => r.uri === 'skills://react-spectrum-s2/SKILL.md'));
    const skillResource = await client.readResource({uri: 'skills://react-spectrum-s2/SKILL.md'});
    assert.ok(skillResource.contents[0].text.includes('name: "react-spectrum-s2"'));
  } finally {
    try {
      await client.close();
    } catch {
      // ignore
    }
    fs.rmSync(tmp, {recursive: true, force: true});
    fs.rmSync(serverStartDir, {recursive: true, force: true});
  }
});

test('MCP multi-root discovery ignores unrelated roots under allowLatestFallback, honors roots with explicit version, and formats MCP search_docs guidance', async () => {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {StdioClientTransport} = await import('@modelcontextprotocol/sdk/client/stdio.js');
  const {ListRootsRequestSchema} = await import('@modelcontextprotocol/sdk/types.js');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-mcp-multiroot-'));
  const serverStartDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-mcp-multiroot-cwd-'));
  const unrelatedRoot = path.join(tmp, 'unrelated-docs');
  const appRoot = path.join(tmp, 'spectrum-app');
  fs.mkdirSync(unrelatedRoot, {recursive: true});
  fs.writeFileSync(path.join(unrelatedRoot, 'package.json'), JSON.stringify({name: 'unrelated'}));
  fs.mkdirSync(path.join(appRoot, 'node_modules/react-aria-components'), {recursive: true});
  fs.writeFileSync(
    path.join(appRoot, 'package.json'),
    JSON.stringify({name: 'spectrum-app', dependencies: {'react-aria-components': '1.22.1'}})
  );
  fs.writeFileSync(
    path.join(appRoot, 'node_modules/react-aria-components/package.json'),
    JSON.stringify({name: 'react-aria-components', version: '1.22.1'})
  );

  const entry = path.join(REPO_ROOT, 'packages/dev/mcp/s2/dist/mcp/s2/src/index.js');
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [entry],
    cwd: serverStartDir,
    env: {
      ...process.env,
      RSP_AGENT_DOCS_SNAPSHOT_SOURCE: SNAPSHOT_SOURCE,
      RSP_AGENT_DOCS_CACHE_DIR: path.join(tmp, 'cache')
    }
  });
  const client = new Client(
    {name: 'mcp-multiroot-test-client', version: '1.0.0'},
    {capabilities: {roots: {listChanged: true}}}
  );
  client.setRequestHandler(ListRootsRequestSchema, async () => ({
    roots: [
      {uri: pathToFileURL(unrelatedRoot).href, name: 'unrelated-docs'},
      {uri: pathToFileURL(appRoot).href, name: 'spectrum-app'}
    ]
  }));

  try {
    await client.connect(transport);

    // 1. Multi-root with allowLatestFallback: true resolves the single Spectrum/Aria root instead of throwing ERR_AMBIGUOUS_WORKSPACE_ROOTS
    const multiRootRes = await client.callTool({
      name: 'resolve_versions',
      arguments: {allowLatestFallback: true}
    });
    assert.ok(!multiRootRes.isError, multiRootRes.content?.[0]?.text);
    const multiRootPayload = JSON.parse(multiRootRes.content[0].text);
    assert.equal(multiRootPayload.resolution.workspacePackageName, 'spectrum-app');

    // 2. Explicit version override without `cwd` still discovers `appRoot` via roots/list
    const overrideRes = await client.callTool({
      name: 'resolve_versions',
      arguments: {version: '@react-spectrum/s2@latest'}
    });
    assert.ok(!overrideRes.isError, overrideRes.content?.[0]?.text);
    const overridePayload = JSON.parse(overrideRes.content[0].text);
    assert.equal(overridePayload.resolution.workspacePackageName, 'spectrum-app');
    assert.equal(
      overridePayload.resolution.packages['react-aria-components']?.packageVersion,
      '1.22.1'
    );

    // 3. `search_docs` Markdown uses MCP `read_docs` guidance, not CLI shell commands
    const searchMdRes = await client.callTool({
      name: 'search_docs',
      arguments: {query: 'Button', limit: 3, format: 'markdown'}
    });
    assert.ok(!searchMdRes.isError, searchMdRes.content?.[0]?.text);
    const searchMd = searchMdRes.content[0].text;
    assert.match(searchMd, /Next: call `read_docs` with `ids: \["[^"]+"\]`/);
    assert.doesNotMatch(searchMd, /Next: `(?:spectrum|react-aria) read /);
    assert.doesNotMatch(searchMd, /Append to every `Next` command/);
  } finally {
    try {
      await client.close();
    } catch {
      // ignore
    }
    fs.rmSync(tmp, {recursive: true, force: true});
    fs.rmSync(serverStartDir, {recursive: true, force: true});
  }
});

test('validateGeneratedPlugins enforces CLI vs MCP separation, duplicate-server prevention, and version-neutral SKILL.md', async () => {
  const {generateAllAgentPlugins, validateGeneratedPlugins} = await pluginModPromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-plugins-'));

  try {
    const pluginsDir = path.join(tmp, 'plugins');
    const skillsDir = path.join(tmp, 'skills');
    const generated = await generateAllAgentPlugins({
      pluginsOutRoot: pluginsDir,
      coreSkillsOutRoot: skillsDir
    });
    assert.equal(generated.validation.ok, true);
    const manifests = fs
      .readdirSync(pluginsDir, {recursive: true})
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(pluginsDir, file));
    execFileSync('yarn', ['format:check', ...manifests], {cwd: REPO_ROOT});

    // Negative check 1: adding `.mcp.json` alongside `mcp.json` in an MCP bundle fails validation (duplicate server registration)
    fs.writeFileSync(path.join(pluginsDir, 'react-spectrum-mcp/.mcp.json'), '{"mcpServers":{}}');
    const dupCheck = validateGeneratedPlugins(pluginsDir);
    assert.equal(dupCheck.ok, false);
    assert.ok(dupCheck.errors.some(e => e.includes('duplicate MCP server')));
    fs.rmSync(path.join(pluginsDir, 'react-spectrum-mcp/.mcp.json'));

    // Negative check 2: adding `mcp.json` to CLI-only bundle fails validation
    fs.writeFileSync(path.join(pluginsDir, 'react-spectrum/mcp.json'), '{"mcpServers":{}}');
    const cliLeakCheck = validateGeneratedPlugins(pluginsDir);
    assert.equal(cliLeakCheck.ok, false);
    assert.ok(cliLeakCheck.errors.some(e => e.includes('CLI-only plugin bundle must not include')));
    fs.rmSync(path.join(pluginsDir, 'react-spectrum/mcp.json'));

    // Negative check 3: leaking version-sensitive subpath import rule into SKILL.md fails validation
    const skillPath = path.join(pluginsDir, 'react-spectrum/skills/react-spectrum-s2/SKILL.md');
    const origSkill = fs.readFileSync(skillPath, 'utf8');
    fs.writeFileSync(skillPath, origSkill + "\nImport from '@react-spectrum/s2/ComboBox'\n");
    const leakCheck = validateGeneratedPlugins(pluginsDir);
    assert.equal(leakCheck.ok, false);
    assert.ok(leakCheck.errors.some(e => e.includes('subpath import')));
    fs.writeFileSync(skillPath, origSkill);

    // Freshness check: passes when matching generator output, fails on drift or extra stale files
    const {checkGeneratedPluginsFreshness} = await pluginModPromise;
    const freshCheck = await checkGeneratedPluginsFreshness({
      pluginsRoot: pluginsDir,
      coreSkillsRoot: skillsDir
    });
    assert.equal(freshCheck.ok, true);

    fs.writeFileSync(skillPath, origSkill + '\n<!-- stale drift -->\n');
    const driftedCheck = await checkGeneratedPluginsFreshness({
      pluginsRoot: pluginsDir,
      coreSkillsRoot: skillsDir
    });
    assert.equal(driftedCheck.ok, false);
    assert.ok(driftedCheck.errors.some(e => e.includes('out of date with generator')));
    fs.writeFileSync(skillPath, origSkill);

    const staleExtra = path.join(pluginsDir, 'react-spectrum/stale.txt');
    fs.writeFileSync(staleExtra, 'stale');
    const extraCheck = await checkGeneratedPluginsFreshness({
      pluginsRoot: pluginsDir,
      coreSkillsRoot: skillsDir
    });
    assert.equal(extraCheck.ok, false);
    assert.ok(extraCheck.errors.some(e => e.includes('unexpected stale file')));
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('CLI supports bare --version / -V, rejects --version on manifest, and reads package version by walking up directories', async () => {
  const {readPackageVersion, runAgentDocsCli} = await corePromise;

  for (const flag of ['--version', '-V', '-v', '--cli-version']) {
    let out = '';
    const code = await runAgentDocsCli('s2', '9.8.7', [flag], {
      stdout: text => {
        out += text;
      }
    });
    assert.equal(code, 0, `Expected exit 0 for bare ${flag}`);
    assert.equal(out.trim(), '9.8.7');
  }

  let manifestErr = '';
  const manifestCode = await runAgentDocsCli('s2', '9.8.7', ['manifest', '--version', '1.2.0'], {
    stderr: text => {
      manifestErr += text;
    }
  });
  assert.equal(manifestCode, 2);
  assert.match(manifestErr, /--version.*not valid for 'spectrum manifest'/i);

  let manifestOut = '';
  const okCode = await runAgentDocsCli('s2', '9.8.7', ['manifest', '--json'], {
    stdout: text => {
      manifestOut += text;
    }
  });
  assert.equal(okCode, 0);
  const manifestObj = JSON.parse(manifestOut);
  assert.equal(manifestObj.cliName, 'spectrum');
  assert.equal(manifestObj.packageVersion, '9.8.7');

  const s2EntryUrl = new URL('../../cli/s2/dist/cli/s2/src/index.js', import.meta.url).href;
  const s2Pkg = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'packages/dev/cli/s2/package.json'), 'utf8')
  );
  assert.equal(readPackageVersion(s2EntryUrl), s2Pkg.version);
});
