/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {classNames} from '@react-spectrum/utils';
import listStyles from './listview.css';
import {ListViewContext} from './ListView';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import {useFocusRing} from '@react-aria/focus';
import {useGridCell, useGridRow} from '@react-aria/grid';
import {useHover} from '@react-aria/interactions';


export function ListViewItem(props) {
  let {
    item
  } = props;
  let {state} = useContext(ListViewContext);
  let ref = useRef<HTMLDivElement>();
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let {isFocusVisible, focusProps} = useFocusRing();
  let {hoverProps, isHovered} = useHover({});
  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true,
    ref
  }, state);
  let {gridCellProps} = useGridCell({
    node: item,
    ref,
    focusMode: 'cell'
  }, state);
  const mergedProps = mergeProps(
    gridCellProps,
    hoverProps,
    focusWithinProps,
    focusProps
  );

  return (
    <div {...rowProps}>
      <div
        className={
          classNames(
            listStyles,
            'react-spectrum-ListViewItem',
            {
              'is-focused': isFocusVisibleWithin,
              'focus-ring': isFocusVisible,
              'is-hovered': isHovered
            }
          )
        }
        ref={ref}
        {...mergedProps}>
        {item.rendered}
      </div>
    </div>
  );
}
