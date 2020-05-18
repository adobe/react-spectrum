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

import {useEffect} from 'react';

let isTabKeyDown = false;
function onKeyDown(e: globalThis.KeyboardEvent) {
  isTabKeyDown = e.key === 'Tab';
}

function onKeyUp() {
  isTabKeyDown = false;
}

let listenerCount = 0;
function setupGlobalTabListener() {
  listenerCount++;
  if (listenerCount === 1) {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);  
  }

  return teardownGlobalTabListener;
}

function teardownGlobalTabListener() {
  if (listenerCount === 0) {
    return;
  }

  listenerCount--;
  if (listenerCount === 0) {
    document.removeEventListener('keydown', onKeyDown, false);
    document.removeEventListener('keyup', onKeyUp, false);  
  }
}

// A helper hook that registers a global listener to track whether the Tab key is currently pressed.
// Can be used to determine if a focus event came from tabbing or other means.
export function useTabKey() {
  useEffect(setupGlobalTabListener, []);
  return {
    isDown() {
      return isTabKeyDown;
    }
  };
}
