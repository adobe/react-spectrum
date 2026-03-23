# Codemod-first workflow

## Inspect before editing

- Search package manifests and source for `@adobe/react-spectrum`, `@react-spectrum/*`, and `@spectrum-icons/*`.
- In monorepos or mixed-tooling repos, inspect the target package or app first instead of assuming the root manifest, Storybook config, or workspace tooling represents the runtime target being migrated.
- Determine the package manager from the relevant lockfile or workspace setup, then choose the codemod runner that matches that repo or package.
- Detect the bundler at the migration target level before touching setup files. Parcel v2.12.0+ already supports S2 style macros. Vite, webpack, Next.js, Rollup, ESBuild, and similar toolchains need explicit macro-plugin setup.
- Find app entrypoints, standalone pages, alternate entrypoints, embedded sub-apps, utility apps, test-only render targets, root providers, shared test wrappers, toast setup, and any direct `defaultTheme` usage before the codemod changes imports.
- Search for `ToastContainer`, `ToastQueue`, `DialogContainer`, `useDialogContainer`, `ClearSlots`, style props, and `UNSAFE_style`. These are common follow-up areas after the codemod.

## Run the codemod first

Prefer the repo-native non-interactive command so the upgrade stays deterministic:

```bash
npx @react-spectrum/codemods s1-to-s2 --agent
yarn dlx @react-spectrum/codemods s1-to-s2 --agent
pnpm dlx @react-spectrum/codemods s1-to-s2 --agent
```

Use `npx` for npm and Yarn 1 repos, `yarn dlx` for Yarn Berry or Yarn PnP repos, and `pnpm dlx` for pnpm repos. Use the equivalent workspace-native runner if the repo uses another package manager.
Use `--path <dir>` for monorepos or when only one package should migrate first. In a monorepo, run the codemod against the target subtree first instead of the whole workspace.
Use `--components A,B` when the user explicitly wants an incremental rollout by component family.
Use `--dry` when you need to preview scope before editing.

## Resolve follow-up work in order

1. Install or verify `@react-spectrum/s2` and clean up imports.
2. Add S2 app setup such as `@react-spectrum/s2/page.css` or `Provider` changes.
3. Search for `TODO(S2-upgrade)` and fix every remaining comment.
4. Resolve style prop, layout, and dialog/collection follow-ups.
5. Migrate icons, illustrations, and toast imports.
6. Update tests, mocks, and validation commands.

## Validate with repo-native commands

Prefer the narrowest existing scripts from `package.json`:

- dependency install if manifests changed
- typecheck or compile
- focused tests for touched areas
- build

For monorepos, validate the affected package or subtree first with its own scripts before escalating to workspace-wide checks.
