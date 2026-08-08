# Check 05 — Versioning & maintenance

## Checks

### On the latest `@react-spectrum/s2`
- **Rule:** Use the latest S2 release.
- **Detect:** read the installed `@react-spectrum/s2` version (from the lockfile or `package.json`) and compare against the latest published version (`npm view @react-spectrum/s2 version`, if network access is available; otherwise note that it couldn't be checked).
- **Severity:** Medium if behind by a minor/patch; High if a major version behind.

### No Spectrum 1 + Spectrum 2 mixing
- **Rule:** A codebase shouldn't straddle Spectrum 1 and Spectrum 2 long-term.
- **Detect:** `@react-spectrum/s2` present **and** any Spectrum 1 packages — `@adobe/react-spectrum`, `@react-spectrum/*` (other than `/s2`), or `@spectrum-icons/*` — in `package.json` or imported in source.
- **Severity:** High. **Hand off:** recommend the `migrate-react-spectrum-v3-to-s2` skill.

### No deprecated props
- **Rule:** Avoid props marked deprecated in the current S2 docs.
- **Detect:** cross-check the props in use against the component docs in the `react-spectrum-s2` skill (`references/components/`).
- **Severity:** Medium.
