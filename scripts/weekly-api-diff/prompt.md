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

## Step 3: Build current API snapshot

```bash
cd $HOME/dev/react-spectrum
yarn build:api-branch
```

This takes 10-30 minutes. Wait for it to complete. Output goes to $HOME/dev/react-spectrum/dist/branch-api/.

## Step 4: Build release baseline (if not already built)

Check if $HOME/dev/react-spectrum/dist/base-api/ exists and contains files:

```bash
ls $HOME/dev/react-spectrum/dist/base-api/ 2>/dev/null | head -5
```

- If it lists files: skip to Step 5 (baseline already built)
- If empty or missing: build it now:

```bash
cd $HOME/dev/react-spectrum
yarn build:api-published
```

This also takes 10-30 minutes.

## Step 5: Generate the diff text

```bash
cd $HOME/dev/react-spectrum
yarn compare:apis --isCI | tee /tmp/diff-current.txt
```

Note: only capture stdout (no 2>&1), stderr from yarn should not end up in the diff file.

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
- Otherwise: find the most recent previous diff file (sort alphabetically, not by mtime):

```bash
ls $HOME/dev/react-spectrum-api-snapshots/diffs/*.txt 2>/dev/null | sort -r | head -1
```

If a previous file exists: run `diff <previous-file> /tmp/diff-current.txt` and save the output as WEEKLY_DELTA.
If no previous file exists (first run): set WEEKLY_DELTA to "(first run, no previous diff to compare against)".

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
git add diffs/$TODAY.txt last-publish-hash.txt
git commit -m "weekly api diff $TODAY"
git push
```

## Step 8: Summarize

Choose the appropriate message based on the following cases:

**Case 1 diff-current.txt is empty (no pending API changes vs release):**
Go to Step 9 with message: "No API changes detected vs last release, all pending changes have been included in a release."

**Case 2 NEW_RELEASE=true (release landed since last diff):**
Go to Step 9 with message noting a new release landed, linking to the full diff.

**Case 3 WEEKLY_DELTA is empty (same diff as last week):**
Go to Step 9 with message: "No new API changes since last diff (PREV_DATE): PREV_URL"

**Case 4 Normal (has changes vs last week):**
Read WEEKLY_DELTA and produce a concise summary:
- Lines added to the diff (new API changes not there last week)
- Lines removed from the diff (API changes that were reverted or released)
- Affected package names

Apply these grouping and classification rules when writing the summary:
- The delta is a diff-of-diffs. A `+` prefix on an entire component section means that component wasn't in last week's diff but appears now — this does NOT mean the component is new. It means the component now has API changes vs the release baseline that weren't there last week (e.g. a prop was added or removed). Only call a component "new" if the diff itself contains a line like `+ ComponentName` indicating a new export.
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
