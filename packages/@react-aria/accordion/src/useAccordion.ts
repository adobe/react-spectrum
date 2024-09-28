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

import {AriaAccordionProps} from '@react-types/accordion';
import {ButtonHTMLAttributes} from 'react';
import {DOMAttributes, Node, RefObject} from '@react-types/shared';
import {mergeProps, useId} from '@react-aria/utils';
import {TreeState} from '@react-stately/tree';
import {useButton} from '@react-aria/button';
import {useSelectableItem, useSelectableList} from '@react-aria/selection';

export interface AccordionAria {
  /** Props for the accordion container element. */
  accordionProps: DOMAttributes
}

export interface AccordionItemAriaProps<T> {
  item: Node<T>
}

export interface AccordionItemAria {
  /** Props for the accordion item button. */
  buttonProps: ButtonHTMLAttributes<HTMLElement>,
  /** Props for the accordion item content element. */
  regionProps: DOMAttributes
}

/**
 * @deprecated Use useDisclosure from `@react-aria/disclosure` instead.
 */
export function useAccordionItem<T>(props: AccordionItemAriaProps<T>, state: TreeState<T>, ref: RefObject<HTMLButtonElement | null>): AccordionItemAria {
  let {item} = props;
  let buttonId = useId();
  let regionId = useId();
  let isDisabled = state.disabledKeys.has(item.key);
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    key: item.key,
    ref
  });
  let {buttonProps} = useButton(mergeProps(itemProps as any, {
    id: buttonId,
    elementType: 'button',
    isDisabled,
    onPress: () => state.toggleKey(item.key)
  }), ref);
  let isExpanded = state.expandedKeys.has(item.key);
  return {
    buttonProps: {
      ...buttonProps,
      'aria-expanded': isExpanded,
      'aria-controls': isExpanded ? regionId : undefined
    },
    regionProps: {
      id: regionId,
      role: 'region',
      'aria-labelledby': buttonId
    }
  };
}

/**
 * @deprecated Use useDisclosure from `@react-aria/disclosure` instead.
 */
export function useAccordion<T>(props: AriaAccordionProps<T>, state: TreeState<T>, ref: RefObject<HTMLDivElement | null>): AccordionAria {
  let {listProps} = useSelectableList({
    ...props,
    ...state,
    allowsTabNavigation: true,
    disallowTypeAhead: true,
    ref
  });
  return {
    accordionProps: {
      ...listProps,
      tabIndex: undefined
    }
  };
}
