# Check 04 — Accessibility & correctness

Catches accessibility regressions and slot / Provider misuse that S2 otherwise handles for you. Canonical rules: `react-spectrum-s2` skill → `SKILL.md` (Buttons with text and icon, Typography, Form fields, Provider scope).

## Checks

### Accessible names
- **Rule:** Icon-only buttons and every collection container need an accessible name.
- **Detect:** `Button` / `ActionButton` with only an icon child and no `aria-label`; collections (`ListView`, `TableView`, `CardView`, `TreeView`, `Menu`, `ListBox`, `GridList`, `TagGroup`, `Breadcrumbs`) without `aria-label` / `aria-labelledby`.
- **Severity:** High.

### Icon + text buttons wrap the label in `Text`
- **Rule:** A button with **both** an icon and a label must wrap the label in `<Text>`; a bare string sibling next to an icon renders incorrectly.
- **Detect:** `Button` / `ActionButton` / `LinkButton` with an icon child and a bare string sibling (no `<Text>`).
- **Severity:** Medium.

### Slot components only inside their slot context
- **Rule:** `Text`, `Heading`, and `Content` are slot components — standalone (outside a card, dialog, list, picker, menu, tab, etc.) they don't produce correct typography. Use a native element + the `style` macro instead.
- **Detect:** `<Heading>` / `<Text>` / `<Content>` rendered outside a component that provides their slot.
- **Severity:** Medium.

### Form fields use props, not wrappers
- **Rule:** S2 fields render their own label, description, error message, and required indicator. Pass these as props (`label`, `description`, `errorMessage`, `isRequired`, `contextualHelp`) — don't wrap a field in a `<label>` / `<p>` / `<div>` to attach them.
- **Detect:** an S2 field wrapped in `<label>`, or a sibling `<p>`/`<span>` used as its label or help text.
- **Severity:** Medium.

### Provider scope and color scheme
- **Rule:** One root Provider; don't stack Providers (nesting is only for scoping a different `locale`/`router`/`colorScheme` to a subtree); let the Provider manage `colorScheme` — use `lightDark()` for one-off color differences rather than hard-coding `colorScheme="light"|"dark"`.
- **Detect:** more than one `Provider`; a hard-coded `colorScheme` prop on `Provider`. (Root-Provider setup is in [01-setup-config](01-setup-config.md).)
- **Severity:** Medium.
