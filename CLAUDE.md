# CLAUDE.md

Guidance for working in the react-spectrum monorepo.

## Repo layout

The repo is layered. Changes flow up from the lowest level:

- **`@internationalized/*` and `@react-stately/*`** — the two lowest levels (i18n utilities and state management).
- **`@react-aria/*`** — behavior and accessibility hooks built on the above.
- **`react-aria-components` (RAC)** and some **React Spectrum v3 (RSP)** — component layer built on the hooks.
- **RSP S2 (`@react-spectrum/s2`)** — the Spectrum 2 design system, the highest level.

Test suites are split by type:

- **Jest tests** — `yarn test`
- **SSR tests** — `yarn test:ssr`
- **Browser tests** — `yarn test:browser`
- **Visual regression tests (VRT)** — `yarn chromatic`
- **High-contrast-mode VRT** — `yarn chromatic:forced-colors`

Maintainers run the Chromatic VRT suites themselves — don't run `yarn chromatic` / `yarn chromatic:forced-colors`. You can still start the VRT Storybooks locally to verify visual state: `yarn start:chromatic` and `yarn start:chromatic-fc`.

All commonly used commands live in the root `package.json` scripts.

Tests are **not** co-located with source — each package keeps them in a sibling `test/` directory. The file suffix routes the test to a runner: `*.ssr.test.*` → `yarn test:ssr`, `*.browser.test.*` → `yarn test:browser`, plain `*.test.*` → `yarn test` (Jest). Shared test helpers live in `@react-aria/test-utils` / `@react-spectrum/test-utils` (the `User` event abstraction and per-component testers).

## Tooling

This repo does **not** use the conventional JS toolchain — reach for these, and don't hand-format code or swap in defaults:

- **Format** — `oxfmt` (`yarn format`), not Prettier. The style is opinionated (single quotes, no bracket spacing → `{foo}`, no trailing commas). Always run the tool rather than formatting by hand.
- **Lint** — `oxlint` plus repo-local rules, not ESLint. `yarn lint` bundles format-check, type-check, `oxlint`, and Yarn `constraints` (which enforce cross-package dependency versions).
- **Type-check** — `tsgo` (`yarn check-types`), the native TypeScript compiler — not `tsc`. A `tsc` fallback exists as `yarn check-types:tsc`.
- **Build** — Parcel driven by `make` (`yarn build`), not plain `tsc`/rollup.
- **Yarn 4 workspaces** monorepo; use `yarn workspaces foreach` for cross-package operations.

## Writing tests

- **Run the full suite before committing.** Do not write PR descriptions that list a subset of specific passing tests — run everything (`yarn test`, and `yarn test:browser` when relevant).
- **Run lint and formatting before committing** (`yarn lint`, `yarn format`).
- **Test at the right level.** For any change at the RAC level or below (including hooks), write the test at the RAC level ideally. If the change lives at a higher level, test at that level.
- **Move to browser tests when needed.** If a test requires mocking specific browser behavior, consider moving it to the browser run (`yarn test:browser`).
- **Cover the reported issue.** When fixing a reported issue, add a test that reproduces the specific example given in the issue.
- **Check whether the test already exists.** Find a home for it near other similar tests.
- **Check code coverage** to decide whether a new test adds value — this is subjective.
- **In unit tests, prefer** fake timers, our test utils, and user event.
- **Keep comments minimal** — let the code speak for itself.
- **Combine tests** that share the same setup before an assertion.
- **Ground test titles in the goal**, not the implementation — double-check they are accurate.

## Contributing

- **Match the surrounding code** — follow the naming, structure, and patterns of neighboring files.
- **Commit format** — use conventional-commit prefixes (`fix:`, `feat:`, `chore:`, `docs:`) as seen in the git history.
- **Storybook** is the main way to develop and view components: `yarn start` (v3) and `yarn start:s2` (S2).
- **S2 styling** — style with the `style` macro (`import {style} from '../style' with {type: 'macro'};` — the `with {type: 'macro'}` attribute is load-bearing). Pass typed style objects to it; don't write CSS files or hand-rolled className strings for S2.
- **User-facing strings** — add the key to the package's `intl/en-US.json` (ICU MessageFormat) and read it via the localized string hook. Never hardcode UI text, and don't hand-edit the other locale files (translators own those).
- **Generated code** — icon components are generated (`yarn build:icons`), not hand-written, and `postinstall` runs `patch-package`, so run install on a fresh clone.
