/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {EffectCallback, useRef} from 'react';
import {useLayoutEffect} from './useLayoutEffect';

// Like useLayoutEffect, but only called for updates after the initial render.
export function useUpdateLayoutEffect(effect: EffectCallback, dependencies: any[]) {
  const isInitialMount = useRef(true);
  const lastDeps = useRef<any[] | null>(null);

  useLayoutEffect(() => {
    isInitialMount.current = true;
    return () => {
      isInitialMount.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (!lastDeps.current || dependencies.some((dep, i) => !Object.is(dep, lastDeps[i]))) {
      effect();
    }
    lastDeps.current = dependencies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
