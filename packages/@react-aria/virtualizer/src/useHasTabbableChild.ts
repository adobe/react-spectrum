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

import {getFocusableTreeWalker} from '@react-aria/focus';
import {RefObject, useEffect, useState} from 'react';

interface AriaHasTabbableChildProps {
  isEmpty: boolean,
  hasRenderedAnything: boolean
}

// This was created for a special empty case of a component that can have child or
// be empty, like Collection/Virtualizer/Table/ListView/etc. When these components
// are empty they can have a message with a tabbable element, which is like them
// being not empty, when it comes to focus and tab order.
//
// This looks at the element's children and determines if any are tabbable.
export function useHasTabbableChild({isEmpty, hasRenderedAnything}: AriaHasTabbableChildProps, ref: RefObject<HTMLElement>): boolean {
  let [hasTabbableChild, setHasTabbableChild] = useState(false);

  useEffect(() => {
    if (ref?.current && isEmpty && hasRenderedAnything) {
      // Detect if there are any tabbable elements and update the tabIndex accordingly.
      let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
      setHasTabbableChild(!!walker.nextNode());
    }
  }, [ref, isEmpty, hasRenderedAnything]);

  return hasTabbableChild;
}
