# `@react-spectrum/cli`

Version-aware documentation, TypeScript API, style macro token, and workflow icon CLI & SDK for coding agents building with `@react-spectrum/s2` and `react-aria-components`.

## Quick Start

```sh
# Search components & guides matched to your workspace's installed versions
npx @react-spectrum/cli search "searchable dropdown"

# Read usage, composition, styling, accessibility, and API for multiple components in one call
npx @react-spectrum/cli read s2:ComboBox s2:Dialog

# Deep TypeScript prop / event / render-prop inspection
npx @react-spectrum/cli api s2:ComboBox --prop selectedKey

# Query S2 style macro tokens & workflow icons
npx @react-spectrum/cli tokens --property backgroundColor
npx @react-spectrum/cli icons search filter

# Pre-warm cache for offline / CI environments
npx @react-spectrum/cli prefetch
```

`read --sections` filters both Markdown and structured entries. `read --max-tokens N` bounds the selected output format at approximately four UTF-8 bytes per token, including its metadata. A truncated read prints a continuation command with `--cursor`. Run it to pick up at the next section or API export. If the next section or export exceeds the budget by itself, increase `--max-tokens`.

Use `--list-sections` to see a page's headings and section IDs without their content. Pass `--section` with an exact heading or ID to read that section, or repeat it to read several sections in document order.

```sh
npx @react-spectrum/cli read s2:ComboBox --list-sections
npx @react-spectrum/cli read s2:ComboBox --section "Asynchronous loading"
```

`read --json` includes the structured entry by default. Use `--json-content markdown` to return rendered Markdown in its place. JSON queries include per-result provenance. Use `--include-resolution` to include the full workspace resolution, or `resolve --json` to inspect it separately.

Use `--snapshot <id>` to pin an immutable documentation revision. Saved SDK/MCP resolutions keep their original snapshot and integrity hash even after a newer revision is published.
