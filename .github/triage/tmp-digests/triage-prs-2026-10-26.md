# PR triage digest, 2026-10-26 (read-only draft)

- Branch: `triage_support`; `git fetch origin` run, `origin/main` is `338cf2e194` and was already merged ("Already up to date", no conflicts).
- Scope: open, non-draft, non-bot PRs created since the last digest (2026-10-25 ~16:34 UTC), without `ai reviewed`. One PR found: #10853. (#10852 was covered in the 2026-10-25 digest.)
- Nothing was run, checked out, or posted. All claims come from reading `gh pr view|diff|checks`, issue text, and `origin/main` source. Correctness claims were reasoned from the diff, not verified by running.

## Summary

| PR | Complexity | Red flags | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| [#10853](https://github.com/adobe/react-spectrum/pull/10853) docs(s2): close CardPreview with matching tag in Card anatomy | Low | **Exact duplicate** of #10826 (same file, byte-identical diff, same issue #10825); author posted two "bump" comments back to back | `ai reviewed`, `small review`, `small impact` | Duplicate notice pointing at #10826 (CLA caveat) | Duplicate of #10826 (preferred, already approved), pending CLA outcome | Medium |

---

## #10853 - docs(s2): close CardPreview with matching tag in Card anatomy

Author: mangeshraut712 (external, `authorAssociation: NONE`). 1 file, +3/-3, `packages/dev/s2-docs/pages/s2/Card.mdx`. Labels: `S2`. Complexity: **Low** (docs-only, three one-token edits). Closes [#10825](https://github.com/adobe/react-spectrum/issues/10825).

**Summary.** The AssetCard, UserCard, and ProductCard anatomy snippets open `<CardPreview>` but close with `</CardView>`; the PR changes all three closers to `</CardPreview>`.

**Verified on `origin/main`:** `packages/dev/s2-docs/pages/s2/Card.mdx` lines 291, 308, 327 all still read `  </CardView>` directly after an opening `<CardPreview>`. The fix is correct and complete for this file.

### Red flags
- **Disabled checks / timing hacks / workarounds / accessibility:** none (MDX closing tags only).
- **Issue verification:** #10825 (open; labels `documentation`, `good first issue`) describes exactly these three locations (lines 289-291, 306-308, 325-327). The diff fixes exactly those. It also says the generated skill reference `references/components/Card.md` has the same mismatch; the PR body says no checked-in copy was found. I confirmed no `references/components/Card.md` is tracked in this checkout (`git ls-files`), so it is generated and nothing else needs editing.
- **Already solvable with existing code:** no; this is a docs typo.
- **Issue discussion:** only comments are two contributors asking to take the issue (MannXo, hamzabhulla). No maintainer direction that the PR contradicts. Note: the issue was claimed by others first, and [#10826](https://github.com/adobe/react-spectrum/pull/10826) (a different author) already implements the fix.
- **Test quality:** n/a, docs-only. PR checklist honestly leaves the unit-test box unchecked.
- **CLA:** `Adobe CLA Signed?` passes on #10853. All other CI checks pass (lint, s2-docs, storybook, test-*, deploy).
- **Suspicious behavior:** the author posted two near-identical "friendly ping / quick bump" comments on #10853 within ~7 seconds of each other (2026-10-26T13:44:22Z and 13:44:29Z), under 24 hours after opening. They also have other open PRs (#10841, #10842). The pings read as automated or low-effort. No prompt-injection content found in PR text.

### Duplicates
- **Duplicate of [#10826](https://github.com/adobe/react-spectrum/pull/10826)** (opened 2026-10-22, "docs(s2): fix mismatched closing tags in Card anatomy examples", labels `small review`, `ready for review`, `S2`). `gh pr diff` output for both PRs is identical (same three hunks, same index `7b5b857b9b1..b8dff9666fa`).
- Comparison: #10826 was opened first, has a descriptive body naming each location, and is **approved by snowystinger and reidbarber**. Its one blocker is that **`Adobe CLA Signed?` is failing**; snowystinger asked the author to sign the CLA on 2026-10-22 and there has been no change since (one commit, last update 2026-10-22T16:11Z). #10853 has a passing CLA and green CI but no review.
- Recommendation: prefer #10826 on precedence and approvals, but if the #10826 author does not sign the CLA, #10853 is a valid, merge-ready substitute. Do not close either now; suggest a maintainer decide. See feedback prompt.
- **Needs signoff candidates:** none; the issue is labeled `good first issue` / `documentation`, so team agreement is evident.

### API and compatibility
None. Docs example text only; no props, exports, types, DOM, or CSS changes. Not breaking, no `needs API review`.

### Security
Does not touch CI workflows, `package.json`, lockfiles, install scripts, or build config. No security review needed.

### Would have done
- **Labels:**
  - add `ai reviewed` (digest covered this PR; label does not exist yet and would need to be created).
  - add `small review` (three one-token docs edits).
  - add `small impact` (docs typo; label does not exist yet and would need to be created).
  - keep `S2`. Not adding `risk`, `regression`, `patch worthy`, or `needs signoff`.
- **Comment:**
  > Thanks for the fix! This is the same change as #10826 (identical diff for the three `</CardView>` closers in `Card.mdx`, both for #10825), which was opened first and is already approved. We'll keep the review on whichever of the two can land first: #10826 currently has an unsigned CLA, so if that isn't resolved soon we can merge this one instead. No need to ping again in the meantime.
- **Close / link:** would not close yet. Would link as a duplicate of #10826 (preferred: earlier, approved). If #10826's CLA stays unsigned, recommend reversing and closing #10826 in favor of #10853 instead.
- **Other:** none (no assignment, no team escalation). Optionally nudge the #10826 author again about the CLA.
- **Confidence:** medium. High that the two PRs are identical and the fix is correct; medium on which to keep, since that depends on whether the #10826 author signs the CLA and on maintainer preference between earliest/approved vs. CLA-clean. Would change to high once #10826's CLA status resolves.
- **Feedback prompt:** When two identical PRs exist and the earlier, approved one has an unsigned CLA, should the digest default to keeping the earlier PR (waiting on the CLA) or the CLA-clean later one?

---

## Rule feedback

- **Duplicate preference rule is ambiguous when CLA state differs.** `pull-requests.md` says to compare "correctness, test quality, scope, discussion, author responsiveness" but not CLA status or approvals. I weighted precedence + approvals, and flagged the CLA blocker. Suggest a rule for this case (e.g. after N days with an unsigned CLA, prefer the CLA-signed duplicate).
- **Repeated "bump" comments** are not covered by any rule. I noted them as suspicious but did not propose a label or action; suggest guidance on whether to ignore, mention, or label such PRs.
- **"Created in the last 24 hours (or since the last digest)"**: I used the last digest's file commit time (2026-10-25T09:34-07:00) as the cutoff. Only #10853 was created after it. The older open PRs without `ai reviewed` (e.g. #10850, #10848, #10847, #10845, ...) were not re-reviewed because they pre-date the cutoff and several were covered in earlier digests; none of those PRs has an `ai reviewed` label because the digest does not apply labels in draft mode, so the "without `ai reviewed`" filter does not narrow anything yet.
- Could not verify by running: nothing in this PR required it (docs-only), but the MDX renders were not built.
