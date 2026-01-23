#!/usr/bin/env node

/**
 * Generates Agent Skills for React Spectrum (S2) and React Aria.
 *
 * This script creates skills in the Agent Skills format (https://agentskills.io/specification)
 *
 * Usage:
 *   node scripts/generateAgentSkills.mjs
 *
 * The script will:
 *   1. Run the markdown docs generation if dist doesn't exist
 *   2. Create skills/ directory with react-spectrum-s2 and react-aria skills
 *   3. Copy relevant documentation to references/ subdirectories
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SKILLS_ROOT = path.join(REPO_ROOT, "skills");
const MARKDOWN_DOCS_DIST = path.join(REPO_ROOT, "packages/dev/s2-docs/dist");
const MDX_PAGES_DIR = path.join(REPO_ROOT, "packages/dev/s2-docs/pages");
const MARKDOWN_DOCS_SCRIPT = path.join(REPO_ROOT, "packages/dev/s2-docs/scripts/generateMarkdownDocs.mjs");

// Skill definitions
const SKILLS = {
  "react-spectrum-s2": {
    name: "react-spectrum-s2",
    description:
      "Build accessible UI components with React Spectrum S2 (Spectrum 2). Use when developers mention React Spectrum, Spectrum 2, S2, @react-spectrum/s2, or Adobe design system components. Provides documentation for buttons, forms, dialogs, tables, date/time pickers, color pickers, and other accessible components.",
    license: "Apache-2.0",
    sourceDir: "s2",
    compatibility:
      "Requires Node.js and a React project with @react-spectrum/s2 installed.",
    metadata: {
      author: "Adobe",
      website: "https://react-spectrum.adobe.com/",
    },
  },
  "react-aria": {
    name: "react-aria",
    description:
      "Build accessible UI components with React Aria Components. Use when developers mention React Aria, react-aria-components, accessible components, or need unstyled accessible primitives. Provides documentation for building custom accessible UI with hooks and components.",
    license: "Apache-2.0",
    sourceDir: "react-aria",
    compatibility:
      "Requires Node.js and a React project with react-aria-components installed.",
    metadata: {
      author: "Adobe",
      website: "https://react-aria.adobe.com/",
    },
  },
};

/**
 * Ensure markdown docs are generated
 */
function ensureMarkdownDocs() {
  const s2LlmsTxt = path.join(MARKDOWN_DOCS_DIST, "s2", "llms.txt");
  const reactAriaLlmsTxt = path.join(MARKDOWN_DOCS_DIST, "react-aria", "llms.txt");

  if (!fs.existsSync(s2LlmsTxt) || !fs.existsSync(reactAriaLlmsTxt)) {
    console.log("Markdown docs not found. Running generateMarkdownDocs.mjs...");
    execSync(`node "${MARKDOWN_DOCS_SCRIPT}"`, {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
  }
}

/**
 * Parse llms.txt to get documentation entries
 */
function parseLlmsTxt(llmsTxtPath) {
  const content = fs.readFileSync(llmsTxtPath, "utf8");
  const entries = [];

  // Parse the markdown list items
  const listRegex = /^- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$/gm;
  let match;

  while ((match = listRegex.exec(content)) !== null) {
    entries.push({
      title: match[1],
      path: match[2],
      description: match[3] || "",
    });
  }

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

  const content = fs.readFileSync(mdxPath, "utf8");
  const sectionMatch = content.match(
    /export\s+const\s+section\s*=\s*['"]([^'"]+)['"]/,
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
  const mdxRelPath = entryPath.replace(/\.md$/, ".mdx");
  return path.join(MDX_PAGES_DIR, sourceDir, mdxRelPath);
}

/**
 * Map section names to category keys
 */
const SECTION_TO_CATEGORY = {
  // Guides
  Guides: "guides",
  Overview: "guides",
  Reference: "guides",
  "Getting started": "guides",
  // Components (default, no section export)
  Components: "components",
  // Utilities
  Utilities: "utilities",
  // Interactions (hooks)
  Interactions: "interactions",
  // Releases
  Releases: "releases",
  // Blog
  Blog: "blog",
  // Examples
  Examples: "examples",
  // Internationalized
  "Date and Time": "internationalized",
  Numbers: "internationalized",
};

/**
 * Files to filter out per source directory
 */
const FILTERED_FILES = {
  s2: ["index.md", "error.md"],
  "react-aria": ["index.md", "examples/index.md", "error.md"],
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
    internationalized: [],
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
    if (entry.path.includes("/testing.md")) {
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
          `Unknown section "${section}" for ${entry.path}, defaulting to components`,
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

/**
 * Generate the SKILL.md content
 */
function generateSkillMd(skillConfig, categories, isS2) {
  const frontmatter = `---
name: ${skillConfig.name}
description: ${skillConfig.description}
license: ${skillConfig.license}
compatibility: ${skillConfig.compatibility}
metadata:
  author: ${skillConfig.metadata.author}
  website: ${skillConfig.metadata.website}
---

`;

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
    for (const entry of categories.guides.slice(0, 10)) {
      content += `- [${entry.title}](references/guides/${entry.path})${entry.description ? `: ${entry.description.slice(0, 100)}` : ""}\n`;
    }
    content += "\n";
  }

  if (categories.components.length > 0) {
    content += `### Components
`;
    // List a subset of key components
    const keyComponents = categories.components.slice(0, 15);
    for (const entry of keyComponents) {
      content += `- [${entry.title}](references/components/${entry.path})${entry.description ? `: ${entry.description.slice(0, 80)}` : ""}\n`;
    }
    if (categories.components.length > 15) {
      content += `- ...and ${categories.components.length - 15} more components in \`references/components/\`\n`;
    }
    content += "\n";
  }

  if (categories.interactions.length > 0) {
    content += `### Interactions
`;
    for (const entry of categories.interactions.slice(0, 10)) {
      content += `- [${entry.title}](references/interactions/${entry.path})${entry.description ? `: ${entry.description.slice(0, 80)}` : ""}\n`;
    }
    if (categories.interactions.length > 10) {
      content += `- ...and ${categories.interactions.length - 10} more in \`references/interactions/\`\n`;
    }
    content += "\n";
  }

  if (categories.utilities.length > 0) {
    content += `### Utilities
`;
    for (const entry of categories.utilities.slice(0, 10)) {
      content += `- [${entry.title}](references/utilities/${entry.path})${entry.description ? `: ${entry.description.slice(0, 80)}` : ""}\n`;
    }
    if (categories.utilities.length > 10) {
      content += `- ...and ${categories.utilities.length - 10} more in \`references/utilities/\`\n`;
    }
    content += "\n";
  }

  if (categories.internationalized.length > 0) {
    content += `### Internationalization
`;
    for (const entry of categories.internationalized) {
      // Strip the 'internationalized/' prefix to avoid double-nesting in the path
      let refPath = entry.path;
      if (refPath.startsWith("internationalized/")) {
        refPath = refPath.slice("internationalized/".length);
      }
      content += `- [${entry.title}](references/internationalized/${refPath})\n`;
    }
    content += "\n";
  }

  if (categories.testing.length > 0) {
    content += `### Testing
`;
    for (const entry of categories.testing.slice(0, 5)) {
      content += `- [${entry.title}](references/testing/${entry.path})\n`;
    }
    content += "\n";
  }

  return content.trimEnd() + "\n";
}

/**
 * Copy documentation files to the skill's references directory
 */
function copyDocumentation(skillConfig, categories, skillDir) {
  const refsDir = path.join(skillDir, "references");
  const sourceDir = path.join(MARKDOWN_DOCS_DIST, skillConfig.sourceDir);

  // Create subdirectories only if they have content
  const subdirs = [
    { name: "guides", entries: categories.guides },
    { name: "components", entries: categories.components },
    { name: "interactions", entries: categories.interactions },
    { name: "utilities", entries: categories.utilities },
    { name: "testing", entries: categories.testing },
    { name: "internationalized", entries: categories.internationalized },
  ];
  for (const { name, entries } of subdirs) {
    if (entries.length > 0) {
      fs.mkdirSync(path.join(refsDir, name), { recursive: true });
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
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  };

  // Copy guides
  for (const entry of categories.guides) {
    copyFile(entry, "guides");
  }

  // Copy components
  for (const entry of categories.components) {
    copyFile(entry, "components");
  }

  // Copy interactions
  for (const entry of categories.interactions) {
    copyFile(entry, "interactions");
  }

  // Copy utilities
  for (const entry of categories.utilities) {
    copyFile(entry, "utilities");
  }

  // Copy testing docs
  for (const entry of categories.testing) {
    copyFile(entry, "testing");
  }

  // Copy internationalized docs (and strip 'internationalized/' prefix to avoid double-nesting)
  for (const entry of categories.internationalized) {
    copyFile(entry, "internationalized", "internationalized/");
  }

  // Copy llms.txt
  const llmsTxtSource = path.join(sourceDir, "llms.txt");
  if (fs.existsSync(llmsTxtSource)) {
    fs.copyFileSync(llmsTxtSource, path.join(refsDir, "llms.txt"));
  }
}

/**
 * Generate a single skill
 */
function generateSkill(skillConfig) {
  const skillDir = path.join(SKILLS_ROOT, skillConfig.name);
  const isS2 = skillConfig.name === "react-spectrum-s2";

  // Create skill directory
  fs.mkdirSync(skillDir, { recursive: true });

  // Parse documentation entries
  const llmsTxtPath = path.join(
    MARKDOWN_DOCS_DIST,
    skillConfig.sourceDir,
    "llms.txt",
  );
  if (!fs.existsSync(llmsTxtPath)) {
    console.error(`llms.txt not found at ${llmsTxtPath}`);
    return;
  }

  const entries = parseLlmsTxt(llmsTxtPath);
  const categories = categorizeEntries(entries, skillConfig.sourceDir);

  // Generate SKILL.md
  const skillMdContent = generateSkillMd(skillConfig, categories, isS2);
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillMdContent);
  console.log(
    `Generated ${path.relative(REPO_ROOT, path.join(skillDir, "SKILL.md"))}`,
  );

  // Copy documentation to references
  copyDocumentation(skillConfig, categories, skillDir);
  console.log(
    `Copied documentation to ${path.relative(REPO_ROOT, path.join(skillDir, "references"))}`,
  );
}


async function main() {
  console.log(
    "Generating Agent Skills for React Spectrum (S2) and React Aria...\n",
  );

  // Ensure markdown docs exist
  ensureMarkdownDocs();

  // Clean up existing skills directory
  if (fs.existsSync(SKILLS_ROOT)) {
    fs.rmSync(SKILLS_ROOT, { recursive: true });
  }
  fs.mkdirSync(SKILLS_ROOT, { recursive: true });

  // Generate each skill
  for (const [name, config] of Object.entries(SKILLS)) {
    console.log(`\nGenerating skill: ${name}`);
    generateSkill(config);
  }

  console.log("\nAgent Skills generation complete!");
  console.log(`Skills directory: ${path.relative(REPO_ROOT, SKILLS_ROOT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
