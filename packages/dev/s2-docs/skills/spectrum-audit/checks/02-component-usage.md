# Check 02 — Component usage

Validates that the project uses S2 components where they exist, builds custom components on React Aria Components + the `style` macro, and follows S2 composition and collection conventions. This is the most judgment-heavy category — read the component's docs in the `react-spectrum-s2` skill (`references/components/`) before flagging.

Canonical rules: `react-spectrum-s2` skill → `SKILL.md` (Component composition, Collections, Typography, Form fields). Reverse-lookup help ("is there an S2 component for this?"): `references/guides/component-decision-tree.md`.

## Checks

### Use an S2 component where one exists
- **Rule:** Prefer S2 components over hand-rolled UI. S2 covers ~85 components — Button, Picker, ComboBox, Menu, Dialog/AlertDialog, Card/CardView, TableView, ListView, Tabs, and more.
- **Detect:** hand-rolled equivalents — `<div role="button|dialog|menu|listbox|tablist">`, custom dropdown/modal/tooltip implementations, native `<button>`/`<select>` styled to look like Spectrum, native `<table>` for data grids. Cross-check candidates against the canonical component list (`@react-spectrum/s2` exports / the `react-spectrum-s2` skill).
- **Severity:** High.

### Custom components build on RAC + the style macro
- **Rule:** When no S2 component fits, build the custom component on React Aria Components (for behavior + accessibility) and style it with the `style` macro — not raw divs with click handlers.
- **Detect:** interactive custom components using bare `<div onClick>` / `<div onKeyDown>` / `<span onClick>` instead of an RAC primitive or an S2 component.
- **Severity:** High (accessibility regressions).

### Typed item components
- **Rule:** Each collection has its own item export — `MenuItem`, `PickerItem`, `ComboBoxItem`, `ListViewItem`, `TreeViewItem`, `Row`/`Cell`/`Column`, `Tag`, `Breadcrumb`, `AccordionItem`, etc. There is no generic `Item`. Typed section exports (`MenuSection`, `PickerSection`, `ComboBoxSection`, …) are valid — only a **generic** `Section` import is wrong.
- **Detect:** `import {Item}` or `import {Section}` (or `Item`/`Section` from `react-stately` / Spectrum 1 packages); a generic `<Item>` / `<Section>` element in S2 code (usually a Spectrum 1 leftover); or the wrong item type nested inside a collection. Do **not** flag typed `*Section` components such as `MenuSection`.
- **Severity:** Medium.

### Collection conventions
- **Rule:** Collection items need an `id` (and React `key` when built with `.map`); items whose children aren't plain text need `textValue`; virtualized collections must not be wrapped in an `overflow` container; empty/loading/bulk-action UI uses the built-in `renderEmptyState` / `loadingState` / `renderActionBar`. Accessible names on collections are covered in [04-accessibility](04-accessibility.md) — record those findings there, not here.
- **Detect:** items lacking `id`; non-text item children without `textValue`; an `overflow*` wrapper around `TableView`/`ListView`/`CardView`/`TreeView`/`Menu`/`ListBox`; hand-rolled empty/spinner/bulk-action UI replacing the built-ins.
- **Severity:** High for missing `id` / `textValue` (breaks selection, keyboard nav, screen readers); Medium for the rest.

### Interactive components in ListView / TreeView
- **Rule:** When a `ListView` or `TreeView` row contains interactive children whose keyboard handling conflicts with arrow-key row navigation (e.g. `TextField`, `ComboBox`, `Picker`), set `keyboardNavigationBehavior="tab"` on the collection so Tab moves focus in and out of rows. See `react-spectrum-s2` skill → `references/components/ListView.md` and `references/components/TreeView.md`.
- **Detect:** `TextField`, `ComboBox`, `Picker`, or other keyboard-interactive components rendered inside a `ListViewItem` / `TreeViewItem` while the parent `ListView` / `TreeView` does not have `keyboardNavigationBehavior="tab"`.
- **Severity:** High.

### Don't reinvent Card / CardView
- **Rule:** For grids of objects/files/products/people, use `CardView` with a variant (`AssetCard`, `UserCard`, `ProductCard`) or `Card` composed from `CardPreview`/`Content`/`Text`/`Footer`.
- **Detect:** hand-rolled card `<div>` / `<article>` grids reproducing card layout.
- **Severity:** Medium.

### Slot discipline
- **Rule:** Only pass `slot` values the parent documents, and don't inject wrapper elements where a component expects specific slot children.
- **Detect:** `<div>`/`<span>` wrapping collection-item children; `slot=` values the parent component doesn't define (e.g. `slot="close"` on an arbitrary button).
- **Severity:** Medium.
