# Implementing Figma designs with React Spectrum S2

When the user supplies a Figma frame, node, or URL and asks for an S2 implementation, treat the Figma MCP as a **reference**, not a code generator. The MCP returns React + Tailwind targeting raw CSS variables — it does **not** produce S2 output. Your job is to recognize what the design *is* (in Spectrum terms), then re-implement it with S2 components and the [`style` macro]({{guidesBase}}style-macro.md).

This guidance applies when the Figma MCP tools (`get_design_context`, `get_screenshot`, `get_variable_defs`, `get_metadata`, `search_design_system`) are available. If they are not, ask the user to install the Figma MCP or to paste a screenshot.

## Workflow

1. **Extract `fileKey` and `nodeId` from the Figma URL.** For `https://figma.com/design/<fileKey>/<fileName>?node-id=1-2`, the node ID is `1:2` (replace `-` with `:`). If the URL is `figma.com/design/<fileKey>/branch/<branchKey>/...`, use the `branchKey` as the `fileKey`.
2. **Inspect the design.** Call `get_design_context` with `clientFrameworks: "react"` and `clientLanguages: "typescript"`. Read the returned screenshot first — it shows the *intent*. The code beneath it is just a starting point, not the actual implementation.
3. **Pull the variables.** Call `get_variable_defs` on the same node to see which design tokens are in play. The names (`Palette/gray/200`, `Palette/transparent-white/800`, etc.) tell you what the designer reached for; the hex values let you sanity-check your token mapping.
4. **Identify the source library and components.** Read `data-name` attributes in the reference code — they preserve the Figma component name (e.g. `data-name=".Status badge"`, `data-name=".Link out"`). If you're uncertain which library an instance came from, call `search_design_system` with the Figma component name and read the `libraryName` field. Real user files may mix S2 with S1 (the predecessor Spectrum library), product-specific kits, and team-internal libraries in the same frame. See [Identify the source library before mapping](#identify-the-source-library-before-mapping). Translate every instance to the **closest S2** React component.
5. **Re-implement with S2 + the `style` macro.** Drop the absolute positioning, the arbitrary pixel values, and the Tailwind classes. See [Translating the reference output](#translating-the-reference-output).
6. **Verify against the screenshot.** Call `get_screenshot` on the same node when you're done and compare.

If there is no Code Connect mapping and the MCP prompts you to ask the user about creating one, follow the script as written; otherwise default to `disableCodeConnect: true` to keep the reference code minimal.

## Identify the source library before mapping

Real Figma files may pull components from **more than one library**. Use `search_design_system` with the Figma component name and read the `libraryName` field to confirm which library an instance came from. When the same component name exists in multiple libraries, prefer the **S2** match — the user usually wants S2 output regardless of which library the designer mocked with.

Source kits usually fall into one of these buckets:

- **S2 / Web (Desktop scale)** — the canonical S2 library. The Figma nodes *are* the spec; use the S2 component directly rather than reconstructing visuals from primitives.
- **S1 (previous Spectrum library)** — `libraryName` starts with `S / ` (e.g. `S / Web (Desktop scale)`). Map each instance to its *equivalent* S2 component. If the user wants to upgrade their existing S1 components to S2, recommend the `migrate-react-spectrum-v3-to-s2` skill.
- **S2 platform variants** (iOS, Android, etc.) — same React component as desktop S2; platform-specific affordances usually don't translate.
- **Product or team-specific kits** — translate to the closest S2 component by name and visual or see if the user already has these components available.

If the design contains only non-S2 components and the user has not yet committed to S2, ask before forcing the translation. The most common reason a user shares one of these files is "I want this *built in* S2," not "preserve this kit's visuals exactly."

### Watch out for axis-order differences between S1 and S2

Both S1 and S2 carry size + variant on `Button` and others, but **the order inside the Figma name is reversed**:

- S2: `Button (M, Accent)` — `(size, variant)`
- S1: `Button (Accent, M)` — `(variant, size)`

The axes are the same. Read both tokens and feed them into the same `Button size="M" variant="accent"` regardless of which order Figma used.

### Prefix and naming conventions to recognize

Names you'll see and what to do with them:

- Leading `.` (e.g. `.Component cover`, `.Status badge`, `.Section title`) — internal scaffolding inside a library file itself. Translate to the underlying component (`.Status badge` → `Badge`), not the wrapper.
- Status emoji like `🚧` (work-in-progress), `🔄 Loading`, `✏️ Edit` — state annotations. The base name still maps to one S2 component; the emoji tells you the visual state (loading, editing), which usually becomes a prop (`isPending`, focus/edit affordance) rather than a different component.
- A short prefix or sigil before the component name (initials, a special character) — a library marker. Strip it mentally before looking up the S2 equivalent (`Foo Text field` → `TextField`).

## Component mapping

Figma splits S2 components by **size** and **style variant** into separate component sets. The Figma library shows `Button (M, Accent)`, `Button (S, Primary)`, `Action button (XS)`, `Action button (M)` as distinct components — but in code these all collapse onto a **single** S2 component with `size` and `variant` props.

Common patterns:

| Figma component name                              | S2 component         | Props derived from the Figma name                                |
| ------------------------------------------------- | -------------------- | ---------------------------------------------------------------- |
| `Button (S/M/L, Accent/Primary/Secondary/Negative)` | `Button`            | `size="S"\|"M"\|"L"`, `variant="accent"\|"primary"\|"secondary"\|"negative"` |
| `Action button (XS/S/M/L/XL)`                     | `ActionButton`       | `size="XS"\|"S"\|"M"\|"L"\|"XL"`                                 |
| `Close button (S/M/L)`                            | `CloseButton`        | `size="S"\|"M"\|"L"`                                             |
| `Toggle button`                                   | `ToggleButton`       | Same size/variant axes as `Button`                               |
| `Checkbox`                                        | `Checkbox`           | `isSelected`, `isIndeterminate`                                  |
| `Radio button`                                    | `Radio` (inside `RadioGroup`) |                                                         |
| `Switch`                                          | `Switch`             |                                                                  |
| `Text field`                                      | `TextField`          | `label`, `description`, `errorMessage`, `isInvalid`, `isRequired` |
| `Combo box` / `Picker` / `Dropdown`               | `ComboBox` / `Picker`| — choose by interaction (typeahead vs. fixed list)               |
| `Tag`                                             | `Tag` (inside `TagGroup`) |                                                              |
| `Badge`                                           | `Badge`              | `variant="neutral"\|"informative"\|"accent"\|...`                |
| `Status light`                                    | `StatusLight`        | `variant`                                                        |
| `Avatar`                                          | `Avatar`             | `size`                                                           |
| `Progress bar` / `Progress circle`                | `ProgressBar` / `ProgressCircle` | `value`, `isIndeterminate`                           |
| `Slider` / `Range slider`                         | `Slider` / `RangeSlider` |                                                              |
| `Tabs`                                            | `Tabs` (`TabList` / `Tab` / `TabPanel`) |                                               |
| `Menu` / `Action menu`                            | `Menu` / `ActionMenu`|                                                                  |
| `Card`                                            | `Card` (consider `AssetCard`/`UserCard`/`ProductCard` variants) |                       |
| `Dialog` / `Alert dialog`                         | `Dialog` / `AlertDialog` |                                                              |
| `Toast`                                           | `Toast` (use `ToastQueue` to trigger) |                                                 |
| `Tooltip`                                         | `Tooltip`            |                                                                  |
| `Inline alert`                                    | `InlineAlert`        | `variant="neutral"\|"informative"\|"positive"\|"notice"\|"negative"` |
| `Help text`                                       | `ContextualHelp` or field `description` |                                              |
| `Icon` (the Figma instance)                       | `@react-spectrum/s2/icons/<Name>` | Match icon name; don't embed the asset URL              |
| `Illustration`                                    | `@react-spectrum/s2/illustrations/<style>/<Name>` |                                      |

When a Figma component name is ambiguous, fall back to the [Component Decision Tree](component-decision-tree.md). Use `search_design_system` with the file key to confirm the exact Figma library name when needed.

**Page-template scaffolding** in the S2 Figma file (names starting with `.` like `.Component cover`, `.Status badge`, `.Section title`, `.Slot-action-button`) are the design-system documentation itself — not patterns the user wants reproduced verbatim. Translate to the underlying component (e.g. `.Status badge` → `Badge`), not a hand-rolled clone.

## Translating the reference output

The MCP's reference code is a **visual approximation** built for fidelity to the screenshot. It is dense with patterns that don't survive translation to S2:

- **Absolute positioning is screenshot scaffolding.** `absolute left-[40px] top-[239px]` recreates the canvas layout pixel-for-pixel. Replace it with flex/grid so the result is fluid. Use the macro: `style({display: 'flex', flexDirection: 'column', gap: 8})`.
- **Arbitrary pixel values snap to the 4px grid.** `gap-[8px]` → `gap: 8`. `p-[12px]` → `padding: 12`. Don't preserve off-grid values (`13px`, `41px`) — round to the nearest grid step.
- **`rounded-[Npx]` → a `borderRadius` token.** `'none'`, `'sm'`, `'default'`, `'lg'`, `'xl'`, `'full'`, `'pill'`. There is no `'md'`. Don't keep the raw pixel value.
- **Type goes through the `font` shorthand.** `font-['Adobe_Clean:Medium'] text-[16px]` is the S2 body family — write `font: 'body'`. Don't import Adobe Clean directly; the macro provides family, size, weight, line-height, and a default color via a single token. Pick the role first (`heading-*`, `title-*`, `body-*`, `detail-*`, `ui-*`, `code-*`) and size second.
- **Colors collapse to semantic tokens.** `bg-[var(--palette/transparent-white/100,…)]` and the hex values from `get_variable_defs` are foundation values. Map by *intent*, not raw value: error/destructive → `negative`, success → `positive`, info → `informative`, brand/CTA → `accent`, generic UI surfaces → `neutral` / `gray-N`. Reach for raw hue tokens (`red-…`, `blue-…`) only for decorative or chart colors.
- **`data-node-id` attributes are noise.** Strip them from the final code. `data-name` was useful for identifying the component — once you've made the mapping, drop it too.
- **Image asset URLs (`https://www.figma.com/api/mcp/asset/…`) expire.** Never embed them. For icons, use `@react-spectrum/s2/icons/*`; for illustrations, use `@react-spectrum/s2/illustrations/*`; for genuine raster content, ask the user where the canonical asset lives.
- **Logical sides, not physical.** Even if the reference code has `pl-[16px]` / `ml-[8px]`, write `paddingStart` / `marginStart` so the layout flips correctly in RTL.

## Example: reference output to S2

Reference code returned by `get_design_context`:

```tsx
<div
  className="absolute bg-[var(--palette\/transparent-white\/100,rgba(255,255,255,0.11))] content-stretch flex items-start left-[40px] overflow-clip px-[12px] py-[10px] rounded-[9px] top-[40px]"
  data-node-id="112:4343"
  data-name=".Status badge">
  <p className="font-['Adobe_Clean:Medium',sans-serif] text-[16px] text-[color:var(--palette\/transparent-white\/800,rgba(255,255,255,0.85))]">
    👍  Ready for pick-up
  </p>
</div>
```

S2 translation:

```tsx
import {Badge} from '@react-spectrum/s2/Badge';

<Badge variant="positive">Ready for pick-up</Badge>
```

The `data-name=".Status badge"` is the signal. Once mapped, the wrapper, the transparent-white tokens, the arbitrary radius, and the explicit font sizing all disappear — the component owns them.

## When the design uses tokens you can't map

If a variable from `get_variable_defs` doesn't have an obvious S2 equivalent:

- For a **one-off light/dark difference**, use `lightDark(light, dark)` from `@react-spectrum/s2/style`.
- For a **decorative color** with no semantic meaning, use the nearest hue token (`blue-700`, `gray-200`, etc.).
- For a **fully custom color** (brand color, illustration tint), use `color('#...')` or `baseColor('...')` and document the choice in a short comment.
- If the design depends on a **transparent overlay** (`Palette/transparent-white/*`, `Palette/transparent-black/*`), the design likely sits on top of imagery — verify with the screenshot before reproducing the alpha by hand.

## Verifying alignment

Before declaring the task done:

1. Run the typecheck and dev/build — the macro catches token typos and disallowed properties at build time. See the "Verify before declaring done" section of the main implementation guidance.
2. Render the result locally and compare to a fresh `get_screenshot` of the same node. Differences in radius, spacing, or weight usually point to a missed token; investigate and avoid falling back to raw values.
3. If the design contains interactive states (hover, focus, pressed, selected), check the Figma component's variants for those states — the S2 component already handles them, but confirm `variant` / `size` / `isQuiet` line up with the design's intent.
