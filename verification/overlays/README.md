# Overlay stack and shared cleanup

Two real `useOverlay`/`usePreventScroll` instances, each acquiring `ariaHideOutside` while open. `Open0/1`, `Close0/1`, and `Unmount0/1` run in any order. `Nested` selects a nested DOM arrangement before opening; the default arrangement is side by side. Unmounting a nested parent also unmounts its child. Closed overlays remain mounted to exercise effect cleanup separately from component disposal. Default depth: 6.

```sh
yarn verify explore overlays
yarn verify explore overlays --environment chromium
```

| Invariant | Contract |
| --- | --- |
| `CountsMatch` | The real overlay stack, hiding-observer stack, and scroll-lock count equal the number of open instances. |
| `ClosedRestoresDocument` | After all close, the root style is restored, content is not hidden/inert, and retained overlay nodes (including detached ones) have zero hiding reference counts. |
| `OnlyTopHandlesEscape` | Escape dispatched from the last-opened overlay invokes exactly its callback, once. |

Callbacks record a close request without applying it; explicit `Close` actions commit the controlled state update. This keeps callback routing observable independently of React batching. Stack order, both instances' lifecycle, hiding reference counts, attributes, and root style are in the observation.

jsdom exercises the `aria-hidden` fallback; Chromium also exercises native `inert`. This covers the standard desktop scroll lock, not iOS touch scrolling, portals, Shadow DOM, outside-pointer dismissal, pre-existing hidden content, or application mutations during callbacks. Private state is read through verification-only probes; production exports are unchanged.
