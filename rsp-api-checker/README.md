# rsp-api-check

API comparison tool for the [react-spectrum](https://github.com/adobe/react-spectrum) monorepo. Replaces the Node.js scripts (`buildPublishedAPI.js`, `buildBranchAPI.js`, `compareAPIs.js`) with a Rust CLI + a standalone TypeScript extractor.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│  get-published-api  │     │    get-local-api      │
│                     │     │                       │
│  npm registry HTTP  │     │  reads local build    │
│  → npm install      │     │  .d.ts files          │
│  → ts-extractor     │     │  → ts-extractor       │
│  → dist/base-api/   │     │  → dist/branch-api/   │
└────────┬────────────┘     └───────────┬───────────┘
         │                              │
         └──────────┐    ┌──────────────┘
                    ▼    ▼
              ┌─────────────────┐
              │     compare     │
              │                 │
              │  reads api.json │
              │  rebuilds types │
              │  diffs output   │
              └─────────────────┘
```

**Key difference from the old scripts:** the TypeScript type extraction now reads `.d.ts` files directly (via the TS compiler API in `ts-extractor/extract-api.ts`) instead of requiring a full Parcel build. This makes the published-API path dramatically faster since the `.d.ts` files already exist in the npm package.

## Prerequisites

- **Rust** (1.75+) — to build the CLI
- **Node.js** (18+) — needed by the TypeScript extractor
- **npm** — for installing packages in the published-API workflow

## Build

```sh
cargo build --release
```

The binary is at `target/release/rsp-api-check`.

## Usage

All commands assume you're running from the react-spectrum monorepo root.

### 1. Extract the published (baseline) API

```sh
rsp-api-check get-published-api --repo-root .
```

This queries the npm registry, downloads all published packages, and runs the TypeScript extractor on their `.d.ts` files. Output goes to `dist/base-api/` by default.

### 2. Extract the local (branch) API

First, build the project so `.d.ts` files are generated:

```sh
yarn build
```

Then extract:

```sh
rsp-api-check get-local-api --repo-root .
```

Output goes to `dist/branch-api/` by default.

### 3. Compare

```sh
rsp-api-check compare
```

Options:

| Flag | Description |
|------|-------------|
| `--base-api-dir <dir>` | Base API directory (default: `dist/base-api`) |
| `--branch-api-dir <dir>` | Branch API directory (default: `dist/branch-api`) |
| `--package <name>` | Filter to a specific package (substring match) |
| `--interface <name>` | Filter to a specific interface/export name |
| `--ci` | Output GitHub-flavored markdown with collapsible sections |
| `--json` | Output machine-readable JSON |
| `--verbose` | Extra debug output |

### All-in-one (published vs local)

```sh
rsp-api-check get-published-api --repo-root .
rsp-api-check get-local-api --repo-root .
rsp-api-check compare
```

### All-in-one (main branch vs local)

Build the main branch API first, then your branch:

```sh
# On your branch:
rsp-api-check get-local-api --repo-root . --output dist/branch-api
git stash
git checkout main
yarn build
rsp-api-check get-local-api --repo-root . --output dist/base-api
git checkout -
git stash pop
rsp-api-check compare
```

## Output format

The diff output uses a TypeScript-like syntax with `+`/`-` markers:

```
### react-aria-components

#### react-aria-components:ComboBox
 ComboBox <M extends SelectionMode = 'single', T extends {}> {
   allowsCustomValue?: boolean
   ...
-  onChange?: (T) => void
+  onChange?: (ChangeValueType<SelectionMode>) => void
   ...
 }
```

Export names are formatted as `(@scope/)?package:ExportName`.

External types (React, DOM, etc.) are **not** flattened into the API surface. Instead they appear in `extends` clauses:

```
 FieldButton extends HTMLAttributes {
   isActive?: boolean
   isQuiet?: boolean
   ...
 }
```

## TypeScript Extractor

The `ts-extractor/` directory contains a standalone TypeScript script that uses the TS compiler API to walk `.d.ts` exports and produce `api.json` files. It handles:

- Cross-package type resolution (via `node_modules`)
- Generic type parameters and constraints
- Interface inheritance (flattens internal types, preserves external extends)
- Component detection (functions returning JSX.Element/ReactNode)
- JSDoc `@default` tag extraction

Install its dependencies once:

```sh
cd ts-extractor && npm install
```

It can also be run directly:

```sh
npx tsx ts-extractor/extract-api.ts --packages-dir ./packages --output-dir ./dist/branch-api
```

## Differences from the original scripts

| Aspect | Old (Node.js) | New (Rust + TS extractor) |
|--------|---------------|---------------------------|
| Published API extraction | Parcel build on downloaded source | TS compiler on `.d.ts` (no Parcel) |
| Local API extraction | Parcel build in temp dir | TS compiler on local `.d.ts` |
| npm queries | `npm view` subprocesses (serial) | HTTP requests (parallel) |
| Type rendering | 3 copies of `processType()` | Single `render_type()` in Rust |
| Diff engine | JS `diff` library | Rust `similar` crate |
| Output modes | Terminal + partial CI markdown | Terminal, CI markdown, JSON |
| External types | Flattened (HTMLAttributes inlined) | Preserved as `extends` |
