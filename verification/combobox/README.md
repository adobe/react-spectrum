# ComboBox state

A real `useComboBoxState` mounted with `renderHook`, with Apple and Banana as the bounded collection, custom values disabled, and default filtering. Depth 4 covers selection followed by focus, typing, and blur, and the fully controlled equivalent.

```sh
yarn verify explore combobox
```

Actions: `Focus`, `Blur`, `Open`, `Close`, `Type` (the partial query `Ban`), `SelectA/B`, `Controlled`, `ControlledSelection`, `LoadStart`, and `LoadComplete`. `Controlled` is enabled only before other actions, selecting a host that accepts input updates and synchronizes input text in `onSelectionChange`. `ControlledSelection` supplies an external key/text update. Loading removes/restores the collection in a separate committed render; it models asynchronous item arrival, not transport or request cancellation.

| Invariant | Contract |
| --- | --- |
| `TypingNeverSelects` | Typing preserves the selected key or clears it; it cannot select a different non-null key. |
| `BlurMatchesSelection` | Immediately after blur, text equals the selected item's text, or empty text if the selection is absent/unavailable. |

A fully controlled host owns both values: refusing updates or supplying inconsistent key/text props cannot satisfy the blur invariant, and is outside this target's assumptions. Callbacks synchronize against the currently loaded collection. The observation includes committed state, focused key, control/loading mode, and the full bounded action history so private commit/filter refs are not inadvertently merged. Excluded: custom values, multiple selection, disabled items, IME events, DOM focus/event wiring, and network ordering.
