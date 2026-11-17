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

export type EvergreenSkillBrand = 's2' | 'react-aria';

export interface EvergreenSkillMetadata {
  name: string;
  description: string;
  license: string;
  compatibility: string;
  author: string;
  website: string;
  resourceUri: string;
}

export const EVERGREEN_SKILL_METADATA: Record<EvergreenSkillBrand, EvergreenSkillMetadata> = {
  s2: {
    name: 'react-spectrum-s2',
    description:
      'Build interfaces with Adobe React Spectrum S2 (@react-spectrum/s2) using version-matched component APIs, usage examples, design tokens, and workflow icons.',
    license: 'Apache-2.0',
    compatibility: 'Requires Node.js >= 18 for @react-spectrum/cli or @react-spectrum/mcp.',
    author: 'Adobe',
    website: 'https://react-spectrum.adobe.com',
    resourceUri: 'skills://react-spectrum-s2/SKILL.md'
  },
  'react-aria': {
    name: 'react-aria',
    description:
      'Build accessible UI components and interactions with React Aria Components (react-aria-components), React Aria hooks, React Stately, and @internationalized/* using version-matched documentation and APIs.',
    license: 'Apache-2.0',
    compatibility: 'Requires Node.js >= 18 for @react-aria/cli or @react-aria/mcp.',
    author: 'Adobe',
    website: 'https://react-aria.adobe.com',
    resourceUri: 'skills://react-aria/SKILL.md'
  }
};

/**
 * Generates an evergreen, strictly version-neutral Agent Skill (`SKILL.md`).
 *
 * By design, all version-sensitive rules (import specifiers, labeling patterns,
 * composition structure, styling constraints, prop defaults, and deprecated APIs)
 * live inside the versioned documentation catalog rather than this file.
 */
export function getEvergreenSkillMarkdown(brand: EvergreenSkillBrand): string {
  const meta = EVERGREEN_SKILL_METADATA[brand];
  const isS2 = brand === 's2';
  const cliBin = isS2 ? 'spectrum' : 'react-aria';
  const cliPkg = isS2 ? '@react-spectrum/cli' : '@react-aria/cli';
  const mcpPkg = isS2 ? '@react-spectrum/mcp' : '@react-aria/mcp';
  const defaultPrefix = isS2 ? 's2' : 'rac';
  const guidanceEntry = isS2 ? 's2:guide/implementation-guidance' : 'rac:getting-started';
  const decisionGuide = isS2 ? 's2:guide/component-decision-tree' : 'rac:collections';
  const overlayEntry = isS2 ? 's2:Dialog' : 'rac:Modal';

  return (
    `---
name: "${meta.name}"
description: "${meta.description}"
license: "${meta.license}"
compatibility: "${meta.compatibility}"
metadata:
  author: "${meta.author}"
  website: "${meta.website}"
---

# ${isS2 ? 'React Spectrum S2' : 'React Aria'} — Version-Matched Documentation Workflow

Use the \`${cliBin}\` CLI (or the equivalent \`${mcpPkg}\` MCP tools when shell execution is unavailable) to retrieve authoritative documentation, imports, composition examples, and TypeScript API signatures matched to the **exact package versions resolved in the target workspace**.

Do **not** rely on memorized import paths, prop names, labeling conventions, or styling rules from training data — those evolve across package versions. Always retrieve and follow the target version's guidance and component entries first.

## 1. Fast 1–2 Command Workflow

\`search\`, \`read\`, \`api\`${isS2 ? ', `tokens`, and `icons`' : ''} **automatically resolve** the workspace's installed or lockfile package versions. Pass \`--cwd <app-dir>\` when working inside a monorepo subdirectory.

### Step A — Discover when component or pattern choice is uncertain
\`\`\`sh
${cliBin} search "<user intent or UI pattern>" --cwd <app-dir>
\`\`\`
Or read the versioned decision guide directly:
\`\`\`sh
${cliBin} read ${decisionGuide} --cwd <app-dir>
\`\`\`

### Step B — Batch-read implementation guidance + target components in one call
\`\`\`sh
${cliBin} read ${guidanceEntry} ${defaultPrefix}:ComboBox ${overlayEntry} --sections guide,usage,api,accessibility --cwd <app-dir>
\`\`\`
${
  isS2
    ? `
### Step C — Look up Spectrum 2 design tokens or workflow icons when styling or adding iconography
\`\`\`sh
spectrum tokens padding --cwd <app-dir>
spectrum icons "search" --cwd <app-dir>
\`\`\`
`
    : ''
}
### Focused prop/event inspection & diagnostic resolution
\`\`\`sh
${cliBin} api ${defaultPrefix}:ComboBox --prop allowsCustomValue,onInputChange --cwd <app-dir>
${cliBin} resolve --cwd <app-dir>
\`\`\`

## 2. Authoritative Implementation Rules

1. **Follow returned versioned guidance verbatim:** Treat the \`imports\`, composition hierarchy, accessible naming guidance, styling rules, and TypeScript signatures returned by \`${cliBin} read\` / \`${cliBin} api\` as authoritative for this workspace.
2. **Keep library namespaces explicit:** Never mix imports or prop conventions across \`s2:\` (\`@react-spectrum/s2\`), \`rac:\` (\`react-aria-components\`), \`react-aria:\` hooks, \`react-stately:\`, and \`internationalized:\` unless the versioned documentation explicitly shows that composition.
3. **Respect version diagnostics:** If the CLI reports a lockfile/installed mismatch or an unavailable historical patch, surface that warning rather than silently substituting \`latest\` APIs.

## 3. Fallbacks When \`${cliBin}\` Is Not Globally Installed

1. **Package runner (zero global install):**
   - npm: \`npx -y ${cliPkg}@latest read ${guidanceEntry} ${defaultPrefix}:Button --cwd <app-dir>\`
   - Yarn: \`yarn dlx ${cliPkg}@latest read ${guidanceEntry} ${defaultPrefix}:Button --cwd <app-dir>\`
   - pnpm: \`pnpm dlx ${cliPkg}@latest read ${guidanceEntry} ${defaultPrefix}:Button --cwd <app-dir>\`
2. **MCP server (\`${mcpPkg}\`):**
   - Call \`search_docs\` and batched \`read_docs\` (passing \`cwd\` when working across multiple workspace roots, or reusing the \`resolution\` object from \`resolve_versions\`).${isS2 ? ' Use `search_s2_tokens` and `search_s2_icons` for tokens and icons.' : ''}
`.trimEnd() + '\n'
  );
}
