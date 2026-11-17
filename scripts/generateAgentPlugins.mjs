#!/usr/bin/env node
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

/**
 * Generates and validates Agent Skills & multi-surface Agent Plugin bundles: -
 * `packages/dev/agent-docs-core/skills/{react-spectrum-s2,react-aria}/SKILL.md` -
 * `plugins/react-spectrum` (Recommended lightweight CLI-skill bundle — NO MCP process) -
 * `plugins/react-aria` (Recommended lightweight CLI-skill bundle — NO MCP process) -
 * `plugins/react-spectrum-mcp` (Optional MCP-enabled bundle for clients without shell execution) -
 * `plugins/react-aria-mcp` (Optional MCP-enabled bundle for clients without shell execution) -
 * `plugins/marketplace.json` (Multi-plugin catalog manifest)
 */

import {execFileSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

async function loadSkillsContentModule() {
  const compiledCandidate = path.join(
    REPO_ROOT,
    'packages/dev/cli/s2/dist/agent-docs-core/src/skillsContent.js'
  );
  if (!fs.existsSync(compiledCandidate)) {
    execFileSync('yarn', ['build:cli'], {cwd: REPO_ROOT, stdio: 'inherit'});
  }
  return import(pathToFileURL(compiledCandidate).href);
}

function readPkgVersion(relPkgJsonPath) {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relPkgJsonPath), 'utf8'));
  return raw.version || '0.1.0';
}

function writeTextFile(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, text, 'utf8');
}

function createPluginBundleConfig({
  pluginDirName,
  pluginName,
  version,
  description,
  skillName,
  skillMarkdown,
  homepage,
  keywords,
  mcpServer
}) {
  const baseManifest = {
    name: pluginName,
    version,
    description,
    author: {
      name: 'Adobe',
      url: 'https://www.adobe.com'
    },
    homepage,
    repository: 'https://github.com/adobe/react-spectrum',
    license: 'Apache-2.0',
    keywords,
    skills: './skills/'
  };

  if (mcpServer) {
    baseManifest.mcpServers = './mcp.json';
  }

  return {
    pluginDirName,
    pluginName,
    skillName,
    skillMarkdown,
    portableManifest: baseManifest,
    claudeManifest: {...baseManifest},
    mcpConfig: mcpServer
      ? {
          mcpServers: {
            [mcpServer.id]: {
              command: mcpServer.command,
              args: mcpServer.args
            }
          }
        }
      : null,
    readmeMarkdown: [
      `# ${pluginName}`,
      '',
      description,
      '',
      mcpServer
        ? [
            '## Bundle Type: Optional MCP + Skill Bundle',
            '',
            `Starts \`${mcpServer.args[mcpServer.args.length - 1]}\` over stdio and installs the \`${skillName}\` skill.`,
            'Use this bundle in MCP-only hosts or environments where shell execution is restricted.',
            `For CLI-capable coding agents (Claude Code, GitHub Copilot CLI, OpenAI Codex CLI, Cursor), prefer the lightweight CLI-only plugin (\`${pluginDirName.replace(/-mcp$/, '')}\`) so no idle MCP server process runs in the background.`
          ].join('\n')
        : [
            '## Bundle Type: Recommended Lightweight CLI-Skill Plugin',
            '',
            `Installs only the evergreen \`${skillName}\` skill (\`SKILL.md\`) with **zero background MCP process** and **zero bundled reference bloat**.`,
            'The skill teaches agents to resolve exact workspace package versions and batch-read documentation via the CLI.'
          ].join('\n'),
      ''
    ].join('\n')
  };
}

export async function generateAllAgentPlugins({
  pluginsOutRoot = path.join(REPO_ROOT, 'plugins'),
  coreSkillsOutRoot = path.join(REPO_ROOT, 'packages/dev/agent-docs-core/skills')
} = {}) {
  const {EVERGREEN_SKILL_METADATA, getEvergreenSkillMarkdown} = await loadSkillsContentModule();
  const s2SkillMd = getEvergreenSkillMarkdown('s2');
  const racSkillMd = getEvergreenSkillMarkdown('react-aria');

  const s2CliVersion = readPkgVersion('packages/dev/cli/s2/package.json');
  const racCliVersion = readPkgVersion('packages/dev/cli/react-aria/package.json');
  const s2McpVersion = readPkgVersion('packages/dev/mcp/s2/package.json');
  const racMcpVersion = readPkgVersion('packages/dev/mcp/react-aria/package.json');

  // 1. Canonical evergreen SKILL.md files in `packages/dev/agent-docs-core/skills/`
  writeTextFile(
    path.join(coreSkillsOutRoot, EVERGREEN_SKILL_METADATA.s2.name, 'SKILL.md'),
    s2SkillMd
  );
  writeTextFile(
    path.join(coreSkillsOutRoot, EVERGREEN_SKILL_METADATA['react-aria'].name, 'SKILL.md'),
    racSkillMd
  );

  // 2. Four separated plugin bundles (2 lightweight CLI-only + 2 optional MCP-enabled)
  const bundles = [
    createPluginBundleConfig({
      pluginDirName: 'react-spectrum',
      pluginName: 'react-spectrum',
      version: s2CliVersion,
      description:
        'Version-matched React Spectrum S2 documentation, APIs, tokens, and icons via @react-spectrum/cli (lightweight skill, no background MCP server).',
      skillName: EVERGREEN_SKILL_METADATA.s2.name,
      skillMarkdown: s2SkillMd,
      homepage: 'https://react-spectrum.adobe.com',
      keywords: ['react-spectrum', 'spectrum-2', 'adobe', 'design-system', 'react', 'cli'],
      mcpServer: null
    }),
    createPluginBundleConfig({
      pluginDirName: 'react-aria',
      pluginName: 'react-aria',
      version: racCliVersion,
      description:
        'Version-matched React Aria Components, hooks, React Stately, and @internationalized/* documentation and APIs via @react-aria/cli (lightweight skill, no background MCP server).',
      skillName: EVERGREEN_SKILL_METADATA['react-aria'].name,
      skillMarkdown: racSkillMd,
      homepage: 'https://react-aria.adobe.com',
      keywords: ['react-aria', 'accessibility', 'adobe', 'aria', 'react', 'cli'],
      mcpServer: null
    }),
    createPluginBundleConfig({
      pluginDirName: 'react-spectrum-mcp',
      pluginName: 'react-spectrum-mcp',
      version: s2McpVersion,
      description:
        'Optional MCP-enabled bundle for React Spectrum S2 (@react-spectrum/mcp + evergreen skill) for clients without shell execution.',
      skillName: EVERGREEN_SKILL_METADATA.s2.name,
      skillMarkdown: s2SkillMd,
      homepage: 'https://react-spectrum.adobe.com',
      keywords: ['react-spectrum', 'spectrum-2', 'adobe', 'mcp', 'design-system'],
      mcpServer: {
        id: 'react-spectrum',
        command: 'npx',
        args: ['-y', '@react-spectrum/mcp@latest']
      }
    }),
    createPluginBundleConfig({
      pluginDirName: 'react-aria-mcp',
      pluginName: 'react-aria-mcp',
      version: racMcpVersion,
      description:
        'Optional MCP-enabled bundle for React Aria (@react-aria/mcp + evergreen skill) for clients without shell execution.',
      skillName: EVERGREEN_SKILL_METADATA['react-aria'].name,
      skillMarkdown: racSkillMd,
      homepage: 'https://react-aria.adobe.com',
      keywords: ['react-aria', 'accessibility', 'adobe', 'mcp', 'aria'],
      mcpServer: {
        id: 'react-aria',
        command: 'npx',
        args: ['-y', '@react-aria/mcp@latest']
      }
    })
  ];

  fs.rmSync(pluginsOutRoot, {recursive: true, force: true});
  fs.mkdirSync(pluginsOutRoot, {recursive: true});

  const jsonFiles = [];
  const writeJsonFile = (filePath, value) => {
    writeTextFile(filePath, JSON.stringify(value, null, 2) + '\n');
    jsonFiles.push(path.resolve(filePath));
  };

  for (const bundle of bundles) {
    const dir = path.join(pluginsOutRoot, bundle.pluginDirName);
    writeJsonFile(path.join(dir, 'plugin.json'), bundle.portableManifest);
    writeJsonFile(path.join(dir, '.claude-plugin', 'plugin.json'), bundle.claudeManifest);
    writeTextFile(path.join(dir, 'skills', bundle.skillName, 'SKILL.md'), bundle.skillMarkdown);
    writeTextFile(path.join(dir, 'README.md'), bundle.readmeMarkdown);
    if (bundle.mcpConfig) {
      writeJsonFile(path.join(dir, 'mcp.json'), bundle.mcpConfig);
    }
  }

  writeJsonFile(path.join(pluginsOutRoot, 'marketplace.json'), {
    name: 'adobe-react-spectrum-plugins',
    owner: {
      name: 'Adobe',
      url: 'https://github.com/adobe/react-spectrum'
    },
    plugins: bundles.map(b => ({
      name: b.pluginName,
      source: `./${b.pluginDirName}`,
      description: b.portableManifest.description,
      version: b.portableManifest.version,
      recommended: !b.mcpConfig
    }))
  });

  execFileSync('yarn', ['format', ...jsonFiles], {cwd: REPO_ROOT, stdio: 'inherit'});

  const validation = validateGeneratedPlugins(pluginsOutRoot);
  if (!validation.ok) {
    throw new Error(`Plugin validation failed:\n  - ${validation.errors.join('\n  - ')}`);
  }

  return {bundles: bundles.map(b => b.pluginDirName), validation};
}

/**
 * Multi-surface validation across Agent Plugins 1.0, GitHub Copilot CLI, OpenAI Codex CLI, and
 * Claude Code plugin conventions, including duplicate-MCP prevention and version-neutrality
 * checks.
 */
export function validateGeneratedPlugins(pluginsRoot = path.join(REPO_ROOT, 'plugins')) {
  const errors = [];
  const expectedBundles = [
    {dir: 'react-spectrum', expectsMcp: false, skill: 'react-spectrum-s2'},
    {dir: 'react-aria', expectsMcp: false, skill: 'react-aria'},
    {dir: 'react-spectrum-mcp', expectsMcp: true, skill: 'react-spectrum-s2'},
    {dir: 'react-aria-mcp', expectsMcp: true, skill: 'react-aria'}
  ];

  // Banned version-sensitive implementation phrases in evergreen SKILL.md (User Correction #4)
  const bannedVersionSensitivePatterns = [
    {
      re: /from\s+['"]@react-spectrum\/s2\/\w+['"]/,
      reason: 'Evergreen SKILL.md must not hardcode S2 subpath import conventions'
    },
    {
      re: /Every control needs a visible <Label>/i,
      reason: 'Evergreen SKILL.md must not hardcode version-sensitive <Label> rules'
    },
    {
      re: /static values only/i,
      reason: 'Evergreen SKILL.md must not hardcode simplified style-macro rules'
    }
  ];

  for (const spec of expectedBundles) {
    const bundleDir = path.join(pluginsRoot, spec.dir);
    const portablePath = path.join(bundleDir, 'plugin.json');
    const claudePath = path.join(bundleDir, '.claude-plugin', 'plugin.json');
    const mcpPath = path.join(bundleDir, 'mcp.json');
    const dotMcpPath = path.join(bundleDir, '.mcp.json');
    const skillPath = path.join(bundleDir, 'skills', spec.skill, 'SKILL.md');

    if (!fs.existsSync(portablePath)) {
      errors.push(`${spec.dir}: missing portable plugin.json`);
      continue;
    }
    if (!fs.existsSync(claudePath)) {
      errors.push(`${spec.dir}: missing .claude-plugin/plugin.json`);
      continue;
    }
    if (!fs.existsSync(skillPath)) {
      errors.push(`${spec.dir}: missing skills/${spec.skill}/SKILL.md`);
      continue;
    }

    const portable = JSON.parse(fs.readFileSync(portablePath, 'utf8'));
    const claude = JSON.parse(fs.readFileSync(claudePath, 'utf8'));

    if (!/^[a-z0-9-]+$/.test(portable.name || '') || portable.name !== claude.name) {
      errors.push(`${spec.dir}: plugin name mismatch or invalid kebab-case identifier`);
    }
    if (portable.skills !== './skills/' || claude.skills !== './skills/') {
      errors.push(`${spec.dir}: both manifests must resolve './skills/' from plugin root`);
    }

    // Ensure zero reference file bloat in plugin skills
    const skillEntries = fs.readdirSync(path.dirname(skillPath));
    if (skillEntries.length !== 1 || skillEntries[0] !== 'SKILL.md') {
      errors.push(
        `${spec.dir}: expected single-file SKILL.md only, found: ${skillEntries.join(', ')}`
      );
    }

    const skillContent = fs.readFileSync(skillPath, 'utf8');
    if (!skillContent.startsWith(`---\nname: "${spec.skill}"\n`)) {
      errors.push(`${spec.dir}: SKILL.md missing required YAML frontmatter name "${spec.skill}"`);
    }
    for (const rule of bannedVersionSensitivePatterns) {
      if (rule.re.test(skillContent)) {
        errors.push(`${spec.dir}: ${rule.reason}`);
      }
    }

    if (!spec.expectsMcp) {
      // CLI-only bundles MUST NOT start any MCP server on any host!
      if (
        portable.mcpServers ||
        claude.mcpServers ||
        fs.existsSync(mcpPath) ||
        fs.existsSync(dotMcpPath)
      ) {
        errors.push(`${spec.dir}: CLI-only plugin bundle must not include mcpServers or mcp.json`);
      }
    } else {
      // MCP-enabled bundles must point both manifests to the exact same `./mcp.json` and NOT also have `.mcp.json` (which would auto-register a second copy in Claude Code!)
      if (fs.existsSync(dotMcpPath)) {
        errors.push(
          `${spec.dir}: must not contain both mcp.json and .mcp.json (causes duplicate MCP server registration)`
        );
      }
      if (portable.mcpServers !== './mcp.json' || claude.mcpServers !== './mcp.json') {
        errors.push(`${spec.dir}: both manifests must reference './mcp.json' identically`);
      }
      if (!fs.existsSync(mcpPath)) {
        errors.push(`${spec.dir}: missing mcp.json`);
      } else {
        const mcpJson = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
        const serverIds = Object.keys(mcpJson.mcpServers || {});
        if (serverIds.length !== 1) {
          errors.push(`${spec.dir}: expected exactly 1 MCP server entry in mcp.json`);
        }
      }
    }
  }

  const marketplacePath = path.join(pluginsRoot, 'marketplace.json');
  if (!fs.existsSync(marketplacePath)) {
    errors.push('missing plugins/marketplace.json');
  }

  return {ok: errors.length === 0, errors};
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  if (checkOnly) {
    const res = validateGeneratedPlugins();
    if (!res.ok) {
      console.error(`Plugin validation failed:\n  - ${res.errors.join('\n  - ')}`);
      process.exit(1);
    }
    console.log('Validated all 4 agent plugin bundles across portable and Claude surfaces.');
    return;
  }

  const res = await generateAllAgentPlugins();
  console.log(
    `Generated and validated ${res.bundles.length} plugin bundles (${res.bundles.join(', ')}).`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
