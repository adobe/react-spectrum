# usePress verification

This package describes the pointer lifecycle in `usePress` and supplies a bounded TLA+ model plus real-hook browser checks. It stores contracts and correspondence metadata; communicate discovered failures and validation evidence in the PR description alongside the source fix and regression tests.

Start from the repository root:

```sh
yarn verify status use-press
```

The [package manifest](verification.json) registers properties, source mappings, checks, tool requirements, and budgets for `yarn verify list use-press`. The last reviewed source revision and fingerprints are in [review.json](review.json). Changed hashes request correspondence review; they do not imply a product bug or require changing the model. Inspect the diff against `reviewedCommit`, including local edits, before relying on a model result. The initial manifest preserves the pilot's source-review baseline rather than silently accepting intervening changes.

## Properties

| Property | Contract and user impact |
| --- | --- |
| `PointerOwnership` | Canceling another pointer preserves the active press, avoiding lost activations. |
| `ActivationUnique` | One attempt produces at most one `onPress`, avoiding duplicate actions. |
| `CancellationSafe` | Canceling an active attempt prevents later activation of that attempt. |
| `LifecycleBalanced` | Within the mounted no-exit/reentry scope, callback starts/ends and the outstanding start remain consistent. Unmount does not promise an end callback. |
| `CleanupComplete` | Cancellation/unmount removes document listeners and pending fallback timers. |

`Safety.cfg` checks the four lifecycle/safety properties; `Ownership.cfg` checks ownership separately against the same model so one violation does not prevent checking the other properties. Preserve failing properties and assertions instead of treating a violation as expected behavior.

## Source mapping and scope

| Source | Covered behavior / model mapping |
| --- | --- |
| `packages/react-aria/src/interactions/usePress.ts` | `triggerPressStart`, `triggerPressEnd`, `cancel`, disabled effect, `onPointerDown`, document `onPointerUp`/`onPointerCancel`, pointer branch of `onClick`, fallback timer, and unmount cleanup. Corresponds to `PointerDown`, `Stop`, `PointerCancel`, `Disable`, `PointerUp`, `OtherPointerCancel`, `NativeClick`, `Fallback`, and `Unmount`. |
| `packages/react-aria/src/utils/useGlobalListeners.ts` | Listener registration/removal and unmount cleanup, abstracted as `h.listeners`; browser checks observe native add/remove calls. |
| `packages/react-aria/src/utils/isVirtualEvent.ts` | Non-virtual pointer inputs and detail=1 native-click assumptions. The browser checks execute the fallback's actual `target.click()`. |
| `packages/react-aria/src/utils/useEffectEvent.ts` | Latest committed handlers after disabled rerenders, excluding concurrent rendering. |

The model explores one target, one activation attempt, two pointer IDs, and up to **8 transitions**. Choices include pointer down/up/cancel, an unrelated pointer's down/cancel, native click, fallback execution, a captured unrelated click, committed disable/enable changes, and unmount.

Assume a connected HTMLElement, non-virtual input, the initiating pointer staying over the target, detail=1 native clicks, and passive user callbacks. Each action abstracts one synchronous handler/effect. Native click includes end/cancel processing; fallback includes focus and `target.click()`. These steps are indivisible only under the no-reentrancy assumption. Clock time is abstracted to event ordering; implementation checks advance the actual 80 ms timer by 100 ms.

Excluded: keyboard/Meta handling, independent virtual activations, pointer leave/reenter, multiple gestures, disabled-at-pointerdown behavior, portals, Shadow DOM, detached/replaced targets, link navigation, callback-driven changes/unmounts/events, exceptions, nested responders, concurrent React rendering, focus/text-selection side effects, device/assistive-technology heuristics, and liveness. Browser checks are selected implementation traces, not exhaustive verification of browsers or TypeScript. Trusted Chromium input additionally exercises mixed mouse/touch ownership.

## Tool setup

Model checks use [tla-ts](https://github.com/aidenybai/tla-ts) 0.0.3. Tools are obtained explicitly outside the checkout; check existing installations first. Obtain the published npm archive outside the checkout, verify it, and extract it without running installation scripts:

```sh
export TLA_TS_CACHE="$(mktemp -d "${TMPDIR:-/tmp}/react-spectrum-tla-ts.XXXXXX")"
curl --fail --location https://registry.npmjs.org/tla-ts/-/tla-ts-0.0.3.tgz --output "$TLA_TS_CACHE/tla-ts.tgz"
printf '%s  %s\n' 'e71ea7ef8c0e2dfcde64bae49fdc5b865f8ca18595ece863e190990025468405' "$TLA_TS_CACHE/tla-ts.tgz" | shasum -a 256 --check
# Continue only if the checksum matches.
tar -xzf "$TLA_TS_CACHE/tla-ts.tgz" -C "$TLA_TS_CACHE"
export TLA_TS_DIR="$TLA_TS_CACHE/package"
yarn verify doctor use-press
yarn verify run use-press
```

No dependency or lockfile change is needed. Doctor verifies the manifest's version and SHA-256 of the distributed runtime. Stop on a checksum mismatch; do not change the pin to accept an unexpected artifact. The worker verifies the runtime again before import, uses one worker, seed 1, and a 512 MiB V8 heap limit. The harness enforces the same model timeouts. Its structured JSON report retains all counterexample states, with TLA+ formatted values, before the package adapter converts explicit `action`/`step` labels into the existing replay protocol. It does not infer actions from the checker's generic `Next` label.

## Run verification

After following the tool setup above, run:

```sh
yarn verify doctor use-press
yarn verify run use-press
# Focus on checks associated with one property.
yarn verify run use-press --property PointerOwnership
```

The harness runs both model configurations with tla-ts, one worker, seed 1, and a 512 MiB V8 heap limit. Each model check has a 120-second budget. It then runs the real-hook Chromium checks through the package Vitest config (180 seconds) and the existing `usePress.test.js` Jest suite (120 seconds). The property filter selects relevant model configs and filters browser tests by name; the shared safety config and regression suite still run in full. `--timeout-ms <ms>` overrides each check's budget.

Use the repository's locked Yarn dependencies. If necessary, obtain Chromium explicitly with `yarn playwright install chromium`; no harness command installs it. Run logs, JSON reports, and model states go in a fresh temporary directory printed by the command. `--output <directory>` selects an external parent directory and `--json` returns the full report. `results.json` includes commands and fingerprints for reruns. Keep that evidence only as long as needed for investigation or the PR description.

The opt-in test filename `packages/react-aria/test/interactions/usePress.verification.browser.tsx` is selected only by this package's config. Browser checks import the actual hook directly. Optional WebKit checks remain a manual command after obtaining WebKit:

```sh
yarn vitest run --config verification/use-press/vitest.config.ts --project webkit-desktop
```

The trusted-input test uses Chromium's CDP and is skipped elsewhere. The harness's registered browser check is Chromium only.

Separate infrastructure errors, source/model drift, model counterexamples, and implementation failures. The harness continues independent checks after a failure. A failing model configuration leaves its other properties uncertified; its report names the violated invariant and the unchecked properties. Translate counterexample transitions to source handlers and replay against the real hook before reporting a product bug. The action-labeled model exports a replayable trace beside its log. A model pass covers only the stated model and bounds, and never renews `review.json`.

## Replay counterexamples

```sh
# Use the ownership.trace.json path printed by run.
yarn verify replay use-press --trace /tmp/evidence/ownership.trace.json
yarn verify replay use-press --trace /tmp/evidence/ownership.trace.json --minimize
```

The `use-press-pointer-v1` trace fixes initial conditions to a mounted, enabled target with non-virtual touch pointer IDs 1 and 2. Supported action names are `PointerDown`, `PointerUp`, `PointerCancel`, `OtherPointerDown`, `OtherPointerCancel`, `NativeClick`, `OtherClick`, `Fallback`, `Disable`, `Enable`, and `Unmount`. Each action is an object containing only `type`; the adapter rejects extra parameters or unsupported ordering. The same eight-action bound applies. `OtherClick` and `Fallback` additionally require an actual pending timer during execution.

The model's `action` variable records which transition ran, without changing its behavioral guards or invariants. Exported traces retain origin fingerprints, and replay records any differences against the current checkout.

The browser driver imports the actual hook and records callbacks, pressed state, timers, and listeners after each action. It checks the requested property and stops at its first violation. Replay uses synthetic events in Chromium; the existing trusted mouse/touch test remains a separate feasibility check. `observations.json` contains the concrete evidence. A failed tool or unsupported trace is never reported as reproduction. Minimization preserves the same property failure and valid input ordering, with a bounded number of trials; see the [harness guide](../README.md#replay-a-counterexample).

## Validate checks and renew correspondence

```sh
yarn verify validate use-press
yarn verify validate use-press --property ActivationUnique
```

The harness runs the ordinary checks before and after validation. It tests each source mutation against both the existing targeted browser assertion and the replay assertion, requiring a clean baseline, a source-transform receipt, the intended assertion failure, and a clean restored run. The transform never writes product source. Unset `USE_PRESS_MUTATION`, `USE_PRESS_MUTATION_RECEIPT`, `USE_PRESS_TRACE`, and `USE_PRESS_REPLAY_RESULT` before using the harness; workflows manage their own child environments.

| Mutation | Property | Required observable failure |
| --- | --- | --- |
| `cancel-activates` | `CancellationSafe` | Cancellation unexpectedly emits `press`. |
| `duplicate-press` | `ActivationUnique` | An activation emits `press` twice. |
| `unbalanced-end` | `LifecycleBalanced` | An activation emits more ends than starts. |
| `leak-timer` | `CleanupComplete` | Disable/unmount leaves a pending fallback timer. |

The manifest declares the exact test filters, assertion markers, and replay action sequences. Controls do not include a mutation for pointer ownership; validation reports a baseline failure if its implementation tests demonstrate one, otherwise it reports missing sensitivity coverage. Existing failures remain visible and cannot mask an escaped mutation.

For manual debugging, the original scratch command is still available:

```sh
USE_PRESS_MUTATION=cancel-activates yarn vitest run --config verification/use-press/vitest.config.ts --project chromium-desktop -t 'cancellation safety: pointercancel'
```

Review handler guards, listener lifetime, disposal, and synchronous boundaries against the source. Split transitions if callbacks can reenter in a newly covered scenario. Only after confirming correspondence and completing appropriate checks and negative controls, update `review.json` with the reviewed commit/date, exact file hashes, and a short review reason. Include whether covered source has uncommitted changes. Retain no finding list or execution results in the record. Recheck with `yarn verify status use-press`.
