# Issue triage digest — 2026-11-03

> Presentation-only revision of the original digest. This is not a fresh triage run; no historical proposal is executed or newly authorized by this rewrite.

## At a glance

- No eligible issues in the original window.
- Two new reports were excluded because they already had a non-component triage label.
- Scope filtering did not assess or dismiss their reported defects.

## Run notes

#### Git synchronization

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, an empty index, no in-progress merge, and no other active triage session before synchronization and again before writing.

Today's target digest did not exist.

Only the local `.github/triage/setup.md` adaptation was modified. `git fetch origin` succeeded.

The tracked-change check excluding `.github/triage` was empty; `git merge origin/main --no-edit` succeeded without conflicts.

Merged baseline: `6dec77beccf0545a04318e6a01b8eb9cbe2dccc6`, verified as an ancestor of HEAD.

The setup adaptation remains unstaged.

No push is performed.

#### Scope

Open issues created since the previous issue digest commit, `fd2c665ed53e4e2b3e0caac66c7d66832efab0ef` at `2026-11-03T00:10:25Z`, through this run's supplied timestamp, `2026-11-03T16:00:25Z`.

Digest date follows the supplied local date, 2026-11-03.

A broad open-issue query from 2026-11-02 and a second query for the exact window agreed: two new open issues, both already carrying a non-component triage label, and zero eligible issues.

Neither query reached its 100-result limit.

#### Scope exclusions

[#10912](https://github.com/adobe/react-spectrum/issues/10912), live-region inert ownership and iOS VoiceOver

- Created (UTC): 2026-11-03T08:17:14Z
- Evidence: The issue's current labels include exactly `waiting on author`.
- Decision: Excluded: this is a non-component triage label. Would not re-triage or propose further actions in this run.

[#10913](https://github.com/adobe/react-spectrum/issues/10913), Escape during a WebKit modal enter animation

- Created (UTC): 2026-11-03T10:29:35Z
- Evidence: The issue's current labels include exactly `waiting on author`.
- Decision: Excluded: this is a non-component triage label. Would not re-triage or propose further actions in this run.

Earlier issues, including [#10907](https://github.com/adobe/react-spectrum/issues/10907) and [#10909](https://github.com/adobe/react-spectrum/issues/10909), were created before the cutoff and were covered in the previous digest.

Their lack of labels does not bring them back into this creation-based window.

#### Read-only boundary

GitHub access used only `gh issue list` and `gh api --method GET` for the repository label list.

No GitHub writes, comments, labels, closes, edits, gists, PR creation, or pushes.

No issue-supplied URLs were opened, and no issue code was executed, installed, built, imported, or evaluated.

Local changes are limited to this generated digest and the authorized synchronization; the existing setup adaptation is preserved.

#### Empty-scope outcome

No labels, comments, closes, links, author requests or escalations were proposed for excluded reports.

No eligible report was assessed for `ready for review`; missing reproduction/environment details were not inferred.

The absent `ai-reviewed` label did not require creation for this run.

Confidence was high for scope filtering only.

Eligibility could change if all non-component labels were removed before a future collection or scope were explicitly expanded.

Historical feedback prompt: Should future digests revisit previously covered but still-unlabeled issues, rather than filtering solely by creation time?

### Rule feedback from the original run

- Used "since the last digest" rather than a rolling 24-hour window, with the previous digest's commit timestamp as the lower bound. This avoids repeating reports already assessed yesterday.
- The rules do not specify an empty-scope format.

- Retained the required summary table, documented exclusions without re-triaging them, and included an explicit empty-scope **Would have done** block.

- There are no eligible issue sections requiring individual blocks.
- The rules call the waiting state `waiting for author`, but the actual repository label is `waiting on author`. Used the exact existing label as evidence that both new reports are already triaged.
- Duplicate searches, reproduction checks, severity judgments, regression checks, and solution research were not performed because no issue passed the scope filter.

- The exclusion decision does not verify or dismiss either report, including its accessibility impact.
- Session-status checks found no overlapping active issue or PR triage run. These are point-in-time checks, not an atomic cross-run lock.
