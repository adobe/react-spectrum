---
name: "react-aria"
description: "Build accessible UI components and interactions with React Aria Components (react-aria-components), React Aria hooks, React Stately, and @internationalized/* using version-matched documentation and APIs."
license: "Apache-2.0"
compatibility: "Requires Node.js >= 18 for @react-aria/cli or @react-aria/mcp."
metadata:
  author: "Adobe"
  website: "https://react-aria.adobe.com"
---

# React Aria — Version-Matched Documentation Workflow

Use the `react-aria` CLI (or the equivalent `@react-aria/mcp` MCP tools when shell execution is unavailable) to retrieve authoritative documentation, imports, composition examples, and TypeScript API signatures matched to the **exact package versions resolved in the target workspace**.

Do **not** rely on memorized import paths, prop names, labeling conventions, or styling rules from training data — those evolve across package versions. Always retrieve and follow the target version's guidance and component entries first.

## 1. Fast 1–2 Command Workflow

`search`, `read`, `api` **automatically resolve** the workspace's installed or lockfile package versions. Pass `--cwd <app-dir>` when working inside a monorepo subdirectory.

### Step A — Discover when component or pattern choice is uncertain
```sh
react-aria search "<user intent or UI pattern>" --cwd <app-dir>
```
Or read the versioned decision guide directly:
```sh
react-aria read rac:collections --cwd <app-dir>
```

### Step B — Batch-read implementation guidance + target components in one call
```sh
react-aria read rac:getting-started rac:ComboBox rac:Modal --sections usage,api,accessibility --cwd <app-dir>
```

### Focused prop/event inspection & diagnostic resolution
```sh
react-aria api rac:ComboBox --prop selectedKey,onSelectionChange --cwd <app-dir>
react-aria resolve --cwd <app-dir>
```

## 2. Authoritative Implementation Rules

1. **Follow returned versioned guidance verbatim:** Treat the `imports`, composition hierarchy, accessible naming guidance, styling rules, and TypeScript signatures returned by `react-aria read` / `react-aria api` as authoritative for this workspace.
2. **Keep library namespaces explicit:** Never mix imports or prop conventions across `s2:` (`@react-spectrum/s2`), `rac:` (`react-aria-components`), `react-aria:` hooks, `react-stately:`, and `internationalized:` unless the versioned documentation explicitly shows that composition.
3. **Respect version diagnostics:** If the CLI reports a lockfile/installed mismatch or an unavailable historical patch, surface that warning rather than silently substituting `latest` APIs.

## 3. Fallbacks When `react-aria` Is Not Globally Installed

1. **Package runner (zero global install):**
   - npm: `npx -y @react-aria/cli@latest read rac:getting-started rac:Button --cwd <app-dir>`
   - Yarn: `yarn dlx @react-aria/cli@latest read rac:getting-started rac:Button --cwd <app-dir>`
   - pnpm: `pnpm dlx @react-aria/cli@latest read rac:getting-started rac:Button --cwd <app-dir>`
2. **MCP server (`@react-aria/mcp`):**
   - Call `search_docs` and batched `read_docs` (passing `cwd` when working across multiple workspace roots, or reusing the `resolution` object from `resolve_versions`).
