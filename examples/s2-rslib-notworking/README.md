# s2-rslib-notworking

This is an example of Rslib with unplugin-parcel-macros, that reliably does not work and fails to build.

## Reproduction steps

1. `yarn install`
2. `yarn build`
3. Observe the error `Module not found: Can't resolve 'macro-xyz.css'`

Note that ../s2-rslib-semiworking _does_ build. This is because it uses less complex, and fewer S2 macros, and therefore does not run into this race condition.

## Debugging notes from AI

*TL;DR: It's a race condition in `unplugin-parcel-macros` + `unplugin`'s virtual module system within rspack. No config-level fix found yet — likely needs an upstream fix or inlining styles.*

---

:mag: **The Problem**
`pnpm nx build @pandora/react-card-container` fails ~50% of the time with:
```
Module not found: Can't resolve 'macro-<hash>.css'
```
Errors come from `EmptyStateStyles.ts` and `ErrorStateStyles.ts`.

---

:detective: **Root Cause**
The S2 `style()` macro generates CSS at build time. That CSS lives in:
• A module-level `assets` Map inside `unplugin-parcel-macros` (shared across plugin instances)
• Empty placeholder files in `node_modules/.virtual/` written by unplugin's `FakeVirtualModulesPlugin`

The `transform` hook generates CSS → adds to `assets` Map → appends `import "macro-<hash>.css"` to the source. Then `resolveId` maps it to a `.virtual/` file, and the `load` hook serves the real CSS from the Map.

The race happens within rspack's internal concurrent module processing. Even with a *single* lib entry and a *single* rspack compiler, the async `transform → resolveId → load` pipeline has a timing window where virtual CSS module resolution fails.

---

:test_tube: **What I Tested**

| Approach | Result |
|---|---|
| Normal build (ESM + CJS parallel) | ~40% pass |
| Patch: remove `assets.delete()` cleanup | Still fails |
| Patch: prevent `.virtual/` dir deletion on shutdown | Still fails |
| Both patches combined | Still fails |
| Patch: per-instance `assets` Map | Worse |
| Sequential builds (separate processes) | ESM passes, CJS still flaky |
| Single lib entry only | Still flaky (3/10) |
| Disable DTS | Still fails |
| Clean `.virtual/` before every build | Still fails |
| `cssModules: { namedExport: false }` | Still fails |

---

:bulb: **Key Takeaways**
• Not caused by parallel ESM+CJS — fails with a single lib entry too
• Not caused by stale `.virtual/` files — cleaning doesn't help
• Not caused by the asset cleanup code — removing it doesn't fix it
• The working repo (`pandora-tooling-demo`) has fewer macro files and simpler inline `style()` calls — smaller race window
• Importing style files `with { type: 'macro' }` doesn't work — S2 throws an error since the exports are already-expanded values, not macro functions
