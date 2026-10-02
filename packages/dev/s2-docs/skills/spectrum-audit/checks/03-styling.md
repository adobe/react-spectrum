# Check 03 — Styling

Validates that styling goes through S2 components and the `style` macro with tokens — not escape hatches, raw CSS, or third-party styling systems. Canonical rules: `react-spectrum-s2` skill → `SKILL.md` (Styling and Icons sections).

Search the source globs (e.g. `**/*.{tsx,jsx,ts,js}`) for the patterns below.

## Checks

### No `UNSAFE_style` / `UNSAFE_className`
- **Rule:** Avoid `UNSAFE_style` and `UNSAFE_className`; they bypass tokens and the style layer ordering.
- **Detect:** grep `UNSAFE_style|UNSAFE_className`.
- **Severity:** High.

### No concatenation of macro output
- **Rule:** `style()` results encode style precedence; concatenating them with template literals, `clsx`, `classnames`, or string spaces breaks ordering. Express variation in one `style({...})` call with runtime conditions, or use `mergeStyles`.
- **Detect:** macro results combined via `` `${style(...)} ...` ``, `clsx(`/`classNames(` wrapping `style(`, or Tailwind utility classes alongside S2 components. grep `clsx|classnames`, `tailwind`, and template-literal `className`s containing `style(`.
- **Severity:** High.

### No inline `style` alongside the macro
- **Rule:** Don't combine `className={style({...})}` (or the `styles` prop) with an inline `style={{...}}` on the same element — inline styles bypass tokens and break layer ordering. Inline `style` is only for values genuinely unknowable at build time (e.g. a drag position).
- **Detect:** elements carrying both `style={{` and `style(` / `styles=`.
- **Severity:** Medium.

### Tokens, not raw CSS values
- **Rule:** Macro values are typed tokens, not raw CSS. No hex / `rgb()` / `var()` colors; no string units like `'1rem'` / `'100%'` (use numbers on the 4px grid, or `'full'`); no `'flex-start'` / `'flex-end'` (use `'start'` / `'end'`); no physical sides (use logical `paddingStart`/`marginEnd`/`insetStart`/`borderStartStartRadius` so they flip under RTL).
- **Detect:** inside `style(` / `styles=`: `#` hex colors, `rgb(`, `var(--`, quoted units (`'…rem'`, `'…px'`, `'…%'`), `'flex-start'`/`'flex-end'`, and physical props `paddingLeft|paddingRight|marginLeft|marginRight|borderTopLeftRadius|borderTopRightRadius`.
- **Severity:** Medium. Prefer **semantic** color tokens (`accent`, `neutral`, `negative`, `positive`, `informative`, `notice`) where color carries meaning, over raw hue tokens (`red-…`, `blue-…`).

### The `styles` prop is layout-only
- **Rule:** The `styles` prop on S2 components is restricted to layout properties (margin, width, flex, grid placement, position, z-index, visibility). Non-layout properties belong on a native element's `className={style(...)}`.
- **Detect:** `styles={style({` on an S2 component containing `backgroundColor`, `color`, `font`, `borderWidth`, or `padding`.
- **Severity:** Medium.

### Subpath imports, not the barrel
- **Rule:** Import components from their subpath (`@react-spectrum/s2/Button`), not the package barrel (`@react-spectrum/s2`). Shared types and list-data hooks (`useListData`, `Key`, `Selection`, …) are the exception — they're re-exported from the barrel.
- **Detect:** a named **component** import from the root: `import {Button|Picker|…} from '@react-spectrum/s2'`.
- **Severity:** Low.

### No third-party icon or design-system libraries
- **Rule:** Use S2 icons/illustrations and components. Don't introduce `lucide-react`, `heroicons`, `phosphor-icons`, `react-icons`, or whole design systems (MUI, Chakra, Radix UI kits, shadcn/ui, Ant Design) in S2 code. `react-aria-components` is fine for custom components — this check targets pre-styled UI kits, not RAC primitives.
- **Detect:** imports from those packages.
- **Severity:** Medium for icon libraries; High for a competing design system. If the same import also triggers [02-component-usage](02-component-usage.md), record **one** finding here (Styling) only.

### Don't restate default prop values
- **Rule:** Setting a prop to its default — `variant="primary"`, `size="M"`, `density="regular"` — is noise.
- **Detect:** those literal default props on S2 components.
- **Severity:** Low.
