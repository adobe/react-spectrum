# ToastQueue timers

[target.tsx](target.tsx) drives a real React Aria Components `ToastRegion`, its `Toast`s, and a `ToastQueue` together, so `useToast`'s mount/unmount effects and `useToastRegion`'s hover and focus handling run as they do in an app.

```sh
yarn verify conform toast-queue
yarn verify cover toast-queue
yarn verify check toast-queue --depth 11  # replays each counterexample in Chromium
yarn verify replay toast-queue --headed --trace <path printed by check>
yarn verify explore toast-queue
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

`maxVisibleToasts` is 1, so adding a toast hides the previous one. Depth 7 takes about 2,900 runs and 1,200 distinct states in jsdom, roughly 13 seconds. jsdom's `Selection` schedules a 0 ms timer on every `focus()`, so the target runs zero-delay timers after setup and each action, as a browser would; `pendingTimers` then lists only toast timeouts.

`pendingTimers` is how long until each pending timeout fires, not just how many there are. `resume()` on a running timer leaves its old timeout pending with nothing referencing it, so two runs can have the same toasts and the same number of timeouts but different deadlines. The target wraps `setTimeout` and `clearTimeout` to see every timeout, and `check` fails the run if that tracking misses one.

## Reference model and invariants

A toast should auto-close once it has been visible and unpaused for its full timeout. The region is paused while the pointer is over it, while focus is in it, or after `pauseAll()` until `resumeAll()`. A toast that becomes visible again starts a fresh timeout, matching `useToast`'s `timer.reset()` on mount.

| Invariant | Contract |
| --- | --- |
| `RegionPauseHoldsTimers` | No toast auto-closes while the pointer is over the region or focus is in it. |
| `PauseAllHoldsTimers` | No toast auto-closes between `pauseAll()` and `resumeAll()`. |
| `AutoCloseAfterTimeout` | An auto-close happens only for a visible toast, after exactly its timeout of unpaused time. |
| `FocusNotStolen` | Focus enters the region only through the `focus` action; adding, closing, timing out, or hovering never moves focus into it. |
| `NoOverdueToast` | A visible toast in an unpaused region never outlives its timeout. |
| `VisibleToastsMatchReference` | `visibleToasts` and the rendered toasts match the reference order. |

`useToastRegion` keeps its focus state in refs that `observe` cannot read, so two runs can look identical while the region's saved focus differs. The observation includes `focusEntered`, whether focus has been in the region during the run, so the explorer does not merge those states; the model tracks the refs themselves.

## Model

[ToastQueue.tla](ToastQueue.tla) counts time in 2500 ms ticks (the timeout is two). Besides the reference timing and the input state, it follows:

- `Timer`: each toast's tracked timeout, its remaining time, and every pending timeout, including the untracked ones `resume()` leaves running when called on a running timer. A firing timeout clears the timer's tracked id even if it was not the tracked one.
- `useToast`: React's passive effects pause removed toasts, then reset newly visible ones.
- `useToastRegion`: `updateTimers` uses the region's `isFocused` ref, not where focus is. The model tracks where focus is (the outside button, `<body>`, or a toast) separately from the region's `isFocused`, `lastFocused`, `focusedToast`, and `toasts` refs. Removing a focused toast leaves focus on `<body>` without a blur event; `useFocusWithin` reports a blur on any later `focusin` outside the region, but the region's own `onBlur` does not run. The layout effect that moves focus after a focused toast is removed, and the passive effect that restores `lastFocused` once no toasts are visible, follow the code's branches for pointer modality.

`View` covers everything the target observes except the region's `data-hovered`, which `check` already ties to the pointer. The model's state includes `step`, so its state count grows with depth: checking takes about 0.4 s at depth 7, 5 s at depth 9, and 30 s at depth 11.

## Assumptions and open questions

- Calling `resumeAll()` when timers are already running is expected to be harmless, and `pauseAll()` is expected to hold every visible toast.
- The interplay between `pauseAll()` and hover/focus (for example, unhovering while paused by the app) is unspecified, so those actions are kept apart.
- Restarting a toast's timeout when it becomes visible again is assumed intended.
- When the last toast closes under the pointer, the pointer moves off. Whether a region that remounts under a stationary pointer counts as hovered depends on the browser.
- Interaction modality is fixed to `pointer` at setup, and the model only covers that branch of `useToastRegion`'s focus handling. In Chromium a programmatic focus can switch modality to `virtual`, which changes where the region moves focus when a focused toast is removed, so traces involving `focus` may diverge between jsdom and Chromium.
- `close` is programmatic. Clicking the close button would also move the pointer into the region.
