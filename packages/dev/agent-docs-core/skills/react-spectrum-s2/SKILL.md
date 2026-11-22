---
name: "react-spectrum-s2"
description: "Build interfaces with Adobe React Spectrum S2 (@react-spectrum/s2) using version-matched component APIs, usage examples, design tokens, and workflow icons."
license: "Apache-2.0"
compatibility: "Requires Node.js >= 18 for @react-spectrum/cli or @react-spectrum/mcp."
metadata:
  author: "Adobe"
  website: "https://react-spectrum.adobe.com"
---

# React Spectrum S2 — Version-Matched Documentation Workflow

Use the `spectrum` CLI (or the equivalent `@react-spectrum/mcp` MCP tools when shell execution is unavailable) to retrieve authoritative documentation, imports, composition examples, and TypeScript API signatures matched to the **exact package versions resolved in the target workspace**.

Do **not** rely on memorized import paths, prop names, labeling conventions, or styling rules from training data — those evolve across package versions. Always retrieve and follow the target version's guidance and component entries first.

## 1. Fast 1–2 Command Workflow

`search`, `read`, `api`, `tokens`, and `icons` **automatically resolve** the workspace's installed or lockfile package versions. Pass `--cwd <app-dir>` when working inside a monorepo subdirectory.

### Step A — Discover when component or pattern choice is uncertain
```sh
spectrum search "<user intent or UI pattern>" --cwd <app-dir>
```
Or read the versioned decision guide directly:
```sh
spectrum read s2:guide/component-decision-tree --cwd <app-dir>
```

### Step B — Batch-read implementation guidance + target components in one budgeted call
```sh
spectrum read s2:guide/implementation-guidance s2:ComboBox s2:Dialog --sections guide,usage --max-tokens 6000 --cwd <app-dir>
```
Complete component pages are large, so set `--max-tokens` and narrow `--sections` (`usage`, `api`, `accessibility`, `styling`, `testing`, `guide`) to what the task needs. For very large pages, list the outline first with `--list-sections` and fetch individual headings or section IDs with `--section <heading|id>`:
```sh
spectrum read s2:ComboBox --list-sections --cwd <app-dir>
```
When an entry is cut short, the output ends with a `Continue with …` command carrying a `--cursor`; run it only if the part you need was omitted. Use `api` (below) rather than a full read to check individual props, and pass `--include-deprecated` when maintaining or migrating older usages.

### Step C — Look up Spectrum 2 design tokens or workflow icons when styling or adding iconography
```sh
spectrum tokens padding --cwd <app-dir>
spectrum icons "search" --cwd <app-dir>
spectrum icons "folder" --illustrations --style linear --cwd <app-dir>
```

### Focused prop/event inspection & diagnostic resolution
```sh
spectrum api s2:ComboBox --prop allowsCustomValue,onInputChange --cwd <app-dir>
spectrum resolve --cwd <app-dir>
```

## 2. Authoritative Implementation Rules

1. **Follow returned versioned guidance verbatim:** Treat the `imports`, composition hierarchy, accessible naming guidance, styling rules, and TypeScript signatures returned by `spectrum read` / `spectrum api` as authoritative for this workspace.
2. **Keep library namespaces explicit:** Never mix imports or prop conventions across `s2:` (`@react-spectrum/s2`), `rac:` (`react-aria-components`), `react-aria:` hooks, `react-stately:`, and `internationalized:` unless the versioned documentation explicitly shows that composition.
3. **Respect version diagnostics:** If the CLI reports a lockfile/installed mismatch or an unavailable historical patch, surface that warning rather than silently substituting `latest` APIs.

## 3. Fallbacks When `spectrum` Is Not Globally Installed

1. **Package runner (zero global install):**
   - npm: `npx -y @react-spectrum/cli@latest read s2:guide/implementation-guidance s2:Button --cwd <app-dir>`
   - Yarn: `yarn dlx @react-spectrum/cli@latest read s2:guide/implementation-guidance s2:Button --cwd <app-dir>`
   - pnpm: `pnpm dlx @react-spectrum/cli@latest read s2:guide/implementation-guidance s2:Button --cwd <app-dir>`
2. **MCP server (`@react-spectrum/mcp`):**
   - Call `search_docs` and batched `read_docs` (passing `cwd` when working across multiple workspace roots, or reusing the `resolution` object from `resolve_versions`). Pass `sections`, `listSections`, `sectionHeadings`, `includeDeprecated`, and `maxTokens` to `read_docs`, and continue a truncated entry with its returned `cursor`. Use `search_s2_tokens` and `search_s2_icons` for tokens and icons.
