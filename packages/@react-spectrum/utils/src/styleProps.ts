import {BackgroundColorValue, BorderColorValue, BorderRadiusValue, BorderSizeValue, ColorValue, DimensionValue, StyleProps, ViewStyleProps} from '@react-types/shared';
import classNames from 'classnames';
import {CSSProperties, HTMLAttributes} from 'react';
import {useLocale} from '@react-aria/i18n';
import {useSlotProvider} from './Slots';

type Direction = 'ltr' | 'rtl';
type StyleName = string | string[] | ((dir: Direction) => string);
type StyleHandler = (value: any) => string;
export interface StyleHandlers {
  [key: string]: [StyleName, StyleHandler]
}

export const baseStyleProps: StyleHandlers = {
  margin: ['margin', dimensionValue],
  marginStart: [rtl('marginLeft', 'marginRight'), dimensionValue],
  marginEnd: [rtl('marginRight', 'marginLeft'), dimensionValue],
  marginLeft: ['marginLeft', dimensionValue],
  marginRight: ['marginRight', dimensionValue],
  marginTop: ['marginTop', dimensionValue],
  marginBottom: ['marginBottom', dimensionValue],
  marginX: [['marginLeft', 'marginRight'], dimensionValue],
  marginY: [['marginTop', 'marginBottom'], dimensionValue],
  width: ['width', dimensionValue],
  height: ['height', dimensionValue],
  minWidth: ['minWidth', dimensionValue],
  minHeight: ['minHeight', dimensionValue],
  maxWidth: ['maxWidth', dimensionValue],
  maxHeight: ['maxHeight', dimensionValue],
  isHidden: ['display', hiddenValue],
  alignSelf: ['alignSelf', passthroughStyle],
  justifySelf: ['justifySelf', passthroughStyle]
};

export const viewStyleProps: StyleHandlers = {
  ...baseStyleProps,
  backgroundColor: ['backgroundColor', backgroundColorValue],
  borderWidth: ['borderWidth', borderSizeValue],
  borderStartWidth: [rtl('borderLeftWidth', 'borderRightWidth'), borderSizeValue],
  borderEndWidth: [rtl('borderRightWidth', 'borderLeftWidth'), borderSizeValue],
  borderLeftWidth: ['borderLeftWidth', borderSizeValue],
  borderRightWidth: ['borderRightWidth', borderSizeValue],
  borderTopWidth: ['borderTopWidth', borderSizeValue],
  borderBottomWidth: ['borderBottomWidth', borderSizeValue],
  borderXWidth: [['borderLeftWidth', 'borderRightWidth'], borderSizeValue],
  borderYWidth: [['borderTopWidth', 'borderBottomWidth'], borderSizeValue],
  borderColor: ['borderColor', borderColorValue],
  borderStartColor: [rtl('borderLeftColor', 'borderRightColor'), borderColorValue],
  borderEndColor: [rtl('borderRightColor', 'borderLeftColor'), borderColorValue],
  borderLeftColor: ['borderLeftColor', borderColorValue],
  borderRightColor: ['borderRightColor', borderColorValue],
  borderTopColor: ['borderTopColor', borderColorValue],
  borderBottomColor: ['borderBottomColor', borderColorValue],
  borderXColor: [['borderLeftColor', 'borderRightColor'], borderColorValue],
  borderYColor: [['borderTopColor', 'borderBottomColor'], borderColorValue],
  borderRadius: ['borderRadius', borderRadiusValue],
  borderTopStartRadius: [rtl('borderTopLeftRadius', 'borderTopRightRadius'), borderRadiusValue],
  borderTopEndRadius: [rtl('borderTopRightRadius', 'borderTopLeftRadius'), borderRadiusValue],
  borderBottomStartRadius: [rtl('borderBottomLeftRadius', 'borderBottomRightRadius'), borderRadiusValue],
  borderBottomEndRadius: [rtl('borderBottomRightRadius', 'borderBottomLeftRadius'), borderRadiusValue],
  borderTopLeftRadius: ['borderTopLeftRadius', borderRadiusValue],
  borderTopRightRadius: ['borderTopRightRadius', borderRadiusValue],
  borderBottomLeftRadius: ['borderBottomLeftRadius', borderRadiusValue],
  borderBottomRightRadius: ['borderBottomRightRadius', borderRadiusValue],
  padding: ['padding', dimensionValue],
  paddingStart: [rtl('paddingLeft', 'paddingRight'), dimensionValue],
  paddingEnd: [rtl('paddingRight', 'paddingLeft'), dimensionValue],
  paddingLeft: ['paddingLeft', dimensionValue],
  paddingRight: ['paddingRight', dimensionValue],
  paddingTop: ['paddingTop', dimensionValue],
  paddingBottom: ['paddingBottom', dimensionValue],
  paddingX: [['paddingLeft', 'paddingRight'], dimensionValue],
  paddingY: [['paddingTop', 'paddingBottom'], dimensionValue]
};

const borderStyleProps = {
  borderWidth: 'borderStyle',
  borderLeftWidth: 'borderLeftStyle',
  borderRightWidth: 'borderRightStyle',
  borderTopWidth: 'borderTopStyle',
  borderBottomWidth: 'borderBottomStyle'
};

function rtl(ltr: string, rtl: string) {
  return (direction: Direction) => (
    direction === 'rtl' ? rtl : ltr
  );
}

export function dimensionValue(value: DimensionValue) {
  if (typeof value === 'number') {
    return value + 'px';
  }

  if (/(%|px|em|rem)$/.test(value)) {
    return value;
  }

  return `var(--spectrum-global-dimension-${value}, var(--spectrum-alias-${value}))`;
}

type ColorType = 'default' | 'background' | 'border' | 'icon' | 'status';
function colorValue(value: ColorValue, type: ColorType = 'default') {
  return `var(--spectrum-global-color-${value}, var(--spectrum-semantic-${value}-color-${type}))`;
}

function backgroundColorValue(value: BackgroundColorValue) {
  return `var(--spectrum-alias-background-color-${value}, ${colorValue(value as ColorValue, 'background')})`;
}

function borderColorValue(value: BorderColorValue) {
  if (value === 'default') {
    return 'var(--spectrum-alias-border-color)';
  }

  return `var(--spectrum-alias-border-color-${value}, ${colorValue(value as ColorValue, 'border')})`;
}

function borderSizeValue(value: BorderSizeValue) {
  return `var(--spectrum-alias-border-size-${value})`;
}

function borderRadiusValue(value: BorderRadiusValue) {
  return `var(--spectrum-alias-border-radius-${value})`;
}

function hiddenValue(value: boolean) {
  return value ? 'none' : undefined;
}

export function convertStyleProps(props: ViewStyleProps, handlers: StyleHandlers, direction: Direction) {
  let style: CSSProperties = {};
  for (let key in props) {
    let styleProp = handlers[key];
    if (!styleProp || props[key] == null) {
      continue;
    }

    let [name, convert] = styleProp;
    if (typeof name === 'function') {
      name = name(direction);
    }

    let value = convert(props[key]);
    if (Array.isArray(name)) {
      for (let k of name) {
        style[k] = value;
      }
    } else {
      style[name] = value;
    }
  }

  for (let prop in borderStyleProps) {
    if (style[prop]) {
      style[borderStyleProps[prop]] = 'solid';
      style.boxSizing = 'border-box';
    }
  }

  return style;
}

export function useStyleProps(props: StyleProps, handlers: StyleHandlers = baseStyleProps) {
  let {
    UNSAFE_className,
    UNSAFE_style,
    slot,
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();
  let slotGridArea = {};
  if (!slotClassName && slot) {
    slotGridArea = {gridArea: slot};
  }
  let {direction} = useLocale();
  let styles = convertStyleProps(props, handlers, direction);
  let style = {...UNSAFE_style, ...styles, ...slotGridArea};

  // @ts-ignore
  if (otherProps.className) {
    console.warn(
      'The className prop is unsafe and is unsupported in React Spectrum v3. ' +
      'Please use style props with Spectrum variables, or UNSAFE_className if you absolutely must to something custom. ' +
      'Note that this may break in future versions due to DOM structure changes.'
    );
  }

  // @ts-ignore
  if (otherProps.style) {
    console.warn(
      'The style prop is unsafe and is unsupported in React Spectrum v3. ' +
      'Please use style props with Spectrum variables, or UNSAFE_style if you absolutely must to something custom. ' +
      'Note that this may break in future versions due to DOM structure changes.'
    );
  }

  let styleProps: HTMLAttributes<HTMLElement> = {
    style,
    className: classNames(UNSAFE_className, slotClassName)
  };

  if (props.isHidden) {
    styleProps.hidden = true;
  }

  return {
    styleProps
  };
}

export function passthroughStyle(value) {
  return value;
}

const boxAlignmentStyleProps: StyleHandlers = {
  justifyItems: ['justify-items', passthroughStyle],
  justifyContent: ['justify-content', passthroughStyle],
  alignItems: ['align-items', passthroughStyle],
  alignContent: ['align-content', passthroughStyle],
  ...baseStyleProps
};

export const flexStyleProps: StyleHandlers = {
  flexDirection: ['flex-direction', passthroughStyle],
  flexWrap: ['flex-wrap', passthroughStyle],
  flexFlow: ['flex-flow', passthroughStyle],
  ...boxAlignmentStyleProps
};

export const gridStyleProps: StyleHandlers = {
  grid: ['grid', passthroughStyle],
  gridArea: ['grid-area', passthroughStyle],
  gridAutoColumns: ['grid-auto-columns', passthroughStyle],
  gridAutoFlow: ['grid-auto-flow', passthroughStyle],
  gridAutoRows: ['grid-auto-rows', passthroughStyle],
  gridColumn: ['grid-column', passthroughStyle],
  gridColumnEnd: ['grid-column-end', passthroughStyle],
  gridColumnStart: ['grid-column-start', passthroughStyle],
  gridRow: ['grid-row', passthroughStyle],
  gridRowEnd: ['grid-row-end', passthroughStyle],
  gridRowStart: ['grid-row-start', passthroughStyle],
  gridTemplate: ['grid-template', passthroughStyle],
  gridTemplateAreas: ['grid-template-areas', passthroughStyle],
  gridTemplateColumns: ['grid-template-columns', passthroughStyle],
  gridTemplateRows: ['grid-template-rows', passthroughStyle],
  rowGap: ['row-gap', dimensionValue],
  columnGap: ['row-gap', dimensionValue],
  ...boxAlignmentStyleProps
};

