# @react-spectrum/native

Expo-focused React Native package for rebuilding React Spectrum components with Uniwind.

This package is still early, but it now includes a working native surface rather than just a scaffold:

- Expo is the assumed runtime.
- Uniwind is the styling layer.
- `react-stately` is the preferred reusable state layer.
- `react-aria`, `react-aria-components`, DOM refs, CSS modules, and `react-dom` are not runtime dependencies.
- React Native Reusables' Uniwind registry is an implementation reference for practical Expo primitive patterns, `cn`, `class-variance-authority`, `tailwind-merge`, and `@rn-primitives/*` usage: https://github.com/founded-labs/react-native-reusables/tree/main/packages/registry/src/uniwind

## Current Surface

- `Provider`, `useProvider`, `useProviderProps`
- light/dark theme tokens and token resolution helpers
- Uniwind config export helper
- `cn`, `cva`, and style prop resolver foundations
- native accessibility prop mappers
- motion constants and reduced-motion hook
- `Item` and `Section` re-exports from `react-stately`
- `Button`, `ActionButton`, `ToggleButton`, and `ButtonText`
- text/layout/display components: `Text`, `Heading`, `Flex`, `View`, `Divider`, `Badge`, `StatusLight`
- field/input components: `Field`, `TextField`, `TextArea`, `SearchField`
- toggle controls: `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`
- feedback components: `InlineAlert`, `ProgressBar`, `ProgressCircle`, `Meter`, `Toast`, `ToastContainer`, `ToastQueue`
- overlays: `Modal`, `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `Tray`
- collections and navigation: `ListBox`, `Picker`, `Menu`, `ActionMenu`, `Tabs`, `ComboBox`, `ListView`, `TableView`, `TreeView`
- advanced inputs and mobile-native additions: `NumberField`, `Slider`, `RangeSlider`, `Calendar`, `RangeCalendar`, `DatePicker`, `DateRangePicker`, `ColorSwatch`, `ColorField`, `Avatar`, `Tag`, `TagGroup`

## Scope Notes

- This package does not try to reuse DOM-oriented React Spectrum runtime code.
- Some web Spectrum exports are still missing or intentionally deferred for native.
- The current status matrix lives in `docs/native-component-gap-analysis.md`.

## Validation

```sh
yarn workspace @react-spectrum/native typecheck
yarn workspace @react-spectrum/native test
```

The Expo smoke app lives in `starters/native`.
