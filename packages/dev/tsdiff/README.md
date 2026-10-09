# tsdiff

TypeScript API comparison tool for JS/TS monorepos. Point `--repo-root` at any
TypeScript workspace and it discovers that repo's packages, package manager and
build command on its own, extracts every package's public type surface, and
diffs two snapshots of it. Types are extracted via Parcel 3's
`@parcel/transformer-ts-doc` plugin.

It was built for [react-spectrum](https://github.com/adobe/react-spectrum) —
where it replaces the Node.js scripts (`buildPublishedAPI.js`,
`buildBranchAPI.js`, `compareAPIs.js`) — and still lives in that monorepo, but
it has no dependency on it.

## Install

```sh
npm install --save-dev tsdiff
npx tsdiff inspect --repo-root .
```

The npm package carries the extraction toolchain as real dependencies, so an
install is self-contained: the target repo does **not** need Parcel. The Rust
binary ships as a per-platform `optionalDependency` (`tsdiff-darwin-arm64`,
`tsdiff-linux-x64-gnu`, …) and a small launcher picks the right one.

Windows is not supported: the extractor mirrors packages into a work directory
with symlinks.

> **Note on the `@parcel/core` peer warning.** `@parcel/config-default` declares
> a peer dependency on `@parcel/core`, so yarn/pnpm will warn that `tsdiff`
> doesn't provide it. That is expected and safe to ignore — extraction runs
> through the `parcel3` native binary, which never loads the JS core. Verified:
> removing `@parcel/core` from a toolchain produces byte-identical output.
> Don't add it just to silence the warning; it's a large unused dependency.

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

- **The extraction toolchain** — the extractor invokes the `parcel3` binary and
  the `@parcel/transformer-ts-doc` plugin. Installing from npm supplies these;
  see [Toolchain resolution](#toolchain-resolution) for how one is chosen.
  **No Node/tsc/tsx is used directly.**
- **npm** — only for the published-API workflow (installing published tarballs).
- **Rust** (1.75+) — only to build the CLI from source.

## Toolchain resolution

The extractor needs a directory whose `node_modules` contains `parcel3`,
`@parcel/transformer-ts-doc` and `@parcel/config-default`. That directory is
independent of the repo being diffed, and is picked in this order:

1. `--toolchain-root <dir>`, if passed.
2. **The target repo itself**, if it already has the toolchain installed. This
   is the cheap path — no merging needed — and it keeps repos that build with
   Parcel (like react-spectrum) behaving exactly as before.
3. `$TSDIFF_TOOLCHAIN_ROOT`, which the npm launcher sets to the package's own
   install location.
4. The command's default (the repo root, or the snapshot dir for `get-ref-api`).

When the toolchain and the target are different directories, the extractor
builds a work directory whose `node_modules` symlinks both trees together, so
Parcel finds its plugins and the mirrored `.d.ts` files find their imports.

## Build from source

```sh
cargo build --release
```

The binary is at `target/release/tsdiff`. The npm launcher falls back to this
build when no platform package is installed, which is the path CI takes.

## Pointing it at a repo

The tool derives everything it needs from the target repo, so the zero-config
path usually just works:

| What | Where it comes from |
| --- | --- |
| Workspace packages | `package.json#workspaces`, then `pnpm-workspace.yaml`, then `packages/*` + `packages/*/*`, then the repo root itself |
| Package manager | the lockfile (`yarn.lock`, `pnpm-lock.yaml`, `bun.lock[b]`, `package-lock.json`), then `package.json#packageManager`, then npm |
| Install / build commands | the detected package manager (`yarn install --no-immutable`, `<pm> run build`, …) |
| Declarations entry | `exports["."]` / `types` / `typings`, else `dist/types/{stem}.d.ts`, `dist/{stem}.d.ts`, `{stem}.d.ts` derived from `source` |

Start with `inspect`, which is read-only and answers "did it find my packages,
and are they built?" before you commit to a long extraction:

```sh
tsdiff inspect --repo-root ../some-other-repo
```

Override any of it with a `tsdiff.json` at the target repo's root. Every key is
optional:

```jsonc
{
  // Workspace globs, relative to the repo root. `!`-prefixed entries exclude.
  "workspaces": ["packages/*", "packages/@*/*"],
  // Locations to leave out of the API surface (matches the dir and its subtree).
  "exclude": ["packages/dev/**"],
  // "yarn" | "npm" | "pnpm" | "bun" — normally detected from the lockfile.
  "packageManager": "yarn",
  // argv used by `get-ref-api` inside its throwaway snapshot.
  "install": ["yarn", "install", "--no-immutable"],
  "build": ["yarn", "build"],
  // Where the build puts declarations, for packages that don't declare `types`.
  "typesFromSource": ["dist/types/{stem}.d.ts"],
  // Sources whose mtimes decide whether a local build is stale.
  "sourceGlobs": ["src/**/*.ts", "src/**/*.tsx"],
  // Extra packages installed alongside the published tarballs in
  // `get-published-api`, pinned to the versions in the local node_modules so
  // external type churn can't masquerade as an API change.
  "pinnedPeers": ["react", "react-dom", "@types/react", "@types/react-dom"],
  // Report packages that fail to extract and carry on, instead of aborting.
  // Off by default: in a repo whose packages all work, a failure is a real
  // regression and should stop the run. Turn it on for a repo where some
  // package reliably defeats the doc transformer, so the rest still diff.
  // Also available per-run as `--allow-failures`.
  "allowFailures": false
}
```

react-spectrum ships exactly such a file at the repo root, so every command
below behaves as it always has.

## Usage

All commands default to `--repo-root .`, so run them from the repo you want to
diff (or pass `--repo-root` explicitly).

### 1. Extract the published (baseline) API

```sh
tsdiff get-published-api --repo-root .
```

This queries the npm registry, downloads all published packages, and runs them through Parcel 3's `@parcel/transformer-ts-doc` plugin on their `.d.ts` files. Output goes to `dist/base-api/` by default.

### 2. Extract the local (branch) API

First, build the project so `.d.ts` files are generated:

```sh
yarn build
```

Then extract:

```sh
tsdiff get-local-api --repo-root .
```

Output goes to `dist/branch-api/` by default.

### 3. Compare

```sh
tsdiff compare
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
tsdiff get-published-api --repo-root .
tsdiff get-local-api --repo-root .
tsdiff compare
```

### All-in-one (main branch vs local)

Build the main branch API first, then your branch:

```sh
# On your branch:
tsdiff get-local-api --repo-root . --output dist/branch-api
git stash
git checkout main
yarn build
tsdiff get-local-api --repo-root . --output dist/base-api
git checkout -
git stash pop
tsdiff compare
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

## Releasing

`scripts/build-npm-packages.mjs` stages the publishable tree under `npm/`. It
owns the platform matrix — the `TARGETS` array near the top of the file is the
only thing to edit when adding a platform.

```sh
node scripts/build-npm-packages.mjs             # cross-compile every target
node scripts/build-npm-packages.mjs --targets=darwin-arm64
node scripts/build-npm-packages.mjs --no-build  # stage prebuilt CI artifacts
```

It produces `npm/tsdiff-<platform>/` for each binary plus a generated
`npm/tsdiff/` wrapper. **Publish the platform packages first, then the
wrapper** — the wrapper lists them as `optionalDependencies`, and a 404 on an
optional dependency is a hard install failure in both Yarn 1 and Yarn 4, not a
warning.

For the same reason the committed `package.json` deliberately carries **no**
`optionalDependencies` and is marked `private`; the publishable manifest is
generated. Otherwise every `yarn install` in this monorepo would fail against
platform packages that don't exist yet.
