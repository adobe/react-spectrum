# Check 01 — Setup & configuration

Validates that the project is configured the way the `react-spectrum-s2` skill specifies.

Read first: `react-spectrum-s2` skill → `references/guides/getting-started.md` (canonical setup), plus the project's `package.json` and bundler config file.

## Detection inputs (gathered in Phase 0)

- **Package manager:** lockfile — `yarn.lock`, `package-lock.json`, or `pnpm-lock.yaml`.
- **Bundler:** `vite.config.*`, `webpack.config.*`, `next.config.*`, `.parcelrc` / a `parcel` dependency, `rollup.config.*`, or an esbuild build script.
- **Installed deps:** `dependencies` / `devDependencies` in `package.json`.

## Checks

### `@react-spectrum/s2` is installed
- **Detect:** `@react-spectrum/s2` present in `package.json`. If absent, the audit does not apply — stop and tell the user.
- **Severity:** — (precondition)

### Style macro plugin configured
- **Rule:** Non-Parcel bundlers must wire `unplugin-parcel-macros` into the build; Parcel needs ≥ 2.12.0. Without it, `style({...})` calls are never evaluated at build time and components render unstyled.
- **Detect:**
  - Vite/Rollup/React Router/ESBuild/webpack/Next: `unplugin-parcel-macros` in deps **and** referenced in the bundler config (`macros.vite()`, `macros.webpack()`, `macros.rollup()`, `macros.esbuild()`).
  - Parcel: `parcel` ≥ 2.12.0 (macros are built in) — no plugin needed.
  - Next.js: also confirm the app starts with `--webpack` (not Turbopack) — check the `dev`/`build` scripts. `unplugin-parcel-macros` does not work with Turbopack.
- **Severity:** Critical.

### CSS bundle optimization
- **Rule:** All S2 + macro-generated CSS should be combined into a single shared `s2-styles` bundle rather than code-split per route. Atomic CSS overlaps heavily between components, so loading it up front is smaller than duplicating it across chunks.
- **Detect:**
  - Parcel: `@parcel/bundler-default.manualSharedBundles` with an `s2-styles` entry in the root `package.json`.
  - webpack/Next: `optimization.splitChunks.cacheGroups` with an `s2`/`s2-styles` group testing for `@react-spectrum/s2` and `macro-*.css`.
  - Vite/Rollup/React Router: `build.rollupOptions.output.manualChunks` returning `'s2-styles'` for `macro-*.css` and `@react-spectrum/s2/*.css`.
- **Severity:** High.

### lightningcss minification
- **Rule:** Compile/minify CSS with lightningcss — it produces a much smaller bundle and dedupes atomic rules.
- **Detect:** `cssMinify: 'lightningcss'` (Vite/React Router) or `CssMinimizerPlugin.lightningCssMinify` (webpack/Next).
- **Severity:** Medium.

### Locale optimization
- **Rule:** S2 ships localized strings for 30+ languages by default. Projects should install the locale optimization plugin and declare only the languages they support.
- **Detect:** `@react-aria/optimize-locales-plugin` (webpack/Vite/Rollup/React Router/ESBuild) or `@react-aria/parcel-resolver-optimize-locales` (Parcel) installed **and** configured with a `locales` list.
- **Severity:** Medium.

### Single root Provider, wired to the router
- **Rule:** Mount one `Provider` from `@react-spectrum/s2/Provider` at the app root, wired to the client router; SSR frameworks (Next.js, React Router) set `locale` from the server request and render `Provider` with `elementType="html"`.
- **Detect:** exactly one root `Provider`; a `router={{navigate}}` prop; for Next/RR, a server-derived locale. Flag a missing `router`, or SSR setups that don't sync the locale.
- **Severity:** High. (Provider *scope* misuse — stacking, hard-coded `colorScheme` — is in [04-accessibility](04-accessibility.md).)

### React 19
- **Rule:** React 19 is recommended for S2.
- **Detect:** `react` version in `package.json`.
- **Severity:** Low.
