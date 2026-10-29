# Behavioral verification

Bounded exhaustive exploration of real library code, for finding edge-case bugs in stateful areas (timers, global registries, multiple instances, event ordering). Each target in this directory drives the actual implementation through named actions. A target can also have a TLA+ model, checked with [tla-ts](https://github.com/aidenybai/tla-ts), for searching deeper or larger spaces than the real code can be run through; the same target checks that the model still matches the code. It is local and opt-in, not part of CI.

## Quick start

From the repository root:

```sh
yarn verify list
yarn verify explore use-press
yarn verify explore toast-queue --depth 8 --max-runs 50000
# Paste a Replay line printed by explore or check:
yarn verify replay use-press --trace /tmp/verification-use-press-…/PointerOwnership.trace.json
# Targets with a model:
yarn verify conform use-press
yarn verify check use-press --depth 20
```

`explore` runs every enabled action sequence up to the depth bound breadth-first, in jsdom by default, so the first trace reported for each invariant is a shortest one. `replay` runs a trace again, by default in Chromium, where `env.input` uses Playwright for hover and CDP for touches, so the browser generates the events.

All commands run inside Vitest ([targets.config.ts](targets.config.ts) and [targets.runner.tsx](targets.runner.tsx)), which supplies TypeScript, the repository's module resolution, jsdom or Chromium, and fake timers. Each candidate sequence replays its prefix from a fresh `setup`, because real code cannot be snapshotted. Evidence (`result.json`, one `<Invariant>.trace.json` per violation, and the Vitest log) goes in a fresh directory outside the checkout; `--output <directory>` picks its parent. All commands accept `--json`. `--timeout-ms` sets a cooperative deadline; cleanup runs before a timeout is reported. A parent-process timeout, with a 60-second startup and shutdown allowance, stops hung actions or model checks. Requests (including replay traces) are stored in the evidence directory rather than in environment variables.

## Writing a target

A target is `verification/<name>/target.tsx` exporting `defineTarget({...})` from [explorer.mjs](explorer.mjs), plus a README with its contracts, bounds, and assumptions.

- `setup(env)` and `teardown(ctx)` create and dispose one fresh instance. Reset any global state the code under test keeps (focus, pointer position, interaction modality, module-level registries), because runs share a page.
- `actions` maps names to `run(ctx)`, or `{enabled(ctx), run(ctx)}`. Guards describe the input protocol and bound the search. Real input goes through `env.input` (`hover`, `touch`), which is synthetic in jsdom and browser-generated in Chromium.
- `observe(ctx)` returns JSON. Sequences that reach the same observation are merged, so include everything that affects future behavior, including real internals such as pending timers and listeners. Merging unequal states can hide bugs. When the code keeps state you cannot read (such as a hook's refs), add a stand-in from the run's history; toast-queue's `focusEntered` and use-press's `fallbackClicked` are examples. A model that tracks that state shows what the observation needs to distinguish, but `conform` checks only the runs exploration keeps, so it cannot detect states that are still being merged.
- `check(ctx)` (optional) runs after setup and every action, and throws when the environment did not do what the actions intended, such as real input that did not register. That makes the run an error rather than evidence.
- `invariants` return `true`, or `false`/a message when violated. Compare real behavior against a reference computed from the inputs. Never set a flag where you expect the bug.
- `bounds.depth` (and optional `maxRuns`) limits the search.

The explorer replays each prefix and reports an error if its observation changed (state leaked between runs), if an action that was enabled during search is not enabled on replay, or if setup, an action, `check`, `observe`, or an invariant throws. `neverEnabled` lists actions that no explored state enabled; check those guards before trusting a pass. Sequences are not extended past a violation, so a known bug can hide others behind it: fix it locally (or tighten the guard) and explore again.

## Models (optional)

Add a model when the real code is too slow or its state space too large to run through, or to reason about liveness or a design before it is built. Set `model` in the target and put the `.tla` file beside it:

```ts
model: {
  spec: 'UsePress.tla',
  // The observation, in the model's View vocabulary.
  project: ({timers, listeners, ...rest}) => ({...rest, timer: timers > 0, listeners: listeners.length > 0})
}
```

The model must declare `CONSTANT MaxSteps`; variables including `action` and `step`, listed in `vars`; `Init`; a `Next` that requires `step < MaxSteps`, increments `step`, and sets `action'` to the name of the target action each transition corresponds to; a `View` record with the same fields as `project` returns; and one operator per target invariant, with the same name. Optional `model.constants`, `model.depth`, and `model.invariants` add constants, set the default checking depth, and choose which of the target's invariants to check.

1. `yarn verify conform <target>` explores the real code in jsdom with invariants off, then uses tla-ts to replay every explored run through the model, comparing `View` with the projected observation after each step. The model may be nondeterministic: a run conforms when some behavior of the model takes its actions with a matching `View` at every step. A mismatch names the trace and either the action the model does not allow or the fields that differ. Run it first, and whenever the source or the model changes; fix the model until it conforms. It shows that the explored behaviors of the code are behaviors of the model, not the reverse.
2. `yarn verify check <target> --depth <n>` model-checks each invariant separately, so one violation does not hide the others, and writes each counterexample as a trace. `--depth` goes up to 100.
3. `yarn verify replay <target> --trace <file>` runs a model counterexample against the real code, exactly like one from `explore`. Only a reproduced replay is evidence of a bug in the code; a model counterexample alone is not.

## Results

`explore` and `check` exit 0 when no invariant fails, 1 for violations, and 2 for incomplete or erroring runs. `conform` exits 0 when the code conforms, 1 for a mismatch, and 2 for errors. `replay` exits 1 when the same invariant fails (`reproduced`), 0 when the trace completes without it (`not-reproduced`), and 2 for a different failure, an action that is no longer enabled, or an error. A pass covers only the target's actions, bounds, and assumptions.

Put confirmed traces and evidence in the PR description with the fix and a regression test in the owning package's `test/` directory, rather than in a findings archive here.

## Harness tests

```sh
yarn test:verification
```

These test the explorer, model checking, conformance, and CLI with toy targets and models, and need no browser. After changing a target or model, run `yarn verify explore <target>` (and `conform` and `check` if it has a model) and inspect the results. `yarn lint` format-checks, type-checks, and lints this directory along with the packages.
