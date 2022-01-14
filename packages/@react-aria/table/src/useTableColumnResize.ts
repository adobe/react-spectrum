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

export function useTableColumnResize(state, layout, item): any {
  const stateRef = useRef(null);
  stateRef.current = state;
  const {moveProps} = useMove({
    onMoveStart() {
      stateRef.current.setCurrentResizeColumn(item.key);
      stateRef.current.addResizedColumn(item.key);
    },
    onMove({deltaX}) {
      stateRef.current.setResizeDelta(deltaX);
    },
    onMoveEnd() {
      stateRef.current.setCurrentResizeColumn();      
      stateRef.current.setResizeDelta(0);
    }
  });

  return {
    resizerProps: moveProps
  };
}
