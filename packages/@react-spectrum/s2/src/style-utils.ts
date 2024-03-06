import {StyleString} from '../style-macro/types';
import {CSSProperties} from 'react';

export const focusRing = () => ({
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineColor: 'focus-ring',
  outlineWidth: 2,
  outlineOffset: 2
} as const);

export const field = () => ({
  display: 'grid',
  gridColumn: {
    isInForm: '1 / span 2'
  },
  gridTemplateColumns: {
    default: ['auto', '1fr'],
    isInForm: 'subgrid'
  },
  gridTemplateRows: {
    labelPosition: {
      top: ['auto', '1fr', 'auto'],
      side: ['auto', '1fr']
    }
  },
  gridTemplateAreas: {
    labelPosition: {
      top: [
        'label label',
        'input input',
        'helptext helptext'
      ],
      side: [
        'label input',
        'label helptext'
      ]
    }
  },
  fontSize: 'control',
  alignItems: 'baseline',
  lineHeight: 100,
  '--field-height': {
    type: 'height',
    value: 'control'
  },
  // Spectrum defines the field label/help text with a (minimum) height, with text centered inside.
  // Calculate what the gap should be based on the height and line height.
  // Use a variable here rather than rowGap since it is applied to the children as padding.
  // This allows the gap to collapse when the label/help text is not present.
  // Eventually this may be possible to do in pure CSS: https://github.com/w3c/csswg-drafts/issues/5813
  '--field-gap': {
    type: 'rowGap',
    value: '[calc((var(--field-height) - 1lh) / 2)]'
  },
  columnGap: 'text-to-control'
} as const);

const allowedOverrides = [
  'margin',
  'marginStart',
  'marginEnd',
  'marginTop',
  'marginBottom',
  'marginX',
  'marginY',
  'width',
  'minWidth',
  'maxWidth',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'justifySelf',
  'alignSelf',
  'order', 
  'gridArea', 
  'gridRow',
  'gridRowStart',
  'gridRowEnd',
  'gridColumn',
  'gridColumnStart',
  'gridColumnEnd',
  'position',
  'zIndex',
  'top',
  'bottom',
  'inset',
  'insetX',
  'insetY',
  'insetStart',
  'insetEnd'
] as const;

const heightProperties = [
  'size',
  'height',
  'minHeight',
  'maxHeight'
] as const;

export type CSSProp = StyleString<(typeof allowedOverrides)[number]>;
export type CSSPropWithHeight = StyleString<(typeof allowedOverrides)[number] | (typeof heightProperties)[number]>;
export interface UnsafeStyles {
  /** Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `css` prop instead. */
  UNSAFE_className?: string,
  /** Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `css` prop instead. */
  UNSAFE_style?: CSSProperties
}

export interface StyleProps extends UnsafeStyles {
  css?: CSSProp
}

export function getAllowedOverrides({height = false} = {}) {
  return (allowedOverrides as unknown as string[]).concat(height ? heightProperties : []);
}
