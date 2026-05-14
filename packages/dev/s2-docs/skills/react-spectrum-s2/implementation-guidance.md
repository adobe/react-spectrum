## Imports

Use subpath imports matching the documentation — don't import from the package barrel `'@react-spectrum/s2'`:

```tsx
import {Button} from '@react-spectrum/s2/Button';
import {Card, CardPreview, Image, Content, Text, Footer} from '@react-spectrum/s2/Card';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Folder from '@react-spectrum/s2/icons/Folder';
import CloudUpload from '@react-spectrum/s2/illustrations/gradient/generic2/CloudUpload';
```

Common types and list-data hooks are re-exported from `@react-spectrum/s2` — don't pull them from `react-aria-components`, `react-stately`, or `@react-types/*`:

```tsx
import type {Key, Selection, SortDescriptor, PressEvent, RangeValue, DateValue, DateRange, TimeValue, RouterConfig} from '@react-spectrum/s2';
import {useListData, useTreeData, useAsyncList} from '@react-spectrum/s2';
```

### Use the typed Item for each collection

Each S2 collection component has its own item export — don't import a generic `Item` from `react-aria-components`. `Menu` → `MenuItem`/`MenuSection`; `Picker` → `PickerItem`/`PickerSection`; `ComboBox` → `ComboBoxItem`/`ComboBoxSection`; `ListView` → `ListViewItem`; `TreeView` → `TreeViewItem` (with `TreeViewItemContent`); `TableView` → `Row`/`Column`/`Cell`/`TableHeader`/`TableBody`; `SegmentedControl` → `SegmentedControlItem`; `TagGroup` → `Tag`; `Breadcrumbs` → `Breadcrumb`; `Accordion` → `AccordionItem` (with `AccordionItemHeader`/`AccordionItemTitle`/`AccordionItemPanel`).

## Styling

Use S2 components and the S2 `style` macro as the default styling approach.

- Prefer S2 components first; use their `styles` prop only for layout-style properties.
- For generic layouts (flex, grid, etc.), use native HTML elements with the `style` macro.
- Avoid using Tailwind, `radix-ui`, `shadcn/ui`, or any other third-party design system in S2 implementations.
- IMPORTANT: avoid using `UNSAFE_style` and `UNSAFE_className`.

S2 components take a `styles` prop (plural) restricted to layout properties:

- `margin`, `marginStart`, `marginEnd`, `marginTop`, `marginBottom`, `marginX`, `marginY`
- `width`, `minWidth`, `maxWidth`
- `flexGrow`, `flexShrink`, `flexBasis`
- `justifySelf`, `alignSelf`, `order`
- `gridArea`, `gridRow`, `gridRowStart`, `gridRowEnd`, `gridColumn`, `gridColumnStart`, `gridColumnEnd`
- `position`, `zIndex`, `top`, `bottom`, `inset`, `insetX`, `insetY`, `insetStart`, `insetEnd`
- `visibility`
- `height`, `minHeight`, `maxHeight` (only in specific components without an intrinsic height)

```tsx
<Button styles={style({marginStart: 8})}>Edit</Button>
```

Native HTML elements and React Aria Components take `className={style(...)}` — there the macro is unrestricted:

```tsx
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Checkbox} from 'react-aria-components';

<div className={style({display: 'grid', gap: 12, padding: 16, backgroundColor: 'gray-75'})}>
  <h2 className={style({font: 'heading-sm'})}>Preferences</h2>
  <Checkbox
    className={style({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: {
        default: 'neutral',
        isSelected: 'blue-900'
      }
    })}
  />
</div>
```

Spacing values follow a 4px grid (`0`, `2`, `4`, `8`, `12`, `16`, …).

### One `style({...})` call per element

Express runtime variation **inside** a single `style({...})` call using its conditional system, not by producing multiple style strings and combining them on the element:

- Conditional keys can be nested objects (`variant: {primary: ..., secondary: ...}`) or boolean conditions starting with `is`/`allows` (`isSelected`, `allowsRemoving`, `isHovered`). The macro returns a function — call it with the runtime values: `styles({variant, isSelected})`.
- Don't concatenate macro results via template literals, `clsx`, `classnames`, or string spaces — the class names encode style precedence and concatenation breaks it. Use `mergeStyles` if you genuinely need to merge two separate style strings at runtime.
- Don't combine `className={style({...})}` (or `styles`) with an inline `style={{...}}` on the same element. The inline prop bypasses tokens and breaks layer ordering. Use the inline `style` prop only for values that genuinely can't be known at build time (e.g. a drag-handler position).

```tsx
// ❌ Two near-identical style calls combined at the call site.
const base = style({padding: 8, backgroundColor: 'gray-100'});
const active = style({backgroundColor: 'accent'});
<div className={`${base} ${isActive ? active : ''}`} />

// ✅ One call with a runtime condition.
const card = style({
  padding: 8,
  backgroundColor: {
    default: 'gray-100',
    isActive: 'accent'
  }
});
<div className={card({isActive})} />
```

```tsx
// ❌ Inline style alongside the macro.
<div className={style({display: 'grid', gap: 12})} style={{gridTemplateColumns: '1fr 2fr'}} />

// ✅ Everything in one macro call.
<div className={style({display: 'grid', gap: 12, gridTemplateColumns: '1fr 2fr'})} />
```

If a value seems impossible to express in the macro, check the [Style Macro]({{guidesBase}}style-macro.md) reference before falling back to inline styles — most CSS properties (grid placement, overflow, position, sizing, display) are supported.

### Style macro values are tokens, not raw CSS

The macro is a typed token system. Raw CSS strings fail type-checking and push the agent toward inline-style workarounds. Common confusions:

- `width`/`height`/`maxWidth`/`maxHeight`/`minWidth`/`minHeight`: `'full'` (not `'100%'`), `'screen'`, or a number.
- `alignItems`/`justifyContent`/`alignSelf`/`justifySelf`: `'start'` / `'center'` / `'end'` / `'space-between'` (not `'flex-start'` / `'flex-end'`).
- Spacing (`margin`, `padding`, `gap`, `top`, etc.): numeric pixels on the 4px grid, not strings like `'1rem'`.
- `borderRadius`: `'none'`, `'sm'`, `'default'`, `'lg'`, `'xl'`, `'full'`, `'pill'`. There is no `'md'`.
- Colors: token names like `'gray-100'`, `'accent'`, `'neutral'`, `'neutral-subdued'` — not hex, `rgb()`, or `var(--…)`.
- Fonts: `font: 'heading-xl'`, `font: 'body-sm'`, etc. — not CSS font shorthand.
- Use **logical** sides — `paddingStart`/`paddingEnd`/`marginStart`/`marginEnd`/`insetStart`/`insetEnd`/`borderStartStartRadius` — not physical `paddingLeft`/`paddingRight`/`marginLeft`/`marginRight`/`borderTopLeftRadius`. The logical variants flip correctly under RTL.

Prefer **semantic** color tokens when the color carries meaning: `'accent'`, `'neutral'`, `'negative'`, `'positive'`, `'informative'`, `'notice'` for errors/success/info/warning/brand — not `'red-…'`/`'green-…'`/`'blue-…'`/`'orange-…'`. Reach for raw hue tokens only for decorative or chart colors.


### Don't restate default prop values

`variant="primary"` on `Button`, `size="M"` on most components, `density="regular"` on collections — setting a prop to its default is noise. Omit it.

### Built-in macro utilities

`@react-spectrum/s2/style` exports helpers — use them instead of rebuilding by hand:

- `focusRing()` — Spectrum focus outline (color, width, offset, `isFocusVisible`, forced colors). Spread into a `style({...})` call; the call must receive `isFocusVisible` at runtime. RAC components pass this as a render prop to className, or you can use the `useFocusRing` hook.

  ```tsx
  import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
  import {Button} from 'react-aria-components';

  const tile = style({
    ...focusRing(),
    borderRadius: 'lg',
    padding: 8
  });
  <Button className={tile}>…</Button>
  ```
- `lightDark(light, dark)` — a value that adapts to the current color scheme. Use this for one-off light/dark differences.
- `baseColor(token)` / `color(token)` — produce a color value for custom CSS variables.
- `space(px)` / `fontRelative(px)` — escape hatches for non-grid pixel values (rare).
- `pressScale(scale)` — press-state scale transforms on custom interactive elements.

See [Styling]({{guidesBase}}styling.md) and [Style Macro]({{guidesBase}}style-macro.md) for the full reference. When building a custom component on top of React Aria Components with the `style` macro, see [Creating Custom Components]({{guidesBase}}creating-custom-components.md) for best practices. If you hit a `style` macro import error, see the 'Framework setup' section of [Getting started]({{guidesBase}}getting-started.md).

## Responsive design

Layouts should adapt to viewport size. The `style` macro provides built-in breakpoint conditions on layout properties — use them rather than producing a fixed-width design.

Breakpoints (min-width, mobile-first): `xs` 480, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. The `default` value applies on the smallest viewport; each breakpoint takes over above its threshold.

```tsx
const grid = style({
  display: 'grid',
  gridTemplateColumns: {
    default: '1fr',
    sm: 'repeat(2, 1fr)',
    lg: 'repeat(3, 1fr)',
    xl: 'repeat(4, 1fr)'
  },
  gap: {default: 12, md: 16, lg: 24},
  padding: {default: 16, md: 24, lg: 32}
});
```

## Component composition

S2 components define their own internal DOM and slot structure. Don't inject wrapper elements where the component expects a specific child API.

- Don't wrap collection-item children in a `<div>`, `<span>`, `<section>`, etc. Use the slot components the component documents:
  - `TreeView` rows: `TreeViewItemContent`, not a `div`.
  - `ListView`, `Menu`, `Picker`, `ComboBox`, `Tabs`, etc.: `Text` (with `slot="label"`/`slot="description"` where relevant) plus documented icon/image/avatar slots.
  - `Card`, `AssetCard`, `UserCard`, `ProductCard`: prescribed slot components (`CardPreview`, `Image`, `Content`, `Text`, `Footer`, etc.).
- Extra layout inside a slot goes **inside** the slot component, not around it.
- Before composing a component, read the **API** section of its docs page — it lists expected child components, slots, and constraints. The docs examples are the source of truth.

### Buttons with text and icon

`Button`/`ActionButton`/`LinkButton` with **both** an icon and a text label require the label to be wrapped in `<Text>` — plain string children next to an icon render incorrectly. Icon-only or text-only children are fine as-is (icon-only needs `aria-label`).

`Text` is re-exported from each button's own subpath — import it alongside the button component:

```tsx
import {ActionButton, Text} from '@react-spectrum/s2/ActionButton';
import Download from '@react-spectrum/s2/icons/Download';

// ✅ Icon + text — label in <Text>, no slot attribute.
<ActionButton>
  <Download />
  <Text>Download</Text>
</ActionButton>

// ✅ Icon only — aria-label required.
<ActionButton aria-label="Download">
  <Download />
</ActionButton>
```

### Exceptions: components that accept arbitrary content

A few components are explicitly free-form: `TableView` `Cell`; Dialog/Popover bodies; `Disclosure`/`Accordion` panels. Compose these with native elements + the `style` macro like any page section. For any other component, defer to slot components.

### Only use `slot` values the component documents

Only pass `slot` when the parent's docs name that slot.

- Don't put `slot="close"` on a `Button` inside a `Dialog` `ButtonGroup` — the dialog handles its own close; `slot="close"` on something else causes the parent context to hide it.
- Don't sprinkle `slot="label"`/`slot="description"` on `Text` outside a component that exposes those slots.

### Don't reinvent `Card` / `CardView`

For grids of objects/files/products/people, use `CardView` plus a prescribed variant (`AssetCard`, `UserCard`, `ProductCard`) or `Card` composed with `CardPreview`/`Content`/`Text`/`Footer`. Don't emit hand-rolled card divs or `<article>` wrappers. Build a custom card with the documented slot components only when no variant fits.

### Collection components handle their own scrolling

`TableView`, `ListView`, `TreeView`, `CardView`, `Menu`, and `ListBox` virtualize and scroll internally. Don't wrap them in an `overflow`/`overflowY`/`overflowX` container — that produces a nested scroller and breaks keyboard navigation. Give the collection a bounded `height`/`maxHeight` via its `styles` prop instead.

```tsx
// ❌ Nested scroller around CardView.
<div className={style({overflowY: 'auto', height: 480})}><CardView>…</CardView></div>

// ✅ Let the collection size itself and scroll internally.
<CardView styles={style({height: 480})}>…</CardView>
```

## Collections

Collection components (`Menu`, `Picker`, `ComboBox`, `ListView`, `TreeView`, `TableView`, `CardView`, `SegmentedControl`, `TagGroup`, `Breadcrumbs`, etc.) share a small set of conventions. Getting them wrong causes runtime warnings, broken selection, and broken keyboard navigation.

### Every item needs an `id`

Items use `id` for selection, `onAction(key)`, sort, expansion, and React reconciliation. Static items get a literal `id`; dynamic items get `id={item.something}` inside the render function. When using `.map`, set **both** `id` and React's `key`:

```tsx
// ✅ Dynamic collection with render function — id only.
<ListView aria-label="Files" items={files}>
  {item => <ListViewItem id={item.id}>{item.name}</ListViewItem>}
</ListView>

// ✅ Dynamic collection using array.map — id AND key.
<ListView aria-label="Files">
  {files.map(item => (
    <ListViewItem key={item.id} id={item.id}>{item.name}</ListViewItem>
  ))}
</ListView>
```

### `textValue` when item children aren't plain text

If an item's children include anything other than a plain string (icon, avatar, multi-slot layout, custom component), set `textValue="..."`. The collection uses it for screen-reader announcements, typeahead, and drag-and-drop labels. Omitting it produces a runtime warning.

```tsx
<ListViewItem id={item.id} textValue={item.name}>
  <FileIcon />
  <Text slot="label">{item.name}</Text>
  <Text slot="description">{item.size}</Text>
</ListViewItem>
```

### `aria-label` on the collection container

Every collection (`ListView`, `TableView`, `CardView`, `TreeView`, `Menu`, `ListBox`, `GridList`, `TagGroup`, `Breadcrumbs`) needs an accessible name — `aria-label="..."` or `aria-labelledby="..."`.

### Empty and loading states are built in

- Empty state: pass `renderEmptyState` returning an `IllustratedMessage`. Don't conditionally swap the whole collection for a custom empty `div`.
- Async data: use `useAsyncList` (or the user's preferred data fetching library) plus the collection's `loadingState`/`onLoadMore` props. Don't render a separate spinner above the collection.

### Bulk actions with ActionBar

Use the `renderActionBar` prop on a collection to show an `ActionBar` when items are selected. The collection passes the current `selectedKeys` to the callback and wires up count and clear-selection automatically — don't pass `selectedItemCount` or `onClearSelection` to `ActionBar` manually.

## Typography

`Text`, `Heading`, and `Content` are **slot components** — they only produce the right typography inside an S2 component that provides their slot context (cards, dialogs, lists, pickers, menus, tabs, etc.). Outside those contexts, use a native HTML element with the `style` macro.

```tsx
// ✅ Standalone heading.
<h1 className={style({font: 'heading-xl'})}>Project overview</h1>

// ❌ Standalone <Heading> with no slot context.
<Heading className={style({font: 'heading-xl'})}>Project overview</Heading>
```

The `font` shorthand sets `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, **and** a default `color`. Don't add a redundant `color` next to a `font` value unless you actually want to override the default.

### Font scales — pick by role, not size

- `heading-*` — page/section headings (`h1`–`h6`); tracks the document outline.
- `title-*` — titles inside components (card titles, dialog titles, tile labels) that aren't part of the page outline.
- `body-*` — running prose and long-form copy.
- `detail-*` — supporting metadata, captions, timestamps, footnotes.
- `ui-*` — interactive UI text: buttons, menu items, form labels, table cells.
- `code-*` — inline or block code (monospace family).

Sizes are `-xs`, `-sm`, default (no suffix), `-lg`, `-xl`, `-2xl`, `-3xl` (not every family has every size — see the [Style Macro]({{guidesBase}}style-macro.md) reference).

## Provider scope

Mount a single `Provider` at the application root (inside `body`, around the top-level layout).

- Don't wrap `<html>`, `<head>`, or `<body>` with `Provider`.
- Don't add a `Provider` around a Dialog, Popover, Toast, or other portaled overlay — they inherit through context.
- Don't stack `Provider`s. Nesting is only correct when scoping a different `locale`/`router`/`colorScheme` to a subtree, which is rare.
- Let the `Provider` manage `colorScheme`. Don't hard-code `colorScheme="light"` or `colorScheme="dark"` to make a screenshot match — for one-off light/dark color differences, use `lightDark()`.

If your app uses `ToastQueue`, place a single `<ToastContainer />` as a sibling of the root layout, inside `Provider`.

```tsx
import {Provider} from '@react-spectrum/s2/Provider';
import {ToastContainer, ToastQueue} from '@react-spectrum/s2/Toast';

function App() {
  return (
    <Provider>
      <ToastContainer />
      <YourApp />
    </Provider>
  );
}

// Anywhere in the tree:
ToastQueue.positive('Saved!', {timeout: 5000});
```

## Form fields

S2 form fields (`TextField`, `TextArea`, `NumberField`, `SearchField`, `Picker`, `ComboBox`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `Slider`, `RangeSlider`, `ColorField`, `DateField`, `DatePicker`, `TimeField`, `DateRangePicker`, etc.) render their own label, description, error message, and required indicator. Pass those as props on the field — don't wrap the field in a `<label>`/`<p>`/`<div>` to attach them.

- `label="..."` — visible label.
- `description="..."` — help text.
- `errorMessage="..."` (or a function) — validation error; pair with `isInvalid` / `validate` / `validationBehavior`.
- `isRequired` — marks required and shows the indicator.
- `necessityIndicator="icon" | "label"` — how required/optional is shown.
- `contextualHelp={<ContextualHelp>…</ContextualHelp>}` — help popover next to the label.
- `aria-label="..."` — when no visible label is needed.

```tsx
<TextField type="email" label="Email" description="We'll never share it." isRequired />
```

Group related fields with `Form`. It handles label alignment (`labelPosition`, `labelAlign`), default sizes, the required indicator, and submission/validation flow. `Form` is not limited to a single vertical column — wrap subsets of fields in a styled native element to build multi-column or grid layouts.

## Icons

Use S2's built-in icons and illustrations.

- Import icons from `@react-spectrum/s2/icons/...`, illustrations from `@react-spectrum/s2/illustrations/...`.
- Don't introduce third-party icon libraries (`lucide-react`, `phosphor-icons`, `heroicons`, etc.).
- Look up icons in the [Icons]({{componentsBase}}icons.md) catalog (or the S2 MCP `search_s2_icons` tool if available). The catalog is the source of truth.
- Don't grep `node_modules` or the S2 source — slow, often misses the intended name, finds stale/internal matches.
- Search the **full** catalog; don't settle for a partial name match. `Heart` ≠ `HeartBroken`; `Edit` ≠ `EditIn`.

```tsx
import AlertTriangle from '@react-spectrum/s2/icons/AlertTriangle';
import DropToUpload from '@react-spectrum/s2/illustrations/gradient/generic1/DropToUpload';
import Warning from '@react-spectrum/s2/illustrations/linear/Warning';
```

Illustrations come in Gradient (Generic 1 / Generic 2 variants) and Linear styles.

Commonly used icons: `AlertTriangle`, `Close`, `ChevronDown`, `Checkmark`, `Preview`, `CheckmarkCircle`, `Add`, `ChevronUp`, `Data`, `FileText`, `InfoCircle`, `OpenIn`, `Chat`, `Code`.

See [Icons]({{componentsBase}}icons.md) and [Illustrations]({{componentsBase}}illustrations.md) for the full catalogs.

## Verify before declaring done

Before reporting the task as complete, exercise the project's own toolchain. The `style` macro performs build-time checks that the editor alone won't show.

- **Typecheck.** Run the project's typecheck (`tsc --noEmit`, `tsc -b`, etc.). Fix everything — wrong `size` values, missing required props, raw CSS in the macro all surface here.
- **Build or dev server.** Run at least once. The macro's "cannot statically evaluate" error means a value inside `style({...})` depends on something non-literal; refactor to use runtime conditions or the runtime style function.
- **Runtime warnings.** If you can render the page, check the console for missing `aria-label`/`textValue`, deprecated props, etc. Treat these as failures.

