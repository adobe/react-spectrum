import type {ViewStyle} from 'react-native';
import type {Direction, Scale} from '../provider/types';
import type {NativeTheme} from '../theme/types';
import {defaultTheme} from '../theme';

type DimensionValue = number | keyof NativeTheme['spacing'];
type ColorValue = keyof NativeTheme['colors'] | string;
type RadiusValue = keyof NativeTheme['radius'] | number;

export interface NativeStyleProps {
  alignSelf?: ViewStyle['alignSelf'];
  backgroundColor?: ColorValue;
  borderColor?: ColorValue;
  borderRadius?: RadiusValue;
  borderWidth?: number | keyof NativeTheme['border']['width'];
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  height?: DimensionValue;
  isHidden?: boolean;
  margin?: DimensionValue;
  marginBottom?: DimensionValue;
  marginEnd?: DimensionValue;
  marginStart?: DimensionValue;
  marginTop?: DimensionValue;
  marginX?: DimensionValue;
  marginY?: DimensionValue;
  maxHeight?: DimensionValue;
  maxWidth?: DimensionValue;
  minHeight?: DimensionValue;
  minWidth?: DimensionValue;
  overflow?: ViewStyle['overflow'];
  padding?: DimensionValue;
  paddingBottom?: DimensionValue;
  paddingEnd?: DimensionValue;
  paddingStart?: DimensionValue;
  paddingTop?: DimensionValue;
  paddingX?: DimensionValue;
  paddingY?: DimensionValue;
  width?: DimensionValue;
}

interface ResolveStyleOptions {
  direction?: Direction;
  scale?: Scale;
  theme?: NativeTheme;
}

export function resolveStyleProps(
  props: NativeStyleProps,
  options: ResolveStyleOptions = {}
): ViewStyle {
  let {direction = 'ltr', theme = defaultTheme} = options;
  let style: ViewStyle = {};

  assignDimension(style, 'width', props.width, theme);
  assignDimension(style, 'height', props.height, theme);
  assignDimension(style, 'minWidth', props.minWidth, theme);
  assignDimension(style, 'minHeight', props.minHeight, theme);
  assignDimension(style, 'maxWidth', props.maxWidth, theme);
  assignDimension(style, 'maxHeight', props.maxHeight, theme);
  assignDimension(style, 'margin', props.margin, theme);
  assignDimension(style, 'marginTop', props.marginTop, theme);
  assignDimension(style, 'marginBottom', props.marginBottom, theme);
  assignDimension(style, 'padding', props.padding, theme);
  assignDimension(style, 'paddingTop', props.paddingTop, theme);
  assignDimension(style, 'paddingBottom', props.paddingBottom, theme);

  assignAxis(style, 'margin', props.marginX, props.marginY, theme);
  assignAxis(style, 'padding', props.paddingX, props.paddingY, theme);
  assignLogical(style, 'margin', props.marginStart, props.marginEnd, direction, theme);
  assignLogical(style, 'padding', props.paddingStart, props.paddingEnd, direction, theme);

  if (props.backgroundColor) {
    style.backgroundColor = resolveColor(props.backgroundColor, theme);
  }
  if (props.borderColor) {
    style.borderColor = resolveColor(props.borderColor, theme);
  }
  if (props.borderRadius !== undefined) {
    style.borderRadius = resolveRadius(props.borderRadius, theme);
  }
  if (props.borderWidth !== undefined) {
    style.borderWidth = resolveBorderWidth(props.borderWidth, theme);
  }
  if (props.alignSelf !== undefined) {
    style.alignSelf = props.alignSelf;
  }
  if (props.flex !== undefined) {
    style.flex = props.flex;
  }
  if (props.flexGrow !== undefined) {
    style.flexGrow = props.flexGrow;
  }
  if (props.flexShrink !== undefined) {
    style.flexShrink = props.flexShrink;
  }
  if (props.overflow !== undefined) {
    style.overflow = props.overflow;
  }
  if (props.isHidden) {
    style.display = 'none';
  }

  return style;
}

function resolveDimension(value: DimensionValue | undefined, theme: NativeTheme) {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'number') {
    return value;
  }

  return theme.spacing[value] ?? Number(value);
}

function resolveColor(value: ColorValue, theme: NativeTheme) {
  return theme.colors[value] ?? value;
}

function resolveRadius(value: RadiusValue, theme: NativeTheme) {
  return typeof value === 'number' ? value : theme.radius[value];
}

function resolveBorderWidth(
  value: number | keyof NativeTheme['border']['width'],
  theme: NativeTheme
) {
  return typeof value === 'number' ? value : theme.border.width[value];
}

function assignDimension(
  style: ViewStyle,
  key: keyof ViewStyle,
  value: DimensionValue | undefined,
  theme: NativeTheme
) {
  let resolved = resolveDimension(value, theme);
  if (resolved !== undefined && Number.isFinite(resolved)) {
    (style as Record<string, unknown>)[key as string] = resolved;
  }
}

function assignAxis(
  style: ViewStyle,
  prefix: 'margin' | 'padding',
  x: DimensionValue | undefined,
  y: DimensionValue | undefined,
  theme: NativeTheme
) {
  assignDimension(style, `${prefix}Left` as keyof ViewStyle, x, theme);
  assignDimension(style, `${prefix}Right` as keyof ViewStyle, x, theme);
  assignDimension(style, `${prefix}Top` as keyof ViewStyle, y, theme);
  assignDimension(style, `${prefix}Bottom` as keyof ViewStyle, y, theme);
}

function assignLogical(
  style: ViewStyle,
  prefix: 'margin' | 'padding',
  start: DimensionValue | undefined,
  end: DimensionValue | undefined,
  direction: Direction,
  theme: NativeTheme
) {
  let startKey = direction === 'rtl' ? `${prefix}Right` : `${prefix}Left`;
  let endKey = direction === 'rtl' ? `${prefix}Left` : `${prefix}Right`;
  assignDimension(style, startKey as keyof ViewStyle, start, theme);
  assignDimension(style, endKey as keyof ViewStyle, end, theme);
}
