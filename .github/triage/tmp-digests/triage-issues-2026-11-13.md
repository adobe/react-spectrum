# Issue triage digest: 2026-11-13

## At a glance

- **2 issues triaged; both unlabelled; no verified team-authored skips.**
- **Main finding:** a non-modal drawer is not an existing Modal configuration; bundling the agent skill requires its complete reference tree, not just `SKILL.md`.
- **Decision needed:** agree the non-modal interaction contract and the release-time skill snapshot contract before implementation. Runtime reproductions, npm contents and pnpm integration were not exercised.

### [#10963: Non-modal drawer support](https://github.com/adobe/react-spectrum/issues/10963)

**Decision:** Ready for a scoped API/accessibility decision, not an agreed implementation. Keep this feature request separate from historical Popover focus reports; a new prop must coordinate Dialog focus, background interactivity and overlay lifecycle.

**Impact/severity:** Unknown. The requested editor-plus-comments/history workflow is clear, but the report does not establish whether an essential task is blocked or an acceptable supported alternative exists. No complete drawer workaround was verified.

**Complexity:** High. A new public modality API would span RAC Modal, shared overlay hooks and Dialog focus behaviour, with compatibility and accessibility review.

#### What matters

- The author wants "the rest of the page stays interactive" while the panel remains open, with focus entry/restoration but no containment, Escape inside the panel, and retained enter/exit states. This is an additional interaction mode, not evidence of a regression.
- Trusted main's [modal hook](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria/src/overlays/useModalOverlay.ts#L69-L94) enables scroll prevention, focus containment and outside-content inertness. `isDismissable={false}` only controls dismissal; it does not make the page interactive, and **false is already the Modal default**, contrary to the report's opening description.
- A bare `Overlay > Dialog` still requests containment through [useDialog](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria/src/dialog/useDialog.ts#L70-L96). Popover's `isNonModal` is not a drop-in drawer recipe: its documented scope is cautious, and blur/positioning dismissal differs from the requested persistent panel.
- Closed [#5564](https://github.com/adobe/react-spectrum/issues/5564#issuecomment-1857080285) concerns a non-modal Popover with a focus-trapping Dialog; a member said disabling child containment "could make sense in very specific use cases". That overlaps one constraint, not the complete Modal/drawer request; no matching implementation PR was established.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Modal`, `Dialog`, `RAC` for component/layer; `accessibility` for the focus and assistive-technology contract; `needs decision` for whether and where persistent non-modal panels belong; `ai-reviewed` for completed dry-run analysis.
- Removals: none. All proposed labels exist.
- Maintainer-only: no `ready for review` implementation recommendation until the API direction is agreed; no `regression` evidence and no author-blocking waiting label.

**Maintainer next step**

1. Choose whether to extend Modal, introduce a separate non-modal panel primitive, or document supported composition. Resolve focus travel between editor and panel, accessible naming, explicit close controls, Escape scope, nested overlays, outside-pointer and blur behaviour, and whether push-layout drawers are within scope.
2. Correct the dismissal-default misunderstanding without treating `isDismissable={false}` as a solution. Preserve existing modal defaults and behaviour; do not recommend removing `inert`, disabling focus management, or overriding private context as a workaround.
3. Before implementing, request the installed RAC/React versions, browser/OS and a minimal editor/panel example, then verify pointer, keyboard and screen-reader access plus enter/exit focus restoration in a permitted maintainer environment. The report supplies conceptual steps but no runnable reproduction or environment inventory; those omissions do not block the design decision.

### [#10959: Package the agent skill with RAC](https://github.com/adobe/react-spectrum/issues/10959)

**Decision:** Ready for a release/tooling decision, not a confirmed zero-cost copy step. Consider an additional npm distribution channel while preserving docs-site installation; require a release-matched, self-contained skill artifact.

**Impact/severity:** Low. Consumers face a separate skill installation/update task and possible documentation-version drift; the existing documented installation channel remains an alternative. No essential runtime workflow failure is established.

**Complexity:** Medium. Existing generation can be reused, but release-time docs inputs, package contents, reference validation and distribution checks must be coordinated.

#### What matters

- The author requests `node_modules/react-aria-components/skills/react-aria/` so "the skill that matches the installed version of the library" is available after dependency approval. The claimed pnpm 12.11+ discovery/approval behaviour and published 1.22.1 tarball contents were **not independently verified**; supplied external URLs were not opened.
- Trusted main's [generator output](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/dev/s2-docs/scripts/generateAgentSkills.mjs#L180-L195) targets docs dist, not the RAC package. Its [generated skill](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/dev/s2-docs/scripts/generateAgentSkills.mjs#L497-L512) links into `references/`; copying only `SKILL.md` would omit required documentation.
- The [package files list](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria-components/package.json#L10-L20) already includes `"*"` with explicit exclusions and no skills exclusion. The missing piece is not proven to be an allowlist change: the trusted package tree has no skill directory, and the inspected generation wiring belongs to docs builds.
- Closed [#10466](https://github.com/adobe/react-spectrum/issues/10466) reported broken reference navigation, fixed by merged [#10486](https://github.com/adobe/react-spectrum/pull/10486), whose description says "Fixes broken cross-file links inside `references/`". That fix and existing link validation are reusable prior art, not a duplicate or an npm-distribution implementation.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `RAC` for the package/layer; `needs decision` for the bundled-snapshot and release ownership contract; `ai-reviewed` for completed dry-run analysis.
- Removals: none. All proposed labels exist.
- Maintainer-only: no `ready for review` implementation recommendation until scope and distribution guarantees are agreed. Do not label this a regression or treat site installation as a workaround for release pinning.

**Maintainer next step**

1. Decide whether RAC should bundle the full generated skill, how its docs are tied to the exact release, and who owns regeneration. Treat optional RSP S2 packaging as a separate scope decision, not an automatic requirement.
2. Reuse the reference-copy/link-rewrite and validation pipeline. Require a clean release-matched docs input instead of copying a live-site artifact or reusing arbitrary docs dist; include the reference tree, preserve site discovery, and inspect packed size and licensing.
3. Before implementation acceptance, independently check the claimed pnpm version, approval/discovery behaviour and update lifecycle in a permitted environment, and inspect the actual npm artifact. Require packaging checks for `skills/react-aria/SKILL.md`, its relative references and release-specific API content; shipping instruction files in a lockfile-controlled package does not itself guarantee safe agent behaviour or eliminate version drift in external links.

## Evidence and verification

### #10963: Modality, dismissal and related work

[ModalOverlay's implementation](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria-components/src/Modal.tsx#L210-L249) keeps content mounted for overlay/content exit animations, then uses the modal hook and an underlay wrapper in [ModalOverlayInner](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria-components/src/Modal.tsx#L260-L348). Animation states are therefore existing lifecycle features, not evidence that simply skipping one hook call preserves all requested behaviour.

[Overlay](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria/src/overlays/Overlay.tsx#L75-L101) restores focus and combines its explicit containment prop with containment requested by descendants. This explains why Dialog must be part of any modality design. The [public Modal documentation](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/dev/s2-docs/pages/react-aria/Modal.mdx#L10-L18) explicitly describes blocking outside interaction; the current behaviour is intentional.

[usePopover](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria/src/overlays/usePopover.ts#L43-L51) warns that most popovers should not use `isNonModal` because of screen-reader consequences. Its [implementation](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria/src/overlays/usePopover.ts#L100-L140) disables outside-pointer dismissal for ordinary non-modal popovers but retains blur dismissal and a positioning close callback. A persistent drawer needs a deliberately specified contract, not assumed parity.

Merged [#10674](https://github.com/adobe/react-spectrum/pull/10674) adds a swipeable Sheet, but [Sheet still composes ModalOverlay](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/react-aria-components/src/Sheet.tsx#L351-L363). Open [#10800](https://github.com/adobe/react-spectrum/pull/10800) adds a styled Popover underlay and independent animations; its description explicitly says "Popover retains ownership of positioning, focus, dismissal" and non-modal popovers gain no backdrop. Neither supplies this requested modality API.

Closed [#5126](https://github.com/adobe/react-spectrum/issues/5126#issuecomment-2455485226) included iframe focus-trap feedback; a member explained "this is what it means to be Modal, you cannot interact with other elements on the screen." Its [later docs response](https://github.com/adobe/react-spectrum/issues/5126#issuecomment-3676008363) invited additional feedback as new issues. Historical modal intent is not evidence to close this new opt-in feature request.

### #10959: Generation and distribution boundaries

The [docs build script](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/dev/s2-docs/package.json#L10) invokes skill generation; [.circleci/build-skills.sh](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/.circleci/build-skills.sh#L19-L30) generates clean docs and copies well-known skill outputs for diffing. These inspected paths do not stage a skill into the published RAC package. Source inspection supports the requested integration gap but does not verify an npm tarball.

[Reference copying](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/dev/s2-docs/scripts/generateAgentSkills.mjs#L826-L866) rewrites relative links for the nested layout. [Validation](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/dev/s2-docs/scripts/generateAgentSkills.mjs#L1046-L1085) covers `SKILL.md` and Markdown references, and is [called before artifact creation](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/dev/s2-docs/scripts/generateAgentSkills.mjs#L1252-L1258). The generator's input-presence check does not establish that existing docs dist matches a release; that invariant must be added to the proposed packaging workflow.

The [trusted AI guide](https://github.com/adobe/react-spectrum/blob/1bff7d0a2e27185d317777779d08784da6966113/packages/dev/s2-docs/pages/react-aria/ai.mdx#L15-L21) documents site-based installation. Closed [#10221](https://github.com/adobe/react-spectrum/issues/10221#issuecomment-4731711925) concerned failed site discovery; the member reported a successful install, and the author later identified a VPN process. This is distinct from version-coupled dependency distribution. No matching npm-packaging PR was found in targeted searches.

All conclusions are reading-based. No issue/PR code, repro, test, build, generator, installer or package-manager approval command was executed. No external reproduction was supplied for either issue; documentation/example URLs that were supplied were not inspected.

## Run notes

### Boundary and checkout

Dry run only: GitHub reads used allowed `gh issue`, `gh pr`, `gh search` commands and `gh api --method GET`. No GitHub comments, labels, edits, closures, gists, PR creation or pushes. Untrusted issue/PR text was evidence only; linked repository items were read through structured `gh` commands, not by opening supplied URLs. No suspected prompt injection was identified.

Verified the existing `/Users/darobins/dev/react-spectrum-triage` checkout on `triage_support`, with no merge in progress and an empty index. App status and process inspection showed no other active triage run; app status was refreshed before digest creation. The target did not exist at initial and pre-write checks. The only pre-existing change was the local `.github/triage/setup.md` adaptation, left untouched and unstaged.

`git fetch origin` and `git merge origin/main --no-edit` succeeded. No tracked changes outside `.github/triage` blocked synchronization. Merge commit: `f15a9f2d6e2dca36db631a6f821186d359bd44a2`. Merged main/source SHA: `1bff7d0a2e27185d317777779d08784da6966113`, verified as an ancestor of HEAD. No conflict or skipped merge.

### Scope and discovery coverage

Run cutoff: supplied timestamp `2026-11-13T16:00:45Z`. Previous digest commit: `c8ac8e9bf593a0c224c9e5f3cea5cffcaa1b4538`, committed at `2026-11-12T16:06:02Z`. Separate open-issue queries for the last 24 hours (`created:>=2026-11-12T16:00:45Z`) and since that commit (`created:>=2026-11-12T16:06:02Z`), each bounded by the run cutoff, returned the same two issues, below the 100-result cap. An initial broader cutoff also returned only these two.

Both issues had `author_association: NONE`; final GETs still showed them open, unlabelled and with zero comments. All supplied bodies and comments were read. No verified team-author skip applied.

Duplicate discovery covered open/closed issues and PRs using non-modal, drawer, `isNonModal`, skill, `skills/` and each exact issue number. Exploratory broad PR searches hit 30/50-result caps; narrowed title/body searches returned 10 non-modal and 15 skill-related PRs, below their limits. Exact issue-number PR searches returned no matches. Relevant related bodies, all returned issue comments and selected PR file lists were read; no repository-wide exhaustive-search claim is made.

### Access failures and safe recovery

Both collaborator-permission GETs failed with HTTP 403, "Must have push access to view collaborator permission." Trusted-main tree inspection found no CODEOWNERS or explicitly named core-contributor/maintainer list. Team membership could not be verified, so normal triage proceeded with that uncertainty; usernames, employer fields and prior contribution were not used as membership proof.

Large command responses were retained by the tool and inspected in bounded ranges or narrowed by source path. An initial source search against guessed docs subdirectories returned no matches; the trusted tree located the generator under `packages/dev/s2-docs/scripts/`, which was then read. No required discovery or source investigation remained blocked. Runtime, tarball and pnpm claims remain intentionally unverified under the read-only/security rules.

### Digest bookkeeping

The only file authorised for staging and the digest commit is `.github/triage/tmp-digests/triage-issues-2026-11-13.md`, on `triage_support`. Recheck the empty index before staging and verify that exact path is the sole staged file before committing with the required Copilot co-author trailer. The resulting commit hash and single-file verification are reported after committing rather than self-embedded here.
