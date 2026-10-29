# FocusScope model checked against Chromium

[FocusScope.tla](FocusScope.tla) models two nested scopes and an outside button. The real adapter mounts `FocusScope` and checks its exported tree. [target.json](target.json) defaults exploration and conformance to Chromium: jsdom does not reproduce Chromium's focus events when a focused node is removed.

```sh
yarn verify conform focus-scope
yarn verify cover focus-scope
yarn verify check focus-scope --depth 8  # replays each counterexample in Chromium
yarn verify replay focus-scope --headed --trace <path printed by check>
yarn verify explore focus-scope
```

`MountPlain0/1` mounts with all flags false; `MountRestore0/1` enables restoreFocus and autoFocus; `MountContain0/1` additionally enables contain. `Unmount0/1`, `Focus0/1/2` (outside, outer, inner), and `RemoveOutside` exercise restoration, containment, and disconnected restore destinations. Mounting the inner scope requires the outer scope. Removing the outer scope removes both. Actions settle two animation frames before observation. Default real-code depth: 4; model checking can go deeper.

| Invariant | Contract |
| --- | --- |
| `FocusConnected` | The active element is connected. |
| `Containment` | Focus stays within mounted containing scopes after settling. |
| `RestoreConnected` | The real code never calls `focus()` on a detached element. |
| `NoDanglingNodes` | The tree has exactly the mounted scopes, and each scope's retained DOM nodes are connected. |

The model stores mount modes, captured restore targets, and focus. Removal chooses a connected captured target, then the surviving parent scope's first control; containment can also recover focus in Chromium after removal. The real observation retains history and captured targets to distinguish internal scope refs; its model projection compares modes, focus, outside-node existence, tree size, and detached-focus attempts. A stored restore reference may become disconnected before unmount; the contract is that it must not be used for restoration.

The model abstracts tree shape to the two nested scopes and focus to one control per scope. It does not enumerate every independent flag combination, portals, sibling scope reparenting, Tab traversal, positive tabindex, Shadow DOM, or application callbacks. Conformance is bounded; deeper model counterexamples still need Chromium replay. An explicit jsdom override is useful for diagnosis but is not the conformance oracle for this model.

Known gap: `cover` reports a mismatch after `MountRestore0 -> MountPlain1 -> Focus2 -> Unmount1 -> Unmount0`. Unmounting the plain inner scope leaves focus on `<body>` and makes the outer scope the active scope, so unmounting the outer scope restores focus to the outside button; the model leaves focus on `<body>`. FocusScope also restores from `<body>` when the unmounting scope is the module's `activeScope` (`shouldRestoreFocus`), which the model does not track.
