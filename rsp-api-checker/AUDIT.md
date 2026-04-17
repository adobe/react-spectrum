# rsp-api-checker Audit & Improvement Plan

Findings from auditing the tool for bugs, accuracy, and speed. Each item is a
concrete change; they can be executed independently. Priority ordering at the
bottom.

## Summary

The tool is architecturally sound: single `ts.Program` reused across packages,
symmetric discovery between Rust and TS, graceful error handling. The biggest
opportunities are around **speed** (no caching between runs, no
yarn-workspaces-based discovery) and a few **accuracy** landmines around
version pinning, conditional exports, property ordering, and symlinked
workspaces.

---

## 🔴 High impact

### A1. Use `yarn workspaces list --json` as source of truth for public packages

**Why:** Both `walk_for_packages` (Rust, `npm.rs:171`) and
`findPackageJsonDirs` (TS, `extract-api.ts:317`) hard-code a depth-4
filesystem walk with a hard-coded skip list (`node_modules`, `.git`, `dev`).
This is fragile: a new scope nested at depth 5 silently disappears from the
diff, and `dev/` is the only excluded non-published directory — anything else
published-false has to be detected by reading every package.json.

**Action:**

- Add a helper `discover_workspaces()` in Rust that runs
  `yarn workspaces list --json --no-private` in `repo_root` once at command
  start, returning `Vec<{name, location, private}>`.
- Use this list as the authoritative set for both `get-published-api`
  (resolves what to install from npm) and `get-local-api` (resolves what to
  extract).
- Keep the fs-walk path as a fallback when `yarn` isn't available (fixtures,
  CI without yarn).
- Remove the depth-4 assumption; remove the hardcoded `dev/` skip (yarn's
  `private: true` handles it).

### A2. Cache published api.json by version

**Why:** `get-published-api` spawns a temp dir, runs `npm install` for ~80
packages, then extracts. For an unchanged `latest`, this is pure waste.
Typical cost: tens of seconds per run.

**Action:**

- Compute a cache key: `sha256(sorted(name@resolved_version)) + extractor_version_sha`.
- Cache location: `~/.cache/rsp-api-check/published/<key>/` (respect
  `XDG_CACHE_HOME`).
- On `get-published-api`: if key hit, copy/symlink cached api.json tree to
  `--output-dir`. Otherwise do the install+extract, then populate cache.
- Add `--no-cache` flag to force refresh.

### A3. Cache local api.json by source SHA

**Why:** `get-local-api` re-runs the extractor even when nothing changed. For
large monorepos this is the slowest local step.

**Action:**

- Before extracting, compute a per-package SHA =
  `sha256(sorted(d.ts file path + mtime))` across all `.d.ts` under the entry
  point's resolution closure. (Or just the repo's `git rev-parse HEAD` +
  `git status --porcelain` for a coarser key.)
- Store api.json alongside a `.cache-key` file. Skip extraction if key
  matches.
- Invalidates automatically on any `.d.ts` mtime change (which is exactly
  when extraction output can change).

### A4. Stable sort of export keys and interface properties before diffing

**Why:** `format_interface` (`interface_builder.rs:729`) iterates `properties`
in `IndexMap` insertion order. TS compiler export/property order is *mostly*
stable but not guaranteed (it depends on resolution order, which depends on
the program's file order, which depends on the `entryFiles` array in
`ts.createProgram`). A real-world symptom: properties appearing "reordered"
in a diff with no API change.

**Action:**

- In `differ.rs`, sort `all_names` alphabetically before the diff loop.
- In `format_interface` (`interface_builder.rs:729`) and
  `format_prop`/`render_properties`, sort properties alphabetically before
  joining. Cross-reference with `type_renderer.rs` to catch all sites.
- Add a Rust test: feed two api.jsons identical except for key order →
  assert zero diffs.

---

## 🟠 Medium impact

### B1. Fix silent version-mismatch fallback for React types

**Why:** `local_installed_version` (`get_published.rs:26-34`) swallows errors
with `.ok()?`, and the call site falls back to `"latest"` on `None` (line 74).
If reading the local `react/package.json` fails for any reason, published
install uses React `latest` while local uses whatever's checked in —
producing spurious diffs on any type change in React.

**Action:**

- Change signature to return `Result<String>` and bail with a clear message
  if the version can't be read.
- Log the resolved version at the top of the `get-published-api` run.

### B2. Conditional exports: environment-aware `resolveTypesField`

**Why:** `resolveTypesField` (`utils.ts:50-78`) walks keys in fixed order
`["types", "import", "default", "require"]`. For packages using conditional
exports like `{ "react-native": "...", "default": "..." }`, this picks
arbitrarily. More concerning: if `types` isn't the first key in a nested
condition, we can pick the wrong branch.

**Action:**

- Prefer `types` strictly over all other keys at each object level.
- Then prefer `import` over `require` (modern ESM bias).
- Explicitly reject non-types keys like `react-native`, `node-addons`,
  `worker` unless nothing else matches.
- Add unit tests for each conditional-exports shape we've seen in
  react-spectrum + the common npm patterns.

### B3. Symlinked workspace packages: correct owner attribution

**Why:** `isExternalDeclaration` (`extract-api.ts:118-128`) derives package
ownership from the file path's `/node_modules/<scope>/<name>/` slice. With
yarn/pnpm workspaces symlinking local packages into `node_modules`, a
symlinked package's files resolve to the *symlink target* (under
`packages/`), not the node_modules path — so the current check says "not
external" correctly, but the reverse case (a published package's file that
happens to live under a nested node_modules) may be mis-attributed.

**Action:**

- Also check `path.realpath()` of the declaration file; if the realpath lands
  outside `packages/`, treat as external.
- Add a test fixture with a symlinked workspace package.

### B4. Report partial npm install failures usefully

**Why:** `workspace.rs:20-22` bails on any non-zero npm exit code, with no
breakdown of which package(s) failed. For a first-time user this is "the
whole thing exploded."

**Action:**

- Capture npm's stderr, grep for `404` / `ETARGET` lines, print a targeted
  message: "These packages couldn't be resolved: X, Y, Z" before bailing.
- Suggest `--tag next` or listing available dist-tags when `latest` fails.

### B5. Handle `workspace:*` / `*` version specifiers explicitly

**Why:** If a dep uses `workspace:*` or `*`, the npm registry query returns
`None` and the package is silently dropped from the install set. This means
some local workspace packages never get compared against npm.

**Action:**

- Detect these version forms in `get-published-api`; resolve via the
  registry's `latest` dist-tag with a logged warning ("Resolved workspace:*
  to @foo/bar@1.2.3 from npm latest").

---

## 🟡 Lower impact (nice to have)

### C1. Time-spent-per-phase reporting

Add `--timing` flag. Print: discovery, install, extract, compare. Lets us
actually know where the time goes.

### C2. Eliminate duplicate private-package filter in TS

`extract-api.ts:2003-2005` skips private packages during *write*, but
discovery already excluded them at line 150 via the walk. Either:

- Remove the redundant write-time check, OR
- Move the discovery filter into a single place and document it.

### C3. Parallelize per-package api.json *write* (not extraction)

The `ts.Program` must stay single-threaded, but serializing symbols + writing
JSON per package can use a worker pool. Modest gain (~20% on large
monorepos).

### C4. Explicit error when zero types are resolvable

When every export becomes `any` (because `@types/react` is missing or
resolution is broken), the tool currently produces a huge useless diff. Add a
threshold check: if `>50%` of exports serialize as `any`, fail with "type
resolution is broken — check @types/react is installed in packages-dir."

### C5. Clean up extractor `findPackageJsonDirs` after A1

Once yarn workspaces is the primary discovery path, the fs-walk becomes a
narrow fallback — shrink it.

---

## Correctness bugs found (not improvements)

### D1. `findPackageJsonDirs` doesn't skip `node_modules` symlinks

The walk (`extract-api.ts:312`) uses `readdirSync` with
`withFileTypes: true`, but a symlink to a directory reports
`isDirectory() === true`. If any `packages/` entry is symlinked out (unusual
but possible), the walk could follow it into unrelated trees.

**Action:** use `entry.isDirectory() && !entry.isSymbolicLink()`.

### D2. `newestMtimeInSources` walks `src/` but not monorepo-local deps

If package A re-exports from package B and B's source changes without
rebuilding B, A's check passes (A's `src/` isn't newer than A's
`dist/types/`) but the resulting diff is still wrong.

**Action:** either document this limitation explicitly, or extend the check
to include declared workspace deps. (Probably not worth extending — loudly
document in the error message.)

### D3. Extractor succeeds when no packages are found

If `discoverPackages` returns an empty list (wrong `--packages-dir`, bad
filter, etc.), the extractor prints "Found 0 packages" but still exits 0.
`compare` then finds zero pairs and reports "no changes."

**Action:** exit 1 when zero packages are discovered, unless an explicit
`--allow-empty` flag is passed.

---

## Proposed order of execution

1. **D1, D3, B1** (small correctness wins, low risk)
2. **A4** (sort exports/properties — removes the largest source of spurious
   diffs)
3. **A1** (yarn workspaces discovery — unblocks removing fragile fs-walk
   code)
4. **A3** (local cache — biggest UX win for iterative use)
5. **A2** (published cache — biggest wall-clock savings)
6. **B2, B3, B4, B5** (accuracy edge cases)
7. **C1–C5** (polish)

Minimum viable first pass: **D1, D3, B1, A4**.
