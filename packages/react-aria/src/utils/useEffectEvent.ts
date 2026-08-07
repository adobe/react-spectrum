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

import React, {useCallback, useRef} from 'react';
import {useLayoutEffect} from './useLayoutEffect';

// Use the earliest effect type possible. useInsertionEffect runs during the mutation phase,
// before all layout effects, but is available only in React 18 and later.
const useEarlyEffect = React['useInsertionEffect'] ?? useLayoutEffect;

export function useEffectEvent<T extends Function>(fn?: T): T {
  const ref = useRef<T | null | undefined>(null);
  useEarlyEffect(() => {
    ref.current = fn;
  }, [fn]);
  // @ts-ignore
  return useCallback<T>((...args) => {
    const f = ref.current!;
    return f?.(...args);
  }, []);
}
