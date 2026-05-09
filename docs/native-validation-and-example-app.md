# Native Validation And Example App

## Package Validation

`@react-spectrum/native` exposes these workspace scripts:

```sh
yarn workspace @react-spectrum/native typecheck
yarn workspace @react-spectrum/native tsc
yarn workspace @react-spectrum/native test
```

The typecheck script runs `tsc -p packages/@react-spectrum/native/tsconfig.json --noEmit`. The test script is intentionally scoped to `packages/@react-spectrum/native` so native package changes can be validated without running the full monorepo test suite.

## Example App

The smoke app lives in `starters/native`. It is an Expo app that imports the workspace package and renders:

- Provider and theme switching
- Button
- TextField and SearchField
- Checkbox
- RadioGroup and Radio
- Switch
- ProgressBar and Meter
- InlineAlert
- Badge and StatusLight
- Modal, Tray, AlertDialog, Popover, Tooltip, and Toast
- Picker and ListBox

Run it from the repo root:

```sh
cd starters/native
yarn install
yarn start
```

The app is deliberately small. Its job is to catch packaging, import, theme, overlay, and basic interaction regressions without becoming a full documentation app.

## Current Test Priorities

1. Token resolver, style prop resolver, and accessibility mapper unit tests.
2. Provider default propagation tests.
3. Core control accessibility-state tests for Button, TextField, Checkbox, Radio, Switch, Progress, and InlineAlert.
4. Controlled/uncontrolled behavior tests for TextField and toggle controls.
5. Continue broadening coverage for overlays, collections, and advanced inputs.
