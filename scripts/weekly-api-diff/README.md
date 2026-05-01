# Weekly API Diff Automation

Runs weekly on a local machine via macOS launchd. Compares the current `main` API surface against the last release baseline and posts a summary to Slack.

## File Inventory

| File | Location | Purpose |
|------|----------|---------|
| Prompt (source of truth) | `scripts/weekly-api-diff/prompt.md` | Claude instructions — edit this, then sync to `~/weekly-tsdiffer.md` |
| Prompt (live) | `~/weekly-tsdiffer.md` | What launchd actually reads each run |
| launchd plist (reference) | `scripts/weekly-api-diff/launchd.plist` | Reference copy — install instructions in comments |
| launchd plist (live) | `~/Library/LaunchAgents/com.<username>.weekly-tsdiffer.plist` | What macOS scheduler reads |
| Secrets | `~/.secrets` | Contains `SLACK_TSDIFF_CHROMATIC_BOT_TOKEN` (chmod 600, never commit) |
| Snapshots repo | `~/dev/react-spectrum-api-snapshots` | Stores weekly diff text files |
| Snapshots repo (GitHub) | https://github.com/\<YOUR_GITHUB_USERNAME\>/react-spectrum-api-snapshots | Public record of weekly diffs |
| Run log | `/tmp/weekly-tsdiffer.log` | stdout/stderr from each run |
| Error log | `/tmp/weekly-tsdiffer-error.log` | Step-level errors from the Claude prompt |

## How It Works

1. macOS launchd fires every Monday at 9am (catches up on wake if laptop was asleep)
2. Invokes `claude -p "$(cat ~/weekly-tsdiffer.md)"` with bash/read/write/edit permissions
3. Claude: pulls latest main → builds API snapshot → generates diff vs release baseline → commits diff text to snapshots repo → posts Slack summary

## Release Baseline

Currently uses commit `ca748178f7975b914f689dd6d0f164622109b0b9` as the fixed reference, built via:
```bash
yarn build:api-branch --githash=ca748178f7975b914f689dd6d0f164622109b0b9 --output=base-api
```

Eventually switch to `yarn build:api-published` once that script is fixed (tracked separately).

## Updating the Prompt

1. Edit `scripts/weekly-api-diff/prompt.md`
2. Commit to the repo
3. Sync to the live location: `cp scripts/weekly-api-diff/prompt.md ~/weekly-tsdiffer.md`

## Migrating to GitHub Actions

The `prompt.md` logic can be translated into a GitHub Actions workflow at `.github/workflows/weekly-api-diff.yml`. The main differences:
- Replace `launchd` schedule with `on: schedule: cron`
- Replace `SLACK_TSDIFF_CHROMATIC_BOT_TOKEN` from `~/.secrets` with a GitHub Actions secret
- Replace `$HOME` paths with `$GITHUB_WORKSPACE`
- The `dist/base-api` baseline would need to be cached or rebuilt each run

## Setup (fresh machine)

```bash
# 1. Copy prompt to home dir
cp scripts/weekly-api-diff/prompt.md ~/weekly-tsdiffer.md

# 2. Install launchd plist (replace <username> with your macOS username)
cp scripts/weekly-api-diff/launchd.plist ~/Library/LaunchAgents/com.<username>.weekly-tsdiffer.plist
launchctl load ~/Library/LaunchAgents/com.<username>.weekly-tsdiffer.plist

# 3. Add Slack bot token to ~/.secrets (chmod 600)
echo 'export SLACK_TSDIFF_CHROMATIC_BOT_TOKEN=xoxb-...' >> ~/.secrets
chmod 600 ~/.secrets

# 4. Clone snapshots repo
git clone https://github.com/<YOUR_GITHUB_USERNAME>/react-spectrum-api-snapshots ~/dev/react-spectrum-api-snapshots

# 5. Build the release baseline (one-time, ~20 min)
cd ~/dev/react-spectrum
yarn build:api-branch --githash=ca748178f7975b914f689dd6d0f164622109b0b9 --output=base-api
```
