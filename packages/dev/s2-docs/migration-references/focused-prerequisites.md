# Inspection checklist

## Minimum tool versions

These tools are not all strictly required, but if the project uses them they must be at these minimum versions to avoid issues with the `with {type: 'macro'}` import syntax:

- **TypeScript 5.3+** — required for the import attributes syntax (`with {type: 'macro'}`).
- **Babel 7.27.0+** or the `@babel/plugin-syntax-import-attributes` plugin — enables Babel to parse import attributes. Alternatively, `@babel/preset-env` with `shippedProposals: true` also enables import attribute parsing.
- **ESLint 9.14.0+** with `@typescript-eslint/parser`.
- **Prettier 3.1.1+** — needed to format `with {type: 'macro'}` import syntax correctly.

## What to look for

- Search package manifests and source for `@adobe/react-spectrum`, `@react-spectrum/*`, and `@spectrum-icons/*`.
- In monorepos or mixed-tooling repos, inspect the target package or app first instead of assuming the root manifest represents the runtime target being migrated.
- Determine the package manager from the relevant lockfile or workspace setup.
- Detect the bundler at the migration target level. The workspace root may include Storybook, Vite, or other tooling that does not represent the runtime bundler for the package being migrated.
  - **Parcel v2.12.0+** already supports S2 style macros natively.
  - **Vite, webpack, Next.js, Rollup, ESBuild** and similar toolchains need `unplugin-parcel-macros`. Keep plugin ordering correct so macros run before the rest of the toolchain.
  - If the repo already has a framework-specific S2 or macro setup, preserve it instead of layering a second macro configuration on top.
- Find **all** app entrypoints, including standalone pages, alternate render roots, embedded sub-apps, utility apps, and test-only render targets. Do not assume there is only one entry.
- Locate root providers, shared test wrappers, toast setup, and any direct `defaultTheme` usage.
- Search for `ToastContainer`, `ToastQueue`, `DialogContainer`, `useDialogContainer`, `ClearSlots`, style props, and `UNSAFE_style`. These are common follow-up areas after the codemod.
