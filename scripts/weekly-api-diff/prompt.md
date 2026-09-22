# Weekly React Spectrum API Diff

You are running the weekly react-spectrum API diff workflow. Follow ALL steps below in order. Do not stop early. If any step fails, log the error to /tmp/weekly-tsdiffer-error.log and continue to the next step where possible.

## Configuration
- react-spectrum repo: $HOME/dev/react-spectrum
- snapshots repo: $HOME/dev/react-spectrum-api-snapshots
- Slack channel: SLACK_CHANNEL_ID
- Slack token env var: SLACK_TSDIFF_CHROMATIC_BOT_TOKEN (already in environment)
- Snapshots GitHub URL: https://github.com/LFDanLu/react-spectrum-api-snapshots

## Step 1: Get today's date

```bash
date +%Y-%m-%d
```

Save the output as TODAY (e.g. 2026-05-05).

## Step 2: Pull latest main

```bash
cd $HOME/dev/react-spectrum
git checkout main
git pull origin main
```

## Step 3: Build the tool and the current API snapshot

Build the extractor/differ (`rsp-api-check`; fast, cached after the first build),
then build main in place and extract its type API:

```bash
cd $HOME/dev/react-spectrum
(cd rsp-api-checker && cargo build --release)
yarn build
rsp-api-checker/target/release/rsp-api-check get-local-api --repo-root . --output dist/branch-api
```

`yarn build` takes 10-30 minutes. Wait for it to complete. Output goes to $HOME/dev/react-spectrum/dist/branch-api/.

## Step 4: Build the release baseline

Resolve the last react-aria-components minor/major release commit and build its
API. `get-ref-api` snapshots that commit with `git archive`, builds it in a temp
dir, and extracts into dist/base-api:

```bash
cd $HOME/dev/react-spectrum
BASELINE_REF=$(git rev-list -n 1 $(git tag -l 'react-aria-components@*' | grep -E '@[0-9]+\.[0-9]+\.0$' | sort -V | tail -1))
echo "Baseline ref: $BASELINE_REF"
rsp-api-checker/target/release/rsp-api-check get-ref-api --repo-root . --ref "$BASELINE_REF" --output dist/base-api
```

This also takes 10-30 minutes.

## Step 5: Generate the diff text

```bash
cd $HOME/dev/react-spectrum
rsp-api-checker/target/release/rsp-api-check compare \
  --base-api-dir dist/base-api \
  --branch-api-dir dist/branch-api \
  --ci | tee /tmp/diff-current.txt
```

Note: only capture stdout (no 2>&1) so stray stderr doesn't end up in the diff file.

## Step 6: Detect new release and compute week-to-week delta

Get the current last Publish commit hash:

```bash
cd $HOME/dev/react-spectrum
git log --grep='^Publish$' --oneline -1 | awk '{print $1}'
```

Save this as CURRENT_PUBLISH. Then read the previously recorded hash:

```bash
cat $HOME/dev/react-spectrum-api-snapshots/last-publish-hash.txt 2>/dev/null
```

Save this as PREV_PUBLISH.

- If PREV_PUBLISH is non-empty and CURRENT_PUBLISH != PREV_PUBLISH: set NEW_RELEASE=true. Skip delta computation and go directly to Step 7.

Otherwise, compute the delta as the ts diff from **last week's main commit** to the **current main** (both sides extracted with the current tool). Record the current main commit and read the previously recorded one:

```bash
cd $HOME/dev/react-spectrum
git rev-parse HEAD                                                          # CURRENT_MAIN
cat $HOME/dev/react-spectrum-api-snapshots/last-main-hash.txt 2>/dev/null   # PREV_MAIN
```

- If PREV_MAIN is empty (first run since switching to commit-based deltas): set WEEKLY_DELTA to "(seeding main hash this run, no delta)".
- Else if PREV_MAIN == CURRENT_MAIN (main unchanged since last run): set WEEKLY_DELTA to "" (empty).
- Else: build last week's main API and diff the current main against it:

```bash
cd $HOME/dev/react-spectrum
rsp-api-checker/target/release/rsp-api-check get-ref-api --repo-root . --ref "$PREV_MAIN" --output dist/last-week-api
rsp-api-checker/target/release/rsp-api-check compare \
  --base-api-dir dist/last-week-api \
  --branch-api-dir dist/branch-api \
  --ci | tee /tmp/weekly-delta.txt
```

Save the output as WEEKLY_DELTA.

## Step 7: Commit and push

Determine whether to commit:
- If /tmp/diff-current.txt is empty (0 bytes): skip commit entirely
- If NEW_RELEASE=true and /tmp/diff-current.txt is non-empty: commit (fresh baseline after release)
- If WEEKLY_DELTA is non-empty and /tmp/diff-current.txt is non-empty: commit (new changes this week)
- Otherwise (WEEKLY_DELTA is empty): skip commit (same as last week)

If committing:

```bash
cd $HOME/dev/react-spectrum-api-snapshots
git checkout main
git pull origin main
cp /tmp/diff-current.txt diffs/$TODAY.txt
echo "$CURRENT_PUBLISH" > last-publish-hash.txt
echo "$CURRENT_MAIN" > last-main-hash.txt   # so next week's delta can diff from here
git add diffs/$TODAY.txt last-publish-hash.txt last-main-hash.txt
git commit -m "weekly api diff $TODAY"
git push
```

## Step 8: Summarize

Choose the appropriate message based on the following cases:

**Case 1 diff-current.txt is empty (no pending API changes vs release):**
Go to Step 9 with message: "No API changes detected vs last release, all pending changes have been included in a release."

**Case 2 NEW_RELEASE=true (release landed since last diff):**
Go to Step 9 with message noting a new release landed, linking to the full diff.

**Case 3 WEEKLY_DELTA is empty (main unchanged since last week, or first-run seed):**
Go to Step 9 with message: "No new API changes on main since last week."

**Case 4 Normal (has changes vs last week):**
Read WEEKLY_DELTA and produce a concise summary:
- Lines added (`+`): API added on main since last week
- Lines removed (`-`): API removed on main since last week (reverted)
- Affected package names

Apply these grouping and classification rules when writing the summary:
- The delta is a direct API diff between last week's main and the current main, so `+` lines are API added this week and `-` lines are API removed this week. A `+ ComponentName` line indicates a new export; a `+` on a prop line inside a component means that prop was added to that component this week.
- If multiple components in the same family (e.g. Checkbox, Radio, Switch) all gain the same new prop (e.g. `description`, `errorMessage`), call it out as a single feature rather than listing each component separately
- If new wrapper components appear (e.g. CheckboxField, RadioField) alongside new props on their inner components, group them together and describe the feature they enable (e.g. "help text support") rather than just listing them as new exports
- Always call out new props added to existing components explicitly, don't bury them under new export counts
- If a prop signature changes (e.g. a callback gains a new argument), flag it as a potential breaking change for consumers who implement that signature
- Group Calendar-family changes together (Calendar, RangeCalendar, CalendarState, DateRangePicker) since they tend to change together

## Step 9: Post to Slack

Post the appropriate message from Step 8:

```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_TSDIFF_CHROMATIC_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\": \"SLACK_CHANNEL_ID\", \"text\": \"📊 Weekly API Diff — $TODAY\n\n<message>\"}"
```

Verify the response contains "ok": true.

## Done

The workflow is complete.
