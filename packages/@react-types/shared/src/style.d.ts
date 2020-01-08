import {BackgroundColorValue, BorderColorValue, BorderRadiusValue, BorderSizeValue, DimensionValue} from './dna';
import {CSSProperties} from 'react';

export interface StyleProps {
  // For backward compatibility!
  /** @deprecated */
  UNSAFE_className?: string,
  UNSAFE_style?: CSSProperties,

  margin?: DimensionValue,
  marginStart?: DimensionValue,
  marginEnd?: DimensionValue,
  marginLeft?: DimensionValue,
  marginRight?: DimensionValue,
  marginTop?: DimensionValue,
  marginBottom?: DimensionValue,
  marginX?: DimensionValue,
  marginY?: DimensionValue,
  width?: DimensionValue,
  height?: DimensionValue,
  minWidth?: DimensionValue,
  minHeight?: DimensionValue,
  maxWidth?: DimensionValue,
  maxHeight?: DimensionValue,
  flex?: string | number | boolean,
  flexGrow?: number,
  flexShrink?: number,
  justifyItems?: 'auto' | 'normal' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'center' | 'left' | 'right' | 'stretch' | 'space-between', // ...
  alignItems?: 'auto' | 'normal' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'center' | 'stretch', // ...
  justifySelf?: 'auto' | 'normal' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'center' | 'left' | 'right' | 'stretch', // ...
  alignSelf?: 'auto' | 'normal' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'center' | 'stretch', // ...
  flexOrder?: number,
  // TODO: grid
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky',
  zIndex?: number,
  top?: DimensionValue,
  bottom?: DimensionValue,
  start?: DimensionValue,
  end?: DimensionValue,
  left?: DimensionValue,
  right?: DimensionValue,

  isHidden?: boolean
}

// These support more properties than specific Spectrum components
// but still based on spectrum global/alias variables.
export interface ViewStyleProps extends StyleProps {
  backgroundColor?: BackgroundColorValue,
  borderWidth?: BorderSizeValue,
  borderStartWidth?: BorderSizeValue,
  borderEndWidth?: BorderSizeValue,
  borderLeftWidth?: BorderSizeValue,
  borderRightWidth?: BorderSizeValue,
  borderBottomWidth?: BorderSizeValue,
  borderTopWidth?: BorderSizeValue,
  borderXWidth?: BorderSizeValue,
  borderYWidth?: BorderSizeValue,
  borderColor?: BorderColorValue,
  borderStartColor?: BorderColorValue,
  borderEndColor?: BorderColorValue,
  borderLeftColor?: BorderColorValue,
  borderRightColor?: BorderColorValue,
  borderBottomColor?: BorderColorValue,
  borderTopColor?: BorderColorValue,
  borderXColor?: BorderColorValue,
  borderYColor?: BorderColorValue,
  borderRadius?: BorderRadiusValue,
  borderTopStartRadius?: BorderRadiusValue,
  borderTopEndRadius?: BorderRadiusValue,
  borderBottomStartRadius?: BorderRadiusValue,
  borderBottomEndRadius?: BorderRadiusValue,
  borderTopLeftRadius?: BorderRadiusValue,
  borderTopRightRadius?: BorderRadiusValue,
  borderBottomLeftRadius?: BorderRadiusValue,
  borderBottomRightRadius?: BorderRadiusValue,
  padding?: DimensionValue,
  paddingStart?: DimensionValue,
  paddingEnd?: DimensionValue,
  paddingLeft?: DimensionValue,
  paddingRight?: DimensionValue,
  paddingTop?: DimensionValue,
  paddingBottom?: DimensionValue,
  paddingX?: DimensionValue,
  paddingY?: DimensionValue,
  overflow?: string,
  // ...
  // shadows?
  // transforms?
}
