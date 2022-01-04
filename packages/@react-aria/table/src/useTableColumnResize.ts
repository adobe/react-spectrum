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


export function useTableColumnResize(state): any {
  const stateRef = useRef(null);
  stateRef.current = state;
  let currentPosition = useRef<number>(null);
  const {moveProps} = useMove({
    onMoveStart() {
      currentPosition.current = null;
      console.log('start resizing - isResizingColumn:', stateRef.current.isResizingColumn());
      stateRef.current.setResizingColumn(true);
    },
    onMove({deltaX}) {

      if (currentPosition.current == null) {
        // currentPosition.current = state;
        currentPosition.current = 100;
      }
      
      currentPosition.current += deltaX;
      // console.log(currentPosition.current, state);
      // setState(currentPosition.current);
      // setState(snapValueToStep(currentPosition.current, 75, 500, 1));
    },
    onMoveEnd() {
      console.log('end resizing - isResizingColumn:', stateRef.current.isResizingColumn());
      stateRef.current.setResizingColumn(false);
    }
  });


  return {
    resizerProps: moveProps
  };

}
