# Creating Custom Components

Build custom Spectrum 2 components by combining unstyled **React Aria Components** (behavior + accessibility) with the **[`style` macro]({{guidesBase}}styling.md)** (Spectrum 2 design tokens). The macro runs at build time and emits atomic CSS class names, so custom components stay visually consistent with the rest of the library.

```tsx
import {Button} from 'react-aria-components/Button';
import {style, focusRing} from '@react-spectrum/s2/style' with {type: 'macro'};

const buttonStyles = style({
  ...focusRing(),
  backgroundColor: 'accent',
  color: 'neutral',
  paddingX: 16,
  paddingY: 8,
  borderRadius: 'pill',
  borderStyle: 'none',
  font: 'ui',
  transition: 'default'
});

function MyButton({children}) {
  return <Button className={buttonStyles}>{children}</Button>;
}
```

Always import the macro with `with {type: 'macro'}`.

## Render props

React Aria components expose interaction state via render props passed to `className` (or `style`) when it is a function. When `style()` includes conditional keys it returns a function with the matching signature, so you can pass it directly:

```tsx
const buttonStyles = style({
  ...focusRing(),
  backgroundColor: {
    default: 'accent',
    isHovered: 'accent-700',
    isPressed: 'accent-600'
  },
  // ...
});

<Button className={buttonStyles}>…</Button>
```

Common render props: `isHovered`, `isPressed`, `isFocused`, `isFocusVisible`, `isDisabled`, `isSelected`. Overlay components also expose `isEntering` / `isExiting`. Each component documents its full set in its **API** section. TypeScript autocompletes available conditions when `style()` is inlined into `className`.

### Custom conditions

Add arbitrary condition keys (e.g. `variant`) and merge your props with the render props at the call site:

```tsx
const buttonStyles = style({
  backgroundColor: {
    variant: {
      primary: 'accent',
      secondary: 'neutral-subtle'
    }
  },
  // ...
});

<Button className={renderProps => buttonStyles({...renderProps, variant})}>…</Button>
```

### Nesting conditions

Nest to express "A **and** B." Siblings at the same level are mutually exclusive — last match wins.

```tsx
backgroundColor: {
  default: 'neutral-subtle',
  isSelected: {
    default: 'accent',
    isHovered: 'accent-700',
    isPressed: 'accent-900'
  }
}
```

## Component props

Extend the React Aria component's `Props` interface and spread `...props` so `aria-*`, event handlers, and behavior props (`isDisabled`, `autoFocus`, …) forward automatically. Forward refs with `React.forwardRef` — required by utilities like [`pressScale`](#press-scaling).

```tsx
import {forwardRef} from 'react';
import {Button, ButtonProps} from 'react-aria-components/Button';

interface MyButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary';
}

const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(function MyButton(
  {variant = 'primary', ...props},
  ref
) {
  return (
    <Button
      {...props}
      ref={ref}
      className={renderProps => buttonStyles({...renderProps, variant})} />
  );
});
```

To prevent consumers from overriding styling, `Omit<ButtonProps, 'className' | 'style'>`.

## Base layers

`baseColor(token)` expands a single token into all four interaction states (`default`, `isHovered`, `isFocusVisible`, `isPressed`). Use for backgrounds and borders.

```tsx
import {style, baseColor} from '@react-spectrum/s2/style' with {type: 'macro'};

const styles = style({
  backgroundColor: baseColor('accent'),
  borderColor: baseColor('gray-200')
});
```

### Disabled states

Use the semantic `disabled` token. Combine with `baseColor` by spreading + overriding:

```tsx
backgroundColor: {
  ...baseColor('accent'),
  isDisabled: 'disabled'
},
color: {
  default: 'white',
  isDisabled: 'disabled'
}
```

### Forced colors (Windows High Contrast)

`forcedColors` is built-in; use [CSS system colors](https://developer.mozilla.org/en-US/docs/Web/CSS/system-color) as values.

```tsx
backgroundColor: {
  ...baseColor('accent'),
  isDisabled: 'disabled',
  forcedColors: {
    default: 'ButtonFace',
    isDisabled: 'ButtonFace'
  }
},
color: {
  default: 'white',
  forcedColors: 'ButtonText'
},
borderColor: {
  default: 'transparent',
  forcedColors: 'ButtonBorder'
},
forcedColorAdjust: 'none'
```

## Spacing & sizing

Numeric spacing values are on a 4px grid (converted to `rem` at build time). Apply through `padding*`, `margin*`, `gap`, `rowGap`, `columnGap`, `inset*`, etc. Logical properties (`paddingStart`, `paddingEnd`, `marginStart`, `marginEnd`) auto-flip in RTL. Shorthands like `paddingX` / `paddingY` are available.

Responsive values use breakpoint keys (built-in to the macro):

```tsx
padding: {
  default: 16,
  sm: 24,
  lg: 32
}
```

Sizing props (`width`, `height`, `size`, `maxWidth`, …) accept the same numeric scale plus semantic values like `'fit'` (fit-content) and `'full'` (100%).

## Typography

The `font` shorthand sets `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, and `color` in one go. Apply per-element, not globally. Override individual props as needed.

Presets:
- **Heading** — `heading-2xs`, `heading-xs`, `heading-sm`, `heading`, `heading-lg`, `heading-xl`, `heading-2xl`, `heading-3xl`
- **Title** — `title-xs`, `title-sm`, `title`, `title-lg`, `title-xl`, `title-2xl`, `title-3xl`
- **Body** — `body-xs`, `body-sm`, `body`, `body-lg`, `body-xl`, `body-2xl`, `body-3xl`
- **Detail** — `detail-sm`, `detail`, `detail-lg`, `detail-xl`
- **UI** — `ui-xs`, `ui-sm`, `ui`, `ui-lg`, `ui-xl`
- **Code** — `code-xs`, `code-sm`, `code`, `code-lg`, `code-xl`

Semantic text colors: `neutral` (primary), `neutral-subdued` (secondary), `disabled`, plus status colors `negative`, `positive`, `informative`, `notice`.

## Focus rings

Spread `focusRing()` into a `style` call to apply the Spectrum 2 focus indicator on `isFocusVisible`.

```tsx
import {style, focusRing} from '@react-spectrum/s2/style' with {type: 'macro'};

const styles = style({
  ...focusRing(),
  // ...
});
```

## Press scaling

`pressScale(ref)` returns a render prop for the `style` prop that applies the Spectrum 3D press scale. Requires a ref to measure the element.

```tsx
import {pressScale} from '@react-spectrum/s2';

function MyButton({children}) {
  let ref = useRef(null);
  return (
    <Button ref={ref} className={buttonStyles} style={pressScale(ref)}>
      {children}
    </Button>
  );
}
```

## Animations

`Popover`, `Modal`, `Dialog`, and `Tooltip` expose `isEntering` and `isExiting` render props. Set resting values in `default`; set entering/exiting *from*/*to* values; add `transition` + `transitionDuration`.

```tsx
const popoverStyles = style({
  backgroundColor: 'layer-2',
  borderRadius: 'lg',
  padding: 16,
  opacity: {
    default: 1,
    isEntering: 0,
    isExiting: 0
  },
  translateY: {
    default: 0,
    isEntering: 4,
    isExiting: 4
  },
  transition: '[opacity, translate]',
  transitionDuration: 200
});
```

`transition` accepts an arbitrary value (square brackets) to limit interpolation to specific properties. Duration and easing can vary per state by nesting.

## Icons

Import from `@react-spectrum/s2/icons`. Size and color icons with `iconStyle` (a specialized `style`). Inside a custom component, set the `--iconPrimary` CSS variable on the parent to control fill color.

```tsx
import {style, iconStyle} from '@react-spectrum/s2/style' with {type: 'macro'};
import EditIcon from '@react-spectrum/s2/icons/Edit';

const buttonStyles = style({
  backgroundColor: 'accent',
  '--iconPrimary': {
    type: 'fill',
    value: 'white'
  },
  // ...
});

<Button className={buttonStyles} aria-label="Edit">
  <EditIcon styles={iconStyle({size: 'S'})} />
</Button>
```

## CSS variables

Define CSS variables in a parent `style` call with a `type` (the CSS property category). Reference them from children by name.

```tsx
const parentStyles = style({
  '--cardBg': {
    type: 'backgroundColor',
    value: 'gray-50'
  },
  '--cardBorder': {
    type: 'borderColor',
    value: 'gray-200'
  }
});

const childStyles = style({
  backgroundColor: '--cardBg',
  borderColor: '--cardBorder',
  borderWidth: 1,
  borderStyle: 'solid'
});
```

## Escape hatches

Use sparingly — they bypass token + type safety.

### Arbitrary values

Square-bracketed strings pass through unchanged:

```tsx
paddingTop: '[3px]',
backgroundColor: '[#ff00aa]',
transition: '[opacity, translate]'
```

Safer conversion helpers:
- `space(px)` → pixel value to `rem` token (e.g. `space(12)` → `[0.75rem]`)
- `fontRelative(px)` → pixel value to font-relative `em` (scales with current font size)

### css macro

For pseudo-elements, complex selectors, or `@keyframes` that `style` can't express:

```tsx
import {css} from '@react-spectrum/s2/style' with {type: 'macro'};

const styles = css`
  &::before { content: '✱'; color: red; }
`;
```

## Merging styles

Use the **runtime** `mergeStyles` from `@react-spectrum/s2` (not the macro) to merge multiple `style()` results — it resolves atomic class conflicts so the last value wins.

```tsx
import {mergeStyles} from '@react-spectrum/s2';

<div className={mergeStyles(baseCard, highlightedCard)}>…</div>
```

## Other utilities

See the [Style Macro reference]({{guidesBase}}style-macro.md#utilities) for full signatures.

- `lightDark(light, dark)` — pick a color by active color scheme.
- `colorMix(token, percentage)` — mix a Spectrum color with another color or transparency.
- `centerPadding()` — vertical padding needed to center text given a `minHeight`.
- `setColorScheme()` — spread on a root container (e.g. a portal) to enable Spectrum light/dark variables for descendants.

## Best practices

- Wrap a React Aria component, not a raw `<div>` / `<button>` — keyboard, focus, and ARIA behavior is hard to replicate.
- Spread `...props` and forward `ref`.
- Use `focusRing()` on focusable elements and `baseColor()` to derive hover/focus/press from one token.
- Prefer tokens (`space()`, `fontRelative()`, color tokens, `font` presets) over hard-coded values.
- Apply `font` per element, not globally.
- Use logical properties (`paddingStart`, `marginEnd`, …) for RTL.
- Use `cursor: 'pointer'` for links only — do not use it for buttons.
- Use `pressScale` on pressable elements.
- Animate overlays with `isEntering` / `isExiting`, not mount/unmount.
- Meet [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); add `forcedColors` for High Contrast Mode.
- Avoid `css` and arbitrary values when a Spectrum token exists.
