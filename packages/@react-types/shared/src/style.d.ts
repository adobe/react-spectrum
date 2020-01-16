import {BackgroundColorValue, BorderColorValue, BorderRadiusValue, BorderSizeValue, DimensionValue} from './dna';
import {CSSProperties} from 'react';

export interface StyleProps {
  // For backward compatibility!
  /** @deprecated */
  UNSAFE_className?: string,
  UNSAFE_style?: CSSProperties,

  slot?: string,

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

type globalVals = 'initial' | 'inherit' | 'unset';
type justifyContentType = 'center'| 'start'| 'end'| 'flex-start' | 'flex-end' | 'left' | 'right' | 'normal' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'safe center' | 'unsafe center' | globalVals;
type justifyItemsType = 'auto' | 'normal' | 'stretch' | 'center'| 'start'| 'end'| 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'left' | 'right' | 'baseline' | 'first baseline' | 'last baseline' | 'safe center' | 'unsafe center' | 'legacy right' | 'legacy left' | 'legacy center' | globalVals;
type alignContentType = 'center'| 'start'| 'end'| 'flex-start' | 'flex-end' | 'normal' | 'baseline' | 'first baseline' | 'last baseline' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'safe center' | 'unsafe center' | globalVals;
type alignItemsType = 'normal'| 'stretch'| 'center'| 'start' | 'end' | 'flex-start' | 'flex-end' | 'baseline' | 'first baseline' | 'last baseline' | 'safe center' | 'unsafe center' | globalVals;

export interface FlexStyleProps extends StyleProps {
  justifyContent?: justifyContentType,
  justifyItems?: justifyItemsType,
  alignContent?: alignContentType,
  alignItems?: alignItemsType,
  placeContent?: {
    align: alignContentType
    justify?: justifyContentType
  },
  placeItems?: {
    align: alignItemsType | 'auto'
    justify?: justifyItemsType
  },
  rowGap?: DimensionValue // not well supported in Flex, but is well supported in Grid, also, should this really be dimension value??
}

export interface GridStyleProps extends StyleProps {
  justifyContent?: justifyContentType,
  justifyItems?: justifyItemsType,
  alignContent?: alignContentType,
  alignItems?: alignItemsType,
  placeContent?: {
    align: alignContentType
    justify?: justifyContentType
  },
  placeItems?: {
    align: alignItemsType | 'auto'
    justify?: justifyItemsType
  },
  rowGap?: DimensionValue, // not well supported in Flex, but is well supported in Grid, also, should this really be dimension value??
  columnGap?: DimensionValue // dimension value correct?
  // gap?: how do i type this one????
}
