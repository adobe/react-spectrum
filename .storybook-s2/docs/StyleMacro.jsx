import { style } from '../../packages/@react-spectrum/s2/style/spectrum-theme' with {type: 'macro'};
import {Link} from '@react-spectrum/s2';
import {highlight} from './highlight' with {type: 'macro'};
import {H2, H3, H3, P, Pre, Code, Strong} from './typography';

export function StyleMacro() {
  return (
    <div className={style({maxWidth: 'lg', marginX: 'auto'})}>
      <header
        className={style({
          paddingX: 48,
          marginBottom: 48
        })}>
        <h1 className={style({font: 'heading-2xl'})}>
          Style Macro
        </h1>
      </header>
      <main className={style({marginX: 48})}>
        <P>The React Spectrum <Code>style</Code> <Link href="https://parceljs.org/features/macros/" target="_blank">macro</Link> generates atomic CSS at build time, which can be applied to any DOM element or Spectrum component. Style properties use Spectrum tokens such as colors, spacing, sizing, and typography, helping you work more quickly with TypeScript autocomplete, reduce the design choices you need to make, and improve consistency between Adobe applications.</P>
        <Pre>{highlight(`import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div className={style({backgroundColor: 'red-400', color: 'white'})}>
  {/* ... */}
</div>`)}</Pre>
        <P><Strong>Atomic CSS</Strong> scales as your application grows because it outputs a separate rule for each CSS property you write, ensuring there is no duplication across your whole app. The above example generates two CSS rules:</P>
        <Pre>{highlight(`.bJ { background-color: #ffbcb4 }
.ac { color: #fff }`, 'CSS')}</Pre>
        <P>These rules are reused across your app wherever the same values are used, which keeps your bundle size small even as you add features. In addition, you only pay for the values you use – there’s no unnecessary CSS custom properties for colors and other tokens that aren’t used.</P>
        <P>The <Code>style</Code> macro <Strong>colocates</Strong> your styles with your component code, rather than in separate CSS files. Colocation enables you to:</P>
        <ul className="sb-unstyled">
          <li className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}><Strong>Develop more efficiently</Strong> – No need to switch between multiple files when working on a component, or spend time writing CSS selectors.</li>
          <li className={style({font: 'body-lg', marginY: 0})}><Strong>Refactor with confidence</Strong> – Changing the styles in a component is guaranteed to never unintentionally affect any other parts of your application. When you delete a component, the corresponding styles are also removed, reducing technical debt.</li>
        </ul>
        <H2>Values</H2>
        <P>The <Code>style</Code> macro supports a constrained set of values for each CSS property, which conform to the Spectrum design system. For example, the <Code>backgroundColor</Code> property supports Spectrum colors, and does not allow arbitrary hex or rgb values by default. This helps make it easier to build consistent UIs that are maintainable over time.</P>
        <H3>Colors</H3>
        <P>The Spectrum 2 color palette is available across all color properties. The <Code>backgroundColor</Code> property also supports Spectrum’s background layers. In addition, semantic colors such as <Code>accent</Code> and <Code>negative</Code> are available across all properties, and automatically update according to states such as <Code>isHovered</Code> (see <Link href="#runtime-conditions" target="_self">runtime conditions</Link> below).</P>
        <H3>Spacing and sizing</H3>
        <P>Spacing properties such as <Code>margin</Code> and <Code>padding</Code>, and sizing properties such as <Code>width</Code> and <Code>height</Code> support a limited set of values. The API is represented in pixels, however, only values conforming to a 4px grid are allowed. This helps ensure that spacing and sizing are visually consistent.</P>
        <P>Internally, spacing and sizing values are converted from pixels to rems, which scale according to the user’s font size preference. In addition, sizing values are multiplied by 1.25x on touch screen devices to help increase the size of hit targets. Spacing values do not scale and remain fixed.</P>
        <H2>Conditional styles</H2>
        <P>The <Code>style</Code> macro also supports conditional styles, such as media queries, UI states such as hover and press, and component variants. Conditional values are defined as an object where each key is a condition. This keeps all values for each property together in one place so it is easy to see where overrides are coming from.</P>
        <P>This example sets the padding of a div to 8px by default, and 32px at the large media query breakpoint (1024px) defined by Spectrum.</P>
        <Pre>{highlight(`<div
  className={style({
    padding: {
      default: 8,
      lg: 32
    }
  })} />`)}</Pre>
        <P>Conditions are mutually exclusive, following object property order. The <Code>style</Code> macro uses <Link href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers" target="_blank">CSS cascade layers</Link> to ensure that there are no specificity issues to worry about. The last matching condition always wins.</P>
        <H3>Runtime conditions</H3>
        <P>The <Code>style</Code> macro also supports conditions that are resolved in JavaScript at runtime, such as variant props and UI states. When a runtime condition is detected, the <Code>style</Code> macro returns a function that can be called at runtime to determine which styles to apply.</P>
        <P>Runtime conditions can be named however you like, and values are defined as an object. This example changes the background color depending on a <Code>variant</Code> prop:</P>
        <Pre>{highlight(`let styles = style({
  backgroundColor: {
    variant: {
      primary: 'accent',
      secondary: 'neutral'
    }
  }
});

function MyComponent({variant}) {
  return <div className={styles({variant})} />
}`)}</Pre>
        <P>Boolean conditions starting with <Code>is</Code> do not need to be nested in an object:</P>
        <Pre>{highlight(`let styles = style({
  backgroundColor: {
    default: 'gray-100',
    isSelected: 'gray-900'
  }
});

<div className={styles({isSelected: true})} />`)}</Pre>
        <P>Runtime conditions also work well with the <Link href="https://react-spectrum.adobe.com/react-aria/styling.html#render-props" target="_blank">render props</Link> in React Aria Components. If you define your styles inline, you’ll even get autocomplete for all of the available conditions.</P>
        <Pre>{highlight(`import {Checkbox} from 'react-aria-components';

<Checkbox
  className={style({
    backgroundColor: {
      default: 'gray-100',
      isHovered: 'gray-200',
      isSelected: 'gray-900'
    }
  })} />`)}</Pre>
        <H3>Nesting conditions</H3>
        <P>Conditions can be nested to apply styles when multiple conditions are true. Keep in mind that conditions at the same level are mutually exclusive, with the last matching condition winning. Since only one value can apply at a time, there are no specificity issues to worry about.</P>
        <Pre>{highlight(`let styles = style({
  backgroundColor: {
    default: 'gray-25',
    isSelected: {
      default: 'neutral',
      isEmphasized: 'accent',
      forcedColors: 'Highlight',
      isDisabled: {
        default: 'gray-400',
        forcedColors: 'GrayText'
      }
    }
  }
});

<div className={styles({isSelected, isEmphasized, isDisabled})} />`)}</Pre>
        <P>The above example has three runtime conditions (<Code>isSelected</Code>, <Code>isEmphasized</Code>, and <Code>isDisabled</Code>), and uses the <Code>forcedColors</Code> condition to apply styles for <Link href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors" target="_blank">Windows High Contrast Mode</Link> (WHCM). The order of precedence follows the order the conditions are defined in the object, with the <Code>isSelected</Code> + <Code>isDisabled</Code> + <Code>forcedColors</Code> state having the highest priority.</P>
        <H2>Reusing styles</H2>
        <P>Styles can be reused by extracting common properties into objects, and spreading them into <Code>style</Code> calls. These must either be constants (declared with <Code>const</Code>) in the same file, or imported from another file as a macro (<Code>{"with {type: 'macro'}"}</Code>). Properties can be overridden just like normal JS objects – the last value always wins.</P>
        <Pre>{highlight(`const horizontalStack = {
  display: 'flex',
  alignItems: 'center',
  columnGap: 8
};

const styles = style({
  ...horizontalStack,
  columnGap: 4
});`)}</Pre>
        <P>You can also create custom utilities by defining your own macros. These are normal functions so you can do whatever computations you like to generate styles.</P>
        <Pre>{highlight(`// style-utils.ts
export function horizontalStack(gap: number) {
  return {
    display: 'flex',
    alignItems: 'center',
    columnGap: gap
  };
}`)}</Pre>
        <P>Then, import your macro and use it in a component.</P>
        <Pre>{highlight(`// component.tsx
import {horizontalStack} from './style-utils' with {type: 'macro'};

const styles = style({
  ...horizontalStack(4),
  backgroundColor: 'base'
});`)}</Pre>
      </main>
    </div>
  )
}
