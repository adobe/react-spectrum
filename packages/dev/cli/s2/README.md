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

`read --sections` filters both Markdown and structured entries. `read --max-tokens N` bounds the complete JSON envelope (estimated as four UTF-8 bytes per token), including metadata; Markdown is bounded by the same conservative budget. Budget-truncated content is marked `truncated` with a `continueCommand`. A budget too small for metadata returns `ERR_INVALID_ARGS`; increase it or request fewer entries.

Use `--snapshot <id>` to pin an immutable documentation revision. Saved SDK/MCP resolutions keep their original snapshot and integrity hash even after a newer revision is published.
