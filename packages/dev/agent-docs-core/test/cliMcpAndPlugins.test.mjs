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
      boundedJson.results.some(r => r.truncated && r.continueCommand?.includes('--sections')),
      'Expected truncated result with actionable --sections continueCommand'
    );
    for (const result of boundedJson.results) {
      assert.ok(
        result.includedSections.every(section => !result.omittedSections.includes(section))
      );
      if (result.omittedSections.includes('api')) {
        assert.equal(result.entry.exports.length, 0);
      }
    }
    const singleBoundedRaw = execFileSync(
      process.execPath,
      [s2CliBin, 'read', 's2:ComboBox', '--max-tokens', '4000', '--version', 'latest', '--json'],
      {cwd: REPO_ROOT, env, encoding: 'utf8'}
    );
    assert.ok(Math.ceil(Buffer.byteLength(singleBoundedRaw) / 4) <= 4000);
    assert.equal(JSON.parse(singleBoundedRaw).results[0].truncated, true);

    // Malformed numeric flags and S2-only commands in the react-aria CLI are invalid arguments
    for (const [bin, args] of [
      [s2CliBin, ['read', 's2:Button', '--max-tokens', 'abc']],
      [s2CliBin, ['read', 's2:Button', '--max-tokens', '1']],
      [s2CliBin, ['search', 'button', '--limit', '0']],
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
          'selectedKey,onSelectionChange',
          '--version',
          'latest',
          '--json'
        ],
        {cwd: REPO_ROOT, env, encoding: 'utf8'}
      )
    );
    const comboExport = racApiJson.exports.find(e => e.name === 'ComboBox');
    assert.ok(comboExport);
    assert.ok(comboExport.props.every(prop => prop.name === 'selectedKey'));
    assert.ok(comboExport.events.every(event => event.name === 'onSelectionChange'));
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
          assert.match(guidance.markdown, /Styling/);
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
    {capabilities: {roots: {listChanged: false}}}
  );

  client.setRequestHandler(ListRootsRequestSchema, async () => ({
    roots: [{uri: pathToFileURL(appWorkspaceDir).href, name: 'workspace-app'}]
  }));

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
    const boundedRes = await client.callTool({
      name: 'read_docs',
      arguments: {ids: ['rac:ComboBox'], maxTokens: 4000, format: 'json', resolution: resolvedState}
    });
    assert.ok(!boundedRes.isError, boundedRes.content?.[0]?.text);
    assert.ok(Math.ceil(Buffer.byteLength(boundedRes.content[0].text) / 4) <= 4000);
    assert.equal(JSON.parse(boundedRes.content[0].text).results[0].truncated, true);

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
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});
