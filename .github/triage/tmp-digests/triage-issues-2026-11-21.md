# Issue triage digest: 2026-11-21

## At a glance

- One eligible issue assessed; no team-authored issues skipped.
- Announcement clearing uses a Trusted Types-sensitive sink on main; an open PR proposes a localized fix.
- Browser enforcement and affected workflow severity remain unverified. Source evidence supports investigation now, without executing the report or its proposed tests.

### [#11012](https://github.com/adobe/react-spectrum/issues/11012): Announcement clearing fails under Trusted Types

**Decision:** Source-supported and actionable, but not fully ready under the environment/reproduction checklist; investigate the focused NumberField path alongside the existing fix proposal.

**Impact/severity:** Unknown. A thrown clearing call can interrupt value announcements, but the report does not establish whether an essential task is blocked, which users are affected, or a practical supported workaround.

**Complexity:** Low, provisionally. The identified sink is confined to two clearing assignments, and replacing child removal need not change public APIs or live-region attributes.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11012) says clearing "throws a TypeError" with `require-trusted-types-for 'script'` and no default policy, affecting `react-aria` 3.53.1. Both `innerHTML = ''` assignments remain on trusted main.
- The [focused spinbutton effect](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/spinbutton/useSpinButton.ts#L150-L155) calls `clearAnnouncer('assertive')` before announcing the updated value. An exception would prevent that announcement; an application-wide crash is not established.
- [#11013](https://github.com/adobe/react-spectrum/pull/11013) explicitly says "Closes #11012" and replaces both assignments with child removal. It is open, not an already-shipped fix or a reason to skip this issue.
- No runnable external reproduction, exact browser version, OS, or application-impact description is supplied. Chromium enforcement and the published ESM claim were not independently verified; no prior working version supports a regression classification.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `NumberField`, `RAC` for the source-traced component/layer; `accessibility` for interrupted value announcements; `needs investigation` for browser enforcement and impact confirmation; `ai-reviewed` for completed automated triage.
- Removals: none; the issue is currently unlabelled. All proposed labels exist.
- Maintainer-only: consider `ready for review` after the reproduction and environment gaps are resolved. Do not propose `regression` on the single affected-version report.

**Maintainer next step**

1. Review the existing child-removal proposal in #11013 against both live logs and their retained ARIA attributes. It appears to address the identified sink; merging/release status needs a separate maintainer decision.
2. Request a minimal reproduction served with the reported CSP, exact Chromium version and OS, the triggering interaction, error stack, and whether value changes or only announcements fail. Include the affected screen-reader/browser combination if accessibility impact is observed.
3. Independently verify a focused NumberField value change under real enforced Trusted Types, with no default policy, and confirm announcements still work afterwards. The proposed setter-mocking test is useful source evidence, not browser or assistive-technology validation.

## Evidence and verification

### #11012: Source-supported failure path

[LiveAnnouncer.clear on trusted main](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/live-announcer/LiveAnnouncer.tsx#L165-L177) contains `this.assertiveLog.innerHTML = ''` and `this.politeLog.innerHTML = ''`. There is no catch around the clearing call in the focused spinbutton effect. Conditional on the reported enforcement throwing at this sink, the subsequent announcement is skipped.

The [same implementation](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/live-announcer/LiveAnnouncer.tsx#L121-L126) creates persistent logs with `role="log"`, `aria-live`, and `aria-relevant="additions"`. Announcement creation already uses `textContent` or ARIA attributes rather than HTML parsing. Removing children while retaining those logs is a plausible localized fix. No documented existing API workaround was established; weakening CSP or adding a permissive default policy is not recommended.

Main's [react-aria package manifest](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/package.json#L1-L3) also identifies version 3.53.1. This corroborates source/version context, not the contents or runtime behaviour of the published package. The report is a compatibility failure under enforcement, not evidence of an exploitable vulnerability or a confirmed regression.

### #11012: Candidate fix and duplicate comparison

The read-only [#11013 files](https://github.com/adobe/react-spectrum/pull/11013/files) replace both sinks with `replaceChildren()` and add tests for selective clearing, preservation of the other log, and a throwing `innerHTML` setter. By reading, the setter-mocking case should expose the current assignments and avoid them after the proposed change. No tests were executed, and the mock does not establish real CSP or screen-reader behaviour.

No matching duplicate issue or merged fix was identified. [#5191](https://github.com/adobe/react-spectrum/issues/5191) reports that "the message is not being announced" on the first trigger, while subsequent triggers work, with a [member-confirmed browser/AT reproduction](https://github.com/adobe/react-spectrum/issues/5191#issuecomment-1747615633). That is an initial-announcement timing problem, not a clearing TypeError under Trusted Types; do not close #11012 as its duplicate.

### #11012: Reproduction limits

The issue has an affected package version and policy condition, but no minimal runnable example, browser build, OS, error stack, or explicit user consequence. Its source link was not opened; the corresponding trusted `origin/main` source was read independently. Issue and PR links were only read through permitted `gh` commands. No issue-supplied code, commands, URLs, proposed tests, browser reproduction, or dependency installation were executed.

## Run notes

### Synchronization and checkout

Verified dedicated checkout `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, with no staged changes or in-progress merge. App status showed this run as the only busy session and all other sessions in the shared triage project idle; the process inspection revealed no additional identifiable active triage command.

`git fetch origin` and `git merge origin/main --no-edit` succeeded without conflicts. Merged source SHA: `6be3466d87cc628ee69461230c1b5f4e3b64c6e3`, verified as an ancestor of HEAD. Pre-digest merge commit: `4bb1e51e9a218821a43214b0e4be3ecd7508ae16`. The only pre-existing worktree change was the local `.github/triage/setup.md` adaptation, which remains unstaged.

### Scope and membership

Cutoff: `2026-11-21T16:01:59Z`, from the supplied run timestamp; filename uses local date November 21. Since-last-digest discovery starts at the November 20 issue digest's cutoff, `2026-11-20T16:01:23Z`; the last-24-hours query starts at `2026-11-20T16:01:59Z`. Both bounded open-issue queries returned only #11012, below their 100-result limits. Final discovery and issue GET at approximately `2026-11-21T16:03:16Z` confirmed it remained open, unlabelled and without comments.

Membership was checked before body investigation: author association `NONE`. The collaborator-permission GET failed with HTTP 403, "Must have push access to view collaborator permission." Team membership is therefore unverified, not disproved; normal triage proceeded. Trusted main tree inspection found no CODEOWNERS or explicitly named maintainer/core-contributor list. No team-author skip was justified.

### Discovery coverage and read failures

Open/closed issue searches: `"Trusted Types"` (1), `LiveAnnouncer` (17), `TrustedHTML` (1), and `announcer CSP` (0). PR searches: `"Trusted Types"` (1), `LiveAnnouncer` (12), and `11012` (1). All were below their 30-result limits. Read the complete issue body/comments, candidate fix body/files/comments, and closest first-announcement comparison #5191. Repository labels were enumerated with paginated GETs.

The initial search incorrectly passed the repository qualifier inside one quoted search argument and failed with "Invalid search query"; subsequent searches using explicit `--repo adobe/react-spectrum` succeeded. Tree/grep probes exited 1 for absent membership-list or announcer-test matches, not a synchronization failure. The main tree contains no dedicated `packages/react-aria/test/live-announcer` tests; the existing spinbutton test mocks the announcer and has no `clearAnnouncer` match. No execution-based claims are made.

### Boundary and digest bookkeeping

Dry run only: no GitHub writes, notifications, labels, comments, assignments, closures, gists, PR creation or push. All actions above are proposals for maintainer review.

Today's target was absent before writing. Only `.github/triage/tmp-digests/triage-issues-2026-11-21.md` is authorized for staging and committing, using `chore: add issue triage digest 2026-11-21` and the prescribed Copilot co-author trailer. The resulting commit hash is reported separately after verifying that it contains only this digest; it is not self-embedded.
