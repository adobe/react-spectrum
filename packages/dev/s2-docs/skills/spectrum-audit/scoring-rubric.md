# Spectrum Adherence Scoring

The Spectrum Adherence Score is computed **deterministically** from the findings you recorded — never from a subjective sense of overall quality. The same set of findings must always produce the same score. Do not round, fudge, or "feel out" a number; run the arithmetic below.

## Severity weights

Each finding contributes points equal to its severity:

| Severity | Weight | Meaning |
|----------|--------|---------|
| Critical | 10 | Breaks the build, breaks accessibility, or ships visibly broken styling to users. |
| High | 5 | Wrong approach that will cause real problems — `UNSAFE_*`, bypassing the design system, missing CSS-bundle optimization. |
| Medium | 2 | Missed reuse or a convention violation that degrades quality but still works. |
| Low | 1 | Polish: redundant default props, minor token choices, naming. |

## Per-category score

For each of the six categories:

```
categoryScore = 100 − min(100, Σ severityWeight for findings in that category)
```

A category with no findings scores 100. A category with one Critical + two Medium findings scores `100 − (10 + 2 + 2) = 86`. The `min(…, 100)` caps deductions so one very-noncompliant category can't push a score below 0.

## Overall score

The overall score is the weighted average of the six category scores:

| Category | Weight |
|----------|--------|
| Setup & configuration | 25% |
| Component usage | 20% |
| Styling | 20% |
| Accessibility | 20% |
| Versioning & maintenance | 10% |
| Testing | 5% |

```
overall = round( Σ (categoryScore × categoryWeight) )
```

## Grade bands

| Score | Grade |
|-------|-------|
| 90–100 | A |
| 80–89 | B |
| 70–79 | C |
| 60–69 | D |
| < 60 | F |

## Notes

- If a category does not apply (e.g. the project has no tests), score it **100** and label it "not applicable" rather than penalizing the project.
- Always show the raw finding counts next to the score. The number is a summary, not a substitute for reading the findings.
- **Deduplicate findings:** count each distinct root cause at a `file:line` once. If multiple checks could apply (e.g. a missing collection `aria-label`, or a third-party design system import), assign it to the most specific check and category only.
