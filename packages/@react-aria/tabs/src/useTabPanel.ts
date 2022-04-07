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

import {AriaTabPanelProps} from '@react-types/tabs';
import {generateId} from './utils';
import {getFocusableTreeWalker} from '@react-aria/focus';
import {HTMLAttributes, RefObject, useState} from 'react';
import {mergeProps, useLabels, useLayoutEffect} from '@react-aria/utils';
import {TabListState} from '@react-stately/tabs';

interface TabPanelAria {
  /** Props for the tab panel element. */
  tabPanelProps: HTMLAttributes<HTMLElement>
}


/**
 * Provides the behavior and accessibility implementation for a tab panel. A tab panel is a container for
 * the contents of a tab, and is shown when the tab is selected.
 */
export function useTabPanel<T>(props: AriaTabPanelProps, state: TabListState<T>, ref: RefObject<HTMLElement>): TabPanelAria {
  let [tabIndex, setTabIndex] = useState(0);

  // The tabpanel should have tabIndex=0 when there are no tabbable elements within it.
  // Otherwise, tabbing from the focused tab should go directly to the first tabbable element
  // within the tabpanel.
  useLayoutEffect(() => {
    if (ref?.current) {
      let update = () => {
        // Detect if there are any tabbable elements and update the tabIndex accordingly.
        let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
        setTabIndex(walker.nextNode() ? undefined : 0);
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

  const id = generateId(state, state?.selectedKey, 'tabpanel');
  const tabPanelProps = useLabels({...props, id, 'aria-labelledby': generateId(state, state?.selectedKey, 'tab')});

  return {
    tabPanelProps: mergeProps(tabPanelProps, {
      tabIndex,
      role: 'tabpanel',
      'aria-describedby': props['aria-describedby'],
      'aria-details': props['aria-details']
    })
  };
}
