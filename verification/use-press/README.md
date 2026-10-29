# usePress pointer lifecycle

[target.tsx](target.tsx) drives the real `usePress` hook on two `div` pressables with one press by pointer 1 and a second hook receiving touches by pointer 2, clicks, the 80 ms fallback timer, disable, and unmount.

```sh
yarn verify conform use-press
yarn verify check use-press --depth 20  # replays each counterexample in Chromium
yarn verify replay use-press --headed --trace <path printed by check>
yarn verify explore use-press
```

## Actions and bounds

| Action | Effect |
| --- | --- |
| `PointerDown` / `PointerUp` / `PointerCancel` | Pointer 1 (a non-virtual touch, `pointerId` 1) on the target, or on `document.body` after unmount. One press per run. |
| `NativeClick` | The browser's `detail: 1` click on the target after pointerup. At most once. |
| `OtherClick` | A click on another element while pointer 1 is down or up, e.g. a second finger's tap. |
| `Tick` | Advance fake time by 100 ms, past the fallback. |
| `OtherPointerDown` / `OtherPointerCancel` | Pointer 2 touches and cancels on the second hook. In Chromium these are CDP touches, so the browser generates the pointer events and assigns their ids. |
| `Disable` / `Enable` | Rerender with `isDisabled`. |
| `Unmount` / `OtherUnmount` | Independently unmount either hook. |
| `PointerLeave` / `PointerEnter` | Move pointer 1 out and back while held; release outside cancels the attempt. |

Default depth is 8. The second hook has its own pressed state and start/end counts; document listeners are observed across both hooks.

The hook records a click for the fallback in a closure, so `observe` includes `fallbackClicked`: whether a click reached the fallback's capturing listener while its timer is pending. Without it, a click before pointerup (which the fallback never sees) and one after it would be merged, and only one of them would be explored further.

## Reference model and invariants

Pointer 1's press is `live` from pointerdown until it resolves. It is `activated` by a native click, or by the fallback when time passes after pointerup without one (iOS and Android skip the click after a long press). It is `canceled` by its own pointercancel, disable, or unmount. Nothing pointer 2 or a click elsewhere does should change it. Leaving ends the visible pressed state; re-entering starts it again. Releasing outside cancels the attempt.

| Invariant | Contract |
| --- | --- |
| `PointerOwnership` | While the press is live and the pointer is inside, the hook stays pressed. Other pointers cannot end it. |
| `ActivationUnique` | One press produces at most one `onPress`. |
| `CancellationSafe` | A canceled press never produces `onPress`. |
| `NoLostActivation` | A release inside, followed by a native click or elapsed fallback delay, produces exactly one `onPress` unless canceled. This expectation is computed from input state, independently of callback counts. |
| `LifecycleBalanced` | `pressend` never outnumbers `pressstart`, and while mounted, starts minus ends equals the pressed state. Unmount does not promise an end. |
| `CleanupComplete` | Once the primary press resolves/unmounts and no second press is held, no fallback timer or `pointerup`/`pointercancel`/`click` document listener remains. |

## Model

[UsePress.tla](UsePress.tla) models the same actions with the same guards and reference outcome. `s.h` follows the primary hook's state (including internal held state separately from visible press-start state), and the `other*` fields track the second hook in `usePress.ts`; `Stop` is `triggerPressEnd` followed by `cancel`. It models the current code, bugs included: `OtherPointerCancel` ends the press because the document `pointercancel` listener does not compare `pointerId`. When the code changes, `conform` reports where the model is now wrong, and the model should be updated to match before `check` results are trusted.

`View` abstracts timers and listeners to whether any exist. The model's state includes `step`, so its distinct-state count grows with depth even though the reachable hook states are exhausted by depth 8.

## Assumptions and exclusions

- Pointer 1 is not virtual; native clicks have `detail: 1`. Its events are dispatched directly in both environments; only pointer 2 is browser-generated in Chromium.
- User callbacks are passive: no state changes, unmounts, or events from inside `onPress*`.
- `OtherClick` assumes a click elsewhere should not affect the press. The fallback treats any document click as the target's own click being stopped before it reached the hook, so whether this is a bug or intended needs a decision.
- Excluded: keyboard and Meta handling, virtual clicks, `shouldCancelOnPointerExit`, repeated primary presses, mouse-specific behavior, portals, Shadow DOM, links, nested pressables, text selection, and focus side effects.
