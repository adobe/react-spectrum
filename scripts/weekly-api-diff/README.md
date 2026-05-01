# Weekly API Diff Automation

Runs weekly via GitHub Actions. Compares the current `main` API surface against the last release baseline and posts a summary to Slack.

A local fallback via macOS launchd is also available (see below).

## File Inventory

| File | Location | Purpose |
|------|----------|---------|
| GitHub Actions workflow | `.github/workflows/weekly-api-diff.yml` | Primary automation — runs on GH infra every Monday 9am PT |
| Prompt (source of truth) | `scripts/weekly-api-diff/prompt.md` | Claude instructions for local launchd fallback — edit this, then sync to `~/weekly-tsdiffer.md` |
| Prompt (live) | `~/weekly-tsdiffer.md` | What launchd actually reads each run |
| launchd plist (reference) | `scripts/weekly-api-diff/launchd.plist` | Reference copy for local fallback — install instructions in comments |
| launchd plist (live) | `~/Library/LaunchAgents/com.<username>.weekly-tsdiffer.plist` | What macOS scheduler reads |
| Secrets (local) | `~/.secrets` | Contains `SLACK_TSDIFF_CHROMATIC_BOT_TOKEN` (chmod 600, never commit) |
| Snapshots repo | `~/dev/react-spectrum-api-snapshots` | Stores weekly diff text files (local fallback only) |
| Snapshots repo (GitHub) | https://github.com/LFDanLu/react-spectrum-api-snapshots | Public record of weekly diffs |
| Run log | `/tmp/weekly-tsdiffer.log` | stdout/stderr from each local run |
| Error log | `/tmp/weekly-tsdiffer-error.log` | Step-level errors from the Claude prompt |

## How It Works (GitHub Actions)

1. GH Actions fires every Monday at 9am PT (`cron: '0 17 * * 1'`)
2. Builds current `main` API snapshot via `yarn build:api-branch`
3. Builds release baseline via `yarn build:api-published` (auto-detects last Publish commit)
4. Generates diff, commits to snapshots repo, summarizes via GitHub Models, posts to Slack

## How It Works (Local Fallback)

1. macOS launchd fires every Monday at 9am (catches up on wake if laptop was asleep)
2. Invokes `claude -p "$(cat ~/weekly-tsdiffer.md)"` with bash/read/write/edit permissions
3. Claude: pulls latest main → builds API snapshot → generates diff vs release baseline → commits diff text to snapshots repo → posts Slack summary

## GitHub Actions Secrets Required

| Secret | Notes |
|--------|-------|
| `SLACK_TSDIFF_CHROMATIC_BOT_TOKEN` | Slack bot token |
| `SLACK_CHANNEL_ID` | Slack channel to post to |
| `SNAPSHOTS_REPO_TOKEN` | GitHub PAT with Contents: read+write on `react-spectrum-api-snapshots` |

## Updating the Prompt (Local Fallback)

1. Edit `scripts/weekly-api-diff/prompt.md`
2. Commit to the repo
3. Sync to the live location: `cp scripts/weekly-api-diff/prompt.md ~/weekly-tsdiffer.md`

## Local Fallback Setup (fresh machine)

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
git clone https://github.com/LFDanLu/react-spectrum-api-snapshots ~/dev/react-spectrum-api-snapshots

# 5. Build the release baseline (one-time, ~20 min)
cd ~/dev/react-spectrum
yarn build:api-published
```
