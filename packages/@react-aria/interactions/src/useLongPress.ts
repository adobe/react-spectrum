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

// Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions

import { useRef } from "react";
import { usePress } from "./usePress";
import { PressEvent } from "@react-types/shared";

export interface LongPressHookProps {
  onLongPress: (e: PressEvent) => void
  triggerThreshold?: number
}


export function useLongPress(props : LongPressHookProps) {
  let {
    onLongPress,
    triggerThreshold
  } = props;
  
  triggerThreshold = triggerThreshold || 500

  const timeRef = useRef(null);

  let { pressProps } = usePress({
    onPressStart(e) {
      timeRef.current = setTimeout(() => {
        onLongPress(e);
        timeRef.current = null;
      }, triggerThreshold);
    },
    onPressEnd() { 
     if(timeRef.current) {
      clearTimeout(timeRef.current)
     }
    },
  });
  
  return pressProps;
}
