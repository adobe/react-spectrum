# Triage automation setup (run first)

Run these steps before the PR or issue digest, regardless of which branch the main checkout (`/Users/danilu/dev/react-spectrum`) currently has checked out. All triage work happens in a dedicated worktree on `triage_support`, so the maintainer's own checkout is never touched.

These are the only git operations allowed: fetch, worktree creation, merging `origin/main`, and committing the digest to `triage_support` (step 5). Never push, never commit to or touch any other branch, never rewrite history (no rebase, amend, reset, or force), and never stage or commit anything other than files under `.github/triage/tmp-digests/`.

1. **Fetch:** `git -C /Users/danilu/dev/react-spectrum fetch origin`
2. **Worktree:** if `/Users/danilu/dev/react-spectrum-triage` does not exist, create it:
   `git -C /Users/danilu/dev/react-spectrum worktree add /Users/danilu/dev/react-spectrum-triage triage_support`
   If git refuses because `triage_support` is checked out in the main checkout, stop and report that the maintainer must switch the main checkout to another branch. Do not use `--force` and do not switch the maintainer's branch yourself.
3. **Update against main:** in the worktree, if `git status --porcelain` shows no tracked changes, run `git merge origin/main --no-edit`. If the merge conflicts, run `git merge --abort`, continue with the un-updated branch, and note the conflict at the top of the digest. If there are tracked changes, skip the merge and note that too.
4. **Work from the worktree:** `cd /Users/danilu/dev/react-spectrum-triage`. Read the prompt file (`.github/triage/pull-requests.md` or `.github/triage/issues.md`) from there, and write the digest to `.github/triage/tmp-digests/` there.
5. **Commit:** after the digest is written, in the worktree verify `git branch --show-current` is `triage_support`, then run `git add .github/triage/tmp-digests/<digest file>` and `git commit -m "chore: add <PR|issue> triage digest YYYY-MM-DD"` with the trailer `Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>`. Do not push. If the branch is anything else, do not commit and report it.
6. **Report:** put the branch, the merged `origin/main` commit (or the reason the merge was skipped), the digest's absolute path, and the commit hash at the top of the final message.
