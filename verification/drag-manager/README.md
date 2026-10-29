# DragManager session model

[DragManager.tla](DragManager.tla) models one attempted drag session, two registered drop targets, entry/exit, drop/cancel, unregister, and removal of the source. The real adapter uses the actual manager; verification-only probes expose its session and target registry.

```sh
yarn verify conform drag-manager
yarn verify check drag-manager --depth 8  # replays each counterexample in Chromium
yarn verify replay drag-manager --headed --trace <path printed by check>
yarn verify explore drag-manager
```

`Begin` starts and settles a virtual drag. `BeginWhileDragging` attempts a second begin and checks that it is rejected without replacing the session. `Enter0/1` and `Leave` drive the manager's target-transition method; `Drop` and `Cancel` end the session. `Unregister0/1` remove registration during or outside a drag, allowing the manager to choose a remaining target. `Unmount` removes the source DOM node without issuing an application cancellation. Default real-code depth: 6.

| Invariant | Contract |
| --- | --- |
| `AtMostOneSession` | A concurrent begin is rejected, the original session survives, and no ended session remains active. |
| `SessionCleanup` | An ended session retains no added document/window listeners or hidden/inert content. |
| `DropAtMostOnce` | The session fires at most one drop callback. |
| `NoStaleTarget` | The current target remains registered and connected. |
| `UnmountEndsSession` | Removing the source leaves no active session. |

Listener instrumentation records callback identity, owner, event type, and capture mode; hiding is checked on real DOM state. Observations include registry membership, valid/current targets, callback counts, listeners, and hiding state. The model abstracts listener identities to a Boolean and follows the manager's current source-removal behavior, so candidate violations remain replayable.

This is a manager-level contract: `Unmount` is DOM removal, not React `useDrag` cleanup. An unmount violation alone does not establish that every component using `useDrag` leaks; integration behavior and the intended ownership of cancellation need separate confirmation. Entry/exit uses manager methods, not native HTML drag events. Callbacks are passive. Excluded: multiple sequential sessions, native data transfer, collections/drop items, keyboard navigation, touch announcements, and callbacks that re-enter the manager.
