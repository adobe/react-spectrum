# rsp-api-check

API comparison tool for the [react-spectrum](https://github.com/adobe/react-spectrum) monorepo. Replaces the Node.js scripts (`buildPublishedAPI.js`, `buildBranchAPI.js`, `compareAPIs.js`) with a Rust CLI that extracts types via Parcel 3's `@parcel/transformer-ts-doc` plugin.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│  get-published-api  │     │    get-local-api      │
│                     │     │                       │
│  npm registry HTTP  │     │  reads local build    │
│  → npm install      │     │  .d.ts files          │
│  → parcel3          │     │  → parcel3            │
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

**Key difference from the old scripts:** type extraction now reads `.d.ts` files directly through Parcel 3's `@parcel/transformer-ts-doc` plugin (via the `parcel3` binary) instead of requiring a full Parcel build of the source. This makes the published-API path dramatically faster since the `.d.ts` files already exist in the npm package.

## Prerequisites

- **Rust** (1.75+) — to build the CLI
- **The repo's `node_modules`** — the extractor invokes the `parcel3` binary and
  the `@parcel/transformer-ts-doc` plugin from `<repo-root>/node_modules`, so run
  `yarn install` at the monorepo root first. **No Node/tsc/tsx is used directly.**
- **npm** — only for the published-API workflow (installing published tarballs).

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

This queries the npm registry, downloads all published packages, and runs them through Parcel 3's `@parcel/transformer-ts-doc` plugin on their `.d.ts` files. Output goes to `dist/base-api/` by default.

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

## Type extraction (Parcel 3)

Type extraction reuses Parcel 3's Rust `@parcel/transformer-ts-doc` plugin — the
same extractor that powers the repo's Storybook control args and s2-docs. For
each package the tool feeds the package's `.d.ts` entry through a
`docs:* → @parcel/transformer-ts-doc` pipeline (via the `parcel3` binary) and
captures the emitted `{ exports, links }` JSON as that package's `api.json`.

This works for published tarballs that ship only `.d.ts` (e.g.
`react-aria-components`) and requires no Node/TypeScript of our own.

## Differences from the original scripts

| Aspect | Old (Node.js) | New (Rust + Parcel 3) |
|--------|---------------|---------------------------|
| Local/Published API extraction | Parcel build (downloaded source / temp dir) | Parcel 3 `transformer-ts-doc` (Rust) on `.d.ts` |
| npm queries | `npm view` subprocesses (serial) | HTTP requests (parallel) |
| Type rendering | 3 copies of `processType()` | Single `render_type()` in Rust |
| Diff engine | JS `diff` library | Rust `similar` crate |
| Output modes | Terminal + partial CI markdown | Terminal, CI markdown, JSON |
| External types | Flattened (HTMLAttributes inlined) | Preserved as `extends` |
