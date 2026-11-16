#!/usr/bin/env node
/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {HEAD_VERSIONS, REPO_ROOT, SCENARIOS} from './scenarios.mjs';
import os from 'node:os';
import {parseArgs} from 'node:util';
import path from 'node:path';
import {performance} from 'node:perf_hooks';

const LOCAL_RESULTS_DIR = path.join(REPO_ROOT, 'packages/dev/agent-docs-bench/.local/results');
const S2_DOCS_DIST = path.join(REPO_ROOT, 'packages/dev/s2-docs/dist');

function estimateTokens(text) {
  return Math.ceil(Buffer.byteLength(text, 'utf8') / 4);
}

function checkPropPresenceAssertion(results, spec, mustExist, violations) {
  if (!spec || !results) {
    return;
  }
  const {entryId, exportName, propName} = spec;
  const found = results.find(r => r.requestedId === entryId && r.ok);
  if (!found) {
    violations.push(`Expected entry '${entryId}' to resolve`);
    return;
  }
  const hasProp = collectEntryPropNames(found.entry, exportName).has(propName);
  if (!mustExist && hasProp) {
    violations.push(
      `Hallucinated newer prop '${propName}' on '${entryId}'${exportName ? ` (${exportName})` : ''} for historical version ${found.provenance?.packageVersion}`
    );
  } else if (mustExist && !hasProp) {
    violations.push(
      `Missing expected prop '${propName}' on '${entryId}'${exportName ? ` (${exportName})` : ''} for version ${found.provenance?.packageVersion}`
    );
  }
}

function ensureLegacyDocsGenerated() {
  const s2Combo = path.join(S2_DOCS_DIST, 's2/ComboBox.md');
  const racCombo = path.join(S2_DOCS_DIST, 'react-aria/ComboBox.md');
  const s2SkillsIndex = path.join(S2_DOCS_DIST, 's2/.well-known/agent-skills/index.json');
  if (!fs.existsSync(s2Combo) || !fs.existsSync(racCombo) || !fs.existsSync(s2SkillsIndex)) {
    console.log('Generating current s2-docs Markdown & Agent Skills for baseline measurement...');
    execFileSync(
      process.execPath,
      [path.join(REPO_ROOT, 'packages/dev/s2-docs/scripts/generateAgentSkills.mjs')],
      {cwd: REPO_ROOT, stdio: 'inherit'}
    );
  }
}

function createSyntheticWorkspace(rootDir, workspaceSpec) {
  const appDir = path.join(rootDir, 'apps/web');
  fs.mkdirSync(appDir, {recursive: true});
  fs.writeFileSync(
    path.join(rootDir, 'package.json'),
    JSON.stringify({name: 'bench-fixture-monorepo', private: true, workspaces: ['apps/*']}, null, 2)
  );
  fs.writeFileSync(
    path.join(appDir, 'package.json'),
    JSON.stringify(
      {name: '@bench/web', private: true, dependencies: workspaceSpec.dependencies},
      null,
      2
    )
  );

  for (const [pkgName, ver] of Object.entries(workspaceSpec.dependencies)) {
    const pkgDir = path.join(appDir, 'node_modules', ...pkgName.split('/'));
    fs.mkdirSync(pkgDir, {recursive: true});
    const nestedDeps = workspaceSpec.nestedDependencies?.[pkgName] || {};
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name: pkgName, version: ver, dependencies: nestedDeps}, null, 2)
    );
    fs.writeFileSync(path.join(pkgDir, 'index.js'), 'export {};\n');

    for (const [nestedName, nestedVer] of Object.entries(nestedDeps)) {
      const nestedDir = path.join(pkgDir, 'node_modules', ...nestedName.split('/'));
      fs.mkdirSync(nestedDir, {recursive: true});
      fs.writeFileSync(
        path.join(nestedDir, 'package.json'),
        JSON.stringify({name: nestedName, version: nestedVer}, null, 2)
      );
      fs.writeFileSync(path.join(nestedDir, 'index.js'), 'export {};\n');
    }
  }

  return appDir;
}

function measureLegacyStaticSkill() {
  ensureLegacyDocsGenerated();

  // Generate legacy bundled-reference archive in an isolated temp dir so default
  // `generateAgentSkills.mjs` can emit single-file evergreen skills without breaking baseline.
  const tmpLegacyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-bench-legacy-wk-'));
  const tmpExtract = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-bench-skill-'));
  let installedFileCount = 0;
  let installedBytes = 0;
  let skillMdText = '';
  try {
    execFileSync(
      process.execPath,
      [
        path.join(REPO_ROOT, 'packages/dev/s2-docs/scripts/generateAgentSkills.mjs'),
        '--legacy-bundled-references',
        '--out-dir',
        tmpLegacyRoot
      ],
      {cwd: REPO_ROOT, stdio: 'ignore'}
    );
    const tarPath = path.join(
      tmpLegacyRoot,
      's2/.well-known/agent-skills/react-spectrum-s2.tar.gz'
    );
    execFileSync('tar', ['-xzf', tarPath, '-C', tmpExtract]);
    const walk = dir => {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile()) {
          installedFileCount++;
          installedBytes += fs.statSync(full).size;
        }
      }
    };
    walk(tmpExtract);
    const skillMdPath = path.join(tmpExtract, 'react-spectrum-s2/SKILL.md');
    if (fs.existsSync(skillMdPath)) {
      skillMdText = fs.readFileSync(skillMdPath, 'utf8');
    }
  } finally {
    fs.rmSync(tmpLegacyRoot, {recursive: true, force: true});
    fs.rmSync(tmpExtract, {recursive: true, force: true});
  }

  const scenarioResults = [];
  for (const scenario of SCENARIOS) {
    const t0 = performance.now();
    let loadedText = skillMdText;
    let lookupCalls = 1; // Reading SKILL.md
    if (scenario.kind === 'discovery') {
      const dtPath = path.join(
        REPO_ROOT,
        'packages/dev/s2-docs/skills/react-spectrum-s2/component-decision-tree.md'
      );
      if (fs.existsSync(dtPath)) {
        loadedText += '\n' + fs.readFileSync(dtPath, 'utf8');
        lookupCalls++;
      }
    }
    for (const ref of scenario.legacyPages) {
      const mdPath = path.join(S2_DOCS_DIST, ref.library, `${ref.page}.md`);
      if (fs.existsSync(mdPath)) {
        loadedText += '\n' + fs.readFileSync(mdPath, 'utf8');
        lookupCalls++;
      }
    }
    const durationMs = performance.now() - t0;

    // Evaluate version accuracy against pinned/mixed/patch fixtures:
    // Legacy static skills always serve HEAD without workspace version resolution.
    const versionViolations = [];
    if (scenario.assertions.mustNotExposePropOnEntry) {
      const {propName} = scenario.assertions.mustNotExposePropOnEntry;
      if (loadedText.includes(`\`${propName}\``)) {
        versionViolations.push(
          `Exposed newer HEAD prop '${propName}' to pinned historical workspace`
        );
      }
    }
    if (scenario.assertions.mustRejectMissingEntry) {
      const missingSlug = scenario.assertions.mustRejectMissingEntry.split(':')[1];
      const missingLib = scenario.assertions.mustRejectMissingEntry.startsWith('s2:')
        ? 's2'
        : 'react-aria';
      if (fs.existsSync(path.join(S2_DOCS_DIST, missingLib, `${missingSlug}.md`))) {
        versionViolations.push(
          `Static skill exposes '${scenario.assertions.mustRejectMissingEntry}' which did not exist in target version`
        );
      }
    }
    if (scenario.assertions.expectedWarningCode) {
      versionViolations.push(
        `Missing expected warning '${scenario.assertions.expectedWarningCode}' (no workspace resolver)`
      );
    }
    if (scenario.assertions.expectedWarningOrErrorCode) {
      versionViolations.push(
        `Silently served HEAD (${HEAD_VERSIONS.s2}) instead of reporting '${scenario.assertions.expectedWarningOrErrorCode}'`
      );
    }

    scenarioResults.push({
      id: scenario.id,
      kind: scenario.kind,
      lookupCalls,
      tokens: estimateTokens(loadedText),
      durationMs: Number(durationMs.toFixed(2)),
      versionAccurate: versionViolations.length === 0,
      versionViolations
    });
  }

  return {
    arm: 'legacy-static-skill',
    installedFootprint: {
      files: installedFileCount,
      bytes: installedBytes
    },
    summary: summarizeScenarios(scenarioResults),
    scenarios: scenarioResults
  };
}

function measureLegacyMcp() {
  ensureLegacyDocsGenerated();

  // Simulate exact current 1-page MCP tool waterfall:
  // list_<lib>_pages(includeDescription: true) -> get_<lib>_page_info(page) -> get_<lib>_page(page)
  const llmsTxtCache = {
    s2: fs.readFileSync(path.join(S2_DOCS_DIST, 's2/llms.txt'), 'utf8'),
    'react-aria': fs.readFileSync(path.join(S2_DOCS_DIST, 'react-aria/llms.txt'), 'utf8')
  };

  const scenarioResults = [];
  for (const scenario of SCENARIOS) {
    const t0 = performance.now();
    let loadedText = '';
    let lookupCalls = 0;

    const seenLibs = new Set();
    for (const ref of scenario.legacyPages) {
      if (!seenLibs.has(ref.library)) {
        seenLibs.add(ref.library);
        loadedText += '\n' + llmsTxtCache[ref.library];
        lookupCalls++; // list_*_pages
      }
      const mdPath = path.join(S2_DOCS_DIST, ref.library, `${ref.page}.md`);
      if (fs.existsSync(mdPath)) {
        const md = fs.readFileSync(mdPath, 'utf8');
        // get_*_page_info returns section headings
        const headings = md
          .split('\n')
          .filter(l => /^#{1,3}\s+/.test(l))
          .join('\n');
        loadedText += '\n' + headings;
        lookupCalls++; // get_*_page_info
        loadedText += '\n' + md;
        lookupCalls++; // get_*_page
      }
    }
    const durationMs = performance.now() - t0;

    const versionViolations = [];
    if (scenario.assertions.mustNotExposePropOnEntry) {
      const {propName} = scenario.assertions.mustNotExposePropOnEntry;
      if (loadedText.includes(`\`${propName}\``)) {
        versionViolations.push(
          `Live 1-page MCP exposed newer HEAD prop '${propName}' to pinned historical workspace`
        );
      }
    }
    if (scenario.assertions.mustRejectMissingEntry) {
      versionViolations.push(
        `Live 1-page MCP always serves latest CDN and exposes '${scenario.assertions.mustRejectMissingEntry}'`
      );
    }
    if (scenario.assertions.expectedWarningCode) {
      versionViolations.push(
        `Missing '${scenario.assertions.expectedWarningCode}' (MCP has no workspace version resolution)`
      );
    }
    if (scenario.assertions.expectedWarningOrErrorCode) {
      versionViolations.push(
        `Silently served live latest (${HEAD_VERSIONS.s2}) instead of '${scenario.assertions.expectedWarningOrErrorCode}'`
      );
    }

    scenarioResults.push({
      id: scenario.id,
      kind: scenario.kind,
      lookupCalls,
      tokens: estimateTokens(loadedText),
      durationMs: Number(durationMs.toFixed(2)),
      versionAccurate: versionViolations.length === 0,
      versionViolations
    });
  }

  return {
    arm: 'legacy-mcp-waterfall',
    installedFootprint: {
      files: 0,
      bytes: 0
    },
    summary: summarizeScenarios(scenarioResults),
    scenarios: scenarioResults
  };
}

async function measureCandidateV2(options) {
  const coreModulePath = path.join(
    REPO_ROOT,
    'packages/dev/cli/s2/dist/agent-docs-core/src/index.js'
  );
  const cliBinPath = path.join(REPO_ROOT, 'packages/dev/cli/s2/dist/cli/s2/src/index.js');
  const snapshotRepoDir =
    options.snapshotRepoDir ||
    path.join(REPO_ROOT, 'packages/dev/agent-docs-bench/.local/snapshots');

  if (!fs.existsSync(coreModulePath) || !fs.existsSync(cliBinPath)) {
    throw new Error(
      `Candidate CLI/SDK build not found at ${cliBinPath}. Build @react-spectrum/cli and snapshots first.`
    );
  }

  const core = await import(coreModulePath);
  const tmpWorkspacesRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-bench-ws-'));
  const coldCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-bench-cold-cache-'));
  const warmCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-bench-warm-cache-'));

  try {
    const scenarioResults = [];
    const sdkColdMs = [];
    const sdkWarmMs = [];
    const cliBinMs = [];
    const cliRunnerMs = [];

    for (const scenario of SCENARIOS) {
      const scenarioRoot = path.join(tmpWorkspacesRoot, scenario.id);
      const appCwd = createSyntheticWorkspace(scenarioRoot, scenario.workspace);

      // 1. Cold cache SDK execution on first scenario
      if (sdkColdMs.length === 0) {
        const coldT0 = performance.now();
        await core.readDocs({
          ids: ['s2:ComboBox'],
          cwd: appCwd,
          cacheDir: coldCacheDir,
          snapshotSource: snapshotRepoDir
        });
        sdkColdMs.push(performance.now() - coldT0);
      }

      // 2. Warm cache SDK execution across scenario steps
      let lookupCalls = 0;
      let markdownText = '';
      let lastJsonEnvelope = null;
      const warmT0 = performance.now();
      for (const step of scenario.v2Plan.steps) {
        lookupCalls++;
        if (step.command === 'search') {
          const res = await core.searchDocs({
            query: step.query,
            cwd: appCwd,
            cacheDir: warmCacheDir,
            snapshotSource: snapshotRepoDir,
            defaultLibrary: scenario.v2Plan.brand === 'rac' ? 'rac' : 's2'
          });
          markdownText += '\n' + core.formatSearchMarkdown(res);
          lastJsonEnvelope = res;
        } else if (step.command === 'read') {
          const res = await core.readDocs({
            ids: step.ids,
            cwd: appCwd,
            cacheDir: warmCacheDir,
            snapshotSource: snapshotRepoDir,
            defaultLibrary: scenario.v2Plan.brand === 'rac' ? 'rac' : 's2'
          });
          markdownText += '\n' + core.formatReadMarkdown(res);
          lastJsonEnvelope = res;
        }
      }
      const warmDuration = performance.now() - warmT0;
      sdkWarmMs.push(warmDuration);

      // 3. Direct CLI binary latency sample on representative read step
      const lastStep = scenario.v2Plan.steps[scenario.v2Plan.steps.length - 1];
      if (lastStep.command === 'read') {
        const binT0 = performance.now();
        execFileSync(
          process.execPath,
          [
            cliBinPath,
            'read',
            ...lastStep.ids,
            '--cwd',
            appCwd,
            '--cache-dir',
            warmCacheDir,
            '--snapshot-source',
            snapshotRepoDir
          ],
          {stdio: 'pipe'}
        );
        cliBinMs.push(performance.now() - binT0);
      }

      // 4. Package runner (`yarn workspace @react-spectrum/cli`) sample on first scenario
      if (cliRunnerMs.length === 0 && lastStep.command === 'read') {
        const runnerT0 = performance.now();
        execFileSync(
          'yarn',
          [
            'workspace',
            '@react-spectrum/cli',
            'exec',
            'node',
            cliBinPath,
            'read',
            ...lastStep.ids,
            '--cwd',
            appCwd,
            '--cache-dir',
            warmCacheDir,
            '--snapshot-source',
            snapshotRepoDir
          ],
          {cwd: REPO_ROOT, stdio: 'pipe'}
        );
        cliRunnerMs.push(performance.now() - runnerT0);
      }

      // 5. Verify version accuracy & content assertions
      const versionViolations = [];
      for (const substr of scenario.assertions.mustContainSubstrings || []) {
        if (!markdownText.includes(substr)) {
          versionViolations.push(`Missing expected content '${substr}'`);
        }
      }

      checkPropPresenceAssertion(
        lastJsonEnvelope?.results,
        scenario.assertions.mustNotExposePropOnEntry,
        false,
        versionViolations
      );
      checkPropPresenceAssertion(
        lastJsonEnvelope?.results,
        scenario.assertions.mustExposePropOnEntry,
        true,
        versionViolations
      );

      if (scenario.assertions.mustRejectMissingEntry) {
        const missingCheck = await core.readDocs({
          ids: [scenario.assertions.mustRejectMissingEntry],
          cwd: appCwd,
          cacheDir: warmCacheDir,
          snapshotSource: snapshotRepoDir,
          defaultLibrary: scenario.v2Plan.brand === 'rac' ? 'rac' : 's2'
        });
        const item = missingCheck.results?.[0];
        if (!item || item.ok) {
          versionViolations.push(
            `Expected '${scenario.assertions.mustRejectMissingEntry}' to be absent in pinned historical version, but it resolved`
          );
        }
      }

      if (scenario.assertions.expectedWarningCode) {
        const hasWarn = (lastJsonEnvelope?.warnings || []).some(
          w => w.code === scenario.assertions.expectedWarningCode
        );
        if (!hasWarn) {
          versionViolations.push(
            `Expected warning '${scenario.assertions.expectedWarningCode}' was not emitted`
          );
        }
      }

      if (scenario.assertions.expectedWarningOrErrorCode) {
        const needle = scenario.assertions.expectedWarningOrErrorCode;
        const hasWarn = (lastJsonEnvelope?.warnings || []).some(w => w.code.includes(needle));
        const hasErr = (lastJsonEnvelope?.results || []).some(
          r => !r.ok && r.error?.code?.includes(needle)
        );
        if (!hasWarn && !hasErr) {
          versionViolations.push(`Expected warning/error matching '${needle}' was not emitted`);
        }
        const usedHead = (lastJsonEnvelope?.results || []).some(
          r =>
            r.ok && r.provenance?.packageVersion === scenario.assertions.mustNotSilentlyUseVersion
        );
        if (usedHead) {
          versionViolations.push(
            `Silently substituted HEAD (${scenario.assertions.mustNotSilentlyUseVersion}) for unverified patch`
          );
        }
      }

      scenarioResults.push({
        id: scenario.id,
        kind: scenario.kind,
        lookupCalls,
        tokens: estimateTokens(markdownText),
        durationMs: Number(warmDuration.toFixed(2)),
        versionAccurate: versionViolations.length === 0,
        versionViolations
      });
    }

    // Measure thin SKILL.md footprint if generated
    let thinSkillBytes = 0;
    const thinSkillCandidatePath = path.join(
      REPO_ROOT,
      'packages/dev/agent-docs-core/skills/react-spectrum-s2/SKILL.md'
    );
    if (fs.existsSync(thinSkillCandidatePath)) {
      thinSkillBytes = fs.statSync(thinSkillCandidatePath).size;
    }

    // Optional MCP stdio measurement if v2 server is built
    let mcpStdioLatencyMs = null;
    const mcpBinPath = path.join(REPO_ROOT, 'packages/dev/mcp/s2/dist/mcp/s2/src/index.js');
    if (options.includeMcp && fs.existsSync(mcpBinPath)) {
      mcpStdioLatencyMs = await measureMcpStdioRoundTrip(mcpBinPath, warmCacheDir, snapshotRepoDir);
    }

    return {
      arm: 'agent-docs-v2',
      installedFootprint: {
        files: thinSkillBytes > 0 ? 1 : 0,
        bytes: thinSkillBytes
      },
      latenciesMs: {
        sdkColdFirstQuery: roundAvg(sdkColdMs),
        sdkWarmMedian: roundMedian(sdkWarmMs),
        cliDirectBinMedian: roundMedian(cliBinMs),
        cliPackageRunnerSample: roundAvg(cliRunnerMs),
        mcpStdioRoundTrip: mcpStdioLatencyMs
      },
      summary: summarizeScenarios(scenarioResults),
      scenarios: scenarioResults
    };
  } finally {
    fs.rmSync(tmpWorkspacesRoot, {recursive: true, force: true});
    fs.rmSync(coldCacheDir, {recursive: true, force: true});
    fs.rmSync(warmCacheDir, {recursive: true, force: true});
  }
}

async function measureMcpStdioRoundTrip(mcpBinPath, cacheDir, snapshotRepoDir) {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {StdioClientTransport} = await import('@modelcontextprotocol/sdk/client/stdio.js');

  const tmpWs = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-bench-mcp-ws-'));
  const appCwd = createSyntheticWorkspace(tmpWs, {
    dependencies: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [mcpBinPath],
    env: {
      ...process.env,
      RSP_AGENT_DOCS_CACHE_DIR: cacheDir,
      RSP_AGENT_DOCS_SNAPSHOT_SOURCE: snapshotRepoDir
    }
  });
  const client = new Client({name: 'agent-docs-bench', version: '0.1.0'});
  try {
    await client.connect(transport);
    const t0 = performance.now();
    await client.callTool({
      name: 'read_docs',
      arguments: {ids: ['s2:ComboBox'], cwd: appCwd}
    });
    return Number((performance.now() - t0).toFixed(2));
  } finally {
    await client.close().catch(() => {});
    fs.rmSync(tmpWs, {recursive: true, force: true});
  }
}

function collectEntryPropNames(entry, exportName) {
  const names = new Set();
  for (const exp of entry?.exports || []) {
    if (exportName && exp.name !== exportName) {
      continue;
    }
    for (const p of exp.props || []) {
      names.add(p.name);
    }
    for (const e of exp.events || []) {
      names.add(e.name);
    }
    for (const rp of exp.renderProps || []) {
      names.add(rp.name);
    }
  }
  return names;
}

function roundAvg(arr) {
  if (!arr.length) {
    return null;
  }
  return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
}

function roundMedian(arr) {
  if (!arr.length) {
    return null;
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const val = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return Number(val.toFixed(2));
}

function summarizeScenarios(scenarios) {
  const standard = scenarios.filter(
    s => !['historical-pinned', 'divergent-multi-snapshot', 'unverified-patch'].includes(s.kind)
  );
  const versionFixtures = scenarios.filter(s =>
    ['historical-pinned', 'divergent-multi-snapshot', 'unverified-patch'].includes(s.kind)
  );
  return {
    totalScenarios: scenarios.length,
    avgLookupCalls: roundAvg(scenarios.map(s => s.lookupCalls)),
    maxStandardLookupCalls: Math.max(...standard.map(s => s.lookupCalls)),
    avgStandardTokens: Math.round(
      standard.reduce((a, b) => a + b.tokens, 0) / Math.max(1, standard.length)
    ),
    versionAccurateCount: versionFixtures.filter(s => s.versionAccurate).length,
    versionFixtureCount: versionFixtures.length,
    allAssertionsPassed: scenarios.every(s => s.versionAccurate)
  };
}

function writeReport(name, payload) {
  fs.mkdirSync(LOCAL_RESULTS_DIR, {recursive: true});
  const outPath = path.join(LOCAL_RESULTS_DIR, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  return outPath;
}

async function main() {
  const {values, positionals} = parseArgs({
    allowPositionals: true,
    options: {
      'snapshot-source': {type: 'string'},
      'include-mcp': {type: 'boolean', default: false},
      json: {type: 'boolean', default: false}
    }
  });

  const cmd = positionals[0] || 'baseline';

  if (cmd === 'baseline') {
    const skill = measureLegacyStaticSkill();
    const mcp = measureLegacyMcp();
    const report = {
      recordedAt: new Date().toISOString(),
      headVersions: HEAD_VERSIONS,
      arms: [skill, mcp]
    };
    const saved = writeReport('baseline', report);
    if (values.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`Baseline recorded to ${saved}\n`);
      for (const arm of report.arms) {
        console.log(
          `- ${arm.arm}: avg lookups=${arm.summary.avgLookupCalls}, avg standard tokens=${arm.summary.avgStandardTokens}, installed files=${arm.installedFootprint.files} (${Math.round(arm.installedFootprint.bytes / 1024)} KB), version fixtures passed=${arm.summary.versionAccurateCount}/${arm.summary.versionFixtureCount}`
        );
      }
    }
    return;
  }

  if (cmd === 'evaluate' || cmd === 'compare') {
    const skill = measureLegacyStaticSkill();
    const mcp = measureLegacyMcp();
    const candidate = await measureCandidateV2({
      snapshotRepoDir: values['snapshot-source'],
      includeMcp: values['include-mcp']
    });
    const report = {
      recordedAt: new Date().toISOString(),
      headVersions: HEAD_VERSIONS,
      arms: [skill, mcp, candidate]
    };
    const saved = writeReport('comparison', report);
    if (values.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`Comparison recorded to ${saved}\n`);
      for (const arm of report.arms) {
        console.log(
          `- ${arm.arm}: avg lookups=${arm.summary.avgLookupCalls}, max standard lookups=${arm.summary.maxStandardLookupCalls}, avg standard tokens=${arm.summary.avgStandardTokens}, installed files=${arm.installedFootprint.files} (${Math.round(arm.installedFootprint.bytes / 1024)} KB), version fixtures=${arm.summary.versionAccurateCount}/${arm.summary.versionFixtureCount}, allPassed=${arm.summary.allAssertionsPassed}`
        );
        if (arm.latenciesMs) {
          console.log(`  latencies (ms): ${JSON.stringify(arm.latenciesMs)}`);
        }
        const failedScenarios = arm.scenarios.filter(s => !s.versionAccurate);
        for (const s of failedScenarios) {
          console.log(`  [FAIL] ${s.id}: ${s.versionViolations.join('; ')}`);
        }
      }
    }
    if (!candidate.summary.allAssertionsPassed) {
      process.exitCode = 1;
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
