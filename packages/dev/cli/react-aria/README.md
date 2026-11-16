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

`read --sections` filters both Markdown and structured entries. `read --max-tokens N` bounds the complete JSON envelope (estimated as four UTF-8 bytes per token), including metadata; Markdown is bounded by the same conservative budget. Budget-truncated content is marked `truncated` with a `continueCommand`. A budget too small for metadata returns `ERR_INVALID_ARGS`; increase it or request fewer entries.

Use `--snapshot <id>` to pin an immutable documentation revision. Saved SDK/MCP resolutions keep their original snapshot and integrity hash even after a newer revision is published.
