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

import {
  baseStyleProps,
  dimensionValue,
  passthroughStyle,
  StyleHandlers,
  useDOMRef,
  useStyleProps
} from '@react-spectrum/utils';
import {DimensionValue, DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {GridProps} from '@react-types/layout';
import React, {forwardRef} from 'react';

export const gridStyleProps: StyleHandlers = {
  ...baseStyleProps,
  autoFlow: ['gridAutoFlow', passthroughStyle],
  autoColumns: ['gridAutoColumns', gridDimensionValue],
  autoRows: ['gridAutoRows', gridDimensionValue],
  areas: ['gridTemplateAreas', gridTemplateAreasValue],
  columns: ['gridTemplateColumns', gridTemplateValue],
  rows: ['gridTemplateRows', gridTemplateValue],
  gap: ['gap', dimensionValue],
  rowGap: ['rowGap', dimensionValue],
  columnGap: ['columnGap', dimensionValue],
  justifyItems: ['justifyItems', passthroughStyle],
  justifyContent: ['justifyContent', passthroughStyle],
  alignItems: ['alignItems', passthroughStyle],
  alignContent: ['alignContent', passthroughStyle]
};

function Grid(props: GridProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps, gridStyleProps);
  styleProps.style.display = 'grid'; // inline-grid?
  let domRef = useDOMRef(ref);

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={domRef}>
      {children}
    </div>
  );
}

/**
 * Can be used to make a repeating fragment of the columns or rows list.
 * See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat).
 * @param count - the number of times to repeat the fragment
 * @param repeat - the fragment to repeat
 */
export function repeat(count: number | 'auto-fill' | 'auto-fit', repeat: DimensionValue | DimensionValue[]): string {
  return `repeat(${count}, ${gridTemplateValue(repeat)})`;
}

/**
 * Defines a size range greater than or equal to min and less than or equal to max.
 * See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/minmax).
 * @param min - the minimum size
 * @param max - the maximum size
 */
export function minmax(min: DimensionValue, max: DimensionValue): string {
  return `minmax(${gridDimensionValue(min)}, ${gridDimensionValue(max)})`;
}

/**
 * Clamps a given size to an available size.
 * See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/fit-content).
 * @param dimension - the size to clamp
 */
export function fitContent(dimension: DimensionValue): string {
  return `fit-content(${gridDimensionValue(dimension)})`;
}

function gridTemplateAreasValue(value) {
  return value.map(v => `"${v}"`).join('\n');
}

function gridDimensionValue(value) {
  if (/^max-content|min-content|minmax|auto|fit-content|repeat|subgrid/.test(value)) {
    return value;
  }

  return dimensionValue(value);
}

function gridTemplateValue(value) {
  if (Array.isArray(value)) {
    return value.map(gridDimensionValue).join(' ');
  }

  return gridDimensionValue(value);
}

/**
 * A layout container using CSS grid. Supports Spectrum dimensions as values to
 * ensure consistent and adaptive sizing and spacing.
 */
const _Grid = forwardRef(Grid);
export {_Grid as Grid};
