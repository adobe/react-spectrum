# Triage automation setup (run first)

Triage runs in its own dedicated checkout, `/Users/danilu/dev/react-spectrum-triage`, a git worktree permanently on `triage_support`. It is registered as the `react-spectrum-triage` project, so the maintainer's main checkout (`/Users/danilu/dev/react-spectrum`) can be on any branch and is never touched.

These are the only git operations allowed: fetch, merging `origin/main`, and committing the digest to `triage_support` (step 4). Never push, never commit to or touch any other branch, never rewrite history (no rebase, amend, reset, or force), and never stage or commit anything other than files under `.github/triage/tmp-digests/`.

1. **Verify:** the current directory must be `/Users/danilu/dev/react-spectrum-triage` and `git branch --show-current` must print `triage_support`. If not, stop and report it. Do not switch branches.
2. **Fetch:** `git fetch origin`
3. **Update against main:** if `git status --porcelain --untracked-files=no -- . ':!.github/triage'` shows no tracked changes, run `git merge origin/main --no-edit`. If the merge conflicts, run `git merge --abort`, continue with the un-updated branch, and note the conflict at the top of the digest. If there are tracked changes, skip the merge and note that too.
4. **Write and commit the digest:** write it to `.github/triage/tmp-digests/` (see the prompt file's Output section). Then run `git add .github/triage/tmp-digests/<digest file>` and `git commit -m "chore: add <PR|issue> triage digest YYYY-MM-DD"` with the trailer `Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>`. Do not push.
5. **Report:** put the branch, the merged `origin/main` commit (or the reason the merge was skipped), the digest's absolute path, and the commit hash at the top of the final message.
