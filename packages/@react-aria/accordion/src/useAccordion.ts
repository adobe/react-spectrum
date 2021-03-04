/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {HTMLAttributes} from 'react';
import {Node} from '@react-types/shared';
import {TreeState} from '@react-stately/tree';
import {useId} from '@react-aria/utils';
import {usePress} from '../../../react-aria';
import {useSelectableList} from '@react-aria/selection';
interface AccordionAria {
  /** Props for the accordion container element. */
  accordionProps: HTMLAttributes<HTMLElement>
}
interface AccordionItemAriaProps<T> {
  item: Node<T>,
  isDisabled?: boolean
}

interface AccordionItemAria {
  /** Props for the accordion item button. */
  buttonProps: HTMLAttributes<HTMLButtonElement>,
  /** Props for the accordion item content element. */
  regionProps: HTMLAttributes<HTMLElement>
}

export function useAccordionItem<T>(props: AccordionItemAriaProps<T>, state: TreeState<T>): AccordionItemAria {
  let {item, isDisabled} = props;
  let buttonId = useId();
  let regionId = useId();
  let {pressProps} = usePress({
    isDisabled,
    onPress: () => state.toggleKey(item.key)
  });
  let isExpanded = state.expandedKeys.has(item.key);
  return {
    buttonProps: {
      ...pressProps,
      id: buttonId,
      'aria-expanded': isExpanded,
      'aria-controls': regionId,
      'aria-disabled': isDisabled || state.disabledKeys.has(item.key)
    },
    regionProps: {
      id: regionId,
      role: 'region',
      'aria-labelledby': buttonId
    }
  };
}

export function useAccordion<T>(state: TreeState<T>): AccordionAria {
  let {listProps} = useSelectableList({
    ...state
  });
  return {
    accordionProps: {
      ...listProps,
      role: 'region'
    }
  };
}
