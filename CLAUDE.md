# CLAUDE.md

Guidance for working in the react-spectrum monorepo.

## Repo layout

The repo is layered. Changes flow up from the lowest level:

- **`@internationalized/*` and `@react-stately/*`** — the two lowest levels (i18n utilities and state management).
- **`@react-aria/*`** — behavior and accessibility hooks built on the above.
- **`react-aria-components` (RAC)** and some **React Spectrum v3 (RSP)** — component layer built on the hooks.
- **RSP S2 (`@react-spectrum/s2`)** — the Spectrum 2 design system, built on RAC, the highest level.

## Toolchain guardrails

This repo does **not** use the conventional JS toolchain — use these, don't swap in defaults:

- Format with `yarn format` (oxfmt), **not** Prettier. Lint with `yarn lint` (oxlint), **not** ESLint. Type-check with `yarn check-types` (tsgo), **not** tsc. Build with `yarn build` (Parcel), **not** rollup/tsc.
- **Don't run `yarn chromatic` / `yarn chromatic:forced-colors`** — maintainers run the VRT suites.
- All commonly used commands live in the root `package.json` scripts.

## Contributing

- **Match the surrounding code** — follow the naming, structure, and patterns of neighboring files.
- **Commit format** — use conventional-commit prefixes (`fix:`, `feat:`, `chore:`, `docs:`) as seen in the git history.

## Task-specific workflows

Read the relevant file before starting that kind of work (other agents: read the file directly; Claude will surface it):

- Writing or running tests → [`docs/contributing/testing.md`](docs/contributing/testing.md)
- Tooling details (format/lint/type-check/build, Storybook, workspaces) → [`docs/contributing/tooling.md`](docs/contributing/tooling.md)
- Styling S2 components → [`docs/contributing/s2-styling.md`](docs/contributing/s2-styling.md)
- Adding user-facing strings → [`docs/contributing/i18n-strings.md`](docs/contributing/i18n-strings.md)
- Touching generated code (icons) → [`docs/contributing/codegen.md`](docs/contributing/codegen.md)
- Comments and opening a PR → [`docs/contributing/pull-requests.md`](docs/contributing/pull-requests.md)
