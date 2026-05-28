export const controlSize = (size: 'sm' | 'md' = 'md'): typeof controlSizeM | typeof controlSizeS =>
  size === 'sm' ? controlSizeS : controlSizeM;

const controlSizeM = {
  default: 32,
  size: {
    XS: 20,
    S: 24,
    L: 40,
    XL: 48
  }
} as const;

const controlSizeS = {
  default: 16,
  size: {
    S: 14,
    L: 18,
    XL: 20
  }
} as const;

const allowedOverrides = [
  'margin',
  'marginStart',
  'marginEnd',
  'marginTop',
  'marginBottom',
  'marginX',
  'marginY',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'justifySelf',
  'alignSelf',
  'order',
  'gridArea',
  'gridRowStart',
  'gridRowEnd',
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
  'insetEnd',
  'visibility'
] as const;

export const widthProperties = ['width', 'minWidth', 'maxWidth'] as const;

export const heightProperties = ['size', 'height', 'minHeight', 'maxHeight'] as const;

export type StylesProp = StyleString<
  (typeof allowedOverrides)[number] | (typeof widthProperties)[number]
>;
export type StylesPropWithHeight = StyleString<
  | (typeof allowedOverrides)[number]
  | (typeof widthProperties)[number]
  | (typeof heightProperties)[number]
>;
export type StylesPropWithoutWidth = StyleString<(typeof allowedOverrides)[number]>;
export type UnsafeClassName = string & {properties?: never};
export interface UnsafeStyles {
  /**
   * Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)
   * for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop
   * instead.
   */
  UNSAFE_className?: UnsafeClassName;
  /**
   * Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for
   * the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop
   * instead.
   */
  UNSAFE_style?: CSSProperties;
}

export interface StyleProps extends UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesProp;
}

export function getAllowedOverrides({width = true, height = false} = {}): string[] {
  return (allowedOverrides as unknown as string[])
    .concat(width ? widthProperties : [])
    .concat(height ? heightProperties : []);
}
