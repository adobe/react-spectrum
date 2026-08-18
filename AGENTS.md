# AGENTS.md

Guidance for working in the react-spectrum monorepo.

## Repo layout

The repo is layered. Changes flow up from the lowest level:

- **`@internationalized/*` and `@react-stately/*`** — the two lowest levels (i18n utilities and state management).
- **`@react-aria/*`** — behavior and accessibility hooks built on the above.
- **`react-aria-components` (RAC)** and some **React Spectrum v3 (RSP)** — component layer built on the hooks.
- **RSP S2 (`@react-spectrum/s2`)** — the Spectrum 2 design system, built on RAC, the highest level.

## Toolchain guardrails

This repo does **not** use the conventional JS toolchain — use these, don't swap in defaults:

- Format with `yarn format` (oxfmt), **not** Prettier. Lint with `yarn lint` (oxlint), **not** ESLint. Type-check with `yarn check-types` (tsc, TypeScript 7's native compiler). Build with `yarn build` (Parcel), **not** rollup/tsc.
- **Don't run `yarn chromatic` / `yarn chromatic:forced-colors`** — maintainers run the VRT suites.
- All commonly used commands live in the root `package.json` scripts.

## Contributing

- **Match the surrounding code** — follow the naming, structure, and patterns of neighboring files.
- **Commit format** — use conventional-commit prefixes (`fix:`, `feat:`, `chore:`, `docs:`) as seen in the git history.

## Filing GitHub issues

This repository uses GitHub issue **forms** defined in [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/) (`Bug_Report.yml`, `Feature_Request.yml`, `Documentation.yml`, `Feedback.yml`). Blank issues are disabled, and `CONTRIBUTING.md` asks contributors to follow the templates. Please do the same when filing on a user's behalf:

- **Search first.** Check existing open and closed issues to avoid duplicates.
- **Prefer the web flow** so the correct form is applied: <https://github.com/adobe/react-spectrum/issues/new/choose>
- **If filing via the `gh` CLI, replicate the template's fields in the body.** `gh issue create --template` does *not* render these YAML issue forms, so passing `--template` alone will not produce a valid issue. Instead, fill in the chosen template's fields manually. For a bug report (`Bug_Report.yml`), include:
  - a general summary
  - Expected Behavior
  - Current Behavior
  - Possible Solution (optional)
  - Context (how it affects you / what you're trying to accomplish)
  - Steps to Reproduce, a minimal repro, ideally a StackBlitz
  - Version, Browsers, Operating System
- **Questions and open-ended discussion** belong in [Discussions](https://github.com/adobe/react-spectrum/discussions), not the issue tracker.
- **Security issues** must not be filed on the public tracker. Follow the process in `CONTRIBUTING.md`.

## Task-specific workflows

Read the relevant file before starting that kind of work (other agents: read the file directly; Claude will surface it):

- Writing or running tests → [`docs/contributing/testing.md`](docs/contributing/testing.md)
- Tooling details (format/lint/type-check/build, Storybook, workspaces) → [`docs/contributing/tooling.md`](docs/contributing/tooling.md)
- Styling S2 components → [`docs/contributing/s2-styling.md`](docs/contributing/s2-styling.md)
- Adding user-facing strings → [`docs/contributing/i18n-strings.md`](docs/contributing/i18n-strings.md)
- Touching generated code (icons) → [`docs/contributing/codegen.md`](docs/contributing/codegen.md)
- Comments and opening a PR → [`docs/contributing/pull-requests.md`](docs/contributing/pull-requests.md)
