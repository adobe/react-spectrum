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

import {useEffect, useState} from 'react';

export function usePendingVisibility(isPending: boolean, delay = 1000) {
  let [isProgressVisible, setIsProgressVisible] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let safeDelay = Math.max(0, delay);
    if (isPending) {
      timeout = setTimeout(() => {
        setIsProgressVisible(true);
      }, safeDelay);
    } else {
      setIsProgressVisible(false);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isPending, delay]);
  return isProgressVisible;
}
