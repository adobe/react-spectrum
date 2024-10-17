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
import {DisclosureState} from '@react-stately/disclosure';
import {HTMLAttributes, RefObject, useEffect} from 'react';
import {useEvent, useId} from '@react-aria/utils';
import {useIsSSR} from '@react-aria/ssr';

export interface AriaDisclosureProps {
  /** Whether the disclosure is disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the disclosure's expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void,
  /** Whether the disclosure is expanded (controlled). */
  isExpanded?: boolean,
  /** Whether the disclosure is expanded by default (uncontrolled). */
  defaultExpanded?: boolean
}

export interface DisclosureAria {
  /** Props for the disclosure button. */
  buttonProps: AriaButtonProps,
  /** Props for the disclosure panel. */
  panelProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a disclosure component.
 * @param props - Props for the disclosure.
 * @param state - State for the disclosure, as returned by `useDisclosureState`.
 * @param ref - A ref for the disclosure content.
 */
export function useDisclosure(props: AriaDisclosureProps, state: DisclosureState, ref?: RefObject<Element | null>): DisclosureAria {
  let {
    isDisabled
  } = props;
  let triggerId = useId();
  let contentId = useId();
  let isControlled = props.isExpanded !== undefined;
  let isSSR = useIsSSR();
  let supportsBeforeMatch = !isSSR && 'onbeforematch' in document.body;

  // @ts-ignore https://github.com/facebook/react/pull/24741
  useEvent(ref, 'beforematch', supportsBeforeMatch && !isControlled ? () => state.expand() : null);

  useEffect(() => {
    // Until React supports hidden="until-found": https://github.com/facebook/react/pull/24741
    if (supportsBeforeMatch && ref?.current && !isControlled && !isDisabled) {
      if (state.isExpanded) {
        ref.current.removeAttribute('hidden');
      } else {
        ref.current.setAttribute('hidden', 'until-found');
      }
    }
  }, [isControlled, ref, props.isExpanded, state, supportsBeforeMatch, isDisabled]);

  return {
    buttonProps: {
      id: triggerId,
      'aria-expanded': state.isExpanded,
      'aria-controls': contentId,
      onPress: (e) => {
        if (!isDisabled && e.pointerType !== 'keyboard') {
          state.toggle();
        }
      },
      isDisabled,
      onKeyDown(e) {
        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          state.toggle();
        }
      }
    },
    panelProps: {
      id: contentId,
      // This can be overridden at the panel element level.
      role: 'group',
      'aria-labelledby': triggerId,
      hidden: (!supportsBeforeMatch || isControlled) ? !state.isExpanded : true
    }
  };
}
