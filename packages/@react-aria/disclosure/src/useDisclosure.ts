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
import {flushSync} from 'react-dom';
import {HTMLAttributes, RefObject, useCallback, useEffect, useRef} from 'react';
import {useEvent, useId, useLayoutEffect} from '@react-aria/utils';
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
 * @param ref - A ref for the disclosure panel.
 */
export function useDisclosure(props: AriaDisclosureProps, state: DisclosureState, ref: RefObject<Element | null>): DisclosureAria {
  let {
    isDisabled
  } = props;
  let triggerId = useId();
  let panelId = useId();
  let isSSR = useIsSSR();
  let supportsBeforeMatch = !isSSR && 'onbeforematch' in document.body;

  let raf = useRef<number | null>(null);

  let handleBeforeMatch = useCallback(() => {
    // Wait a frame to revert browser's removal of hidden attribute
    raf.current = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.setAttribute('hidden', 'until-found');
      }
    });
    // Force sync state update
    flushSync(() => {
      state.toggle();
    });
  }, [ref, state]);

  // @ts-ignore https://github.com/facebook/react/pull/24741
  useEvent(ref, 'beforematch', supportsBeforeMatch ? handleBeforeMatch : null);

  useLayoutEffect(() => {
    // Cancel any pending RAF to prevent stale updates
    if (raf.current) {
      cancelAnimationFrame(raf.current);
    }
    // Until React supports hidden="until-found": https://github.com/facebook/react/pull/24741
    if (supportsBeforeMatch && ref.current && !isDisabled) {
      if (state.isExpanded) {
        ref.current.removeAttribute('hidden');
      } else {
        ref.current.setAttribute('hidden', 'until-found');
      }
    }
  }, [isDisabled, ref, state.isExpanded, supportsBeforeMatch]);

  useEffect(() => {
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, []);

  return {
    buttonProps: {
      id: triggerId,
      'aria-expanded': state.isExpanded,
      'aria-controls': panelId,
      onPress: (e) => {
        if (!isDisabled && e.pointerType !== 'keyboard') {
          state.toggle();
        }
      },
      isDisabled,
      onPressStart(e) {
        if (e.pointerType === 'keyboard' && !isDisabled) {
          state.toggle();
        }
      }
    },
    panelProps: {
      id: panelId,
      // This can be overridden at the panel element level.
      role: 'group',
      'aria-labelledby': triggerId,
      'aria-hidden': !state.isExpanded,
      hidden: supportsBeforeMatch ? true : !state.isExpanded
    }
  };
}
