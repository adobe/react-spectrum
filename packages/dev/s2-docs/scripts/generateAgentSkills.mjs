#!/usr/bin/env node

/**
 * Generates Agent Skills for React Spectrum (S2), migration, and React Aria.
 *
 * This script creates skills in the Agent Skills format (https://agentskills.io/specification)
 *
 * Usage:
 * node packages/dev/s2-docs/scripts/generateAgentSkills.mjs.
 *
 * The script will:
 * 1. Run the markdown docs generation if dist doesn't exist
 * 2. Create .well-known/skills directories inside the docs dist output
 * 3. Copy relevant documentation to references/ subdirectories
 * 4. Generate .well-known/skills/index.json for discovery.
 */

import {execSync} from 'child_process';
import {fileURLToPath} from 'url';
import fs from 'fs';
import path from 'path';
import remarkParse from 'remark-parse';
import {unified} from 'unified';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../../');
const MARKDOWN_DOCS_DIST = path.join(REPO_ROOT, 'packages/dev/s2-docs/dist');
const MDX_PAGES_DIR = path.join(REPO_ROOT, 'packages/dev/s2-docs/pages');
const MARKDOWN_DOCS_SCRIPT = path.join(__dirname, 'generateMarkdownDocs.mjs');
const MIGRATION_REFS_DIR = path.join(REPO_ROOT, 'packages/dev/s2-docs/migration-references');
const AUDIT_SKILL_SOURCE_DIR = path.join(REPO_ROOT, 'packages/dev/s2-docs/skills/spectrum-audit');
const WELL_KNOWN_DIR = '.well-known';
const WELL_KNOWN_SKILLS_DIR = 'skills';

// Skill definitions
const SKILLS = {
  'react-spectrum-s2': {
    name: 'react-spectrum-s2',
    description:
      "Build UIs with React Spectrum S2 (Spectrum 2), Adobe's component library for React. Use when developers are using `@react-spectrum/s2` or need Adobe design system components. Includes React Aria Components docs as a reference for building custom components on top of unstyled primitives.",
    license: 'Apache-2.0',
    sourceDir: 's2',
    additionalReferenceLibraries: [
      {
        skillName: 'react-aria',
        referenceSubdir: 'react-aria',
        title: 'React Aria Components',
        description:
          'Documentation for unstyled accessible primitives. Use only when no React Spectrum S2 component fits the requirements.'
      }
    ],
    compatibility: 'Requires a React project with @react-spectrum/s2 installed.',
    metadata: {
      author: 'Adobe',
      website: 'https://react-spectrum.adobe.com/'
    }
  },
  'migrate-react-spectrum-v3-to-s2': {
    name: 'migrate-react-spectrum-v3-to-s2',
    description:
      'Upgrade React Spectrum v3 (Spectrum 1) codebases to React Spectrum S2. Use when developers mention migrating or upgrading from React Spectrum v3, Spectrum 1, S1, @adobe/react-spectrum, @react-spectrum/* packages, or codemod-assisted upgrades to @react-spectrum/s2.',
    kind: 'migration',
    license: 'Apache-2.0',
    sourceDir: 's2',
    compatibility:
      'Requires a React project currently using React Spectrum v3, @react-spectrum/* packages, or related React Spectrum v3 helpers.',
    metadata: {
      author: 'Adobe',
      website: 'https://react-spectrum.adobe.com/'
    }
  },
  'react-aria': {
    name: 'react-aria',
    description:
      'Build accessible UI components with React Aria Components. Use when developers mention React Aria, react-aria-components, accessible components, or need unstyled accessible primitives. Provides documentation for building custom accessible UI with hooks and components.',
    license: 'Apache-2.0',
    sourceDir: 'react-aria',
    compatibility: 'Requires React project with react-aria-components installed.',
    metadata: {
      author: 'Adobe',
      website: 'https://react-aria.adobe.com/'
    }
  },
  'spectrum-audit': {
    name: 'spectrum-audit',
    description:
      'Audit a codebase for adherence to the Spectrum design system and React Spectrum S2 best practices. Use when a developer asks to audit, review, lint, or check a project for Spectrum/S2 correctness, configuration, styling, accessibility, or component-usage issues.',
    kind: 'audit',
    license: 'Apache-2.0',
    sourceDir: 's2',
    compatibility: 'Requires a React project using @react-spectrum/s2.',
    metadata: {
      author: 'Adobe',
      website: 'https://react-spectrum.adobe.com/'
    }
  }
};

const CUSTOM_SKILL_CONTENT = {
  'react-spectrum-s2': {
    skillNotesMarkdown: [
      'If the requirements do not clearly specify which React Spectrum component to use, consult the [Component Decision Tree](references/guides/component-decision-tree.md) before choosing a component.',
      'If the request involves a Figma design, frame, or URL — or if the Figma MCP (`get_design_context`,`search_design_system`, etc.) is available — consult [Implementing Figma designs with React Spectrum S2](references/guides/figma-to-s2.md) before generating code.',
      'When writing tests that exercise S2 components, consult [Testing with React Spectrum S2](references/guides/test-utils-guidance.md) and prefer the ARIA pattern testers from `@react-spectrum/test-utils` over hand-rolled role/selector queries.',
      `## React Spectrum S2 vs React Aria Components

React Spectrum S2 is built on top of React Aria Components. The S2 components add Spectrum 2 styling, behavior, and slot structure on top of the unstyled React Aria primitives. Always prefer S2 components for React Spectrum work because they are pre-styled, design-system compliant, and cover most common UI patterns.

Only reach for React Aria Components directly when:
- Building a custom component because no S2 component matches the requirements. Follow [Creating Custom Components](references/guides/creating-custom-components.md) and pair the React Aria primitive with the S2 \`style\` macro for Spectrum styling.
- You need a utility such as \`FocusScope\`, \`VisuallyHidden\`, \`useFocusRing\`, \`mergeProps\`, etc.

The React Aria Components documentation is bundled under \`references/react-aria/\`. Many unstyled React Aria Components share the same name as S2 components, so ensure that you're searching and accessing the correct docs where needed.`
    ].join('\n\n'),
    embeddedMarkdownPaths: [
      path.join(
        REPO_ROOT,
        'packages/dev/s2-docs/skills/react-spectrum-s2/implementation-guidance.md'
      )
    ],
    guideEntries: [
      {
        title: 'Component Decision Tree',
        path: 'component-decision-tree.md',
        sourcePath: path.join(
          REPO_ROOT,
          'packages/dev/s2-docs/skills/react-spectrum-s2/component-decision-tree.md'
        ),
        description:
          'How to choose the right S2 component when requirements do not name one explicitly.'
      },
      {
        title: 'Implementing Figma designs with React Spectrum S2',
        path: 'figma-to-s2.md',
        sourcePath: path.join(
          REPO_ROOT,
          'packages/dev/s2-docs/skills/react-spectrum-s2/figma-to-s2.md'
        ),
        description:
          'How to translate Figma designs (via the Figma MCP) into S2 components and the `style` macro.'
      },
      {
        title: 'Creating Custom Components',
        path: 'creating-custom-components.md',
        sourcePath: path.join(
          REPO_ROOT,
          'packages/dev/s2-docs/skills/react-spectrum-s2/creating-custom-components.md'
        ),
        description:
          'How to build custom Spectrum 2 components using React Aria Components and the `style` macro.'
      },
      {
        title: 'Testing with React Spectrum S2',
        path: 'test-utils-guidance.md',
        sourcePath: path.join(
          REPO_ROOT,
          'packages/dev/s2-docs/skills/react-spectrum-s2/test-utils-guidance.md'
        ),
        description:
          'How to write tests for S2 components using ARIA pattern testers from `@react-spectrum/test-utils`.'
      }
    ]
  },
  'react-aria': {
    embeddedMarkdownPaths: [
      path.join(REPO_ROOT, 'packages/dev/s2-docs/skills/react-aria/test-utils-guidance.md')
    ]
  }
};

/**
 * Ensure markdown docs are generated.
 */
function ensureMarkdownDocs() {
  const s2LlmsTxt = path.join(MARKDOWN_DOCS_DIST, 's2', 'llms.txt');
  const reactAriaLlmsTxt = path.join(MARKDOWN_DOCS_DIST, 'react-aria', 'llms.txt');

  if (!fs.existsSync(s2LlmsTxt) || !fs.existsSync(reactAriaLlmsTxt)) {
    console.log('Markdown docs not found. Running generateMarkdownDocs.mjs...');
    execSync(`node "${MARKDOWN_DOCS_SCRIPT}"`, {
      cwd: REPO_ROOT,
      stdio: 'inherit'
    });
  }
}

function getWellKnownRootForLibrary(sourceDir) {
  return path.join(MARKDOWN_DOCS_DIST, sourceDir, WELL_KNOWN_DIR, WELL_KNOWN_SKILLS_DIR);
}

function getCustomSkillContent(skillName) {
  return CUSTOM_SKILL_CONTENT[skillName] ?? null;
}

function renderCustomMarkdown(markdownPath, replacements = {}) {
  let content = fs.readFileSync(markdownPath, 'utf8');
  for (const [token, value] of Object.entries(replacements)) {
    content = content.replaceAll(token, value);
  }
  return content.trim();
}

function readCustomEmbeddedMarkdown(skillName, replacements = {}) {
  const customContent = getCustomSkillContent(skillName);
  if (!customContent?.embeddedMarkdownPaths?.length) {
    return '';
  }

  return customContent.embeddedMarkdownPaths
    .flatMap(markdownPath => {
      if (!fs.existsSync(markdownPath)) {
        console.warn(`Custom skill content not found at ${markdownPath}`);
        return [];
      }

      return [renderCustomMarkdown(markdownPath, replacements)];
    })
    .filter(Boolean)
    .join('\n\n');
}

function getCustomGuideEntries(skillName) {
  return getCustomSkillContent(skillName)?.guideEntries ?? [];
}

function getCustomSkillNotesMarkdown(skillName) {
  return getCustomSkillContent(skillName)?.skillNotesMarkdown ?? '';
}

function getAdditionalReferenceLibraries(skillConfig) {
  return (skillConfig.additionalReferenceLibraries ?? []).flatMap(library => {
    const referencedSkillConfig = SKILLS[library.skillName];
    if (!referencedSkillConfig) {
      console.warn(
        `Additional reference skill "${library.skillName}" not found for ${skillConfig.name}`
      );
      return [];
    }

    return [
      {
        ...library,
        skillConfig: referencedSkillConfig
      }
    ];
  });
}

/**
 * Parse llms.txt to get documentation entries.
 */
function parseLlmsTxt(llmsTxtPath) {
  const content = fs.readFileSync(llmsTxtPath, 'utf8');
  const entries = [];
  const tree = unified().use(remarkParse).parse(content);

  const toText = node => {
    if (!node) {
      return '';
    }
    if (node.type === 'text') {
      return node.value;
    }
    if (node.type === 'inlineCode') {
      return '`' + node.value + '`';
    }
    if (Array.isArray(node.children)) {
      return node.children.map(toText).join('');
    }
    return '';
  };

  const extractEntry = listItem => {
    const paragraph = listItem.children?.find(child => child.type === 'paragraph');
    if (!paragraph || !Array.isArray(paragraph.children)) {
      return null;
    }

    const linkIndex = paragraph.children.findIndex(child => child.type === 'link');
    if (linkIndex === -1) {
      return null;
    }

    const link = paragraph.children[linkIndex];
    const title = toText(link).trim();
    const entryPath = link.url;
    if (!title || !entryPath) {
      return null;
    }

    let description = paragraph.children
      .slice(linkIndex + 1)
      .map(toText)
      .join('')
      .trim();

    if (description.startsWith(':')) {
      description = description.slice(1).trim();
    }

    return {
      title,
      path: entryPath,
      description
    };
  };

  const walk = node => {
    if (!node || !Array.isArray(node.children)) {
      return;
    }

    for (const child of node.children) {
      if (child.type === 'listItem') {
        const entry = extractEntry(child);
        if (entry) {
          entries.push(entry);
        }
      }
      walk(child);
    }
  };

  walk(tree);
  return entries;
}

/**
 * Extract the section export from an MDX file.
 *
 * @param {string} mdxPath - Path to the MDX file.
 * @returns {string | null} - The section value or null if not found
 */
function extractSectionFromMdx(mdxPath) {
  if (!fs.existsSync(mdxPath)) {
    return null;
  }

  const content = fs.readFileSync(mdxPath, 'utf8');
  const sectionMatch = content.match(/export\s+const\s+section\s*=\s*['"]([^'"]+)['"]/);
  return sectionMatch ? sectionMatch[1] : null;
}

/**
 * Get the MDX file path for a given entry.
 *
 * @param {string} sourceDir - The source directory (e.g., "s2" or "react-aria")
 * @param {string} entryPath - The path from llms.txt (e.g., "Button.md")
 * @returns {string} - The full path to the MDX file
 */
function getMdxPath(sourceDir, entryPath) {
  // Convert .md path to .mdx path (e.g., "Button.md" -> "Button.mdx")
  const mdxRelPath = entryPath.replace(/\.md$/, '.mdx');
  return path.join(MDX_PAGES_DIR, sourceDir, mdxRelPath);
}

/**
 * Map section names to category keys.
 */
const SECTION_TO_CATEGORY = {
  // Guides
  Guides: 'guides',
  Overview: 'guides',
  Reference: 'guides',
  'Getting started': 'guides',
  // Components (default, no section export)
  Components: 'components',
  // Utilities
  Utilities: 'utilities',
  // Interactions (hooks)
  Interactions: 'interactions',
  // Releases
  Releases: 'releases',
  // Blog
  Blog: 'blog',
  // Examples
  Examples: 'examples',
  // Internationalized
  'Date and Time': 'internationalized',
  Numbers: 'internationalized'
};

/**
 * Files to filter out per source directory.
 */
const FILTERED_FILES = {
  s2: ['index.md', 'error.md'],
  'react-aria': ['index.md', 'examples/index.md', 'error.md']
};

/**
 * Categorize documentation entries by reading section exports from MDX files.
 */
function categorizeEntries(entries, sourceDir) {
  const categories = {
    components: [],
    guides: [],
    utilities: [],
    interactions: [],
    releases: [],
    blog: [],
    examples: [],
    testing: [],
    internationalized: []
  };

  const filteredFiles = FILTERED_FILES[sourceDir] || [];

  for (const entry of entries) {
    // Filter out specific files per source directory
    if (filteredFiles.includes(entry.path)) {
      continue;
    }

    // Skip malformed entries
    if (entry.title.length > 100) {
      continue;
    }

    // Check if this is a testing subpage (e.g., "CheckboxGroup/testing.md")
    if (entry.path.includes('/testing.md')) {
      categories.testing.push(entry);
      continue;
    }

    // Get the section from the original MDX file
    const mdxPath = getMdxPath(sourceDir, entry.path);
    const section = extractSectionFromMdx(mdxPath);

    if (section) {
      const categoryKey = SECTION_TO_CATEGORY[section];
      if (categoryKey && categories[categoryKey]) {
        categories[categoryKey].push(entry);
      } else {
        // Unknown section, default to components
        console.warn(`Unknown section "${section}" for ${entry.path}, defaulting to components`);
        categories.components.push(entry);
      }
    } else {
      // No section export means it's a component
      categories.components.push(entry);
    }
  }

  return categories;
}

function generateFrontmatter(skillConfig) {
  return `---
name: "${skillConfig.name}"
description: "${skillConfig.description}"
license: "${skillConfig.license}"
compatibility: "${skillConfig.compatibility}"
metadata:
  author: "${skillConfig.metadata.author}"
  website: "${skillConfig.metadata.website}"
---

`;
}

/**
 * Generate the SKILL.md content.
 */
function generateDocsSkillMd(skillConfig, categories, isS2) {
  const customGuideEntries = getCustomGuideEntries(skillConfig.name);
  const customSkillNotesMarkdown = getCustomSkillNotesMarkdown(skillConfig.name);
  const additionalReferenceLibraries = getAdditionalReferenceLibraries(skillConfig);
  const embeddedCustomMarkdown = readCustomEmbeddedMarkdown(skillConfig.name, {
    '{{guidesBase}}': 'references/guides/',
    '{{componentsBase}}': 'references/components/',
    '{{testingBase}}': 'references/testing/'
  });

  let content = generateFrontmatter(skillConfig);

  if (isS2) {
    content += '# React Spectrum S2 (Spectrum 2)\n';
  } else {
    content += '# React Aria Components\n';
  }

  if (customSkillNotesMarkdown) {
    content += `\n${customSkillNotesMarkdown}\n`;
  }

  if (embeddedCustomMarkdown) {
    content += `\n${embeddedCustomMarkdown}\n\n`;
  }

  content += `## Documentation Structure

The \`references/\` directory contains detailed documentation organized as follows:

`;

  // Add documentation sections
  if (customGuideEntries.length > 0 || categories.guides.length > 0) {
    content += `### Guides
`;
    for (const entry of customGuideEntries) {
      content += `- [${entry.title}](references/guides/${entry.path})${entry.description ? `: ${entry.description}` : ''}\n`;
    }
    for (const entry of categories.guides) {
      content += `- [${entry.title}](references/guides/${entry.path})\n`;
    }
    content += '\n';
  }

  if (categories.components.length > 0) {
    const componentNames = categories.components.map(entry => entry.title).join(', ');
    content += `### Components

Component documentation is in \`references/components/\` — one Markdown file per component (e.g. \`references/components/Button.md\`). Read the file for a component when you need its API, props, examples, or accessibility notes.

Available components: ${componentNames}.

`;
  }

  if (categories.interactions.length > 0) {
    content += `### Interactions
`;
    for (const entry of categories.interactions) {
      content += `- [${entry.title}](references/interactions/${entry.path})${entry.description ? `: ${entry.description}` : ''}\n`;
    }
    content += '\n';
  }

  if (categories.utilities.length > 0) {
    content += `### Utilities
`;
    for (const entry of categories.utilities) {
      content += `- [${entry.title}](references/utilities/${entry.path})${entry.description ? `: ${entry.description}` : ''}\n`;
    }
    content += '\n';
  }

  if (categories.internationalized.length > 0) {
    content += `### Internationalization
`;
    for (const entry of categories.internationalized) {
      // Strip the 'internationalized/' prefix to avoid double-nesting in the path
      let refPath = entry.path;
      if (refPath.startsWith('internationalized/')) {
        refPath = refPath.slice('internationalized/'.length);
      }
      content += `- [${entry.title}](references/internationalized/${refPath})\n`;
    }
    content += '\n';
  }

  if (additionalReferenceLibraries.length > 0) {
    content += `### Additional References
`;
    for (const library of additionalReferenceLibraries) {
      content += `- [${library.title}](references/${library.referenceSubdir}/llms.txt)${library.description ? `: ${library.description}` : ''}\n`;
    }
    content += '\n';
  }

  return content.trimEnd() + '\n';
}

function generateMigrationSkillMd(skillConfig) {
  return (
    `${generateFrontmatter(skillConfig)}# React Spectrum v3 to S2 migration

Upgrade React Spectrum v3 codebases to S2 by following these eight steps in order.

## Scope

This skill covers only the React Spectrum v3 (S1) to S2 migration. Do **not** perform major dependency upgrades such as React version bumps (e.g. React 16→17, 17→18, 18→19) as part of this migration. If the project needs a major dependency upgrade, note it as a recommended follow-up in the final report (Step 8) rather than attempting it during migration.

## Step 1: Inspect the codebase

- Search package manifests for \`@adobe/react-spectrum\`, \`@react-spectrum/*\`, and \`@spectrum-icons/*\`.
- Note the package manager (npm, yarn, pnpm) from the lockfile.
- Identify the bundler used by the migration target (Parcel, Vite, webpack, Next.js, Rollup, ESBuild).
- In monorepos, inspect the specific package or app being migrated rather than the workspace root.
- Find app entrypoints, root providers, shared test wrappers, toast setup, and any \`defaultTheme\` usage.

See [Prerequisites](references/focused-prerequisites.md) for the full inspection checklist and minimum tool versions.

## Step 2: Install @react-spectrum/s2

Install the S2 package with the project's package manager:

\`\`\`bash
npm install @react-spectrum/s2
yarn add @react-spectrum/s2
pnpm add @react-spectrum/s2
\`\`\`

If the bundler is not Parcel v2.12.0+, also install and configure \`unplugin-parcel-macros\` as a dev dependency. See [Getting started](references/docs-getting-started.md) for bundler-specific setup instructions.

## Step 3: Dry-run the codemod

Preview what the codemod will change before applying:

\`\`\`bash
npx @react-spectrum/codemods s1-to-s2 --agent --dry
yarn dlx @react-spectrum/codemods s1-to-s2 --agent --dry
pnpm dlx @react-spectrum/codemods s1-to-s2 --agent --dry
\`\`\`

Use \`npx\` for npm/Yarn 1, \`yarn dlx\` for Yarn Berry/PnP, \`pnpm dlx\` for pnpm.
Add \`--path <dir>\` for monorepos or partial rollouts.
Add \`--components A,B\` only when explicitly requested for incremental migration.

Review the dry-run output to understand the scope of changes.

## Step 4: Run the codemod

Execute the codemod to transform the source files:

\`\`\`bash
npx @react-spectrum/codemods s1-to-s2 --agent
yarn dlx @react-spectrum/codemods s1-to-s2 --agent
pnpm dlx @react-spectrum/codemods s1-to-s2 --agent
\`\`\`

Use the same \`--path\` and \`--components\` flags as the dry run if applicable.

## Step 5: Format with the project's formatter

If the project has a formatter (Prettier, ESLint, Biome, Oxfmt, etc.), run it on the changed files to remove extraneous formatting changes introduced by the codemod.

## Step 6: Fix remaining TODO(S2-upgrade) comments

Search the codebase for \`TODO(S2-upgrade)\` comments left by the codemod. Each one marks a change that requires manual review.

See [Focused manual fixes](references/focused-manual-fixes.md) for information on how to fix these.

Also reference the \`react-spectrum-s2\` skill (if available) for full S2 component documentation when needed.

## Step 7: Validate

Run the project's own toolchain to verify the migration is complete:

1. Install dependencies if package manifests changed.
2. Run the typecheck or compile step (e.g. \`tsc --noEmit\`, \`tsc -b\`).
3. Run tests covering the migrated code. Prefer the narrowest test scope that covers the changed files.
4. Run the build to confirm the output is intact.

In monorepos, validate the affected package first with its own scripts before running workspace-wide checks. Fix any failures before declaring the migration complete.

## Step 8: Generate final report

After the migration is complete, produce a final report for the user with the following sections:

### Summary of changes
- Packages added and removed.
- What the codemod changed (files affected, components migrated).
- Manual fixes applied (layout components, icons, dialogs, collections, toast, etc.).

### Remaining issues
- Any unresolved \`TODO(S2-upgrade)\` comments.
- Type errors, test failures, or known gaps that still need attention.

### Recommended follow-ups
- If the project is not on **React 19**, recommend upgrading. React 19 is recommended for S2. Include the relevant upgrade guide links:
  - React 17: https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html
  - React 18: https://react.dev/blog/2022/03/08/react-18-upgrade-guide
  - React 19: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- Any other major upgrades (e.g. React, bundler, etc.) that were out of scope for this migration.
- Any additional cleanup or improvements the user may want to address.

## Deep reference

Use these when you need more component-by-component or API-level detail:
- [Migration guide](references/docs-migrating.md): comprehensive component-by-component migration reference.
- [Getting started](references/docs-getting-started.md): framework setup and macro configuration.
- [Provider](references/docs-provider.md): locale, router, color-scheme, and SSR usage.
- [Styling](references/docs-styling.md): style macro overview including runtime conditions, CSS variables, CSS optimization, and CSS resets.
- [Style macro](references/docs-style-macro.md): exact style macro syntax and constraints.
- [Toast](references/docs-toast.md): full S2 toast API and examples.
`.trimEnd() + '\n'
  );
}

function generateAuditSkillMd(skillConfig) {
  return (
    `${generateFrontmatter(skillConfig)}# Spectrum Audit

Audit a codebase for adherence to the Spectrum design system and React Spectrum S2 best practices, then produce a scored, prioritized report. This skill is **report-only** — it does not modify any files.

## When to use

Use when a developer asks to audit, review, lint, or check a project for Spectrum / S2 correctness, configuration, styling, accessibility, or component-usage issues.

Requires a project with \`@react-spectrum/s2\` installed. If S2 is not a dependency, say so and stop.

## How it works

Run these phases in order.

### Phase 0 — Scope

- Identify the project — or, in a monorepo, the specific package — to audit. Audit the package, not the workspace root.
- Detect the package manager from the lockfile, the bundler (Vite / webpack / Next.js / Parcel / Rollup / ESBuild), and read \`package.json\` dependencies.
- Confirm \`@react-spectrum/s2\` is installed. Establish the source globs to scan (e.g. \`src/**/*.{tsx,jsx,ts,js}\`).
- Check whether the \`react-spectrum-s2\` skill is available (listed among the agent's installed skills, or present under a local skills directory such as \`.cursor/skills/\` or \`.agents/skills/\`). Record whether it was found — the report template uses this.

### Phase 1 — Run the checks

Work through each check file in \`references/checks/\`, in order. For every violation, record a finding: \`{file:line, rule, severity, category, fix}\`. Cite only line numbers you actually read or grepped — never invent locations. Record **one finding per distinct root cause** at a \`file:line\` — if multiple check files cover the same issue (e.g. a missing collection \`aria-label\` or a third-party design system), assign it to the most specific check and do not duplicate it across categories.

- [01 — Setup & configuration](references/checks/01-setup-config.md)
- [02 — Component usage](references/checks/02-component-usage.md)
- [03 — Styling](references/checks/03-styling.md)
- [04 — Accessibility & correctness](references/checks/04-accessibility.md)
- [05 — Versioning & maintenance](references/checks/05-versioning.md)
- [06 — Testing](references/checks/06-testing.md)

The canonical rules behind these checks live in the \`react-spectrum-s2\` skill — read its \`SKILL.md\` (implementation guidance) and \`references/guides/getting-started.md\`, \`references/guides/component-decision-tree.md\`, and \`references/components/\` as needed. If that skill is not installed, proceed using the check files alone, but note the limitation in the report (see Phase 3).

### Phase 2 — Score

Apply the [scoring rubric](references/scoring-rubric.md) to the recorded findings to compute per-category scores and the overall Spectrum Adherence Score. The score is arithmetic over counted findings — do not estimate it.

### Phase 3 — Report

Write \`SPECTRUM-AUDIT.md\` to the audited project following the [report template](references/report-template.md): headline score, grade, and severity counts; a summary; scores by category; findings grouped by severity (each with a clickable \`file:line\` and the check name that defines its rule); prioritized action items; what looks good; and — if \`react-spectrum-s2\` was not detected in Phase 0 — a recommendation to install it.

### Phase 4 — Hand off

This skill does not edit code. Recommend:

- The \`react-spectrum-s2\` skill to implement the fixes. If it is not installed:

  \`\`\`bash
  npx skills add https://react-spectrum.adobe.com --skill react-spectrum-s2
  \`\`\`

- The \`migrate-react-spectrum-v3-to-s2\` skill if Spectrum 1 packages (\`@adobe/react-spectrum\`, \`@react-spectrum/*\`, \`@spectrum-icons/*\`) are present.
`.trimEnd() + '\n'
  );
}

/**
 * Copy documentation files to the skill's references directory.
 */
function copyDocsDocumentation(skillConfig, categories, skillDir, options = {}) {
  const refsDir = path.join(skillDir, 'references', options.referenceSubdir ?? '');
  const sourceDir = path.join(MARKDOWN_DOCS_DIST, skillConfig.sourceDir);
  const customGuideEntries = getCustomGuideEntries(skillConfig.name);

  // Create subdirectories only if they have content
  const subdirs = [
    {name: 'guides', entries: [...customGuideEntries, ...categories.guides]},
    {name: 'components', entries: categories.components},
    {name: 'interactions', entries: categories.interactions},
    {name: 'utilities', entries: categories.utilities},
    {name: 'testing', entries: categories.testing},
    {name: 'internationalized', entries: categories.internationalized}
  ];
  for (const {name, entries} of subdirs) {
    if (entries.length > 0) {
      fs.mkdirSync(path.join(refsDir, name), {recursive: true});
    }
  }

  // Copy files by category
  const copyFile = (entry, targetSubdir, stripPrefix = null) => {
    const sourcePath = path.join(sourceDir, entry.path);
    if (!fs.existsSync(sourcePath)) {
      return;
    }

    // Optionally strip a prefix from the path to avoid double-nesting
    let targetRelPath = entry.path;
    if (stripPrefix && targetRelPath.startsWith(stripPrefix)) {
      targetRelPath = targetRelPath.slice(stripPrefix.length);
    }

    const targetPath = path.join(refsDir, targetSubdir, targetRelPath);
    fs.mkdirSync(path.dirname(targetPath), {recursive: true});
    fs.copyFileSync(sourcePath, targetPath);
  };

  // Copy guides
  const customContent = getCustomSkillContent(skillConfig.name);
  for (const entry of customGuideEntries) {
    const sourcePath =
      entry.sourcePath ||
      customContent?.embeddedMarkdownPaths?.find(markdownPath => markdownPath.endsWith(entry.path));
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      continue;
    }

    const targetPath = path.join(refsDir, 'guides', entry.path);
    fs.mkdirSync(path.dirname(targetPath), {recursive: true});
    fs.writeFileSync(
      targetPath,
      renderCustomMarkdown(sourcePath, {
        '{{guidesBase}}': '',
        '{{componentsBase}}': '../components/',
        '{{testingBase}}': '../testing/'
      }) + '\n'
    );
  }

  for (const entry of categories.guides) {
    copyFile(entry, 'guides');
  }

  // Copy components
  for (const entry of categories.components) {
    copyFile(entry, 'components');
  }

  // Copy interactions
  for (const entry of categories.interactions) {
    copyFile(entry, 'interactions');
  }

  // Copy utilities
  for (const entry of categories.utilities) {
    copyFile(entry, 'utilities');
  }

  // Copy testing docs
  for (const entry of categories.testing) {
    copyFile(entry, 'testing');
  }

  // Copy internationalized docs (and strip 'internationalized/' prefix to avoid double-nesting)
  for (const entry of categories.internationalized) {
    copyFile(entry, 'internationalized', 'internationalized/');
  }

  // Copy llms.txt
  const llmsTxtSource = path.join(sourceDir, 'llms.txt');
  if (fs.existsSync(llmsTxtSource)) {
    fs.copyFileSync(llmsTxtSource, path.join(refsDir, 'llms.txt'));
  }
}

function copyAdditionalReferenceLibraries(skillConfig, skillDir) {
  for (const library of getAdditionalReferenceLibraries(skillConfig)) {
    const llmsTxtPath = path.join(MARKDOWN_DOCS_DIST, library.skillConfig.sourceDir, 'llms.txt');
    if (!fs.existsSync(llmsTxtPath)) {
      console.warn(`Warning: expected additional reference docs not found: ${llmsTxtPath}`);
      continue;
    }

    const entries = parseLlmsTxt(llmsTxtPath);
    const categories = categorizeEntries(entries, library.skillConfig.sourceDir);
    copyDocsDocumentation(library.skillConfig, categories, skillDir, {
      referenceSubdir: library.referenceSubdir
    });
    console.log(
      `Copied ${library.title} documentation to ${path.relative(REPO_ROOT, path.join(skillDir, 'references', library.referenceSubdir))}`
    );
  }
}

function copyFocusedDocs(sourceDir, skillDir, docs) {
  for (const [sourceName, outputName] of docs) {
    const sourcePath = path.join(MARKDOWN_DOCS_DIST, sourceDir, sourceName);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Warning: expected migration reference not found: ${sourcePath}`);
      continue;
    }

    const outputPath = path.join(skillDir, 'references', outputName);
    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    fs.copyFileSync(sourcePath, outputPath);
  }
}

function writeMigrationReferences(skillDir, sourceDir) {
  // Copy focused reference docs from source files
  const focusedRefs = ['focused-prerequisites.md', 'focused-manual-fixes.md'];

  for (const filename of focusedRefs) {
    const sourcePath = path.join(MIGRATION_REFS_DIR, filename);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Warning: expected migration reference not found: ${sourcePath}`);
      continue;
    }

    const outputPath = path.join(skillDir, 'references', filename);
    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    fs.copyFileSync(sourcePath, outputPath);
  }

  copyFocusedDocs(sourceDir, skillDir, [
    ['migrating.md', 'docs-migrating.md'],
    ['getting-started.md', 'docs-getting-started.md'],
    ['Provider.md', 'docs-provider.md'],
    ['styling.md', 'docs-styling.md'],
    ['style-macro.md', 'docs-style-macro.md'],
    ['Toast.md', 'docs-toast.md']
  ]);
}

function writeAuditReferences(skillDir) {
  const refsDir = path.join(skillDir, 'references');
  fs.mkdirSync(refsDir, {recursive: true});

  // Copy authored audit check files.
  const checksSourceDir = path.join(AUDIT_SKILL_SOURCE_DIR, 'checks');
  const checksTargetDir = path.join(refsDir, 'checks');
  fs.mkdirSync(checksTargetDir, {recursive: true});
  for (const file of fs.readdirSync(checksSourceDir)) {
    if (file.endsWith('.md')) {
      fs.copyFileSync(path.join(checksSourceDir, file), path.join(checksTargetDir, file));
    }
  }

  // Copy the authored scoring rubric and report template.
  for (const file of ['scoring-rubric.md', 'report-template.md']) {
    fs.copyFileSync(path.join(AUDIT_SKILL_SOURCE_DIR, file), path.join(refsDir, file));
  }
}

function collectSkillFiles(skillDir) {
  const files = [];

  const walk = currentDir => {
    const entries = fs.readdirSync(currentDir, {withFileTypes: true});
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  };

  walk(skillDir);

  return files
    .map(filePath => {
      const relativePath = path.relative(skillDir, filePath);
      return relativePath.split(path.sep).join('/');
    })
    .sort((a, b) => {
      if (a === 'SKILL.md') {
        return b === 'SKILL.md' ? 0 : -1;
      }
      if (b === 'SKILL.md') {
        return 1;
      }
      return a.localeCompare(b);
    });
}

/**
 * Validate that all references/ links in SKILL.md resolve to actual files.
 * Throws if any broken links are found.
 */
function validateSkillLinks(skillDir) {
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    return;
  }

  const content = fs.readFileSync(skillMdPath, 'utf8');
  const linkPattern = /\[([^\]]*)\]\((references\/[^)]+)\)/g;
  const broken = [];

  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const linkText = match[1];
    const linkPath = match[2];
    const resolvedPath = path.join(skillDir, linkPath);
    if (!fs.existsSync(resolvedPath)) {
      broken.push(`"${linkText}" -> ${linkPath}`);
    }
  }

  if (broken.length > 0) {
    throw new Error(
      `Broken references in ${path.relative(REPO_ROOT, skillMdPath)}:\n  ${broken.join('\n  ')}`
    );
  }
}

function writeIndexJson(wellKnownRoot, skills) {
  const indexPath = path.join(wellKnownRoot, 'index.json');
  const payload = {skills};
  fs.writeFileSync(indexPath, JSON.stringify(payload, null, 2) + '\n');
  console.log(`Generated ${path.relative(REPO_ROOT, indexPath)}`);
}

/**
 * Generate a single skill.
 */
function generateSkill(skillConfig, wellKnownRoot) {
  const skillDir = path.join(wellKnownRoot, skillConfig.name);

  // Create skill directory
  fs.mkdirSync(skillDir, {recursive: true});

  if (skillConfig.kind === 'migration') {
    const skillMdContent = generateMigrationSkillMd(skillConfig);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMdContent);
    console.log(`Generated ${path.relative(REPO_ROOT, path.join(skillDir, 'SKILL.md'))}`);

    writeMigrationReferences(skillDir, skillConfig.sourceDir);
    console.log(
      `Copied migration references to ${path.relative(REPO_ROOT, path.join(skillDir, 'references'))}`
    );

    return skillDir;
  }

  if (skillConfig.kind === 'audit') {
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), generateAuditSkillMd(skillConfig));
    console.log(`Generated ${path.relative(REPO_ROOT, path.join(skillDir, 'SKILL.md'))}`);

    writeAuditReferences(skillDir);
    console.log(
      `Copied audit references to ${path.relative(REPO_ROOT, path.join(skillDir, 'references'))}`
    );

    return skillDir;
  }

  const isS2 = skillConfig.name === 'react-spectrum-s2';

  // Parse documentation entries
  const llmsTxtPath = path.join(MARKDOWN_DOCS_DIST, skillConfig.sourceDir, 'llms.txt');
  if (!fs.existsSync(llmsTxtPath)) {
    console.error(`llms.txt not found at ${llmsTxtPath}`);
    return;
  }

  const entries = parseLlmsTxt(llmsTxtPath);
  const categories = categorizeEntries(entries, skillConfig.sourceDir);

  // Generate SKILL.md
  const skillMdContent = generateDocsSkillMd(skillConfig, categories, isS2);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMdContent);
  console.log(`Generated ${path.relative(REPO_ROOT, path.join(skillDir, 'SKILL.md'))}`);

  // Copy documentation to references
  copyDocsDocumentation(skillConfig, categories, skillDir);
  console.log(
    `Copied documentation to ${path.relative(REPO_ROOT, path.join(skillDir, 'references'))}`
  );
  copyAdditionalReferenceLibraries(skillConfig, skillDir);

  return skillDir;
}

function main() {
  console.log('Generating Agent Skills for React Spectrum (S2) and React Aria...\n');

  // Ensure markdown docs exist
  ensureMarkdownDocs();

  const skillsByLibrary = new Map();
  for (const config of Object.values(SKILLS)) {
    const list = skillsByLibrary.get(config.sourceDir) || [];
    list.push(config);
    skillsByLibrary.set(config.sourceDir, list);
  }

  for (const [library, skills] of skillsByLibrary.entries()) {
    const wellKnownRoot = getWellKnownRootForLibrary(library);

    if (fs.existsSync(wellKnownRoot)) {
      fs.rmSync(wellKnownRoot, {recursive: true});
    }
    fs.mkdirSync(wellKnownRoot, {recursive: true});

    const indexEntries = [];
    for (const config of skills) {
      console.log(`\nGenerating skill: ${config.name}`);
      const skillDir = generateSkill(config, wellKnownRoot);
      validateSkillLinks(skillDir);
      const files = collectSkillFiles(skillDir);
      const entry = {
        name: config.name,
        description: config.description,
        files
      };
      if (config.kind) {
        entry.kind = config.kind;
      }
      indexEntries.push(entry);
    }

    writeIndexJson(wellKnownRoot, indexEntries);
    console.log(`Skills directory: ${path.relative(REPO_ROOT, wellKnownRoot)}`);
  }

  console.log('\nAgent Skills generation complete!');
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
