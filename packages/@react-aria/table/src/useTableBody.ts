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
import {useLayoutEffect} from '@react-aria/utils';
import {RefObject, useState} from 'react';

export interface TableBodyAria {
  /** Indicator of if the element can be focused */
  tabIndex?: number | undefined
}

export function useTableBody<T>(ref: RefObject<HTMLElement>): TableBodyAria {
  let [tabIndex, setTabIndex] = useState(undefined);

  // The tableBody should be tabble when it is empty (no rows) and has no tabbled children.
  // Otherwise, tabbing from the focused table peer should go directly to the first tabbable element
  // within the table, which is accomplished with tabIndex=-1. A -1 is used instead of undefined to
  // get the desired behavior if this is wrapped by a FocusScope.
  useLayoutEffect(() => {
    if (ref?.current) {
      let update = () => {
        // Detect if there are any tabbable elements and update the tabIndex accordingly.
        let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
        setTabIndex(walker.nextNode() ? -1 : 0);
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
        observer.disconnect();
      };
    }
  }, [ref]);

  return {
    tabIndex: tabIndex
  }
}
