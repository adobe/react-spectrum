# usePress pointer lifecycle

[target.tsx](target.tsx) drives the real `usePress` hook on a `div` with one press by pointer 1, an unrelated touch by pointer 2, clicks, the 80 ms fallback timer, disable, and unmount.

```sh
yarn verify explore use-press
yarn verify replay use-press --trace <path printed by explore>
```

## Actions and bounds

| Action | Effect |
| --- | --- |
| `PointerDown` / `PointerUp` / `PointerCancel` | Pointer 1 (a non-virtual touch, `pointerId` 1) on the target, or on `document.body` after unmount. One press per run. |
| `NativeClick` | The browser's `detail: 1` click on the target after pointerup. At most once. |
| `OtherClick` | A click on another element while pointer 1 is down or up, e.g. a second finger's tap. |
| `Tick` | Advance fake time by 100 ms, past the fallback. |
| `OtherPointerDown` / `OtherPointerCancel` | Pointer 2 touches and cancels on a surface outside the hook. In Chromium these are CDP touches, so the browser generates the pointer events and assigns their ids. |
| `Disable` / `Enable` | Rerender with `isDisabled`. |
| `Unmount` | Unmount the hook. |

Depth 8 takes about 480 runs and 120 distinct states in jsdom, under a second.

## Reference model and invariants

Pointer 1's press is `live` from pointerdown until it resolves. It is `activated` by a native click, or by the fallback when time passes after pointerup without one (iOS and Android skip the click after a long press). It is `canceled` by its own pointercancel, disable, or unmount. Nothing pointer 2 or a click elsewhere does should change it.

| Invariant | Contract |
| --- | --- |
| `PointerOwnership` | While the press is live, the hook stays pressed. Other pointers cannot end it. |
| `ActivationUnique` | One press produces at most one `onPress`. |
| `CancellationSafe` | A canceled press never produces `onPress`. |
| `NoLostActivation` | An activated press produces exactly one `onPress`. |
| `LifecycleBalanced` | `pressend` never outnumbers `pressstart`, and while mounted, starts minus ends equals the pressed state. Unmount does not promise an end. |
| `CleanupComplete` | Once the press resolves or the hook unmounts, no fallback timer or `pointerup`/`pointercancel`/`click` document listener remains. |

## Assumptions and exclusions

- Pointer 1 stays over the target and is not virtual; native clicks have `detail: 1`. Its events are dispatched directly in both environments; only pointer 2 is browser-generated in Chromium.
- User callbacks are passive: no state changes, unmounts, or events from inside `onPress*`.
- `OtherClick` assumes a click elsewhere should not affect the press. The fallback treats any document click as the target's own click being stopped before it reached the hook, so whether this is a bug or intended needs a decision.
- Excluded: keyboard and Meta handling, virtual clicks, pointer leave/reenter and `shouldCancelOnPointerExit`, multiple presses, mouse-specific behavior, portals, Shadow DOM, links, nested pressables, text selection, and focus side effects.
