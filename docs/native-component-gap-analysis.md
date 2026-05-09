# Native Component Gap Analysis

## Purpose

Track the current `@react-spectrum/native` surface against the canonical web React Spectrum exports in `packages/@adobe/react-spectrum/exports/index.ts`.

Status values:

- `implemented`: present in `packages/@react-spectrum/native` and usable as a native component.
- `audit`: present, but needs API/accessibility/state/test review before alpha.
- `scaffold`: present as infrastructure, but intentionally incomplete.
- `stub`: directory/export exists with `export {};` only.
- `missing`: not present yet and expected for native parity or mobile completeness.
- `defer`: valid Spectrum concept, but not needed for the first native alpha.
- `native-only`: mobile design-system addition that is not a direct web Spectrum export.
- `web-only`: DOM/browser behavior that should not be ported directly.

## Current Native Surface

| Area | Web Spectrum exports | Native status | Notes | Phase |
| --- | --- | --- | --- | --- |
| Provider/theme | `Provider`, `useProvider`, themes | audit | Implemented with native theme defaults and overlay root. Needs example app and tests. | Foundation |
| Primitive rendering | `View`, `Text`, style props | audit | Native `View`, `Text`, `Pressable`, style props, `cn`, and variants exist. | Foundation |
| Overlay root | `DialogContainer`, overlay internals | scaffold | `PortalProvider`, `Overlay`, and `FocusScope` exist. Portal now supports layers and Android back dismissal, but modal isolation/focus are still limited. | Overlay |
| Button family | `Button`, `ActionButton`, `ToggleButton` | audit | Implemented. Needs tests for disabled, pending, pressed, selected, and icon-label behavior. | Core controls |
| Text/layout/display | `Text`, `Heading`, `Flex`, `Divider`, `Badge`, `StatusLight` | audit | Implemented. `Grid`, `Well`, `Content`, `Header`, and `Footer` are missing/deferred. | Core controls |
| Fields | `TextField`, `TextArea`, `SearchField` | audit | Implemented. Needs controlled/uncontrolled and native keyboard behavior tests. | Core controls |
| Toggles | `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch` | audit | Implemented using `react-stately`. Needs group and accessibility-state tests. | Core controls |
| Progress/feedback | `ProgressBar`, `ProgressCircle`, `Meter`, `InlineAlert` | audit | Implemented. Toast surface is also implemented and tested. | Core controls |
| Dialogs | `Dialog`, `AlertDialog`, `DialogTrigger`, `DialogContainer` | implemented/audit | `Dialog` and `AlertDialog` are exported. Trigger/container parity with web remains partial. | Overlay |
| Toasts | `ToastContainer`, `ToastQueue` | implemented/audit | Queue and container are exported. Timing, announcements, and UX still need hardening. | Overlay |
| Menus | `Menu`, `MenuTrigger`, `ActionMenu`, `SubmenuTrigger` | implemented/audit | `Menu`, `MenuTrigger`, and `ActionMenu` are exported. Submenu parity is still limited. | Collections |
| Pickers/selects | `Picker` | implemented/audit | Exported and built on native tray/listbox patterns. | Collections |
| ListBox | `ListBox`, `Item`, `Section` | implemented/audit | Native rendering exists; `Item` and `Section` still come from `react-stately`. | Collections |
| Tabs | `Tabs`, `TabList`, `TabPanels` | implemented/audit | Exported with native selection state; deeper parity work remains. | Collections |
| ComboBox | `ComboBox` | implemented/audit | Exported and built on text input plus tray/listbox composition. | Advanced inputs |
| Table | `TableView`, `TableHeader`, `TableBody`, `Column`, `Row`, `Cell` | implemented/audit | `TableView` is exported as the current native table surface. Web subcomponent parity is not complete. | Deferred |
| Date/time | `Calendar`, `RangeCalendar`, `DateField`, `DatePicker`, `DateRangePicker`, `TimeField` | partial | `Calendar`, `RangeCalendar`, `DatePicker`, and `DateRangePicker` are exported. `DateField` and `TimeField` remain absent. | Advanced inputs |
| Number/slider | `NumberField`, `Slider`, `RangeSlider` | implemented/audit | Exported with native interactions and tests. | Advanced inputs |
| Accordion | `Accordion`, `Disclosure`, `DisclosurePanel`, `DisclosureTitle` | missing | Implement after basic selection and animation patterns. | Collections |
| Navigation/data display | `Breadcrumbs`, `ListView`, `TreeView`, `TagGroup`, `Avatar`, `Image`, `IllustratedMessage`, `LabeledValue` | partial | `ListView`, `TreeView`, `TagGroup`, and `Avatar` are exported. The rest remain missing or deferred. | Later |
| Color tools | `ColorArea`, `ColorEditor`, `ColorField`, `ColorPicker`, `ColorSlider`, `ColorSwatch`, `ColorSwatchPicker`, `ColorWheel` | defer | High effort and dependent on gestures/SVG. | Later |
| Drag/drop/file | `DropZone`, `FileTrigger`, `useDragAndDrop`, drop item helpers | web-only/defer | Replace with Expo document picker/share sheet/gesture reorder when scoped. | Later |
| DOM utilities | `SSRProvider`, `VisuallyHidden`, `Collection`, `useFilter`, locale/formatter hooks from `react-aria` | web-only or native adapter | Do not depend on `react-aria` at runtime. Provide native equivalents only when needed. | Foundation/later |

## Mobile-Native Additions

| Component/pattern | Status | Notes | Phase |
| --- | --- | --- | --- |
| Bottom sheet / tray | implemented/audit | `Tray` exists as the current bottom-sheet style surface for mobile overlays. | Overlay |
| Action sheet | missing | Mobile replacement for some menu/popover flows. | Overlay |
| App bar / mobile header | missing | Useful for Expo example and app shells, not web Spectrum parity. | Mobile |
| Segmented control | missing | Mobile-friendly selection pattern; related to Tabs but not identical. | Mobile |
| List item / swipe actions | missing | Needed for mobile list ergonomics. | Mobile |
| Empty/loading/error states | missing | Required design-system building blocks for real apps. | Mobile |
| Skeleton loader | missing | Feedback pattern beyond current progress components. | Mobile |
| Avatar/chip/tag | implemented/audit | `Avatar`, `Tag`, and `TagGroup` are available as native additions or ports. | Mobile/later |

## Immediate Corrections

1. Treat the current exported surface as an audit target, not a blank slate.
2. Prioritize API review, accessibility behavior, and parity gaps over adding more breadth.
3. Fill missing web-parity pieces such as `DateField`, `TimeField`, and deeper table/menu semantics before broadening scope further.
4. Keep validating changes through the package Jest project and the Expo smoke app.
