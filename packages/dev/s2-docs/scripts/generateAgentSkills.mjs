#!/usr/bin/env node

/**
 * Generates Agent Skills for React Spectrum (S2) and React Aria.
 *
 * This script creates skills in the Agent Skills format (https://agentskills.io/specification)
 *
 * Usage:
 *   node packages/dev/s2-docs/scripts/generateAgentSkills.mjs
 *
 * The script will:
 *   1. Run the markdown docs generation if dist doesn't exist
 *   2. Create .well-known/skills directories inside the docs dist output
 *   3. Copy relevant documentation to references/ subdirectories
 *   4. Generate .well-known/skills/index.json for discovery
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
const CODEMOD_S1_TO_S2_DIR = path.join(
  REPO_ROOT,
  'packages/dev/codemods/src/s1-to-s2'
);
const WELL_KNOWN_DIR = '.well-known';
const WELL_KNOWN_SKILLS_DIR = 'skills';

// Skill definitions
const SKILLS = {
  'react-spectrum-s2': {
    name: 'react-spectrum-s2',
    description:
      'Build accessible UI components with React Spectrum S2 (Spectrum 2). Use when developers mention React Spectrum, Spectrum 2, S2, @react-spectrum/s2, or Adobe design system components. Provides documentation for buttons, forms, dialogs, tables, date/time pickers, color pickers, and other accessible components.',
    license: 'Apache-2.0',
    sourceDir: 's2',
    compatibility:
      'Requires a React project with @react-spectrum/s2 installed.',
    metadata: {
      author: 'Adobe',
      website: 'https://react-spectrum.adobe.com/'
    }
  },
  'react-spectrum-v3-to-s2-migration': {
    name: 'react-spectrum-v3-to-s2-migration',
    description:
      'Migrate React Spectrum v3 codebases to Spectrum 2. Use when upgrading from @adobe/react-spectrum or @react-spectrum/* packages to @react-spectrum/s2, running the s1-to-s2 codemod, or resolving TODO(S2-upgrade) follow-ups.',
    license: 'Apache-2.0',
    sourceDir: 's2',
    compatibility:
      'Requires a React project migrating from React Spectrum v3 to @react-spectrum/s2.',
    metadata: {
      author: 'Adobe',
      website: 'https://react-spectrum.adobe.com/'
    },
    mode: 'migration'
  },
  'react-aria': {
    name: 'react-aria',
    description:
      'Build accessible UI components with React Aria Components. Use when developers mention React Aria, react-aria-components, accessible components, or need unstyled accessible primitives. Provides documentation for building custom accessible UI with hooks and components.',
    license: 'Apache-2.0',
    sourceDir: 'react-aria',
    compatibility:
      'Requires React project with react-aria-components installed.',
    metadata: {
      author: 'Adobe',
      website: 'https://react-aria.adobe.com/'
    }
  }
};

/**
 * Ensure markdown docs are generated
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
  return path.join(
    MARKDOWN_DOCS_DIST,
    sourceDir,
    WELL_KNOWN_DIR,
    WELL_KNOWN_SKILLS_DIR
  );
}

/**
 * Parse llms.txt to get documentation entries
 */
function parseLlmsTxt(llmsTxtPath) {
  const content = fs.readFileSync(llmsTxtPath, 'utf8');
  const entries = [];
  const tree = unified().use(remarkParse).parse(content);

  const toText = (node) => {
    if (!node) {
      return '';
    }
    if (node.type === 'text') {
      return node.value;
    }
    if (Array.isArray(node.children)) {
      return node.children.map(toText).join('');
    }
    return '';
  };

  const extractEntry = (listItem) => {
    const paragraph = listItem.children?.find((child) => child.type === 'paragraph');
    if (!paragraph || !Array.isArray(paragraph.children)) {
      return null;
    }

    const linkIndex = paragraph.children.findIndex((child) => child.type === 'link');
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

  const walk = (node) => {
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
 * Extract the section export from an MDX file
 * @param {string} mdxPath - Path to the MDX file
 * @returns {string|null} - The section value or null if not found
 */
function extractSectionFromMdx(mdxPath) {
  if (!fs.existsSync(mdxPath)) {
    return null;
  }

  const content = fs.readFileSync(mdxPath, 'utf8');
  const sectionMatch = content.match(
    /export\s+const\s+section\s*=\s*['"]([^'"]+)['"]/
  );
  return sectionMatch ? sectionMatch[1] : null;
}

/**
 * Get the MDX file path for a given entry
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
 * Map section names to category keys
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
 * Files to filter out per source directory
 */
const FILTERED_FILES = {
  s2: ['index.md', 'error.md'],
  'react-aria': ['index.md', 'examples/index.md', 'error.md']
};

/**
 * Categorize documentation entries by reading section exports from MDX files
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
        console.warn(
          `Unknown section "${section}" for ${entry.path}, defaulting to components`
        );
        categories.components.push(entry);
      }
    } else {
      // No section export means it's a component
      categories.components.push(entry);
    }
  }

  return categories;
}

function getSkillFrontmatter(skillConfig) {
  return `---
name: ${skillConfig.name}
description: ${skillConfig.description}
license: ${skillConfig.license}
compatibility: ${skillConfig.compatibility}
metadata:
  author: ${skillConfig.metadata.author}
  website: ${skillConfig.metadata.website}
---

`;
}

/**
 * Generate the SKILL.md content
 */
function generateSkillMd(skillConfig, categories, isS2) {
  const frontmatter = getSkillFrontmatter(skillConfig);

  let content = frontmatter;

  if (isS2) {
    content += `# React Spectrum S2 (Spectrum 2)

React Spectrum S2 is Adobe's implementation of the Spectrum 2 design system in React. It provides a collection of accessible, adaptive, and high-quality UI components.

## Documentation Structure

The \`references/\` directory contains detailed documentation organized as follows:

`;
  } else {
    content += `# React Aria Components

React Aria Components is a library of unstyled, accessible UI components that you can style with any CSS solution. Built on top of React Aria hooks, it provides the accessibility and behavior without prescribing any visual design.

## Documentation Structure

The \`references/\` directory contains detailed documentation organized as follows:

`;
  }

  // Add documentation sections
  if (categories.guides.length > 0) {
    content += `### Guides
`;
    for (const entry of categories.guides) {
      content += `- [${entry.title}](references/guides/${entry.path})${entry.description ? `: ${entry.description}` : ''}\n`;
    }
    content += '\n';
  }

  if (categories.components.length > 0) {
    content += `### Components
`;
    for (const entry of categories.components) {
      content += `- [${entry.title}](references/components/${entry.path})${entry.description ? `: ${entry.description}` : ''}\n`;
    }
    content += '\n';
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

  if (categories.testing.length > 0) {
    content += `### Testing
`;
    for (const entry of categories.testing) {
      content += `- [${entry.title}](references/testing/${entry.path})\n`;
    }
    content += '\n';
  }

  return content.trimEnd() + '\n';
}

function generateMigrationSkillMd(skillConfig) {
  let content = getSkillFrontmatter(skillConfig);

  content += `# React Spectrum v3 to S2 Migration

Use this skill when upgrading a React Spectrum v3 codebase to Spectrum 2.

> **Tip:** For full S2 component API documentation, install the \`react-spectrum-s2\` skill or the React Spectrum S2 MCP server alongside this migration skill.

## Prerequisites (check before starting)

- **Install \`@react-spectrum/s2\` FIRST** — the codemod requires it at runtime to resolve the list of available S2 components. Without it, the codemod silently produces 0 transformations.
- **Verify npm/yarn registry access** — in corporate environments with private registries, you may need to configure your scoped registry for \`@react-spectrum\`, or use \`--registry https://registry.npmjs.org\` for public packages.
- **Yarn PnP users**: use \`yarn dlx\` instead of \`npx\`. Ensure \`@react-spectrum/s2\` is resolvable by jscodeshift workers (you may need \`nodeLinker: node-modules\` or a symlink workaround, since PnP virtual resolution is not visible to jscodeshift subprocesses).

## Migration workflow

1. Install \`@react-spectrum/s2\` in each workspace that uses React Spectrum.
2. Run a dry codemod pass to preview migration edits.
3. Run the codemod in apply mode.
4. Optionally scope to specific components with \`--components\`.
5. Resolve remaining \`TODO(S2-upgrade)\` comments manually (see the resolution guide below).
6. Migrate components the codemod skips (see the skipped components section below).
7. Configure bundler for style macro support.
8. Add \`page.css\` import to app entrypoints.
9. Migrate icons from \`@spectrum-icons/workflow/*\` to \`@react-spectrum/s2/icons/*\`, and illustrations from \`@spectrum-icons/illustrations/*\` to \`@react-spectrum/s2/illustrations/linear/<Name>\` or \`@react-spectrum/s2/illustrations/gradient/generic1/<Name>\`.
10. Clean up imports (see the import cleanup section below).
11. Update Provider/theme setup and verify (see the verification section below).

## Codemod commands

\`\`\`bash
# Install S2 first (required for codemod to work)
npm install @react-spectrum/s2
# or: yarn add @react-spectrum/s2

# Preview changes without writing files
npx @react-spectrum/codemods s1-to-s2 --agent --dry --path .

# Apply migrations
npx @react-spectrum/codemods s1-to-s2 --agent --path .

# Scope to specific components
npx @react-spectrum/codemods s1-to-s2 --agent --path . --components=Button,TextField
\`\`\`

## Monorepo considerations

- In a monorepo, run the codemod per-workspace or use \`--path ./packages\` to target all workspaces at once. Ensure \`@react-spectrum/s2\` is hoisted or available in each workspace's resolution scope.
- The codemod spawns jscodeshift workers as subprocesses. These workers must be able to \`require.resolve('@react-spectrum/s2')\` — ensure it is in \`node_modules\`, not only in PnP virtual resolution.
- The \`--agent\` flag skips interactive prompts, package installation, and macro setup, but still requires \`@react-spectrum/s2\` to be installed and resolvable.

## Known codemod limitations

- Does NOT update \`package.json\` (add S2, remove v3 packages).
- Does NOT migrate all individual \`@react-spectrum/*\` package imports (e.g., \`@react-spectrum/toast\`, \`@react-spectrum/utils\`). Rewrite these manually to \`@react-spectrum/s2\` where S2 equivalents exist.
- Does NOT handle \`@react-types/*\` imports — audit and remove after migration since types are re-exported from \`@react-spectrum/s2\`.
- \`@react-aria/*\` and \`@react-stately/*\` packages remain compatible with S2 and do not need migration.

## Components the codemod skips

The following components have no automated transform and require fully manual migration:

- **Accordion** — restructure to use \`Disclosure\`, \`DisclosureTitle\`, and \`DisclosurePanel\`:
  \`\`\`jsx
  // Before (v3)
  <Accordion>
    <Item key="one" title="Section One">Content one</Item>
  </Accordion>

  // After (S2)
  <Accordion allowsMultipleExpanded>
    <Disclosure id="one">
      <DisclosureTitle>Section One</DisclosureTitle>
      <DisclosurePanel>Content one</DisclosurePanel>
    </Disclosure>
  </Accordion>
  \`\`\`
- **ActionBar** — remove \`ActionBarContainer\` and move \`ActionBar\` to the \`renderActionBar\` prop of \`TableView\` or \`CardView\`. Convert \`Item\` children to \`ActionButton\`, and move \`onAction\` to individual \`onPress\` handlers.
- **Card / CardView** — no automated transform yet; migrate manually.
- **Well** — replace with a \`<div>\` and apply styles using the style macro:
  \`\`\`jsx
  // Before (v3)
  <Well>Content</Well>

  // After (S2)
  <div className={style({
    padding: 16, minWidth: 160, marginTop: 4,
    borderWidth: 1, borderRadius: 'sm', borderStyle: 'solid',
    borderColor: 'transparent-black-75', font: 'body-sm'
  })}>Content</div>
  \`\`\`

## Resolving TODO(S2-upgrade) comments

After the codemod runs, search for \`TODO(S2-upgrade)\` comments. Each comment pattern has a specific resolution:

### Style prop spreads
\`TODO(S2-upgrade): check this spread for style props\`

The codemod found a JSX spread attribute (\`{...props}\`) and cannot determine whether it contains v3 style props. Inspect the spread source — if it contains v3 style props (\`margin\`, \`padding\`, \`width\`, etc.), extract them into a \`style()\` macro call and remove them from the spread.

### Dynamic prop values
\`TODO(S2-upgrade): Prop X could not be automatically updated because Y could not be followed.\`

The prop value is a variable or expression the codemod cannot statically analyze. Trace the variable to its source and apply the same transformation manually. Common examples:

\`\`\`jsx
// validationState variable → isInvalid
// Before
const state = hasError ? 'invalid' : 'valid';
<TextField validationState={state} />
// After
<TextField isInvalid={hasError} />

// Dynamic variant
// Before
<Button variant={isPrimary ? 'cta' : 'secondary'} />
// After
<Button variant={isPrimary ? 'accent' : 'secondary'} />
\`\`\`

### Removed prop with dynamic value
\`TODO(S2-upgrade): X could not be automatically removed because Y could not be followed.\`

A deprecated prop (like \`isQuiet\`) has a dynamic value the codemod cannot safely remove. Verify the prop is no longer needed and remove it manually, updating any related logic.

### Icons without S2 equivalent
\`TODO(S2-upgrade): A Spectrum 2 equivalent to 'IconName' was not found. Please update this icon manually.\`

Check the S2 icons list for a semantic match. Import from \`@react-spectrum/s2/icons/IconName\`. If no suitable icon exists, consider using a custom SVG icon.

### Illustrations without S2 equivalent
\`TODO(S2-upgrade): A Spectrum 2 equivalent to 'IllustrationName' was not found. Please update this illustration manually.\`

Choose from available S2 illustrations:
- Linear variant: \`@react-spectrum/s2/illustrations/linear/<Name>\`
- Gradient variant: \`@react-spectrum/s2/illustrations/gradient/generic1/<Name>\` or \`@react-spectrum/s2/illustrations/gradient/generic2/<Name>\`

### Unconvertible CSS units
\`TODO(S2-upgrade): Unable to convert CSS unit to a pixel value\`

Units like \`%\`, \`vw\`, \`vh\`, \`rem\`, \`auto\` cannot be auto-converted. Rewrite using the \`style()\` macro with an appropriate S2 token or the escape-hatch syntax \`'[value]'\`:

\`\`\`jsx
// Before
<View width="100%" />
// After — use 'full' for 100%, or escape-hatch for other values
<div className={style({width: 'full'})} />
<div className={style({width: '[50vw]'})} />
\`\`\`

### Style props that could not be converted
\`TODO(S2-upgrade): update this style prop\`

A v3 dimension value couldn't be mapped. Convert it manually using the dimension table in the [Codemod UPGRADE notes](references/codemod/UPGRADE.md).

### UNSAFE_style / UNSAFE_className
\`TODO(S2-upgrade): check this UNSAFE_style\` or \`check this UNSAFE_className\`

Review whether the custom styling is still needed in S2. Prefer migrating to the \`style()\` macro. If the styling must remain, keep it as \`UNSAFE_className\` or \`UNSAFE_style\`.

### Collection item type detection
\`TODO(S2-upgrade): Couldn't automatically detect what type of collection component this is rendered in.\`

The codemod couldn't determine the parent collection for an \`Item\` or \`Section\`. Rename based on context:
- Inside \`Menu\` or \`ActionMenu\` → \`MenuItem\`
- Inside \`Picker\` → \`PickerItem\`
- Inside \`ComboBox\` → \`ComboBoxItem\`
- Inside \`TagGroup\` → \`Tag\`
- Inside \`Breadcrumbs\` → \`Breadcrumb\`
- Inside \`ListView\` → \`ListViewItem\`
- Inside \`TabList\` → \`Tab\`

### Table row header
\`TODO(S2-upgrade): You'll need to add isRowHeader to one of the columns manually.\`

Add \`isRowHeader\` to the \`<Column>\` that contains the primary identifying content (usually the first text column like "Name").

### Table row IDs
\`TODO(S2-upgrade): If the items do not have id properties, you'll need to add an id prop to the Row.\`

Add an explicit \`id\` prop to \`<Row>\` using a unique identifier from your data.

### Dialog render props
\`TODO(S2-upgrade): Could not automatically move the render props.\` or \`update this dialog to move the close function inside\`

Move the \`close\` function from \`DialogTrigger\`'s render prop to \`Dialog\`'s render prop:

\`\`\`jsx
// Before (v3)
<DialogTrigger>
  <Button>Open</Button>
  {(close) => (
    <Dialog>
      <Content>...</Content>
      <ButtonGroup>
        <Button onPress={close}>Done</Button>
      </ButtonGroup>
    </Dialog>
  )}
</DialogTrigger>

// After (S2)
<DialogTrigger>
  <Button>Open</Button>
  <Dialog>
    {({close}) => (
      <>
        <Content>...</Content>
        <ButtonGroup>
          <Button onPress={close}>Done</Button>
        </ButtonGroup>
      </>
    )}
  </Dialog>
</DialogTrigger>
\`\`\`

### Dynamic imports
\`TODO(S2-upgrade): check this dynamic import\`

Dynamic \`import()\` statements from v3 packages cannot be automatically rewritten. Update the import path manually to \`@react-spectrum/s2\`.

### Link with custom element
\`TODO(S2-upgrade): You may have been using a custom link component here.\`

If you had a custom element (not \`<a>\`) inside \`Link\`, remove it and apply props directly to \`Link\`. S2 \`Link\` renders its own anchor element.

### Breadcrumbs nav element
\`TODO(S2-upgrade): S2 Breadcrumbs no longer includes a nav element.\`

S2 \`Breadcrumbs\` no longer wraps in \`<nav>\`. If you need the navigation landmark, wrap it yourself:

\`\`\`jsx
<nav aria-label="Breadcrumbs">
  <Breadcrumbs>...</Breadcrumbs>
</nav>
\`\`\`

## Common manual migration patterns

These patterns come up frequently and the codemod cannot handle them because they involve dynamic expressions.

### isLoading to loadingState

\`\`\`jsx
// Before (v3)
<Picker isLoading={loading} />

// After (S2)
<Picker loadingState={loading ? 'loading' : 'idle'} />
\`\`\`

### Collection render function to array.map

\`\`\`jsx
// Before (v3)
<ActionGroup items={actions} onAction={onAction}>
  {(item) => <Item key={item.id}>{item.label}</Item>}
</ActionGroup>

// After (S2) — using ActionButtonGroup (no selection)
<ActionButtonGroup>
  {actions.map((item) => (
    <ActionButton key={item.id} onPress={() => onAction(item.id)}>
      {item.label}
    </ActionButton>
  ))}
</ActionButtonGroup>

// After (S2) — using ToggleButtonGroup (with selection)
<ToggleButtonGroup selectionMode="single" onSelectionChange={onSelectionChange}>
  {actions.map((item) => (
    <ToggleButton key={item.id} id={item.id}>
      {item.label}
    </ToggleButton>
  ))}
</ToggleButtonGroup>
\`\`\`

### DialogTrigger type to separate component

\`\`\`jsx
// Before (v3) — popover dialog
<DialogTrigger type="popover" placement="bottom">
  <ActionButton>Info</ActionButton>
  <Dialog><Content>Details here</Content></Dialog>
</DialogTrigger>

// After (S2) — use Popover component
<DialogTrigger>
  <ActionButton>Info</ActionButton>
  <Popover placement="bottom">
    <Dialog><Content>Details here</Content></Dialog>
  </Popover>
</DialogTrigger>

// Before (v3) — fullscreen dialog
<DialogTrigger type="fullscreen">
  <Button>Open</Button>
  <Dialog>...</Dialog>
</DialogTrigger>

// After (S2) — use FullscreenDialog component
<DialogTrigger>
  <Button>Open</Button>
  <FullscreenDialog>...</FullscreenDialog>
</DialogTrigger>
\`\`\`

### Flex/Grid/View to div with style macro

\`\`\`jsx
// Before (v3)
<Flex direction="column" gap="size-200" marginTop="size-100">
  <View padding="size-250" backgroundColor="gray-50" borderRadius="medium">
    Content
  </View>
</Flex>

// After (S2)
<div className={style({display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8})}>
  <div className={style({padding: 20, backgroundColor: 'layer-1', borderRadius: 'lg'})}>
    Content
  </div>
</div>
\`\`\`

## Import cleanup

After migration, clean up package imports:

**Remove these packages** from \`package.json\` if they are no longer needed:
- \`@adobe/react-spectrum\`
- \`@react-spectrum/provider\`, \`@react-spectrum/button\`, and other individual \`@react-spectrum/*\` component packages
- \`@spectrum-icons/workflow\` (replaced by \`@react-spectrum/s2/icons/*\`)
- \`@spectrum-icons/illustrations\` (replaced by \`@react-spectrum/s2/illustrations/*\`)
- \`@spectrum-icons/ui\` (no direct S2 equivalent — migrate manually)

**Keep these packages** (still compatible with S2):
- \`@react-aria/*\`
- \`@react-stately/*\`

**Audit and likely remove**:
- \`@react-types/*\` — most types are re-exported from \`@react-spectrum/s2\`

## Bundler setup

Configure style macro support for your bundler:
- **Parcel 2.12+**: macros are built in — no plugin needed. Add \`manualSharedBundles\` config to root \`package.json\` for CSS optimization.
- **Vite**: install \`unplugin-parcel-macros\` and add \`macros.vite()\` to \`vite.config.ts\`.
- **Webpack**: install \`unplugin-parcel-macros\`, \`mini-css-extract-plugin\`, and \`css-minimizer-webpack-plugin\`.

Add \`import '@react-spectrum/s2/page.css';\` in your app entry files.

Update Provider setup: S2 does not require a \`Provider\` component. Remove v3 \`Provider\` + \`defaultTheme\` usage, or replace with S2 \`Provider\` if you need to configure settings.

See [Getting Started](references/guides/getting-started.md) for more information.

## Verification

After completing the migration, verify with these steps:

1. **Type check** — run \`npx tsc --noEmit\` to catch type errors from removed or renamed props.
2. **Search for remaining TODOs** — \`grep -r "TODO(S2-upgrade)" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"\`
3. **Search for leftover v3 imports**:
  - \`grep -r "from '@adobe/react-spectrum'" --include="*.tsx" --include="*.ts"\`
  - \`grep -r "from '@react-spectrum/" --include="*.tsx" --include="*.ts" | grep -v "@react-spectrum/s2"\`
4. **Search for leftover icon imports** — \`grep -r "from '@spectrum-icons/" --include="*.tsx" --include="*.ts"\`
5. **Verify page.css import** — confirm \`import '@react-spectrum/s2/page.css'\` exists in your app entry files.
6. **Run tests** — run the project's test suite to catch runtime regressions.
7. **Run linter/formatter** — the codemod may leave formatting inconsistencies; run Prettier or ESLint to clean up.

## References

- [Migrating guide](references/guides/migrating.md): comprehensive per-component migration details
- [Style macro guide](references/guides/style-macro.md): how to use the \`style()\` macro
- [Styling guide](references/guides/styling.md): S2 styling concepts and patterns
- [Getting started](references/guides/getting-started.md): S2 setup and installation
- [Codemod README](references/codemod/README.md): codemod CLI options and usage
- [Codemod UPGRADE notes](references/codemod/UPGRADE.md): per-component prop changes and dimension mapping tables
`;

  return content.trimEnd() + '\n';
}

/**
 * Copy documentation files to the skill's references directory
 */
function copyDocumentation(skillConfig, categories, skillDir) {
  const refsDir = path.join(skillDir, 'references');
  const sourceDir = path.join(MARKDOWN_DOCS_DIST, skillConfig.sourceDir);

  // Create subdirectories only if they have content
  const subdirs = [
    {name: 'guides', entries: categories.guides},
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

function copyMigrationReferences(skillDir) {
  const refsDir = path.join(skillDir, 'references');
  const guidesSourceDir = path.join(MARKDOWN_DOCS_DIST, 's2');
  const guidesDir = path.join(refsDir, 'guides');
  const codemodDir = path.join(refsDir, 'codemod');

  fs.mkdirSync(guidesDir, {recursive: true});
  fs.mkdirSync(codemodDir, {recursive: true});

  const guideFiles = [
    'migrating.md',
    'style-macro.md',
    'styling.md',
    'getting-started.md'
  ];

  for (const file of guideFiles) {
    const sourcePath = path.join(guidesSourceDir, file);
    const targetPath = path.join(guidesDir, file);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing migration guide file: ${sourcePath}`);
    }
    fs.copyFileSync(sourcePath, targetPath);
  }

  const codemodFiles = [
    {source: path.join(CODEMOD_S1_TO_S2_DIR, 'README.md'), target: 'README.md'},
    {source: path.join(CODEMOD_S1_TO_S2_DIR, 'UPGRADE.md'), target: 'UPGRADE.md'}
  ];

  for (const file of codemodFiles) {
    const targetPath = path.join(codemodDir, file.target);
    if (!fs.existsSync(file.source)) {
      throw new Error(`Missing codemod reference file: ${file.source}`);
    }
    fs.copyFileSync(file.source, targetPath);
  }
}

function collectSkillFiles(skillDir) {
  const files = [];

  const walk = (currentDir) => {
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
    .map((filePath) => {
      const relativePath = path.relative(skillDir, filePath);
      return relativePath.split(path.sep).join('/');
    })
    .sort((a, b) => {
      if (a === 'SKILL.md') {return b === 'SKILL.md' ? 0 : -1;}
      if (b === 'SKILL.md') {return 1;}
      return a.localeCompare(b);
    });
}

function writeIndexJson(wellKnownRoot, skills) {
  const indexPath = path.join(wellKnownRoot, 'index.json');
  const payload = {skills};
  fs.writeFileSync(indexPath, JSON.stringify(payload, null, 2) + '\n');
  console.log(`Generated ${path.relative(REPO_ROOT, indexPath)}`);
}

/**
 * Generate a single skill
 */
function generateSkill(skillConfig, wellKnownRoot) {
  const skillDir = path.join(wellKnownRoot, skillConfig.name);
  const isS2 = skillConfig.name === 'react-spectrum-s2';

  // Create skill directory
  fs.mkdirSync(skillDir, {recursive: true});

  if (skillConfig.mode === 'migration') {
    const skillMdContent = generateMigrationSkillMd(skillConfig);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMdContent);
    console.log(
      `Generated ${path.relative(REPO_ROOT, path.join(skillDir, 'SKILL.md'))}`
    );

    copyMigrationReferences(skillDir);
    console.log(
      `Copied migration references to ${path.relative(REPO_ROOT, path.join(skillDir, 'references'))}`
    );

    return skillDir;
  }

  // Parse documentation entries
  const llmsTxtPath = path.join(
    MARKDOWN_DOCS_DIST,
    skillConfig.sourceDir,
    'llms.txt'
  );
  if (!fs.existsSync(llmsTxtPath)) {
    console.error(`llms.txt not found at ${llmsTxtPath}`);
    return;
  }

  const entries = parseLlmsTxt(llmsTxtPath);
  const categories = categorizeEntries(entries, skillConfig.sourceDir);

  // Generate SKILL.md
  const skillMdContent = generateSkillMd(skillConfig, categories, isS2);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMdContent);
  console.log(
    `Generated ${path.relative(REPO_ROOT, path.join(skillDir, 'SKILL.md'))}`
  );

  // Copy documentation to references
  copyDocumentation(skillConfig, categories, skillDir);
  console.log(
    `Copied documentation to ${path.relative(REPO_ROOT, path.join(skillDir, 'references'))}`
  );

  return skillDir;
}


async function main() {
  console.log(
    'Generating Agent Skills for React Spectrum (S2) and React Aria...\n'
  );

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
      const files = collectSkillFiles(skillDir);
      indexEntries.push({
        name: config.name,
        description: config.description,
        available_files: files,
        files
      });
    }

    writeIndexJson(wellKnownRoot, indexEntries);
    console.log(
      `Skills directory: ${path.relative(REPO_ROOT, wellKnownRoot)}`
    );
  }

  console.log('\nAgent Skills generation complete!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
