/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {getFocusableTreeWalker} from './FocusScope';
import {RefObject} from '@react-types/shared';
import {useLayoutEffect} from '@react-aria/utils';
import {useState} from 'react';

interface AriaHasTabbableChildOptions {
  isDisabled?: boolean
}

// This was created for a special empty case of a component that can have child or
// be empty, like Collection/Virtualizer/Table/ListView/etc. When these components
// are empty they can have a message with a tabbable element, which is like them
// being not empty, when it comes to focus and tab order.

/**
 * Returns whether an element has a tabbable child, and updates as children change.
 * @private
 */
export function useHasTabbableChild(ref: RefObject<Element | null>, options?: AriaHasTabbableChildOptions): boolean {
  let isDisabled = options?.isDisabled;
  let [hasTabbableChild, setHasTabbableChild] = useState(false);

  useLayoutEffect(() => {
    if (ref?.current && !isDisabled) {
      let update = () => {
        if (ref.current) {
          let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
          setHasTabbableChild(!!walker.nextNode());
        }
      };

      update();

      // Update when new elements are inserted, or the tabIndex/disabled attribute updates.
      let observer = new MutationObserver(update);
      observer.observe(ref.current, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['tabIndex', 'disabled']
      });

      return () => {
        // Disconnect mutation observer when a React update occurs on the top-level component
        // so we update synchronously after re-rendering. Otherwise React will emit act warnings
        // in tests since mutation observers fire asynchronously. The mutation observer is necessary
        // so we also update if a child component re-renders and adds/removes something tabbable.
        observer.disconnect();
      };
    }
  });

  return isDisabled ? false : hasTabbableChild;
}
