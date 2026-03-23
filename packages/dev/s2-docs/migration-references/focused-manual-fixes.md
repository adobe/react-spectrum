# Manual fixes after the codemod

## Known gaps to handle explicitly

- `@react-spectrum/toast` imports are not automatically migrated. Move them to S2, then re-check `ToastContainer` mounts and `ToastQueue` usages.
- v3 `Provider` and `defaultTheme` wrappers in apps and tests need human review. S2 does not use the v3 theme object model.

## Imports and packages

- Collapse v3 component imports onto `@react-spectrum/s2`.
- Keep using `@spectrum-icons/*` only when there is no S2 icon or illustration equivalent. Prefer `@react-spectrum/s2/icons/*` and `@react-spectrum/s2/illustrations` when possible.
- If the codemod leaves `TODO(S2-upgrade)` next to an icon or illustration import, pick the nearest S2 replacement manually.

## App and Provider setup

- Full-page apps usually add `import '@react-spectrum/s2/page.css';` at the entrypoint and no longer need a mandatory root Provider just to supply `theme={defaultTheme}`.
- Embedded sections still use S2 `Provider` with an explicit `background`.
- Keep or add S2 `Provider` only when locale, router integration, color-scheme/background overrides, or SSR `elementType="html"` behavior are needed.
- Preserve unrelated wrappers such as routing, store, analytics, i18n, and host-framework providers. Replace or remove only the React Spectrum-specific layer.

## Style and layout follow-ups

- Convert v3 style props and `UNSAFE_style` cases to the S2 style macro when possible.
- `Flex` and `Grid` often become `div` elements styled with the macro.
- Review `ClearSlots` and other direct `@react-spectrum/utils` imports manually. These are not part of the common S2 app surface.

## Dialogs and collections

- `DialogContainer` and `useDialogContainer` still exist in S2, but the import path changes and dismiss logic may need to move between `Dialog`, `DialogTrigger`, and `DialogContainer`.
- When `Item` survives the codemod, rename it based on its parent: `MenuItem`, `PickerItem`, `ComboBoxItem`, `ListBoxItem`, `Tab`, `TabPanel`, `Tag`, `Breadcrumb`, and similar.
- Preserve React `key` when mapping arrays, but ensure collection data items expose `id` when S2 expects it.
- Table and ListView migrations often need manual review for row headers, nested columns, and explicit item ids.

## Tests

- Replace v3 Provider/defaultTheme test wrappers with the minimal S2 `Provider` props the test actually needs, or remove the wrapper entirely if no S2 context is required.
- Update toast mocks and assertions that still reference `@react-spectrum/toast` or old dialog markup.
