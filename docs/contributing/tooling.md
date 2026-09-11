# Tooling

This repo does **not** use the conventional JS toolchain — reach for these, and don't hand-format code or swap in defaults:

- **Format** — `oxfmt` (`yarn format`), not Prettier. The style is opinionated (single quotes, no bracket spacing → `{foo}`, no trailing commas). Always run the tool rather than formatting by hand.
- **Lint** — `oxlint` (`oxlint packages --fix`) plus repo-local rules, not ESLint. `yarn lint` bundles format-check, type-check, `oxlint`, and Yarn `constraints` (`yarn constraints --fix`) (which enforce cross-package dependency versions).
- **Type-check** — `tsc` (`yarn check-types`), TypeScript 7's native compiler.
- **Build** — Parcel driven by `make` (`yarn build`), not plain `tsc`/rollup.
- **Yarn 4 workspaces** monorepo; use `yarn workspaces foreach` for cross-package operations.

## Storybook

Storybook is the main way to develop and view components: `yarn start` (v3/RAC) and `yarn start:s2` (S2).
