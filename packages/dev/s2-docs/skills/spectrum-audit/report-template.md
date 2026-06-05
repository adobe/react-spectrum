# Spectrum Audit report format

Write the report to `SPECTRUM-AUDIT.md` in the audited project (or the audited package's root in a monorepo). Use this structure exactly.

## Template

```markdown
# Spectrum Audit: <project name>

**Spectrum Adherence Score: <score>/100 (<grade>)**
<n> Critical · <n> High · <n> Medium · <n> Low

## Summary

<2–3 sentences: the overall state of Spectrum/S2 adherence, the single most important thing to fix, and one thing the project does well.>

## Scores by category

| Category | Grade | Findings |
|----------|-------|----------|
| Setup & configuration | <A–F> | <count> |
| Styling | <A–F> | <count> |
| Component usage | <A–F> | <count> |
| Accessibility | <A–F> | <count> |
| Versioning & maintenance | <A–F> | <count> |
| Testing | <A–F> | <count> |

## Findings

Group by severity, highest first; omit empty groups. One bullet per finding:

### Critical
- `path/to/file.tsx:42` — **<rule>**. <Why it matters, one line.> _Fix:_ <remediation>. ([03-styling](references/checks/03-styling.md))

### High
…

### Medium
…

### Low
…

## Action items

- **Fix now** (Critical + High) — most impactful first.
- **Improve** (Medium).
- **Polish** (Low).
- **Follow-ups** — e.g. upgrade to the latest `@react-spectrum/s2`; run the migration skill for remaining Spectrum 1 packages; move to React 19.

## What looks good

- <Genuine positives: correct build setup, good token usage, proper component composition.>
```

## Rules

- Every finding cites a real `file:line` you actually read or grepped. Never invent locations.
- Render `file:line` as a clickable link so the user can jump straight to it.
- Link each finding back to the `references/checks/*.md` file that defines its rule.
- The audit is **report-only** — do not edit any files. Hand fixes to the `react-spectrum-s2` skill.
