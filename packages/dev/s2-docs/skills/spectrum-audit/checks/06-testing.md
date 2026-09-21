# Check 06 — Testing

Lowest-weight category. Only applies if the project has tests that exercise S2 components.

## Checks

### Use the ARIA pattern testers
- **Rule:** Test S2 components with the ARIA pattern testers from `@react-spectrum/test-utils` rather than hand-rolled role/selector queries. The testers model real user interaction (open a menu, select a row, toggle a checkbox) and stay correct as internal DOM changes.
- **Detect:** tests that render S2 collections or overlays and query them with raw `getByRole` / `container.querySelector` chains instead of the `@react-spectrum/test-utils` testers.
- **Severity:** Low.

If the project has no tests touching S2 components, score this category **100** and label it "not applicable" in the report.
