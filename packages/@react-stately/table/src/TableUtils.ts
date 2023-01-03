/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ColumnSize} from '@react-types/table';
import {Key} from 'react';

// numbers and percents are considered static. *fr units or a lack of units are considered dynamic.
export function isStatic(width: number | string): boolean {
  return width != null && (!isNaN(width as number) || (String(width)).match(/^(\d+)(?=%$)/) !== null);
}

export function parseFractionalUnit(width: string): number {
  if (!width) {
    return 1;
  }
  let match = width.match(/^(.+)(?=fr$)/);
  // if width is the incorrect format, just default it to a 1fr
  if (!match) {
    console.warn(`width: ${width} is not a supported format, width should be a number (ex. 150), percentage (ex. '50%') or fr unit (ex. '2fr')`,
      'defaulting to \'1fr\'');
    return 1;
  }
  return parseFloat(match[0]);
}

export function parseStaticWidth(width: number | string, tableWidth: number): number {
  if (typeof width === 'string') {
    let match = width.match(/^(\d+)(?=%$)/);
    if (!match) {
      throw new Error('Only percentages or numbers are supported for static column widths');
    }
    return tableWidth * (parseFloat(match[0]) / 100);
  }
  return width;
}


export function getMaxWidth(maxWidth: number | string, tableWidth: number): number {
  return maxWidth != null
    ? parseStaticWidth(maxWidth, tableWidth)
    : Number.MAX_SAFE_INTEGER;
}

// cannot support FR units, we'd need to know everything else in the table to do that
export function getMinWidth(minWidth: number | string, tableWidth: number): number {
  return minWidth != null
    ? parseStaticWidth(minWidth, tableWidth)
    : 0;
}


export interface IColumn {
  minWidth?: number | string,
  maxWidth?: number | string,
  width?: number | string,
  defaultWidth?: number | string,
  key?: Key
}

/**
 * Implements the flex algorithm described in https://www.w3.org/TR/css-flexbox-1/#layout-algorithm
 * It makes a few constraint/assumptions:
 * 1. All basis values are 0 unless it is a static width, then the basis is the static width
 * 2. All flex grow and shrink values are equal to the FR specified on the column, grow and shrink for the same column are equal
 * 3. We only have one row
 * An example of the setup can be seen here https://jsfiddle.net/snowystinger/wv0ymjaf/61/ where I let the browser figure out the
 * flex of the columns.
 * Note: We differ in one key aspect, all of our column widths must be whole numbers, so we avoid browser
 * sub pixel rounding errors. To do this, we use a cascading rounding algorithm to ensure that the sum of the widths is maintained
 * while distributing the rounding remainder across the columns.
 *
 * As noted in the chrome source code, this algorithm is very accurate, but has the potential to be quadratic.
 * They have deemed this to be acceptable because the number of elements is usually small and the flex factors
 * are usually not high variance. I believe we can make the same assumptions. Particularly once resizing is
 * started, it will convert all columns to the left to static widths, so it will cut down on the number of FR columns.
 * @param availableWidth - The visible width of the table.
 * @param columns - The table defined columns.
 * @param changedColumns - Any columns we want to override, for example, during resizing.
 * @param getDefaultWidth - A function that returns the default width of a column by its index.
 * @param getDefaultMinWidth - A function that returns the default min width of a column by its index.
 */
export function calculateColumnSizes(availableWidth: number, columns: IColumn[], changedColumns: Map<Key, ColumnSize>, getDefaultWidth, getDefaultMinWidth) {
  let flexItems = columns.map((column, index) => {
    let width = changedColumns.get(column.key) != null ? changedColumns.get(column.key) : column.width ?? column.defaultWidth ?? getDefaultWidth?.(index) ?? '1fr';
    let frozen = false;
    let baseSize = 0;
    let flex = 0;
    if (isStatic(width)) {
      baseSize = parseStaticWidth(width, availableWidth);
      frozen = true;
    } else {
      flex = parseFractionalUnit(width);
      if (flex <= 0) {
        frozen = true;
      }
    }

    let min = getMinWidth(column.minWidth ?? getDefaultMinWidth?.(index) ?? 0, availableWidth);
    let max = getMaxWidth(column.maxWidth, availableWidth);
    let hypotheticalMainSize = Math.max(min, Math.min(baseSize, max));
    return {
      frozen,
      baseSize,
      hypotheticalMainSize,
      min,
      max,
      flex,
      targetMainSize: null,
      scaledFlexShrinkFactor: 0,
      violation: ''
    };
  });
  // 9.7.1
  let totalHypothetical = flexItems.reduce((acc, col) => acc + col.hypotheticalMainSize, 0);
  let isGrow = false;
  if (totalHypothetical < availableWidth) {
    isGrow = true;
  }
  // 9.7.2
  flexItems.forEach(item => {
    if (item.frozen) {
      item.targetMainSize = item.hypotheticalMainSize;
      return;
    }
    if (isGrow) {
      if (item.baseSize > item.hypotheticalMainSize) {
        item.targetMainSize = item.hypotheticalMainSize;
      }
    } else {
      if (item.baseSize < item.hypotheticalMainSize) {
        item.targetMainSize = item.hypotheticalMainSize;
      }
    }
  });

  // 9.7.3
  let initialFreeSpace = availableWidth - flexItems.reduce((acc, item) => {
    if (item.frozen) {
      return acc + item.targetMainSize;
    }
    return acc + item.baseSize;
  }, 0);

  let remainingFreeSpace = initialFreeSpace;
  // 9.7.4
  // 9.7.4.a
  while (flexItems.some(item => !item.frozen)) {
    // 9.7.4.b
    /**
     * Calculate the remaining free space as for initial free space,
     * above (9.7.3). If the sum of the unfrozen flex items’ flex factors is
     * less than one, multiply the initial free space by this sum (of flex factors).
     * If the magnitude of this value is less than the magnitude of
     * the remaining free space, use this as the remaining free space.
     */
    remainingFreeSpace = availableWidth - flexItems.reduce((acc, item) => {
      if (item.frozen) {
        return acc + item.targetMainSize;
      }
      return acc + item.baseSize;
    }, 0);
    let flexFactors = flexItems.reduce((acc, item) => {
      if (!item.frozen) {
        return acc + item.flex;
      }
      return acc;
    }, 0);
    if (flexFactors < 1) {
      let tempRemainingFreeSpace = initialFreeSpace * flexFactors;
      if (tempRemainingFreeSpace < remainingFreeSpace) {
        remainingFreeSpace = tempRemainingFreeSpace;
      }
    }
    // 9.7.4.c
    /**
     * If the remaining free space is zero
     * - Do nothing.
     *
     * If using the flex grow factor
     * - Find the ratio of the item’s flex grow factor to the
     * sum of the flex grow factors of all unfrozen items on
     * the line. Set the item’s target main size to its flex
     * base size plus a fraction of the remaining free space
     * proportional to the ratio.
     *
     * If using the flex shrink factor
     * - For every unfrozen item on the line, multiply its flex
     * shrink factor by its inner flex base size, and note
     * this as its scaled flex shrink factor. Find the ratio
     * of the item’s scaled flex shrink factor to the sum of
     * the scaled flex shrink factors of all unfrozen items
     * on the line. Set the item’s target main size to its
     * flex base size minus a fraction of the absolute value
     * of the remaining free space proportional to the ratio.
     * Note this may result in a negative inner main size; it
     * will be corrected in the next step.
     *
     * Otherwise
     * - Do nothing.
     */
    if (remainingFreeSpace <= 0) {
      // do nothing
    } else if (isGrow) {
      let total = flexItems.reduce((acc, item) => item.frozen ? acc : acc + item.flex, 0);
      flexItems.forEach((item) => {
        if (item.frozen) {
          return;
        }
        let ratio = item.flex / total;
        item.targetMainSize = item.baseSize + (ratio * remainingFreeSpace);
      });
    } else if (!isGrow) {
      flexItems.forEach((item) => {
        item.scaledFlexShrinkFactor = 1;
        if (!item.frozen) {
          item.scaledFlexShrinkFactor = item.flex * item.baseSize;
        }
      });
      let totalShrinkFactors = flexItems.reduce((acc, item) => acc + item.scaledFlexShrinkFactor, 0);

      flexItems.forEach(item => {
        if (item.frozen) {
          return;
        }
        let ratio = item.scaledFlexShrinkFactor / totalShrinkFactors;
        item.targetMainSize = item.baseSize - Math.abs(ratio * remainingFreeSpace);
      });
    } else {
      // do nothing
    }

    // 9.7.4.d
    /**
     * Fix min/max violations. Clamp each non-frozen item’s
     * target main size by its used min and max main sizes
     * and floor its content-box size at zero. If the item’s
     * target main size was made smaller by this, it’s a max
     * violation. If the item’s target main size was made
     * larger by this, it’s a min violation.
     */
    let totalViolation = 0;
    flexItems.forEach(item => {
      item.violation = '';
      if (!item.frozen) {
        let {min, max, targetMainSize} = item;
        item.targetMainSize = Math.max(min, Math.min(targetMainSize, max));

        totalViolation += item.targetMainSize - targetMainSize;
        // got smaller
        if (item.targetMainSize < targetMainSize) {
          item.violation = 'max';
        } else if (item.targetMainSize > targetMainSize) {
          item.violation = 'min';
        }
      }
    });

    // 9.7.4.e
    /**
     * Freeze over-flexed items. The total violation is the
     * sum of the adjustments from the previous step
     * ∑(clamped size - unclamped size). If the total violation is:
     * Zero
     * - Freeze all items.
     *
     * Positive
     * - Freeze all the items with min violations.
     *
     * Negative
     * - Freeze all the items with max violations.
     */
    if (totalViolation === 0) {
      flexItems.forEach(item => {
        item.frozen = true;
      });
    } else if (totalViolation > 0) {
      flexItems.forEach(item => {
        if (item.violation === 'min') {
          item.frozen = true;
        }
      });
    } else {
      flexItems.forEach(item => {
        if (item.violation === 'max') {
          item.frozen = true;
        }
      });
    }
  }

  return cascadeRounding(flexItems.map((item) => item.targetMainSize));
}

function cascadeRounding(array: number[]): number[] {
  /*
  Given an array of floats that sum to an integer, this rounds the floats
  and returns an array of integers with the same sum.
  */

  let fpTotal = 0;
  let intTotal = 0;
  let roundedArray = [];
  array.forEach(function (float) {
    let integer = Math.round(float + fpTotal) - intTotal;
    fpTotal += float;
    intTotal += integer;
    roundedArray.push(integer);
  });

  return roundedArray;
}
