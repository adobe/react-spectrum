# Design: Replace the Node TypeScript extractor with the Parcel 3 `transformer-ts-doc` binary

- **Date:** 2026-09-21
- **Branch:** `rewrite-tsdiffer-to-rust`
- **Status:** Proposed (awaiting review)

## Background

`rsp-api-checker` is a Rust CLI that diffs the public API surface of the
react-spectrum monorepo (published npm baseline vs. local branch). It already
replaced the old Node scripts (`buildPublishedAPI.js`, `buildBranchAPI.js`,
`compareAPIs.js`) with three Rust commands: `get-published-api`,
`get-local-api`, `compare`.

However, the type-extraction step is **still Node**: each command shells out to
`ts-extractor/extract-api.ts` (~2300 lines), which uses the TypeScript compiler
API to walk `.d.ts` entry points and emit `api.json`. That is the last Node
dependency in the tool.

Separately, Parcel 3 (the Rust bundler, shipped as the `@parcel/parcel3` native
binary and enabled in this repo via `PARCEL_V3=1` / the `start-parcel3` script)
generates Storybook control args from TypeScript using a **Rust** transformer,
`@parcel/transformer-ts-doc`, wired up in the `.parcelrc-v3` files
(`docs:* → @parcel/transformer-ts-doc`). Its output is mapped to react-docgen by
`@parcel/transformer-storybook-v3/to-react-docgen.js`.

## Goal

Replace the Node extractor by **reusing Parcel 3's `transformer-ts-doc`** to
produce the type JSON, keeping the diff/render pipeline in Rust. Net effect: the
checker no longer depends on Node/tsc/tsx — it depends on the `parcel3` native
binary plus the `@parcel/transformer-ts-doc` plugin (both already present in the
repo's `node_modules`).

### Non-goals

- Reimplementing TypeScript type resolution in Rust (SWC etc.). We reuse the
  existing compiled transformer.
- Changing the `compare`/diff/render logic or the `api.json` schema.
- Wholesale rewriting the `TypeNode` model. It already matches
  transformer-ts-doc output (see Findings); only additive tweaks are in scope
  (e.g. a missing `reference` variant + a permissive fallback, per Component 3).
- Extraction caching / perf work (tracked separately in `AUDIT.md` A2/A3).

## Key findings (evidence)

These were verified against the code and a working spike, and they are what make
this a small, low-risk change:

1. **The `api.json` schema is already transformer-ts-doc's model.** The top-level
   `ApiJson { exports, links }` and the internally-tagged `TypeNode` enum in
   `src/api_json.rs` mirror Parcel's `TType` model 1:1 (the same model the
   s2-docs site renders in `packages/dev/s2-docs/src/types.tsx`). A spike ran
   `transformer-ts-doc` over a fixture `.d.ts` and the emitted
   `{ exports, links }` JSON deserializes straight into `ApiJson`.

2. **`transformer-ts-doc` parses `.d.ts` directly.** The spike fed it a `.d.ts`
   (not source) and it produced correct nodes, including JSDoc `@default`,
   descriptions, optional/required flags, string-literal unions, and function
   parameters. This resolves the concern that `react-aria-components` publishes
   **no source** (only `.d.ts`) in its npm tarball — `.d.ts` is a first-class
   input.

3. **`transformer-ts-doc` emits a standalone `.json` asset.** Building
   `import docs from 'docs:<file>.d.ts'` writes `<name>-<hash>.json` into the
   dist dir. No JS evaluation is needed to capture the output.

4. **Ids need no cross-run normalization.** transformer-ts-doc `id`s embed the
   absolute source path (`/abs/file.d.ts:ButtonProps`). The Rust renderer's
   `Link` handling (`src/type_renderer.rs:223`) takes the substring **after the
   last `:`**, so `/abs/file.d.ts:ButtonProps` → `ButtonProps` — identical to the
   existing `@pkg:ButtonProps` fixtures. The `links` map is **never indexed** in
   production code (only in tests); package identity is derived from the file
   layout (a `package.json` next to `dist/`) and the `exports` keys, formatted as
   `package:ExportName` in `src/differ.rs`. So absolute-path ids in `id`/`links`
   are harmless.

## Architecture

**Before** (per command): `discover packages → npx tsx extract-api.ts → per-package api.json → compare (Rust)`

**After** (per command): `discover packages → parcel3 + transformer-ts-doc → per-package api.json → compare (Rust)`

Only the middle box changes. `compare`, the differ, the renderer, and the
`api.json` schema are untouched.

## Components

### 1. Extraction driver (new Rust module, `src/extract.rs`)

Replaces the `npx tsx extract-api.ts` call sites. Responsibilities:

- Given the authoritative package set (existing yarn-workspaces / fs-walk
  discovery) and each package's `.d.ts` entry (resolved from the
  `types`/`exports` field, which the checker already reads):
  - Write a checker-owned `.parcelrc` (see below) into the working dir.
  - For each package, invoke the repo's `parcel3` binary
    (`node_modules/.bin/parcel3`) to build the package's `.d.ts` entry through
    the `docs:` pipeline and capture the emitted `{ exports, links }` JSON.
  - Write that JSON to the package's `dist/api.json` in the output tree, in the
    layout `compare` already expects (a `package.json` adjacent to `dist/`).
- **One parcel3 build per package** to start: deterministic (exactly one
  `docs:` asset ⇒ exactly one emitted `.json`), no output-name correlation
  needed. Batching multiple entries into fewer builds is a perf follow-up.
- Preserve the existing guards previously implemented in the Node extractor:
  build-freshness check (local), `--allow-empty`, and the "zero packages
  discovered ⇒ exit 1" behavior — reimplemented in Rust.
- On a failed parcel3 build, capture stderr and report which package/entry
  failed.

### 2. Checker-owned `.parcelrc`

Minimal config, mirroring the working spike:

```json
{
  "extends": "@parcel/config-default",
  "transformers": { "docs:*": ["@parcel/transformer-ts-doc"] }
}
```

Plugin resolution: `parcel3` and `@parcel/transformer-ts-doc` resolve from the
repo's `node_modules` (local flow) and the temp install dir's `node_modules`
(published flow). Whichever working dir the config lives in must have those on
its resolution chain — a wiring detail for the plan.

### 3. Model-compatibility pass

`TypeNode` looks complete but has **no `reference` variant**, whereas Parcel's
`TType` defines `TReference` (`{ type: 'reference', local, imported, specifier }`).
The first implementation task runs `transformer-ts-doc` over real
react-spectrum `.d.ts` (including `react-aria-components`) and enumerates every
emitted node `type`. Then:

- Add any missing variants (expected: `Reference`; audit for others).
- Add a permissive fallback (e.g. an `Unknown`/catch-all `#[serde(other)]`
  arm, or a lenient deserialize) so a novel node type degrades gracefully
  instead of failing the whole package.

## Local vs. published wiring

Same shape as today; only the extractor call changes.

- **`get-local-api`:** keep `yarn build`, then drive parcel3 over local
  `packages/**/dist/types/**/*.d.ts` entries. Cross-package types resolve via
  the repo's `node_modules` + built `dist/types`, exactly as the Node extractor
  relied on.
- **`get-published-api`:** keep the npm-install-into-temp-dir step, then drive
  parcel3 over the installed packages' `.d.ts`. Cross-package types resolve via
  the temp dir's `node_modules`.

Both sides feed **`.d.ts`** (not source), preserving the branch's "read types
directly" invariant and keeping the two sides apples-to-apples.

## What gets deleted

- The entire `ts-extractor/` directory: `extract-api.ts`, `utils.ts`,
  `*.test.ts`, `package.json`, `package-lock.json`, `tsconfig.json`,
  `vitest.config.ts`, and the `node_modules` fixture tree under it.
- Any Rust plumbing that existed solely to feed the Node extractor (e.g. the
  `--workspaces-file` hand-off) is removed or rerouted into the driver.

## Docs & CI

- Update `README.md` and `AUDIT.md`: remove the "TypeScript Extractor" section
  and the Node/npm/tsx prerequisites; document the parcel3 + transformer-ts-doc
  dependency and the `.d.ts`-in / `api.json`-out flow.
- Update `.circleci/config.yml`: drop the `npm install` / `tsx` steps for the
  extractor; ensure `parcel3` + `@parcel/transformer-ts-doc` are available in the
  job (they come with the repo install).

## Testing

- **Driver integration test:** run parcel3 over spike fixtures moved to
  `tests/fixtures/`, assert a per-package `api.json` is produced and that
  `compare` reports zero diffs against itself.
- **Model-coverage test:** over a few real packages (incl. the `.d.ts`-only
  `react-aria-components`), assert every emitted node deserializes into
  `TypeNode` (guards the `reference`/missing-variant risk).
- **Existing differ/renderer unit tests:** unchanged and must stay green.
- Gate parcel3-dependent tests on the binary's availability (skip cleanly when
  absent), mirroring the existing yarn-availability fallback.

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| `transformer-ts-doc` emits a node `TypeNode` doesn't model (e.g. `reference`) | Model-coverage pass is task #1; add variants + permissive fallback. |
| Subtle output differences between the Node extractor and transformer-ts-doc produce a one-time large diff | Compare old-vs-new `api.json` for a sample set during implementation; treat the transformer output as the new source of truth. |
| Per-package parcel3 spawn overhead is slow across ~80 packages | Acceptable to start; batch entries per build as a perf follow-up (AUDIT). |
| Plugin/binary resolution differs between local and temp-install (published) dirs | Establish the working-dir/`node_modules` chain explicitly in the driver. |

## Trade-off being accepted

We trade a **Node/tsc/tsx** dependency for a dependency on the **`parcel3`
native binary + `@parcel/transformer-ts-doc`**. Not "zero external process," but
zero Node/TypeScript, and the extraction is now the same Rust engine that powers
the repo's Storybook/docs.

## Rough implementation order

1. **Model coverage:** run transformer-ts-doc over real `.d.ts`; enumerate node
   types; extend `TypeNode` (`reference`, fallback). Land with tests.
2. **Extraction driver:** `src/extract.rs` — config emit, per-package parcel3
   invocation, capture, write to `dist/api.json`; port the freshness/allow-empty/
   zero-package guards.
3. **Wire `get-local-api` / `get-published-api`** to the driver; delete the Node
   extractor call sites.
4. **Delete `ts-extractor/`**; update `README.md`, `AUDIT.md`, `.circleci`.
5. **Tests:** driver integration + model coverage; confirm existing suite green.

## Open questions

- Can a `docs:`-prefixed path be a parcel3 **entry** directly
  (`parcel3 build 'docs:/abs/x.d.ts'`), removing the need for an `index.mjs`
  wrapper? Worth trying in task 2 as a simplification; the wrapper approach is
  already proven.
- Exact working directory for the published flow's parcel3 invocation so plugin
  resolution and type resolution both succeed.
