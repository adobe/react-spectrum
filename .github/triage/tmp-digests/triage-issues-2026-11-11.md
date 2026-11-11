# Issue triage digest: 2026-11-11

## At a glance

- **1 issue triaged; 1 excluded by existing labels; no verified team-authored skips.**
- **Main finding:** the locale-preserving direction override already has an open implementation PR, but no released solution was established.
- **Decision needed:** agree how overridden context direction stays aligned with DOM/CSS direction, including application-wide use rather than only targeted sliders.

### [#10954: Override direction without changing locale](https://github.com/adobe/react-spectrum/issues/10954)

**Decision:** Ready for a maintainer API/scope decision, not an independent implementation review; consolidate the requirement with open [#10537](https://github.com/adobe/react-spectrum/pull/10537), without closing this report while the design remains unresolved.

**Impact/severity:** Unknown. The reported mismatch affects keyboard navigation and overlays in Arabic/Hebrew applications intentionally kept LTR, but blocked essential tasks, affected scope and a practical locale-preserving workaround are not established.

**Complexity:** High. This changes a public provider API and shared direction semantics across hooks and RAC components, with DOM/CSS, nesting and default-locale compatibility to review.

#### What matters

- The reporter needs an LTR layout with Arabic translations and formatting: "`useLocale().locale` stays `ar-AE`". Main exposes only `locale` and derives direction from it; this is a capability request, not an established regression.
- A [member's issue comment](https://github.com/adobe/react-spectrum/issues/10954#issuecomment-6781294581) confirms the matching PR and says "the team still needs to discuss". Existing maintainer involvement does not remove this unlabelled issue from scope.
- The [PR author's design question](https://github.com/adobe/react-spectrum/pull/10537#issuecomment-6329080042) is concrete: "`I18nProvider` renders no DOM, so an override changes what `useLocale()` returns but not what CSS logical properties resolve against." The issue's claim that no other call sites need changes is therefore not established.
- The inline Tabs/Popover scenario and package versions are supplied, but browser/OS details are absent and runtime behaviour was not exercised. No supported existing API preserving the requested locale while overriding direction was found; script-tag rewriting is not recommended as a solution.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `I18nProvider`, `RAC`, `internationalization` for component/layer/scope; `needs decision` for the context-versus-DOM direction contract; `ai-reviewed` for completed dry-run analysis.
- Removals: none. All proposed labels exist.
- Maintainer-only: no `ready for review` recommendation for implementation review until the API/scope decision is resolved; no `regression` recommendation without a working/failing release transition.

**Maintainer next step**

1. Review #10954's application-wide use case alongside #10537's targeted-control use case. Decide whether the provider remains context-only with a documented matching DOM `dir`, or whether DOM direction management belongs elsewhere. The issue's member responder and the maintainers already discussing #10537 can resolve this; nobody was contacted or assigned.
2. Require the eventual implementation to preserve formatting and translations, omitted-prop behaviour, default locale and nested providers. Check keyboard direction, logical styling and portalled overlays together rather than assuming every consumer requires no change.
3. Keep this report open as a linked requirement while that decision is pending. If runtime details affect the decision, request the browser/OS and a minimal composed Tabs/Popover example; do not treat the supplied inline scenario as absent or execute its code during triage.

## Evidence and verification

### #10954: Current API and behaviour

On trusted main, [I18nProviderProps and the explicit-locale branch](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-aria/src/i18n/I18nProvider.tsx#L25-L51) accept no direction override and use `isRTL(locale)`. The [default-locale branch and exported provider](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-aria/src/i18n/I18nProvider.tsx#L54-L80) also provide no override and render context only.

[Tabs keyboard delegation](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-aria/src/tabs/useTabList.ts#L61-L66) consumes context direction. [Overlay placement translation](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-aria/src/overlays/useOverlayPosition.ts#L434-L438) maps `end` to left in RTL, and [Popover](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-aria-components/src/Popover.tsx#L205-L213) passes context direction explicitly as `dir`. These reads support the mismatch mechanism, not an independently reproduced browser result.

The [trusted useLocale documentation](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/dev/s2-docs/pages/react-aria/useLocale.mdx) tells applications to set DOM `lang` and `dir` from the context. Setting DOM `dir` alone does not override the context; changing the locale changes the requirement. No safe existing-API answer or `has workaround` proposal is justified by these reads.

Reported versions: `react-aria-components@1.22.1` and `react-aria@3.53.1`. React, browser and OS versions are not supplied. Assessment used source and discussion reads only; no reproduction, tests, builds or issue-supplied URL retrieval.

### #10954: Matching requests and changed maintainer direction

Closed [#6469](https://github.com/adobe/react-spectrum/issues/6469) requested the same optional provider direction API for RTL Storybook testing. Its [February decision](https://github.com/adobe/react-spectrum/issues/6469#issuecomment-3893677168) was "we won't be doing this". However, a [September member comment on #10537](https://github.com/adobe/react-spectrum/pull/10537#issuecomment-5721165509) explicitly says "we're reversing the decision" and asks for a provider override with nested subtrees. The old closure is not current evidence to reject #10954.

Open [#10112](https://github.com/adobe/react-spectrum/issues/10112) concerns media-slider direction independently of locale. Its [provider-override suggestion](https://github.com/adobe/react-spectrum/issues/10112#issuecomment-4549777779) and #10537 cover the same mechanism, but #10954 adds application-wide Tabs/Popover and formatting requirements. The PR is open, not a shipped fix; its body and all available comments were read, not its implementation executed or independently validated.

Closed [#8583](https://github.com/adobe/react-spectrum/issues/8583) instead lacked a matching locale provider; its [reporter confirmed that adding I18nProvider solved it](https://github.com/adobe/react-spectrum/issues/8583#issuecomment-3290741813). #10954 already uses the provider and intentionally needs a direction different from that locale, so this is not the same answerable usage issue.

## Run notes

### Boundary and checkout

Dry run only: all GitHub access used allowed `gh` reads or explicit GET API requests. No comments, labels, edits, closures, gists, PR creation, assignments or pushes. Issue/PR content was treated as untrusted data; linked GitHub items were read through permitted `gh` commands, never by opening issue-supplied URLs. No suspected prompt injection was identified.

Verified the dedicated checkout `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, no merge in progress, an empty index and no pre-existing target digest. App status checks showed only this run active, with the other issue/PR triage sessions idle. The local `.github/triage/setup.md` adaptation remained unstaged.

`git fetch origin` succeeded. There were no tracked changes outside `.github/triage`, so `git merge origin/main --no-edit` ran successfully and reported already up to date. Main commit `d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32` was verified as an ancestor of HEAD `95f3fbc4a6f92c92b046cb41ddbfa8db3a74b355`.

### Scope and coverage

Window: since the previous digest commit `09e0f713425bad1fac856184dc31773c692b0fe4` at `2026-11-10T16:17:03Z`, through the supplied run timestamp `2026-11-11T17:44:34Z`. The exact-window open-issue query returned two issues, below its 100-item limit; the last-24-hours cross-check returned only #10954. An initial broader query starting at the prior run timestamp returned the same two candidates.

[#10951](https://github.com/adobe/react-spectrum/issues/10951) was excluded because its existing `enhancement` label is not a component label. **Would have done:** no analysis or label proposals under the current time-window/label rules; preserve the label and leave the issue untouched. #10954 remained open and unlabelled at the final eligibility read.

Open/closed issue searches for I18nProvider/direction and direction/override, plus PR searches for I18nProvider/direction and I18nProvider, stayed below their respective 50-result limits. They found the matching open PR and historical requests described above, not a merged direction-override solution.

### Access failures and membership

#10954's author association is `NONE`. A GET collaborator-permission check failed with HTTP 403, "Must have push access to view collaborator permission." Reading `.github/CODEOWNERS` from main failed because the path does not exist; a main tree search found no CODEOWNERS file. Team membership could not be verified, so normal triage proceeded rather than inferring membership from the author's stated company/team.

The initial `gh search` query with an embedded repository qualifier failed parsing/access validation. Retrying with explicit `--repo adobe/react-spectrum` succeeded for both issues and PRs. No required discovery remained blocked.

### Digest bookkeeping

Only `.github/triage/tmp-digests/triage-issues-2026-11-11.md` is intended for staging and the authorised digest commit on `triage_support`, with the required Copilot co-author trailer. The resulting commit hash and single-file verification are reported after committing; the hash is not self-embedded in this file.
