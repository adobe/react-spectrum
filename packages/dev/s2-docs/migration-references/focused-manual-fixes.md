# Manual fixes after the codemod

## Icons and illustrations

- If the codemod leaves `TODO(S2-upgrade)` next to an icon or illustration import, pick the nearest S2 replacement manually.

## Layout components

`Flex`, `Grid`, `View`, and `Well` are not part of S2. These should be updated to `div` elements styled with the macro.

### Flex example

Before:

```jsx
<Flex direction="column">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Flex>
```

After:

```jsx
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div className={style({display: 'flex', flexDirection: 'column'})}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Grid example

Before:

```jsx
<Grid justifyContent="center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

After:

```jsx
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div className={style({display: 'grid', justifyContent: 'center'})}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### View example

Before:

```jsx
<View>
  Content
</View>
```

After:

```jsx
<div>
  Content
</div>
```

### Well example

Before:

```jsx
<Well>
  Content
</Well>
```

After:

```jsx
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div className={style({
  display: 'block',
  textAlign: 'start',
  padding: 16,
  minWidth: 160,
  marginTop: 4,
  borderWidth: 1,
  borderRadius: 'sm',
  borderStyle: 'solid',
  borderColor: 'transparent-black-75',
  font: 'body-sm'
})}>
  Content
</div>
```

## UNSAFE_style and UNSAFE_className

Move `UNSAFE_style` usage to the S2 style macro when possible.

Move `UNSAFE_className` usage to the S2 style macro when possible.

Reference the S2 styling docs to see the supported CSS properties.

## Dialogs

- `DialogContainer` and `useDialogContainer` still exist in S2, but the dismiss logic may need to move between `Dialog`, `DialogTrigger`, and `DialogContainer`. See the S2 Dialog documentation for more details.

## Collections

- When `Item` survives the codemod, rename it based on its parent component:

  | Parent component | v3 child | S2 child |
  |---|---|---|
  | Menu / ActionMenu | Item | MenuItem |
  | Picker | Item | PickerItem |
  | ComboBox | Item | ComboBoxItem |
  | Tabs | Item | Tab / TabPanel |
  | TagGroup | Item | Tag |
  | Breadcrumbs | Item | Breadcrumb |

- Preserve React `key` when mapping arrays, but ensure collection data items expose `id` when S2 expects it. See the S2 Collections documentation for more details.
- Table and ListView migrations often need manual review for row headers, nested columns, and explicit item ids.

## Toast migration

- Move `ToastContainer` and `ToastQueue` imports from `@react-spectrum/toast` to `@react-spectrum/s2`.
- Keep a shared `ToastContainer` mounted near the app root or test harness, then update all queue calls to use the S2 import path.
- S2 supports `ToastQueue.neutral`, `positive`, `negative`, and `info`.
- Re-check options such as `timeout`, `actionLabel`, `onAction`, `shouldCloseOnAction`, and `onClose` after the import move.
- The queue methods still return a close function. Keep programmatic dismissal logic when the existing UX depends on it.
- Search for every `ToastContainer` mount and every `ToastQueue` usage after moving imports. Shared app roots, secondary entrypoints, and test harnesses are easy to miss.
