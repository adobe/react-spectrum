# Weekly React Spectrum API Diff

You are running the weekly react-spectrum API diff workflow. Follow ALL steps below in order. Do not stop early. If any step fails, log the error to /tmp/weekly-tsdiffer-error.log and continue to the next step where possible.

## Configuration
- react-spectrum repo: $HOME/dev/react-spectrum
- snapshots repo: $HOME/dev/react-spectrum-api-snapshots
- Slack channel: <SLACK_CHANNEL_ID>
- Slack token env var: SLACK_BOT_TOKEN (already in environment)
- Snapshots GitHub URL: https://github.com/<YOUR_GITHUB_USERNAME>/react-spectrum-api-snapshots
- Release baseline commit: ca748178f7975b914f689dd6d0f164622109b0b9
  (eventually replace with yarn build:api-published once that script is fixed)

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
yarn build:api-branch --githash=ca748178f7975b914f689dd6d0f164622109b0b9 --output=base-api
```

This also takes 10-30 minutes.

## Step 5: Generate the diff text

```bash
cd $HOME/dev/react-spectrum
yarn compare:apis \
  --branch-api-dir=$HOME/dev/react-spectrum/dist/branch-api \
  --base-api-dir=$HOME/dev/react-spectrum/dist/base-api \
  --isCI 2>&1 | tee $HOME/dev/react-spectrum-api-snapshots/diffs/$TODAY.txt
```

Check if the output file is empty:

```bash
wc -c < $HOME/dev/react-spectrum-api-snapshots/diffs/$TODAY.txt
```

- If the file is empty (0 bytes): set EMPTY_DIFF=true, skip Step 6 and Step 8, and go directly to Step 9 using the no-diff message format
- Otherwise: continue to Step 6

## Step 6: Compute week-to-week delta

Find the most recent previous diff file in the snapshots repo:

```bash
ls -t $HOME/dev/react-spectrum-api-snapshots/diffs/*.txt 2>/dev/null | sed -n '2p'
```

- If a previous file exists: run `diff <previous-file> $HOME/dev/react-spectrum-api-snapshots/diffs/$TODAY.txt` and save the output as the WEEKLY_DELTA
- If no previous file exists (first run): set WEEKLY_DELTA to "(first run — no previous diff to compare against)"

## Step 7: Commit and push the new diff file

```bash
cd $HOME/dev/react-spectrum-api-snapshots
git add diffs/$TODAY.txt
git commit -m "weekly api diff $TODAY"
git push
```

## Step 8: Summarize

Read the WEEKLY_DELTA from Step 6 and produce a concise summary of what changed this week:
- Lines added to the diff (new API changes vs release that weren't there last week)
- Lines removed from the diff (API changes that were reverted or landed in a release)
- Affected package names

If first run, note that and link to the full diff instead.

Apply these grouping and classification rules when writing the summary:
- If multiple components in the same family (e.g. Checkbox, Radio, Switch) all gain the same new prop (e.g. `description`, `errorMessage`), call it out as a single feature rather than listing each component separately
- If new wrapper components appear (e.g. CheckboxField, RadioField) alongside new props on their inner components, group them together and describe the feature they enable (e.g. "help text support") rather than just listing them as new exports
- Always call out new props added to existing components explicitly — don't bury them under new export counts
- If a prop signature changes (e.g. a callback gains a new argument), flag it as a potential breaking change for consumers who implement that signature
- Group Calendar-family changes together (Calendar, RangeCalendar, CalendarState, DateRangePicker) since they tend to change together

## Step 9: Post to Slack

If EMPTY_DIFF=true, post this message:

```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\": \"<SLACK_CHANNEL_ID>\", \"text\": \"📊 Weekly API Diff — $TODAY\n\nNo API changes vs release baseline this week — either nothing new has landed on main yet, or all pending changes were included in a release.\"}"
```

Otherwise, post the summary. Fill in the actual counts and package names from Step 8:

```bash
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"channel\": \"<SLACK_CHANNEL_ID>\", \"text\": \"📊 Weekly API Diff — $TODAY\n\n<summary of weekly delta>\n\nFull diff vs release: https://github.com/<YOUR_GITHUB_USERNAME>/react-spectrum-api-snapshots/blob/main/diffs/$TODAY.txt\n\nReact ✅ if changes look expected, or 🚨 if something looks wrong.\"}"
```

Verify the response contains "ok": true.

## Done

The workflow is complete.
