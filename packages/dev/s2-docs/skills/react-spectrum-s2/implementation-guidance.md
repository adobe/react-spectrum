## Styling

Use React Spectrum S2 components and the S2 `style` macro as the default styling approach.

- Import the `style` macro using the `{type: 'macro'}` import attribute: `import {style} from '@react-spectrum/s2/style' with {type: 'macro'};`
- Remember that the `style` macro runs at build time and returns class names.
- Avoid introducing Tailwind, `radix-ui`, `shadcn/ui`, or any other third-party design system components in S2 implementations.
- Prefer S2 components first, and use their `styles` prop only for the supported layout-style properties.
- For generic layouts (flex, grid, etc.), use native HTML elements with the `style` macro.
- For card-style layouts, use the S2 `Card` component instead of building something custom.
- IMPORTANT: Avoid using the `UNSAFE_style` and `UNSAFE_className` props.

For React Spectrum components, the `styles` prop is intentionally limited. Supported properties are:

- `margin`, `marginStart`, `marginEnd`, `marginTop`, `marginBottom`, `marginX`, `marginY`
- `width`, `minWidth`, `maxWidth`
- `flexGrow`, `flexShrink`, `flexBasis`
- `justifySelf`, `alignSelf`, `order`
- `gridArea`, `gridRow`, `gridRowStart`, `gridRowEnd`, `gridColumn`, `gridColumnStart`, `gridColumnEnd`
- `position`, `zIndex`, `top`, `bottom`, `inset`, `insetX`, `insetY`, `insetStart`, `insetEnd`
- `visibility`
- `height`, `minHeight`, `maxHeight` (only in specific components without an intrinsic height)

Example:

```tsx
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button} from '@react-spectrum/s2';

<Button styles={style({marginStart: 8})}>Edit</Button>
```

When styling native HTML elements or React Aria Components, use `className={style(...)}` instead of the limited `styles` prop. In those cases, you are not limited to the React Spectrum component property subset.

Example:

```tsx
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Checkbox} from 'react-aria-components';

<div className={style({display: 'grid', gap: 12, padding: 16, backgroundColor: 'gray-75'})}>
  <h2 className={style({font: 'heading-sm'})}>Preferences</h2>
  <Checkbox
    className={style({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: {
        default: 'neutral',
        isSelected: 'blue-900'
      }
    })}
  />
</div>
```

The `style` macro supports runtime conditions:

```tsx
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const styles = style({
  backgroundColor: {
    variant: {
      primary: 'accent',
      secondary: 'neutral'
    }
  }
});

function MyComponent({variant}: {variant: 'primary' | 'secondary'}) {
  return <div className={styles({variant})} />
}
```

Boolean conditions starting with `is` or `allows` can be used directly without nesting:

```tsx
const styles = style({
  backgroundColor: {
    default: 'gray-100',
    isSelected: 'gray-900',
    allowsRemoving: 'gray-400'
  }
});

<div className={styles({isSelected: true})} />
```

Do not concatenate class names from the `style` macro:

The `style` macro returns an opaque class name string that encodes style precedence. Concatenating it with other class names (via template literals, `clsx`, `classnames`, spaces, etc.) breaks the precedence system and produces incorrect or unpredictable styles.

- Do **not** build up class names conditionally by calling `style(...)` multiple times and joining the results.
- Instead, express runtime decisions inside a **single** `style({...})` call using the macro's runtime conditions (nested `default`/variant objects, and `is*`/`allows*` boolean conditions).
- When merging style strings together, use the `mergeStyles` runtime function.

Bad:

```tsx
// ❌ Concatenates two style macro results — breaks precedence.
const base = style({padding: 8, backgroundColor: 'gray-100'});
const active = style({backgroundColor: 'accent'});

<div className={`${base} ${isActive ? active : ''}`} />
```

Good:

```tsx
// ✅ One style call, runtime decision inside the macro.
const styles = style({
  padding: 8,
  backgroundColor: {
    default: 'gray-100',
    isActive: 'accent'
  }
});

<div className={styles({isActive})} />
```

Note:
- Base spacing values (for `margin`, `gap`, etc.): Use pixels following a 4px grid (`0`, `2`, `4`, `8`, `12`, `16`...)

See [Styling]({{guidesBase}}styling.md) for the full guide and [Style Macro]({{guidesBase}}style-macro.md) for the full property and utility reference.

If you encounter issues related to the `style` macro import, see the 'Framework setup' section of the [Getting started]({{guidesBase}}getting-started.md) guide.

## Typography

Avoid using `Text`/`Heading`/`Content` as standalone typography primitives. These should only be used inside specific React Spectrum components where they inherit the intended slots and default styles.

- Use `Text`/`Heading`/`Content` inside components like cards, lists, pickers, menus, tabs, and other Spectrum composition APIs where `slot="label"`, `slot="description"`, or default/implicit Text slots are used. Component docs will have examples of these.
- For standalone headings, body copy, captions, and other page-level typography, use native HTML elements plus the `style` macro.

Example:

```tsx
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<section>
  <h1 className={style({font: 'heading-xl', marginBottom: 8})}>
    Project overview
  </h1>
  <p className={style({font: 'body', color: 'neutral-subdued'})}>
    Review status, owners, and upcoming milestones.
  </p>
  <p className={style({font: 'body-sm', marginTop: 12})}>
    Last updated 2 hours ago
  </p>
</section>
```

See [Style Macro]({{guidesBase}}style-macro.md) for the available typography tokens and related text styling options.

## Buttons with icons and text

When a `Button`, `ActionButton`, or `LinkButton` contains **both** an icon and a text label, the text **must** be wrapped in an S2 `<Text>` element so the component can apply the correct icon/label slot styling and spacing. Plain string children next to an icon render incorrectly.

- Icon-only: no `<Text>` needed (provide an accessible label via `aria-label`).
- Text-only: plain string children are fine.
- Icon + text: wrap the label in `<Text>`.

## Icons

Use React Spectrum's built-in icons and illustrations.

- Import icons from `@react-spectrum/s2/icons/...`
- Import illustrations from `@react-spectrum/s2/illustrations/...`
- Avoid introducing third-party icon libraries such as `lucide-react`, `phosphor-icons`, or `heroicons`

Commonly used icons include `AlertTriangle`, `Close`, `ChevronDown`, `Checkmark`, `Preview`, `CheckmarkCircle`, `Add`, `ChevronUp`, `Data`, `FileText`, `InfoCircle`, `OpenIn`, `Chat`, and `Code`.

Example icon:

```tsx
import AlertTriangle from '@react-spectrum/s2/icons/AlertTriangle';

<AlertTriangle />
```

Example illustrations:

```tsx
import DropToUpload from '@react-spectrum/s2/illustrations/gradient/generic1/DropToUpload';
import CloudUpload from '@react-spectrum/s2/illustrations/gradient/generic2/CloudUpload';
import Warning from '@react-spectrum/s2/illustrations/linear/Warning';

<DropToUpload />
<CloudUpload />
<Warning />
```

- Note that illustrations can be in a Gradient or Linear style.
- Gradient illustrations can include Generic 1 and Generic 2 variants.

See [Icons]({{componentsBase}}icons.md) and [Illustrations]({{componentsBase}}illustrations.md) for the full catalogs and usage guidance.
