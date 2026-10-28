# PR triage digest, 2026-10-28 (read-only draft)

- Branch: `triage_support`; `git fetch origin` run, `origin/main` is `0752308bb1` ("fix(react-aria-components): inherit Form validationBehavior in ColorField (#10863)"). `git merge origin/main` reported "Already up to date" (no conflicts, no tracked local changes).
- Scope: open, non-draft, non-bot PRs created since the last digest (committed 2026-10-27 ~23:52 UTC), without `ai reviewed`. 5 PRs: #10885, #10884, #10883, #10882, #10879. No new PRs from `mangeshraut712` today.
- Nothing was run, checked out, or posted. All claims come from `gh pr view|diff|checks`, `gh api` GETs, issue text, and `origin/main` source. Correctness claims were reasoned from the diffs, not verified by running anything. CI log pages (CircleCI) were not opened, per the rules.
- No prompt-injection content found in any PR text. No PR touches CI workflows, `package.json`, lockfiles, or build config, so none is flagged **needs security review**.
- **Pattern worth a look:** 4 of the 5 PRs (#10882, #10883, #10884, #10885) are from `ayuxy027`, opened within 16 minutes (13:38Z to 13:54Z), all declaring AI assistance, all with the same PR-body structure, and none has any comment or review yet. They are well-formed (CLA signed, all CI green, tests included, scope notes, honest limitations), unlike yesterday's batch. But **three of the four duplicate an existing open PR for the same issue** (see Duplicates), and the PR bodies don't acknowledge those PRs.

## Summary

| PR | Complexity | Red flags | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| [#10884](https://github.com/adobe/react-spectrum/pull/10884) fix(ariaHideOutside): track hiding per call so overlapping channels restore correctly | High | **Duplicate of [#10812](https://github.com/adobe/react-spectrum/pull/10812)** (same issue #10802, 8 days older, maintainer-reviewed, not updated since); this PR implements the design snowystinger proposed there; test scaffolding closely mirrors #10812's; rewrites core overlay hiding logic (+200/-43) | `ai reviewed`*, `risk`*, `large impact`*, `Overlays`, `ComboBox` | Duplicate note, ask which PR continues | none yet; recommend one of #10812/#10884 be kept, not closed blind | Medium |
| [#10883](https://github.com/adobe/react-spectrum/pull/10883) fix(useComboBox): prevent default on Escape when it closes the popover | Low | **Duplicate of [#10788](https://github.com/adobe/react-spectrum/pull/10788)** (same issue #10784, 13 days older, root-cause fix in the shared handler, matches the maintainer's comment on the issue); this PR fixes only the ComboBox call site | `ai reviewed`*, `small impact`*, `ComboBox` | Duplicate note, explain tradeoff | duplicate of #10788 (maintainer to choose approach) | Medium |
| [#10882](https://github.com/adobe/react-spectrum/pull/10882) fix(useComboBoxState): don't commit a read-only ComboBox's value on blur | Low | **Duplicate of [#10869](https://github.com/adobe/react-spectrum/pull/10869)** (same issue #10846, one day older, already has nwidynski's LGTM). No maintainer response on #10846 yet. Otherwise clean | `ai reviewed`*, `small review`, `small impact`*, `ComboBox` | Duplicate note | duplicate of #10869 (either could be kept) | Medium |
| [#10879](https://github.com/adobe/react-spectrum/pull/10879) perf: stabilize number formatter options | Medium | **CLA not signed** (check `action_required`), `lint` and `commit` CI jobs failing, no linked issue (body is literally `Closes <!-- no issue linked -->`), no measured benefit, author says tests were never run | `ai reviewed`*, `performance`, `small impact`* | CLA + lint + motivation | none | High |
| [#10885](https://github.com/adobe/react-spectrum/pull/10885) fix(useFocusWithin): don't synthesize onBlurWithin while focus stays inside | Medium | none blocking; PR admits it didn't reproduce the reporter's scenario end to end; leaves #8456's second half (ComboBox `onFocusWithin` not called) open | `ai reviewed`*, `risk`*, `medium impact`*, `Focus`, `ComboBox` | none | none | Medium |

\* label does not exist in the repo yet. Labels that need to be created: `ai reviewed`, `needs signoff`, `risk`, `regression`, `patch worthy`, `small impact`/`medium impact`/`large impact`. Existing and usable: `small review`, `needs API review`, `has workaround`, `performance`, `Focus`, `ComboBox`, `Overlays`, `duplicate`.

---

## #10884 - fix(ariaHideOutside): track hiding per call so overlapping channels restore correctly

- Author: ayuxy027 (independent contributor, AI-assisted, disclosed). +200/-43, `packages/react-aria/src/overlays/ariaHideOutside.ts` and its test. CLA signed, all CI green. Closes #10802. No comments or reviews.
- **Complexity: High.** `ariaHideOutside` is used by every modal/popover/combobox overlay in the library, and this replaces the ref-count with a per-element state machine.
- **Summary:** Replaces the module-level `refCountMap` with a `WeakMap<Element, HiddenState>` that records, per element, which active `ariaHideOutside` call hides it and through which channel (`aria-hidden` or `inert`). The applied mark is recomputed on every hide/release (`inert` wins while any call uses it, otherwise `aria-hidden`), and original `aria-hidden`/`inert` values are restored once no call hides the element. This fixes the stuck `aria-hidden="true"` when a `useComboBox` (aria-hidden) call and a `usePopover`/`useModalOverlay` (inert) call overlap and release in that order.
- **API / compatibility:** No public API change (`ariaHideOutside` signature is the same). Behavior changes: (1) an original `aria-hidden="false"` is now restored instead of removed (stated in the PR body); (2) while any overlapping call uses `inert`, the element is made `inert` and its `aria-hidden` attribute is removed (previously an aria-hidden-first overlap never got `inert`). Both are deliberate and arguably fixes, but they affect every overlay, hence `risk`. No DOM-structure or class changes.
- **Issue check (reading only):** #10802 is a theoretical-then-demonstrated bug; snowystinger acknowledged it ("it seems like something we should address") after a StackBlitz repro by hafizahmedzia. In the review on #10812 snowystinger asked for exactly this shape: "keep a map of some sort of {element -> {id -> attribute}} ... If the map for that element contains any `inert`, then that wins. Otherwise it's `aria-hidden`. If nothing is left, we set it back to whatever its initial value was". This PR follows that design.
- **Duplicates:** **[#10812](https://github.com/adobe/react-spectrum/pull/10812)** (unknownhackerworld, opened 2026-10-20, closes #10802, +109/-4, CI green, reviews from snowystinger and the author, single commit, last activity 2026-10-26). #10812's author replied to the map suggestion with "I think that's better than what I have ... What I'd change: replace refCountMap and inertHiddenMap with one WeakMap<Element, Map<number, 'inert'|'aria-hidden'>>" but has not pushed that change in 8 days. Comparison:
  - Correctness/scope: #10884 already implements the maintainer-requested design and also fixes the "aria-hidden call first, inert call later never becomes inert" gap that unknownhackerworld acknowledged in #10812. #10812 as pushed covers only the stuck-attribute case.
  - Tests: #10884 covers both orders, upgrade/downgrade between channels, app-set `aria-hidden`, app-set `inert`, and `aria-hidden="false"` restoration, and cleans up leaked calls in `afterEach`. #10812's tests are narrower.
  - Notable: #10884's test setup (`jest.isolateModules` + `inert` polyfill on `HTMLElement.prototype` in `beforeAll`, `outside`/`target` fixtures) is structurally very close to #10812's. This could be coincidence (same repo test style, same constraint) or derived from #10812 without credit. Worth a maintainer glance.
  - Responsiveness: #10812's author said he'd change it and then went quiet; #10884's author is new and fast.
  - Recommendation: don't close either blindly. Ask #10812's author whether they intend to update; otherwise continue in #10884 and close #10812 as superseded. Only a recommendation.
- **Red flags (light, since High):** no `eslint-disable`, `oxlint-disable`, `@ts-*`, `as any`, or timing hacks in the added lines (scanned the diff). Two reasoning-only concerns that a reviewer should check: (a) `state.ariaHidden`/`state.inert` snapshot is taken once at first hide, so an app change to those attributes between hide and final release is overwritten on restore (previous code also unconditionally cleared); (b) mutation-observer paths that re-`hide()` a node for the same call just overwrite the channel in `state.calls` (idempotent). Could not verify by running.
- **Security review:** not needed (no CI/package/build changes).

**Would draft comment (not posted):**
> Thanks for the PR! This overlaps with #10812, which is also open for #10802 and where @snowystinger suggested tracking hidden elements in a map keyed by call id and recomputing the applied attribute (inert wins, otherwise aria-hidden). That is the approach used here. @unknownhackerworld, are you planning to update #10812 along those lines? If not, we'll continue the review here. @ayuxy027, if any of the test setup was adapted from #10812, a mention would be appreciated.

### Would have done
- **Labels:** add `ai reviewed`* (covered by digest), `risk`* (core overlay hiding used by all overlays), `large impact`* (affects every modal/popover), `Overlays`, `ComboBox` (the triggering overlap).
- **Comment:** the draft above.
- **Close / link:** none now; link as related/duplicate of #10812. Keep whichever of #10812/#10884 ends up carrying the maintainer-requested design.
- **Other:** needs careful human review (core behavior, changes `aria-hidden="false"` restoration); no API review needed.
- **Confidence:** medium. Would change if the #10812 author pushes the map-based update soon, or if reviewers find an edge case in the observer/hide paths.
- **Feedback prompt:** When two PRs implement the same issue and the older one is stalled after a maintainer review, should we ask the older author to update or let the newer PR proceed?

---

## #10883 - fix(useComboBox): prevent default on Escape when it closes the popover

- Author: ayuxy027 (AI-assisted, disclosed). +27/-1, `packages/react-aria/src/combobox/useComboBox.ts` and `packages/react-aria-components/test/ComboBox.test.js`. CLA signed, CI green. Closes #10784. No comments or reviews.
- **Complexity: Low** (one source line, one hook, no API surface), consistent with how yesterday's small `useComboBox` guards were classified.
- **Summary:** The Escape shortcut action now returns `{shouldContinuePropagation, shouldPreventDefault: state.isOpen}` (captured before `state.revert()`), so Escape that closes the popover is default-prevented (stops Safari exiting fullscreen) while Escape on a closed ComboBox is untouched.
- **API / compatibility:** No API change. Behavior change: Escape with an open ComboBox popover is now `preventDefault`ed in all browsers, so an app relying on the native default for that keystroke (e.g. native `<dialog>` closing, fullscreen exit) will no longer get it while the popover is open. Propagation is unchanged (verified: `useOverlay` and Escape listeners don't check `defaultPrevented`, per #10788's author; not independently verified here).
- **Red flags:**
  - Disabled checks / timing hacks / workarounds / a11y: none. Escape handling stays keyboard-accessible; no ARIA changes.
  - **Issue verification:** #10784 reports Safari fullscreen exits on Escape with the popover open. Reading the diff against the report, `shouldPreventDefault: state.isOpen` plausibly fixes it (the handler only calls `preventDefault` for object results when the flag is truthy, per the PR's explanation of `createKeyboardShortcutHandler`). Not run.
  - **Issue discussion:** snowystinger on #10784: "`useComboBox.ts#L242` should be calling preventDefault if it's not specified as false. Will need to look into that." That signals the maintainer expects the **default** to be fixed in the handler, not an explicit flag per call site. This PR deliberately does the opposite (the body argues against changing the handler) and doesn't mention #10788.
  - **Already solvable with existing code:** no prop covers it. An app could add its own `onKeyDown` on the input that calls `preventDefault()` when `isOpen`, but that is the very workaround the issue reporter patched locally; not a reason to reject.
  - **Test quality:** good, interaction-level. Opens the listbox with the keyboard, fires `keyDown` Escape, asserts `fireEvent` returned `false` (default prevented) and the listbox is gone; a second test asserts a closed ComboBox's Escape is not prevented. Reasoning: the first test fails without the fix (returns `true` today). It does not cover an Escape that is handled while the popover is open but the input is empty, or the `shouldContinuePropagation` combinations.
  - **CLA:** signed.
- **Duplicates:** **[#10788](https://github.com/adobe/react-spectrum/pull/10788)** (UditDewan, opened 2026-10-15, closes #10784, +30/-6, CI green, no reviews yet, `REVIEW_REQUIRED`). It changes `createKeyboardShortcutHandler` so omitted fields in an object result fall back to the handled defaults (prevent default unless `shouldPreventDefault: false`), and the author says it audited that no other object-returning shortcut is affected. Comparison:
  - #10788 matches snowystinger's stated expectation and the `useKeyboard` docs; it protects the next handler that returns a partial object. Risk: changes behavior of every `useKeyboard({shortcuts})` consumer that returns a partial object, including third-party code; also prevents Escape when the popover is already closed (the case #10883 explicitly avoids).
  - #10883 is narrower and lower risk, but fixes only one call site, and leaves the underlying default as is.
  - Both are AI-assisted and untested by maintainers. Recommend the maintainer decide the approach on #10784 first, then close the other. Only a recommendation.
- **Security review:** not needed.

**Would draft comment (not posted):**
> Thanks for the PR! #10788 is also open for #10784 and fixes it in `createKeyboardShortcutHandler` (the object-result default), which is what @snowystinger suggested on the issue. Could you compare the two approaches there? Your PR avoids preventing Escape when the popover is closed, which #10788's default change would do: that tradeoff is worth discussing in one place. We'll hold one of the two until the approach is chosen.

### Would have done
- **Labels:** add `ai reviewed`*, `small impact`* (browser-specific edge case), `ComboBox`.
- **Comment:** the draft above.
- **Close / link:** link as duplicate of #10788 (the older PR and the root-cause approach the maintainer hinted at). Don't close until the approach is decided.
- **Other:** ask snowystinger (who commented on #10784) to choose between handler-level and call-site fix.
- **Confidence:** medium. Would change if the maintainer prefers a call-site fix (then #10883 is the right one and #10788 should be closed).
- **Feedback prompt:** For the Escape default-prevention, do we want the shared handler default fixed (#10788) or an explicit per-call flag (#10883)?

---

## #10882 - fix(useComboBoxState): don't commit a read-only ComboBox's value on blur

- Author: ayuxy027 (AI-assisted, disclosed). +59/-1, `packages/react-stately/src/combobox/useComboBoxState.ts` plus tests in `packages/react-stately/test/combobox/useComboBoxState.test.js` and `packages/react-aria-components/test/ComboBox.test.js`. CLA signed, CI green. Closes #10846. No comments or reviews.
- **Complexity: Low** (a six-line guard in one hook; plus a stately-layer change, which the rules would call High. Same judgment as #10869 yesterday, see Rule feedback).
- **Summary:** In `setFocused(false)`, when `props.isReadOnly` is set it now calls `closeMenu()` instead of `commitValue()`, so blurring a read-only ComboBox whose controlled `selectedKey` isn't in the collection no longer fires `onSelectionChange(null)`/`onChange` and clears the field. Validation on blur is unchanged.
- **API / compatibility:** none. Behavior change limited to read-only ComboBoxes (blur no longer commits; the menu closes). A read-only ComboBox with `allowsCustomValue` or multi-select also stops committing on blur, per the PR; consistent with "read-only can't change value".
- **Red flags:**
  - Disabled checks, timing hacks, workarounds: none.
  - **Issue verification:** #10846 describes exactly this (`commitSelection` fires `onSelectionChange(selectedKey)`/`onChange` when `inputValue !== itemText`, and `selectedKey` resolves to nothing in an empty collection), and its "Possible Solution" is "Gate the blur commit on `isReadOnly` in `useComboBoxState`'s `setFocused`". The diff does that. Read against `origin/main`'s `commitSelection`, it prevents the reported path.
  - **Issue discussion:** no maintainer comments on #10846 yet (filed 2026-10-23, label `bug`). Candidate for **needs signoff** (see list).
  - **Already solvable with existing code:** the issue lists workarounds (keep the selected item in `items`, or default a `null` selection back to the current value when read-only). These are app-level hacks; no existing API fixes it. Not proposing `has workaround`.
  - **Test quality:** good. A RAC test (read-only, `selectedKey="4"` which isn't in Cat/Dog/Kangaroo, `inputValue="Penguin"`, focus then Tab away, asserts no `onSelectionChange` and input value kept) exercises the real scenario; two stately tests cover read-only blur and "menu open when `isReadOnly` turns on". The PR says all three fail without the fix; by reading `commitSelection` (`inputValue !== itemText` → fires) that's consistent. Not run. The RAC test uses `selectedKey` rather than the issue's `value`; both feed the same `value` resolution.
  - **Accessibility:** no change. **CLA:** signed.
- **Duplicates:** **[#10869](https://github.com/adobe/react-spectrum/pull/10869)** (mangeshraut712, opened 2026-10-27, closes #10846, +25/-1, CI green, comment from nwidynski "LGTM. Thanks!", no maintainer review). Same guard `shouldCloseOnBlur && !props.isReadOnly`. Differences: #10882 also closes the menu when read-only turns on while open and has tests at the stately layer. #10869 skips both commit and close, which leaves an open menu in that edge case (impractical in normal use since read-only blocks opening). Earlier closed [#10850](https://github.com/adobe/react-spectrum/pull/10850) (florianaltendorfer) was the same one-line fix, closed by its author. Three PRs for one-line fix in four days.
  - Recommendation: functionally equivalent for the reported bug. #10869 is older and approved by a contributor but belongs to a batch flagged yesterday (10 open AI PRs from one author, maintainer asked them to stop); #10882 is slightly more thorough. Maintainer's call; only a recommendation. I'd lean on keeping #10882 for thoroughness, but low confidence.
- **Security review:** not needed.

**Would draft comment (not posted):**
> Thanks for the PR! #10869 is already open for #10846 with the same one-line guard. Compared to that one, this PR also closes the menu when `isReadOnly` is turned on while the menu is open and adds stately-level tests. We'll keep one of the two; please don't open further PRs for #10846.

### Would have done
- **Labels:** add `ai reviewed`*, `small review`, `small impact`*, `ComboBox`.
- **Comment:** the draft above (or no comment if the maintainer prefers to just close one).
- **Close / link:** link as duplicate of #10869 (and the earlier closed #10850). Keep one; recommend this one for the extra edge case and tests, low confidence.
- **Other:** `#10846` has no maintainer sign-off yet; if the team wants one, mark `needs signoff`* on whichever PR is kept.
- **Confidence:** medium. Would change if maintainers prefer the smaller diff in #10869 or want `isReadOnly` handled inside `commitValue`.
- **Feedback prompt:** With two equivalent PRs for one issue, do we prefer the first opened (#10869), the one with more tests (#10882), or the one from the non-bulk contributor?

---

## #10879 - perf: stabilize number formatter options

- Author: francescatinelli11-cyber (account created 2026-03-23, 1 public repo). +62/-0, `packages/react-aria/src/i18n/useNumberFormatter.ts` and a new test file. AI-assisted per the checklist. Project field: "React Spectrum". No comments or reviews.
- **Complexity: Medium.** `useNumberFormatter` is a shared hook (NumberField, Slider, Meter, S2 and RSP components); small diff, but the behavior (formatter identity) is used by many consumers.
- **Summary:** Wraps `options` in `useDeepMemo(options, isEqual)` (same pattern as `useDateFormatter`) with a shallow-equality `isEqual`, so the memoized `NumberFormatter` wrapper isn't recreated when callers pass a fresh-but-equal options object (including the default `{}`). The underlying `Intl.NumberFormat` was already cached, so the PR says it removes only wrapper allocations.
- **API / compatibility:** none (signature unchanged); formatter identity is now stable across renders for equal options. Should be safe; `useDateFormatter` in `origin/main` already does the same thing with `useDeepMemo`.
- **Blocking issues:**
  - **CLA not signed:** `Adobe CLA Signed?` = `action_required`: "No signed agreements were found."
  - **CI failing:** `ci/circleci: lint` = FAILURE and `commit` = FAILURE ("Failed: lint"). I could not read why (CircleCI logs were not opened). Candidate: formatting of the new test file or the arrow-function/`isEqual` style; unverified.
  - **No linked issue:** body starts with `Closes <!-- no issue linked -->`; no benchmark or reproduction of a measurable problem. Per the rules this PR would need an issue first.
  - **Not tested by the author:** "This environment lacked Node.js/Yarn, so the test could not be run locally."
  - **Test quality (reasoning only):** the two tests check identity reuse with `renderHook` and rebuild on option change; they exercise the hook directly rather than a user scenario. Acceptable for a perf-only change. Would fail before the fix (a fresh object means a new `NumberFormatter` today).
- **Related/duplicates:** closed [#9128](https://github.com/adobe/react-spectrum/pull/9128) "Don't waste a number formatter" (plesiecki, closed 2025-11-01), a related perf attempt on number formatters; I did not read why it was closed. Worth a look by a maintainer before accepting similar micro-optimizations. No open duplicates.
- **Security review:** not needed.

**Would draft comment (not posted), CLA:**
> Thanks for the PR! The Adobe CLA check reports no signed agreement. Please [sign the Adobe CLA](http://opensource.adobe.com/cla.html), then close and re-open this pull request so the check re-runs. The `lint` and `commit` CI jobs are also failing; could you check and fix them? Finally, there's no linked issue: could you describe the problem you observed (or a measurement showing this matters) so we can decide whether it's worth the added complexity?

### Would have done
- **Labels:** add `ai reviewed`*, `performance`, `small impact`*.
- **Comment:** the draft above (CLA + failing CI + missing issue/motivation).
- **Close / link:** none now. If there's no response or no motivation, a maintainer may close it as not needed.
- **Other:** none. Not `small review` since it can't be reviewed until CLA and CI are resolved.
- **Confidence:** high on the CLA/CI/no-issue comment; medium on whether the change is wanted at all.
- **Feedback prompt:** Do we accept micro-perf PRs without a linked issue or measurement, or should those be asked for an issue first?

---

## #10885 - fix(useFocusWithin): don't synthesize onBlurWithin while focus stays inside

- Author: ayuxy027 (AI-assisted, disclosed). +42/-1, `packages/react-aria/src/interactions/useFocusWithin.ts` and its test. CLA signed, CI green. "Related to #8456" (no closing keyword on purpose). No comments or reviews.
- **Complexity: Medium** (a 4-line condition in a widely used shared hook; affects every `onBlurWithin` consumer; rules call behavior changes in shared hooks Medium).
- **Summary:** The global `focus` capture listener added in `onFocus` (used to synthesize a blur when the focused child is removed from the DOM) now also requires `!nodeContains(currentTarget, getActiveElement(ownerDocument))`. Virtual focus (`dispatchVirtualFocus`, used by ComboBox listbox options in a portaled popover) dispatches `focus` events on elements outside `currentTarget` while `document.activeElement` stays on the input, which previously triggered a bogus `onBlurWithin`. `getActiveElement` is already imported in the file.
- **API / compatibility:** no API change. Behavior: `onBlurWithin` no longer fires for outside `focus` events while `activeElement` is still inside. The DOM-removal path still works since focus falls back to `<body>`. A consumer relying on virtual-focus events to trigger blur would change, which is the bug being fixed.
- **Issue check:** #8456 (open, `bug`, reported 2025-06-26): moving the mouse over ComboBox items triggers `onBlurWithin`, with `document.activeElement` unchanged. snowystinger reproduced it with fast mouse movement and suggested checking whether virtual focus events in the popover bubble through the React portal; he also said ComboBox's own `onFocusWithin`/`onBlurWithin` not being called "seems like a bug". The PR's diagnosis matches the issue symptoms (activeElement unchanged, speed-sensitive). It explicitly does not fix the second point, and is correctly marked "Related to" rather than "Closes". The PR admits it did not reproduce the scenario in jsdom ("A browser check with the codesandbox from the issue would confirm the end-to-end behavior"), so the claim that this resolves the reporter's case is unverified.
- **Notes (reasoning only):**
  - Test is hook-level with `dispatchVirtualFocus(outside, inner)` and asserts no events and `activeElement` stays on the input. It is closer to an implementation-level check than a ComboBox scenario, but the author explains why (jsdom skips dispatch when `aria-activedescendant` already points at the option). A RAC-level test would be preferable if feasible.
  - No `eslint-disable`/`ts-ignore`/timing hacks added.
- **Duplicates:** none found (searched PRs for #8456 and `useFocusWithin`; only this one is linked). [#10628](https://github.com/adobe/react-spectrum/pull/10628) touches ComboBox focus return but a different bug.
- **Security review:** not needed.

### Would have done
- **Labels:** add `ai reviewed`*, `risk`* (shared hook used widely), `medium impact`*, `Focus`, `ComboBox`.
- **Comment:** no comment. (Optional: ask the author or a maintainer to confirm with the issue's codesandbox in a real browser before merging.)
- **Close / link:** none.
- **Other:** worth a maintainer's eyes since `useFocusWithin` is used by many components; ask snowystinger (who triaged #8456) to confirm the fix addresses the issue.
- **Confidence:** medium. Would change if a browser check shows the fast-mouse blur still happens (then the root cause is elsewhere, e.g. React-portal bubbling of virtual focus events).
- **Feedback prompt:** Is a hook-level virtual-focus test enough for a bug reported against ComboBox, or should we require a RAC/browser-level test?

---

## Rule feedback

- **Duplicate detection is the main story today.** Three of five PRs (#10883, #10884, #10882) have an older open PR for the same issue. I recommended one of each pair, but the rules don't say how to weigh: older vs. newer, contributor stalled after maintainer review, approach matching a maintainer comment vs. narrower scope. Added tie-breakers would help (e.g. "prefer the PR whose approach a maintainer has endorsed on the issue; if the older PR is stalled for more than N days, prefer the newer one").
- **Same-day multi-PR contributors:** `ayuxy027` opened four PRs in 16 minutes. They look careful, so the "too many open PRs by one author" rule proposed yesterday shouldn't automatically penalize them, but a rule for it may want to distinguish low-quality batches from well-formed ones.
- **PRs that don't acknowledge existing PRs:** #10882, #10883, #10884 don't mention #10869, #10788, #10812. Should the template/digest suggest a standard comment asking authors to search for existing PRs?
- **Complexity buckets:** the "High = changes in `@react-stately` / `@react-aria` core behavior" line is still ambiguous. I classified #10883 and #10882 as Low (one-to-six source lines, single component), #10885 as Medium (shared hook), #10884 as High (core overlay logic, +200 lines), #10879 as Medium (shared i18n hook).
- **"needs signoff" candidates** (issue without maintainer agreement before the PR): #10882 (#10846 has no maintainer comment). Not on the list: #10883 (snowystinger agrees on #10784), #10884 (agreed on #10802), #10885 (#8456 triaged as a bug, though the exact fix wasn't agreed).
- **Check not performed:** I could not read why `lint`/`commit` failed on #10879 (CircleCI logs are URLs and the rules forbid opening them). Nor could I verify whether the new tests fail without the fix (rules forbid running them), so those claims come from reading the diffs only. I also did not check why #9128 (closed perf PR) was closed.
- **Same-author prior digest PRs:** #10869 and #10850 were covered yesterday as low-risk and not live duplicates. With #10882 now open, #10869 becomes a live duplicate; the "closed by its own author isn't a duplicate" note from yesterday no longer applies to the pair.
