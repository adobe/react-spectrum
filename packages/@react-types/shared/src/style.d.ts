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

  isHidden?: boolean,

  // don't know how to type these https://css-tricks.com/snippets/css/complete-guide-grid/
  gridColumnStart?: string,
  gridColumnEnd?: string,
  gridRowStart?: string,
  gridRowEnd?: string,
  gridColumn?: string,
  gridRow?: string,
  gridArea?: string
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

type GlobalVals = 'initial' | 'inherit' | 'unset';
type JustifyContentType = 'center'| 'start'| 'end'| 'flex-start' | 'flex-end' | 'left' | 'right' | 'normal' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'safe center' | 'unsafe center' | GlobalVals;
type JustifyItemsType = 'auto' | 'normal' | 'stretch' | 'center'| 'start'| 'end'| 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'left' | 'right' | 'baseline' | 'first baseline' | 'last baseline' | 'safe center' | 'unsafe center' | 'legacy right' | 'legacy left' | 'legacy center' | GlobalVals;
type AlignContentType = 'center'| 'start'| 'end'| 'flex-start' | 'flex-end' | 'normal' | 'baseline' | 'first baseline' | 'last baseline' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'safe center' | 'unsafe center' | GlobalVals;
type AlignItemsType = 'normal'| 'stretch'| 'center'| 'start' | 'end' | 'flex-start' | 'flex-end' | 'baseline' | 'first baseline' | 'last baseline' | 'safe center' | 'unsafe center' | GlobalVals;

export interface FlexStyleProps extends StyleProps {
  justifyContent?: JustifyContentType,
  justifyItems?: JustifyItemsType,
  alignContent?: AlignContentType,
  alignItems?: AlignItemsType
}

export interface GridStyleProps extends StyleProps {
  justifyContent?: JustifyContentType,
  justifyItems?: JustifyItemsType,
  alignContent?: AlignContentType,
  alignItems?: AlignItemsType,
  // naming existing properties but don't know how to type many of them
  rowGap?: DimensionValue, // not well supported in Flex, but is well supported in Grid, also, should this really be dimension value??
  columnGap?: DimensionValue, // dimension value correct?
  gridTemplateAreas?: string,
  gridTemplateRows?: string,
  gridTemplateColumns?: string,
  gridTemplate?: string,
  gridColumnGap?: string,
  gridRowGap?: string,
  gridGap?: string,
  gridAutoColumns?: string,
  gridAutoRows?: string,
  gridAutoFlow?: 'row' | 'column' | 'row dense' | 'column dense',
  grid?: string,
  // gap?: how do i type this one????
}
