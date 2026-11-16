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
