# `@react-aria/cli`

Version-aware documentation and TypeScript API CLI & SDK for coding agents building with `react-aria-components`, `react-aria`, `react-stately`, and `@internationalized/*`.

## Quick Start

```sh
# Search components, hooks, and guides matched to your workspace's installed versions
npx @react-aria/cli search "searchable dropdown"

# Read usage, composition, styling, accessibility, and API for multiple entries in one call
npx @react-aria/cli read rac:ComboBox rac:Popover rac:ListBox

# Deep TypeScript prop / event / render-prop inspection
npx @react-aria/cli api rac:ComboBox --render-props

# Pre-warm cache for offline / CI environments
npx @react-aria/cli prefetch
```

`read --sections` filters both Markdown and structured entries. `read --max-tokens N` bounds the selected output format at approximately four UTF-8 bytes per token, including its metadata. A truncated read prints a continuation command with `--cursor`. Run it to pick up at the next section or API export. If the next section or export exceeds the budget by itself, increase `--max-tokens`.

`read --json` includes the structured entry by default. Use `--json-content markdown` to return rendered Markdown in its place. JSON queries include per-result provenance. Use `--include-resolution` to include the full workspace resolution, or `resolve --json` to inspect it separately.

Use `--snapshot <id>` to pin an immutable documentation revision. Saved SDK/MCP resolutions keep their original snapshot and integrity hash even after a newer revision is published.
