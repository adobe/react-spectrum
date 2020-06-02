/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {BackgroundColorValue, BorderColorValue, BorderRadiusValue, BorderSizeValue, ColorValue, DimensionValue, Direction, StyleProps, ViewStyleProps} from '@react-types/shared';
import {CSSProperties, HTMLAttributes} from 'react';
import {useLocale} from '@react-aria/i18n';

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
  justifySelf: ['justifySelf', passthroughStyle],
  position: ['position', anyValue],
  zIndex: ['zIndex', anyValue],
  top: ['top', dimensionValue],
  bottom: ['bottom', dimensionValue],
  start: [rtl('left', 'right'), dimensionValue],
  end: [rtl('right', 'left'), dimensionValue],
  left: ['left', dimensionValue],
  right: ['right', dimensionValue],
  flex: ['flex', flexValue],
  flexGrow: ['flexGrow', passthroughStyle],
  flexShrink: ['flexShrink', passthroughStyle],
  flexBasis: ['flexBasis', passthroughStyle],
  gridArea: ['gridArea', passthroughStyle],
  gridColumn: ['gridColumn', passthroughStyle],
  gridColumnEnd: ['gridColumnEnd', passthroughStyle],
  gridColumnStart: ['gridColumnStart', passthroughStyle],
  gridRow: ['gridRow', passthroughStyle],
  gridRowEnd: ['gridRowEnd', passthroughStyle],
  gridRowStart: ['gridRowStart', passthroughStyle]
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

const UNIT_RE = /(%|px|em|rem|vw|vh|auto|cm|mm|in|pt|pc|ex|ch|rem|vmin|vmax|fr)$/;
export function dimensionValue(value: DimensionValue) {
  if (typeof value === 'number') {
    return value + 'px';
  }

  if (UNIT_RE.test(value)) {
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

function anyValue(value: any) {
  return value;
}

function flexValue(value: boolean | number | string) {
  if (typeof value === 'boolean') {
    return value ? '1' : undefined;
  }

  return '' + value;
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

export function useStyleProps<T extends StyleProps>(props: T, handlers: StyleHandlers = baseStyleProps) {
  let {
    UNSAFE_className,
    UNSAFE_style,
    ...otherProps
  } = props;
  let {direction} = useLocale();
  let styles = convertStyleProps(props, handlers, direction);
  let style = {...UNSAFE_style, ...styles};

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
    className: UNSAFE_className
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
