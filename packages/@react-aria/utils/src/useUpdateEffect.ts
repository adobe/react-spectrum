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

import {EffectCallback, useEffect, useRef} from 'react';
import {useEffectEvent} from './useEffectEvent';

// Like useEffect, but only called for updates after the initial render.
export function useUpdateEffect(cb: EffectCallback, dependencies: any[]): void {
  const isInitialMount = useRef(true);
  const lastDeps = useRef<any[] | null>(null);
  let cbEvent = useEffectEvent(cb);

  useEffect(() => {
    isInitialMount.current = true;
    return () => {
      isInitialMount.current = false;
    };
  }, []);

  useEffect(() => {
    let prevDeps = lastDeps.current;
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (!prevDeps || dependencies.some((dep, i) => !Object.is(dep, prevDeps[i]))) {
      cbEvent();
    }
    lastDeps.current = dependencies;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
