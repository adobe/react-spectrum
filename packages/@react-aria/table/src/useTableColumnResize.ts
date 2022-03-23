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
import {useLocale} from '@react-aria/i18n';
import {useRef} from 'react';

export function useTableColumnResize(state, item, ref): any {
  const stateRef = useRef(null);
  // keep track of what the cursor on the body is so it can be restored back to that when done resizing
  const cursor = useRef(null);
  stateRef.current = state;

  let {direction} = useLocale();
  let {focusableProps} = useFocusable({excludeFromTabOrder: true}, ref);
  let {keyboardProps} = useKeyboard({
    onKeyDown: (e) => {
      if (e.key === 'Tab') {
        // useKeyboard stops propagation by default. We want to continue propagation for tab so focus leaves the table
        e.continuePropagation();
      }
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
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
      cursor.current = document.body.style.cursor;
      document.body.style.setProperty('cursor', 'col-resize');
    },
    onMove({deltaX, pointerType}) {
      if (direction === 'rtl') {
        deltaX *= -1;
      }
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
      stateRef.current.onColumnResizeEnd();
      columnResizeWidthRef.current = 0;
      document.body.style.cursor = cursor.current;
    }
  });

  return {
    resizerProps: {
      ...mergeProps(moveProps, focusableProps, keyboardProps)
    }
  };
}
