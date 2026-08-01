# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, GitHub Copilot, Codex, etc.) working in this repository. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for full contributor documentation and local development setup.

## Filing GitHub issues

This repository uses GitHub issue **forms** defined in [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/) (`Bug_Report.yml`, `Feature_Request.yml`, `Documentation.yml`, `Feedback.yml`). Blank issues are disabled, and `CONTRIBUTING.md` asks contributors to follow the templates. Please do the same when filing on a user's behalf:

- **Search first.** Check existing open and closed issues to avoid duplicates.
- **Prefer the web flow** so the correct form is applied: <https://github.com/adobe/react-spectrum/issues/new/choose>
- **If filing via the `gh` CLI, replicate the template's fields in the body.** `gh issue create --template` does *not* render these YAML issue forms, so passing `--template` alone will not produce a valid issue. Instead, fill in the chosen template's fields manually. For a bug report (`Bug_Report.yml`), include:
  - a general summary
  - Expected Behavior
  - Current Behavior
  - Possible Solution (optional)
  - Context (how it affects you / what you're trying to accomplish)
  - Steps to Reproduce — a minimal repro, ideally a StackBlitz
  - Version, Browsers, Operating System
- **Questions and open-ended discussion** belong in [Discussions](https://github.com/adobe/react-spectrum/discussions), not the issue tracker.
- **Security issues** must not be filed on the public tracker. Follow the process in `CONTRIBUTING.md`.
