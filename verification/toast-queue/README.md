# ToastQueue timers

[target.tsx](target.tsx) drives a real React Aria Components `ToastRegion`, its `Toast`s, and a `ToastQueue` together, so `useToast`'s mount/unmount effects and `useToastRegion`'s hover and focus handling run as they do in an app.

```sh
yarn verify explore toast-queue
yarn verify replay toast-queue --trace <path printed by explore>
```

## Actions and bounds

| Action | Effect |
| --- | --- |
| `add` | `queue.add()` with a 5000 ms timeout. At most 2 open toasts and 3 adds per run. |
| `close` | `queue.close()` on the newest visible toast. |
| `hover` / `unhover` | Pointer onto the region / onto a button outside it. The target's `check` fails the run if the region's `data-hovered` ever disagrees with where the pointer should be. |
| `focus` / `blur` | Focus the visible toast / the outside button. |
| `tick` | Advance fake time by 2500 ms. |
| `pauseAll` / `resumeAll` | The public queue methods. Only enabled while the region is neither hovered nor focused. |

`maxVisibleToasts` is 1, so adding a toast hides the previous one. Depth 7 takes about 2,400 runs and 900 distinct states in jsdom, roughly 10 seconds.

## Reference model and invariants

A toast should auto-close once it has been visible and unpaused for its full timeout. The region is paused while the pointer is over it, while focus is in it, or after `pauseAll()` until `resumeAll()`. A toast that becomes visible again starts a fresh timeout, matching `useToast`'s `timer.reset()` on mount.

| Invariant | Contract |
| --- | --- |
| `RegionPauseHoldsTimers` | No toast auto-closes while the pointer is over the region or focus is in it. |
| `PauseAllHoldsTimers` | No toast auto-closes between `pauseAll()` and `resumeAll()`. |
| `AutoCloseAfterTimeout` | An auto-close happens only for a visible toast, after exactly its timeout of unpaused time. |
| `NoOverdueToast` | A visible toast in an unpaused region never outlives its timeout. |
| `VisibleToastsMatchReference` | `visibleToasts` and the rendered toasts match the reference order. |

## Assumptions and open questions

- Calling `resumeAll()` when timers are already running is expected to be harmless, and `pauseAll()` is expected to hold every visible toast.
- The interplay between `pauseAll()` and hover/focus (for example, unhovering while paused by the app) is unspecified, so those actions are kept apart.
- Restarting a toast's timeout when it becomes visible again is assumed intended.
- When the last toast closes under the pointer, the pointer moves off. Whether a region that remounts under a stationary pointer counts as hovered depends on the browser.
- Interaction modality is fixed to `pointer` at setup. In Chromium a programmatic focus can switch modality to `virtual`, which changes where `useToastRegion` moves focus when a focused toast is removed, so traces involving `focus` may diverge between jsdom and Chromium.
- `close` is programmatic. Clicking the close button would also move the pointer into the region.
