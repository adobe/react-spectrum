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

// import {snapValueToStep} from '@react-aria/utils';
import {useMove} from '@react-aria/interactions';
import {useRef} from 'react';

export function useTableColumnResize(state, item): any {
  const stateRef = useRef(null);
  stateRef.current = state;

  const columnResizeWidthRef = useRef(null);
  const {moveProps} = useMove({
    onMoveStart() {
      stateRef.current.setCurrentResizeColumn(item.key);
      stateRef.current.addResizedColumn(item.key);
      columnResizeWidthRef.current = stateRef.current.getColumnWidth(item.key);
    },
    onMove({deltaX}) {
      columnResizeWidthRef.current += deltaX;
      let widthRespectingBoundaries = Math.max(item.props.minWidth || 75, Math.min(columnResizeWidthRef.current, item.props.maxWidth || Infinity));
      stateRef.current.setResizeDelta(widthRespectingBoundaries);
      stateRef.current.setColumnWidth(item.key, widthRespectingBoundaries);
    },
    onMoveEnd() {
      stateRef.current.setCurrentResizeColumn();
      columnResizeWidthRef.current = 0;
    }
  });

  return {
    resizerProps: moveProps
  };
}
