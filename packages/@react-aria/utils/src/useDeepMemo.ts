/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {useRef} from 'react';

export function useDeepMemo<T>(value: T, isEqual: (a: T, b: T) => boolean): T {
  // Using a ref during render is ok here because it's only an optimization – both values are equivalent.
  // If a render is thrown away, it'll still work the same no matter if the next render is the same or not.
  let lastValue = useRef<T | null>(null);
  if (value && lastValue.current && isEqual(value, lastValue.current)) {
    value = lastValue.current;
  }

  lastValue.current = value;
  return value;
}
