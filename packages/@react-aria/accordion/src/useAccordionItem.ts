/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AccordionItemState} from '../../../@react-stately/accordion/src';
import {AriaButtonProps} from '@react-types/button';
import {DOMAttributes} from '@react-types/shared';
import {RefObject, useEffect} from 'react';
import {useId} from '@react-aria/utils';

export interface AccordionItemAriaProps {
  /** Whether the accordion item is disabled. */
  isDisabled?: boolean,
  /**
   * The accessibility role for the accordion item panel.
   * @default 'region'
   */
  role?: string,
  /** Handler that is called when the accordion item's panel open state changes. */
  onOpenChange?: (isOpen: boolean) => void,
  /** Whether the accordion item's panel is open (controlled). */
  isOpen?: boolean,
  /** Whether the accordion item's panel is open by default (uncontrolled). */
  defaultOpen?: boolean,
  /** The ref for the accordion item's panel element. */
  panelRef: RefObject<HTMLElement>
}

export interface AccordionItemAria {
  /** Props for the accordion item button. */
  buttonProps: AriaButtonProps,
  /** Props for the accordion item content element. */
  regionProps: DOMAttributes
}

export function useAccordionItem(props: AccordionItemAriaProps, state: AccordionItemState): AccordionItemAria {
  let {
    isDisabled,
    role = 'region',
    panelRef
  } = props;
  let buttonId = useId();
  let regionId = useId();
  let isControlled = props.isOpen !== undefined;
  let supportsBeforeMatch = 'onbeforematch' in document.body;

  useEffect(() => {
    // Until React supports hidden="until-found": https://github.com/facebook/react/pull/24741
    if (supportsBeforeMatch && panelRef.current && !isControlled) {
      if (state.isOpen) {
        // @ts-ignore
        panelRef.current.hidden = undefined;
      } else {
        // @ts-ignore
        panelRef.current.hidden = 'until-found';
        // @ts-ignore
        panelRef.current.onbeforematch = () => {
          state.open();
        };
      }
    }
  }, [isControlled, panelRef, props.isOpen, state, supportsBeforeMatch]);

  return {
    buttonProps: {
      'aria-expanded': state.isOpen,
      'aria-controls': state.isOpen ? regionId : undefined,
      onPress: state.toggle,
      isDisabled: isDisabled
    },
    regionProps: {
      id: regionId,
      role,
      'aria-labelledby': buttonId,
      // @ts-ignore
      hidden: (!supportsBeforeMatch || isControlled) ? !state.isOpen : undefined
    }
  };
}
