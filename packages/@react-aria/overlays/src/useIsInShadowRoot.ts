/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {isShadowRoot} from '@react-aria/utils';
import {useMemo} from 'react';
import {useUNSAFE_PortalContext} from './PortalProvider';

/**
 * Checks if the current component is rendering inside a Shadow DOM.
 * This is useful for conditionally applying styles or behaviors that are incompatible
 * with Shadow DOM encapsulation, such as `isolation: isolate` which can interfere
 * with stacking contexts for absolutely positioned overlays.
 * 
 * @returns {boolean} True if rendering inside a Shadow DOM, false otherwise.
 */
export function useIsInShadowRoot(): boolean {
  let {getContainer} = useUNSAFE_PortalContext();

  return useMemo(() => {
    // Check if the portal container is within a shadow root
    if (getContainer) {
      try {
        let container = getContainer();
        if (container) {
          let root = container.getRootNode?.();
          if (root && isShadowRoot(root)) {
            return true;
          }
        }
      } catch {
        // Ignore errors, assume not in shadow root
      }
    }
    return false;
  }, [getContainer]);
}

