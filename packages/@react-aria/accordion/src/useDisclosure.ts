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

import {AriaButtonProps} from '@react-types/button';
import {DisclosureState} from '@react-stately/accordion';
import {HTMLAttributes, RefObject, useEffect} from 'react';
import {useId} from '@react-aria/utils';

export interface AriaDisclosureProps {
  /** Whether the disclosure is disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the disclosure's open state changes. */
  onOpenChange?: (isOpen: boolean) => void,
  /** Whether the disclosure is open (controlled). */
  isOpen?: boolean,
  /** Whether the disclosure is open by default (uncontrolled). */
  defaultOpen?: boolean,
  /** The ref for the disclosure's content element. */
  contentRef: RefObject<HTMLElement | null>
}

export interface DisclosureAria {
  /** Props for the disclosure button. */
  triggerProps: AriaButtonProps,
  /** Props for the content element. */
  contentProps: HTMLAttributes<HTMLElement>
}

export function useDisclosure(props: AriaDisclosureProps, state: DisclosureState): DisclosureAria {
  let {
    isDisabled,
    contentRef
  } = props;
  let triggerId = useId();
  let contentId = useId();
  let isControlled = props.isOpen !== undefined;
  let supportsBeforeMatch = 'onbeforematch' in document.body;

  useEffect(() => {
    // Until React supports hidden="until-found": https://github.com/facebook/react/pull/24741
    if (supportsBeforeMatch && contentRef.current && !isControlled) {
      if (state.isOpen) {
        // @ts-ignore
        contentRef.current.hidden = undefined;
      } else {
        // @ts-ignore
        contentRef.current.hidden = 'until-found';
        // @ts-ignore
        contentRef.current.onbeforematch = () => {
          state.open();
        };
      }
    }
  }, [isControlled, contentRef, props.isOpen, state, supportsBeforeMatch]);
  

  return {
    triggerProps: {
      id: triggerId,
      'aria-expanded': state.isOpen,
      'aria-controls': state.isOpen ? contentId : undefined,
      onPress: state.toggle,
      isDisabled: isDisabled
    },
    contentProps: {
      id: contentId,
      'aria-labelledby': triggerId,
      hidden: (!supportsBeforeMatch || isControlled) ? !state.isOpen : true
    }
  };
}
