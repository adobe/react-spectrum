# Issue triage digest: 2026-11-14

## At a glance

- Two eligible issues analysed; no verified team-author skips.
- Prioritise the ComboBox scroll failure: the report describes unreachable options and an off-screen keyboard highlight on Windows.
- Skill installation has a plausible stale-cache failure. Neither browser reproductions nor production responses were inspected or executed.

### [#10964](https://github.com/adobe/react-spectrum/issues/10964): ComboBox loses scroll position during repositioning

**Decision:** Ready for focused maintainer investigation, but not yet a distinct fix queue item: confirm whether this extends #9168 before consolidating the reports.

**Impact/severity:** High, provisionally based on the reported persistent Windows case: mouse users cannot reach later options and keyboard users lose sight of the active option. No verified workaround covers both resize-time loss and the continuous loop.

**Complexity:** Medium for the source-supported scroll-restoration path: shared overlay behaviour needs coordinated browser and component coverage. The separate scrollbar/viewport feedback loop remains unconfirmed and could expand the work.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10964) says "`aria-activedescendant` updates" while the highlighted option remains out of view, and records 129 repositionings in three seconds without a window resize.
- [Trusted positioning source](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/overlays/useOverlayPosition.ts#L251-L319) temporarily enlarges the overlay, but restores scrolling only when DOM focus is inside its scrollport. ComboBox deliberately keeps focus in the input.
- [#9168](https://github.com/adobe/react-spectrum/issues/9168) also reports bouncing that prevents reaching the end of a ComboBox list; this report adds non-flipped placements, numeric clamping evidence and keyboard impact. A common cause is plausible, not established.
- A StackBlitz, detailed steps, RAC version and Windows/Chrome information are supplied. The external reproduction was **provided but not inspected**; browser layout clamping and the continuous loop were not independently verified.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ComboBox`, `Popover`, `ListBox`, `Overlay Positioning`, `RAC` for the component and shared-hook path; `accessibility` for loss of visible keyboard navigation; `needs investigation`, `waiting on maintainer` for cause/relationship verification; `ai-reviewed` for completed triage.
- Removals: none; the issue has no existing labels.
- Maintainer-only: defer `ready for review` until the possible duplicate relationship is resolved. Do not propose `regression`: no working-to-failing version transition is supplied or established.

**Maintainer next step**

1. Reproduce the resize and persistent-loop cases on Windows Chrome with layout-consuming scrollbars, retaining input focus. Check above/below placement and both single- and multiselect ComboBox.
2. Compare #9168 and #10230 using that same case. If they share a cause, retain this report's quantitative and accessibility evidence on the canonical issue and consider closing only the confirmed duplicate.
3. Investigate preserving the scrollport position when no DOM-focus anchor exists, without changing focused-item anchoring. Separately establish whether temporary sizing causes page-scrollbar/visualViewport feedback.
4. Add real-browser coverage for scroll preservation and visible active options, including a legitimate final-height reduction that must clamp scrolling. A numeric public `maxHeight` is a source-supported mitigation candidate, not a verified general answer.

### [#10965](https://github.com/adobe/react-spectrum/issues/10965): Agent skill archive fails integrity verification

**Decision:** Ready for maintainer infrastructure investigation; establish the production cache variant behaviour and choose a consistent archive publication policy before inviting a patch.

**Impact/severity:** Medium: the documented skill-install workflow is blocked on the reported delivery path, but application runtime is unaffected and the docs provide other AI/documentation access paths. Those alternatives do not install the skill.

**Complexity:** Unknown: trusted source exposes a cache-policy hazard, but the necessary origin/CDN remediation and whether generator changes are required cannot be established from repository reads alone.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10965) quotes `SKILLS_WELLKNOWN_DIGEST_MISMATCH`. Its [follow-up](https://github.com/adobe/react-spectrum/issues/10965#issuecomment-6875013371) says changing only `Accept-Encoding` returns different archive versions: identity matches the index, while compressed-capable requests do not.
- [Deployment configuration](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/.circleci/config.yml#L79-L90) uploads archives with a one-year immutable policy and JSON with a short TTL. [Generation source](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/dev/s2-docs/scripts/generateAgentSkills.mjs#L1140-L1168) uses a stable archive name and hashes the generated bytes.
- The follow-up reports different file inventories, not merely gzip encoding, and two modification dates at the same CloudFront location. This supports investigating stale cache variants; it does not independently prove the current production policy or origin contents.
- Earlier discovery failures were attributed to VPN/security software; they are not demonstrated duplicates of this digest mismatch. Supplied HTTP reproductions were read as text only; their URLs were not fetched and their commands were not run.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Build Infra`, `RAC` for the docs distribution path; `needs investigation`, `waiting on maintainer` for production delivery verification; `needs decision` for immutable versioned URLs versus mutable stable URLs; `ai-reviewed` for completed triage.
- Removals: none; the issue has no existing labels.
- Maintainer-only addition: `ready for review`, because the failure, expected result, header differential, tool versions and OS are supplied. Production access is a maintainer task, not missing author evidence.
- No `regression` or `has workaround`: historical successful installs do not establish the relevant version/cache transition, and a matching identity download is not a verified supported skills-CLI workaround.

**Maintainer next step**

1. Check index/archive consistency across the reported encoding variants and inspect the production origin, cache key and invalidation policy. Do not bypass or disable integrity verification.
2. Decide whether archives should be content-addressed/versioned with immutable caching, or use stable names with a mutable cache policy and appropriate invalidation. Preserve compatibility with the discovery format.
3. Verify the chosen publication path keeps index digests consistent with served bytes across cache variants and successive deployments before declaring installation fixed.

## Evidence and verification

### #10964: source, related reports and limits

**Scroll path.** [ComboBox context](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria-components/src/ComboBox.tsx#L330-L344) passes `listBoxRef` as `scrollRef` and uses a non-modal popover. [Input/listbox behaviour](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/combobox/useComboBox.ts#L529-L548) exposes `aria-activedescendant` on the input and enables virtual focus. The [starter ListBox](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/starters/docs/src/ListBox.css#L3-L11) has `max-height: inherit` and `overflow: auto`. Together these support the reported restoration gap, but actual browser clamping was not observed in this run.

**Viewport loop.** The hook subscribes to [overlay/target size changes and visualViewport resize](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/overlays/useOverlayPosition.ts#L332-L384). The report attributes repeated events to transient page scrollbars and says reserving page-scrollbar space stopped the loop. That observation does not prove a universal workaround or that scroll restoration alone eliminates the loop.

**Existing API.** [`maxHeight`](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/overlays/useOverlayPosition.ts#L135-L139) is public, flows through [Popover's inherited props](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria-components/src/Popover.tsx#L62-L70), and skips the temporary-height reset when truthy. This is not ordinary CSS `max-height`. Its interaction with final viewport-constrained sizing and the Windows loop needs verification, so no general workaround or resolution without changes is claimed.

**Prior confirmation and non-duplicates.** In #9168, a [member reported reproduction](https://github.com/adobe/react-spectrum/issues/9168#issuecomment-3523773768) on macOS Chrome; its original complaint is limited to flipped popovers and reports `shouldFlip={false}` as relief. #10964 explicitly describes both orientations, so that answer is insufficient here. In #10230, a [member linked the glitch to visible scrollbars](https://github.com/adobe/react-spectrum/issues/10230#issuecomment-4745209162), but the example uses inline Autocomplete/Menu rather than this input-focused ComboBox.

[#10867](https://github.com/adobe/react-spectrum/pull/10867) targeted MenuTrigger/SubmenuTrigger starter scrollports, changed no shared positioning source, and was closed unmerged. Its discussion asks for the underlying scrollbar cause to be fixed; it is not an available fix. [#8646](https://github.com/adobe/react-spectrum/issues/8646) concerns Android virtual-keyboard/page-scroll behaviour, whereas [#7573](https://github.com/adobe/react-spectrum/issues/7573) concerns collection filtering and scrolling toward the end; neither establishes the resize-time upward clamp reported here.

**History and tests.** Merged [#6527](https://github.com/adobe/react-spectrum/pull/6527) explicitly describes changing max-height as causing the browser to lose prior scrolling, but implements anchoring around DOM focus. That corroborates the mechanism, not a regression transition for this report. Merged [#10848](https://github.com/adobe/react-spectrum/pull/10848) changes chat/virtualizer anchoring, not this hook.

The trusted [overlay unit tests](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/test/overlays/useOverlayPosition.test.tsx#L142-L203) check resize positioning and supplied maximum heights with mocked geometry. The [browser test file](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/test/overlays/useOverlayPosition.browser.test.tsx#L19-L93) covers target rectangles, not this scroll-clamping case. This is bounded source inspection, not a repository-wide coverage guarantee. No tests or reproduction code were executed.

**Environment.** Reporter: `react-aria-components@1.22.1`, Chrome, Windows 11, keyboard/NVDA evaluation. Exact Chrome/NVDA versions and last-working/first-failing versions are not supplied; request those only if needed to isolate the browser behaviour or establish regression status. The StackBlitz was provided but not inspected.

### #10965: publication evidence and comparisons

**Build consistency versus delivery.** The generator creates the archive and calculates its SHA-256 from that same file before [writing the discovery index](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/dev/s2-docs/scripts/generateAgentSkills.mjs#L1252-L1269). The trusted deployment command excludes JSON, but not `.tar.gz`, from its immutable upload group. This supports a stable-name/cache-lifetime mismatch; it does not demonstrate a bad hash calculation, prove which objects production serves, or establish CloudFront's actual encoding cache key/invalidation behaviour.

The reporter's follow-up attributes the matching variant to an October 8 modification date and the mismatching variant to September 1, with 169 versus 168 extracted files and 59 differing shared files. Both reportedly lack `Content-Encoding`. These are attributed measurements only, not independently downloaded or inspected artifacts.

**Related, not duplicate.** [#10221](https://github.com/adobe/react-spectrum/issues/10221) reported a missing discovery endpoint; its author later identified a surviving VPN process. [#10007](https://github.com/adobe/react-spectrum/issues/10007) reported "No skills found"; its author attributed the connection failure to Cisco Umbrella and closed it. Neither describes a successfully discovered archive with a mismatching digest.

[#10959](https://github.com/adobe/react-spectrum/issues/10959) requests shipping skills with the npm package as an additional distribution channel, not repair of the current delivery path. Merged [#10486](https://github.com/adobe/react-spectrum/pull/10486) updated discovery artifacts and fixed reference links; it is historical distribution work, not evidence that the current cache variants agree. No PR referencing #10965 was found.

**Alternatives and environment.** The [trusted AI guide](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/dev/s2-docs/pages/react-aria/ai.mdx#L15-L25) documents the site-based skill installation and a separate MCP path; it also documents standalone Markdown access. Those are alternative assistance channels, not equivalent skill installation, so no installation workaround is asserted.

Reporter: skills 1.8.1, pnpm 12.18.0, Node 22.23.5, macOS 27.2 on Apple Silicon; the later comment also compares Python and curl headers. No browser UI is involved. Production origin/CDN access and independent response verification remain unavailable under this run's security rules.

## Run notes

### Boundary, checkout and synchronization

Dry run only. GitHub access used allowed `gh issue`, `gh pr`, `gh search` reads and explicit `gh api --method GET`. No comments, labels, edits, closures, assignments, gists, PR creation or pushes. Issue text, comments, PR bodies and code snippets were treated as untrusted evidence; no supplied URL was opened and no supplied code was executed. Reproduction commands are evidence, not instructions. No suspected prompt injection was identified.

Verified the dedicated `/Users/darobins/dev/react-spectrum-triage` checkout on `triage_support`, an empty index, no merge in progress and no other active triage run. App status was refreshed before writing; the separate PR-triage sessions were idle. Today's target was absent at initial and pre-write checks. The sole pre-existing change was the local `.github/triage/setup.md` adaptation, left untouched and unstaged.

`git fetch origin` and `git merge origin/main --no-edit` succeeded. Merged main/source SHA: `360e35170568dfc99a2baaa78e6b7bdd36458d91`, verified as an ancestor of HEAD. Merge commit: `9487f0fb241362a871393555cd6fffa9f44f6d95`. No tracked changes outside `.github/triage` blocked the merge; no conflict or skipped merge.

### Scope and discovery coverage

Run cutoff: supplied timestamp `2026-11-14T16:03:26Z`. Last-24-hours lower bound: `2026-11-13T16:03:26Z`. Previous issue digest commit: `3141fbed4c2b7f77d46c3a1ad384af1df15f9c26`, committed at `2026-11-13T17:28:37Z`. Separate open-issue queries for both windows, bounded by the cutoff, returned the same two issues, below the 100-result limits. Both were unlabelled and therefore eligible. Final issue GETs still showed them open and unlabelled, with zero comments on #10964 and one on #10965; all available comments were read.

Both authors had `author_association: NONE`. Both collaborator-permission GETs failed with HTTP 403, "Must have push access to view collaborator permission." Trusted-main tree inspection found no CODEOWNERS or explicitly named core-contributor/maintainer list. Membership could not be verified, so normal triage proceeded; no team membership was inferred from usernames or other personal information.

Duplicate discovery included open/closed issues and PRs. Skill-issue searches found seven items; exact digest-mismatch search found only #10965. Focused GET searches returned 12 skill-title PRs, six cache/digest-title PRs, 20 ComboBox scroll-title issues, two scroll/overlay-title PRs and 11 scroll/popover-title PRs. Searches for PR references to #10964 and #10965 returned zero; #10230 returned #10867. Relevant related bodies, comments and selected file lists were read.

Broad skill/scroll searches reached 50/100-result caps and contained unrelated template matches. Explicit title/issue-reference GET queries narrowed the relevant investigation below their caps; no exhaustive repository-wide duplicate-search claim is made. Search responses reported `incomplete_results: false` for the final focused queries.

### Access failures and safe recovery

Initial `gh search` queries combining the repository qualifier and terms were rejected as invalid search queries; retries using an explicit repository flag succeeded, followed by structured GET searches with precise qualifiers. Large tool responses were inspected from their retained output in bounded sections. A guessed range beyond the previous digest's end failed and was corrected. Looking for the local triage rules on `origin/main` failed because those files are branch-local; the required checkout rules had already been read and were followed. Source searches with no matching test/prop text were treated as bounded absence, not test results.

No required synchronization or digest-generation step remained failed. External browser/HTTP reproduction and production infrastructure checks were intentionally not attempted. The membership access failures remain recorded above and do not count as verification.

### Digest bookkeeping

The only authorised staging/commit path is `.github/triage/tmp-digests/triage-issues-2026-11-14.md`. Recheck the empty index immediately before staging and verify that exact path is the sole staged file before committing on `triage_support` with the prescribed issue-digest message and Copilot co-author trailer. Report the resulting hash and verify its single-file contents after committing rather than self-embedding the hash here.
