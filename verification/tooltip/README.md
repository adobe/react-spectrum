# Tooltip warmup and cooldown

Two real `useTooltipTriggerState` instances mounted with `renderHook`. `Hover0/1` calls delayed `open`, `Focus0/1` calls immediate `open`, `Leave0/1` calls delayed `close`, `Unmount0/1` disposes an instance, and `Tick` advances 500 ms. The default warmup is 1500 ms and cooldown is 500 ms. Depth 5 (at most 50,000 runs) reaches both a cold warmup and a subsequent instant open.

```sh
yarn verify explore tooltip
yarn verify replay tooltip --trace <printed trace path>
```

| Invariant | Contract |
| --- | --- |
| `AtMostOneOpen` | At most one mounted hook reports open. |
| `WarmOpensInstantly` | An open requested while globally warm is open before advancing time. |
| `UnmountedRegistryClean` | Every entry in the real `tooltips` registry belongs to a mounted instance, including after timers run. |
| `UnmountedTimersClean` | After both hooks unmount, no timer remains. |

The verification-only probe reads the actual module registry and warmup/cooldown flags. Timer deadlines, trigger intent, and action history distinguish pending per-hook close callbacks and global timer ownership. Setup resets the module between runs; teardown resets it **after** invariants were checked, so a leaked callback cannot contaminate the next run or disappear before inspection.

Hover and focus are state API calls, not DOM event simulation: this target verifies the state hook's coordination contract, not `useTooltipTrigger`'s event wiring. All props are uncontrolled, callbacks are passive, and delays are fixed. The all-unmounted timer invariant does not attribute each outstanding timer to a particular hook while others remain mounted. A shared cooldown surviving the last unmount is a candidate contract violation, not automatically a user-visible bug.
