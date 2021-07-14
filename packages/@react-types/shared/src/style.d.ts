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

type ResponsiveProp<T> = {
  base?: T,
  S?: T,
  M?: T,
  L?: T,
  [custom: string]: T | undefined
}
type Responsive<T> = T | ResponsiveProp<T>

export interface StyleProps {
  // For backward compatibility!
  /** Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use style props instead. */
  UNSAFE_className?: string,
  /** Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/Element/style) for the element. Only use as a **last resort**. Use style props instead. */
  UNSAFE_style?: CSSProperties,

  /** The margin for all four sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin). */
  margin?: Responsive<DimensionValue>,
  /** The margin for the logical start side of the element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-start). */
  marginStart?: Responsive<DimensionValue>,
  /** The margin for the logical end side of an element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-end). */
  marginEnd?: Responsive<DimensionValue>,
  // /** The margin for the left side of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left). Consider using `marginStart` instead for RTL support. */
  // marginLeft?: Responsive<DimensionValue>,
  // /** The margin for the right side of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left). Consider using `marginEnd` instead for RTL support. */
  // marginRight?: Responsive<DimensionValue>,
  /** The margin for the top side of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top). */
  marginTop?: Responsive<DimensionValue>,
  /** The margin for the bottom side of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom). */
  marginBottom?: Responsive<DimensionValue>,
  /** The margin for both the left and right sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin). */
  marginX?: Responsive<DimensionValue>,
  /** The margin for both the top and bottom sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/margin). */
  marginY?: Responsive<DimensionValue>,

  /** The width of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/width). */
  width?: Responsive<DimensionValue>,
  /** The height of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/height). */
  height?: Responsive<DimensionValue>,
  /** The minimum width of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width). */
  minWidth?: Responsive<DimensionValue>,
  /** The minimum height of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/min-height). */
  minHeight?: Responsive<DimensionValue>,
  /** The maximum width of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/max-width). */
  maxWidth?: Responsive<DimensionValue>,
  /** The maximum height of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/max-height). */
  maxHeight?: Responsive<DimensionValue>,

  /** When used in a flex layout, specifies how the element will grow or shrink to fit the space available. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex). */
  flex?: Responsive<string | number | boolean>,
  /** When used in a flex layout, specifies how the element will grow to fit the space available. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow). */
  flexGrow?: Responsive<number>,
  /** When used in a flex layout, specifies how the element will shrink to fit the space available. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink). */
  flexShrink?: Responsive<number>,
  /** When used in a flex layout, specifies the initial main size of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis). */
  flexBasis?: Responsive<number | string>,
  /** Specifies how the element is justified inside a flex or grid container. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self). */
  justifySelf?: Responsive<'auto' | 'normal' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'center' | 'left' | 'right' | 'stretch'>, // ...
  /** Overrides the `alignItems` property of a flex or grid container. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/align-self). */
  alignSelf?: Responsive<'auto' | 'normal' | 'start' | 'end' | 'center' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'stretch'>,
  /** The layout order for the element within a flex or grid container. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/order). */
  order?: Responsive<number>,

  /** When used in a grid layout, specifies the named grid area that the element should be placed in within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area). */
  gridArea?: Responsive<string>,
  /** When used in a grid layout, specifies the column the element should be placed in within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column). */
  gridColumn?: Responsive<string>,
  /** When used in a grid layout, specifies the row the element should be placed in within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row). */
  gridRow?: Responsive<string>,
  /** When used in a grid layout, specifies the starting column to span within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start). */
  gridColumnStart?: Responsive<string>,
  /** When used in a grid layout, specifies the ending column to span within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end). */
  gridColumnEnd?: Responsive<string>,
  /** When used in a grid layout, specifies the starting row to span within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start). */
  gridRowStart?: Responsive<string>,
  /** When used in a grid layout, specifies the ending row to span within the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end). */
  gridRowEnd?: Responsive<string>,

  /** Specifies how the element is positioned. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/position). */
  position?: Responsive<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>,
  /** The stacking order for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index). */
  zIndex?: Responsive<number>,
  /** The top position for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/top). */
  top?: Responsive<DimensionValue>,
  /** The bottom position for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/bottom). */
  bottom?: Responsive<DimensionValue>,
  /** The logical start position for the element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-start). */
  start?: Responsive<DimensionValue>,
  /** The logical end position for the element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-end). */
  end?: Responsive<DimensionValue>,
  /** The left position for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/left). Consider using `start` instead for RTL support. */
  left?: Responsive<DimensionValue>,
  /** The right position for the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/right). Consider using `start` instead for RTL support. */
  right?: Responsive<DimensionValue>,

  /** Hides the element. */
  isHidden?: Responsive<boolean>
}

// These support more properties than specific Spectrum components
// but still based on spectrum global/alias variables.
export interface ViewStyleProps extends StyleProps {
  /** The background color for the element. */
  backgroundColor?: Responsive<BackgroundColorValue>,

  /** The width of the element's border on all four sides. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-width). */
  borderWidth?: Responsive<BorderSizeValue>,
  /** The width of the border on the logical start side, depending on the layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-width). */
  borderStartWidth?: Responsive<BorderSizeValue>,
  /** The width of the border on the logical end side, depending on the layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-width). */
  borderEndWidth?: Responsive<BorderSizeValue>,
  // borderLeftWidth?: BorderSizeValue,
  // borderRightWidth?: BorderSizeValue,
  /** The width of the top border. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-width). */
  borderTopWidth?: Responsive<BorderSizeValue>,
  /** The width of the bottom border. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-width). */
  borderBottomWidth?: Responsive<BorderSizeValue>,
  /** The width of the left and right borders. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-width). */
  borderXWidth?: Responsive<BorderSizeValue>,
  /** The width of the top and bottom borders. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-width). */
  borderYWidth?: Responsive<BorderSizeValue>,

  /** The color of the element's border on all four sides. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-color). */
  borderColor?: Responsive<BorderColorValue>,
  /** The color of the border on the logical start side, depending on the layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-color). */
  borderStartColor?: Responsive<BorderColorValue>,
  /** The color of the border on the logical end side, depending on the layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-color). */
  borderEndColor?: Responsive<BorderColorValue>,
  // borderLeftColor?: BorderColorValue,
  // borderRightColor?: BorderColorValue,
  /** The color of the top border. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-color). */
  borderTopColor?: Responsive<BorderColorValue>,
  /** The color of the bottom border. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-color). */
  borderBottomColor?: Responsive<BorderColorValue>,
  /** The color of the left and right borders. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-color). */
  borderXColor?: Responsive<BorderColorValue>,
  /** The color of the top and bottom borders. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-width). */
  borderYColor?: Responsive<BorderColorValue>,

  /** The border radius on all four sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius). */
  borderRadius?: Responsive<BorderRadiusValue>,
  /** The border radius for the top start corner of the element, depending on the layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-start-radius). */
  borderTopStartRadius?: Responsive<BorderRadiusValue>,
  /** The border radius for the top end corner of the element, depending on the layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-end-radius). */
  borderTopEndRadius?: Responsive<BorderRadiusValue>,
  /** The border radius for the bottom start corner of the element, depending on the layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-end-start-radius). */
  borderBottomStartRadius?: Responsive<BorderRadiusValue>,
  /** The border radius for the bottom end corner of the element, depending on the layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-end-end-radius). */
  borderBottomEndRadius?: Responsive<BorderRadiusValue>,
  // borderTopLeftRadius?: BorderRadiusValue,
  // borderTopRightRadius?: BorderRadiusValue,
  // borderBottomLeftRadius?: BorderRadiusValue,
  // borderBottomRightRadius?: BorderRadiusValue,

  /** The padding for all four sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/padding). */
  padding?: Responsive<DimensionValue>,
  /** The padding for the logical start side of the element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline-start). */
  paddingStart?: Responsive<DimensionValue>,
  /** The padding for the logical end side of an element, depending on layout direction. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline-end). */
  paddingEnd?: Responsive<DimensionValue>,
  // paddingLeft?: Responsive<DimensionValue>,
  // paddingRight?: Responsive<DimensionValue>,
  /** The padding for the top side of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-top). */
  paddingTop?: Responsive<DimensionValue>,
  /** The padding for the bottom side of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-bottom). */
  paddingBottom?: Responsive<DimensionValue>,
  /** The padding for both the left and right sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/padding). */
  paddingX?: Responsive<DimensionValue>,
  /** The padding for both the top and bottom sides of the element. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/padding). */
  paddingY?: Responsive<DimensionValue>,

  /** Species what to do when the element's content is too long to fit its size. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow). */
  overflow?: Responsive<string>
  // ...
  // shadows?
  // transforms?
}

export interface BoxAlignmentStyleProps {
  /**
   * The distribution of space around items along the main axis. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content).
   * @default 'stretch'
   */
  justifyContent?: Responsive<'start' | 'end' | 'center' | 'left' | 'right' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'baseline' | 'first baseline' | 'last baseline' | 'safe center' | 'unsafe center'>,
  /**
   * The distribution of space around child items along the cross axis. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content).
   * @default 'start'
   */
  alignContent?: Responsive<'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'baseline' | 'first baseline' | 'last baseline' | 'safe center' | 'unsafe center'>,
  /**
   * The alignment of children within their container. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items).
   * @default 'stretch'
   */
  alignItems?: Responsive<'start' | 'end' | 'center' | 'stretch' | 'self-start' | 'self-end' | 'baseline' | 'first baseline' | 'last baseline' | 'safe center' | 'unsafe center'>,
  /** The space to display between both rows and columns. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gap). */
  gap?: Responsive<DimensionValue>,
  /** The space to display between columns. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/column-gap). */
  columnGap?: Responsive<DimensionValue>,
  /** The space to display between rows. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/row-gap). */
  rowGap?: Responsive<DimensionValue>
}

export interface FlexStyleProps extends BoxAlignmentStyleProps, StyleProps {
  /**
   * The direction in which to layout children. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction).
   * @default 'row'
   */
  direction?: Responsive<'row' | 'column' | 'row-reverse' | 'column-reverse'>,
  /**
   * Whether to wrap items onto multiple lines. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap).
   * @default false
   */
  wrap?: Responsive<boolean | 'wrap' | 'nowrap' | 'wrap-reverse'>
}

export interface GridStyleProps extends BoxAlignmentStyleProps, StyleProps {
  /** Defines named grid areas. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas). */
  areas?: Responsive<string[]>,
  /** Defines the sizes of each row in the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows). */
  rows?: Responsive<string | DimensionValue[]>,
  /** Defines the sizes of each column in the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns). */
  columns?: Responsive<string | DimensionValue[]>,
  /** Defines the size of implicitly generated columns. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns). */
  autoColumns?: Responsive<DimensionValue>,
  /** Defines the size of implicitly generated rows. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows). */
  autoRows?: Responsive<DimensionValue>,
  /** Controls how auto-placed items are flowed into the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow). */
  autoFlow?: Responsive<'row' | 'column' | 'row dense' | 'column dense'>,
  /** Defines the default `justifySelf` for all items in the grid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items). */
  justifyItems?: Responsive<'auto' | 'normal' | 'start' | 'end' | 'center' | 'left' | 'right' | 'stretch' | 'self-start' | 'self-end' | 'baseline' | 'first baseline' | 'last baseline' | 'safe center' | 'unsafe center' | 'legacy right' | 'legacy left' | 'legacy center'>
}
