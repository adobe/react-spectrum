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

import {focusSafely, useFocusable} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import {useKeyboard, useMove} from '@react-aria/interactions';
import {useRef} from 'react';

export function useTableColumnResize(state, item, ref): any {
  const stateRef = useRef(null);
  stateRef.current = state;

  let {focusableProps} = useFocusable({excludeFromTabOrder: true}, ref);
  let {keyboardProps} = useKeyboard({
    onKeyDown: (e) => {
      if (e.key === 'Tab') {
        // useKeyboard stops propagation by default. We want to continue propagation for tab
        e.continuePropagation();
      }
      if (e.key === 'Escape') {
        // switch focus back to the column header on escape
        const columnHeader = ref.current.previousSibling;
        if (columnHeader) {
          focusSafely(columnHeader);
        }
      }
    }
  });

  const columnResizeWidthRef = useRef(null);
  const {moveProps} = useMove({
    onMoveStart() {
      stateRef.current.onColumnResizeStart();
      columnResizeWidthRef.current = stateRef.current.getColumnWidth(item.key);
    },
    onMove({deltaX, pointerType}) {
      // if moving up/down only, no need to resize
      if (deltaX !== 0) {
        if (pointerType === 'keyboard') {
          deltaX *= 10;
        }
        columnResizeWidthRef.current += deltaX;
        stateRef.current.onColumnResize(item, columnResizeWidthRef.current);
      }
    },
    onMoveEnd() {
      stateRef.current.onColumnResizeEnd(item, columnResizeWidthRef.current);
      columnResizeWidthRef.current = 0;
    }
  });

  return {
    resizerProps: {
      ...mergeProps(moveProps, focusableProps, keyboardProps)
    }
  };
}
