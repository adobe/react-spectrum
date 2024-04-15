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

import {AriaButtonProps} from '@react-types/button';
import {AriaLabelingProps, DOMAttributes, FocusableElement} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {QueuedToast, ToastState} from '@react-stately/toast';
import {RefObject, useEffect} from 'react';
import {useId, useSlotId} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaToastProps<T> extends AriaLabelingProps {
  /** The toast object. */
  toast: QueuedToast<T>
}

export interface ToastAria {
  /** Props for the toast container, non-modal dialog element. */
  toastProps: DOMAttributes,
  /** Props for the toast content alert message. */
  contentProps: DOMAttributes,
  /** Props for the toast title element. */
  titleProps: DOMAttributes,
  /** Props for the toast description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the toast close button. */
  closeButtonProps: AriaButtonProps
}

/**
 * Provides the behavior and accessibility implementation for a toast component.
 * Toasts display brief, temporary notifications of actions, errors, or other events in an application.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useToast<T>(props: AriaToastProps<T>, state: ToastState<T>, ref: RefObject<FocusableElement>): ToastAria {
  let {
    key,
    timer,
    timeout,
    animation
  } = props.toast;

  useEffect(() => {
    if (!timer) {
      return;
    }

    timer.reset(timeout);
    return () => {
      timer.pause();
    };
  }, [timer, timeout]);

  // When toast unmounts, move focus to the next or previous toast.
  // There's potentially a small problem here if two toasts next to each other unmount at the same time.
  // It may be better to track this at the toast container level.
  // We may also be assuming that other implemenations will have the same focus behavior.
  // let container = useRef(null);
  // useLayoutEffect(() => {
  //   let toast = ref.current;
  //   container.current = toast.closest('[role="region"]');
  //   let focusManager = createFocusManager(container);
  //   return () => {
  //     if (toast && toast.contains(document.activeElement)) {
  //       const from = document.activeElement?.closest('[role="alertdialog"]') || document.activeElement;
  //       const accept = (node:Element) => node.getAttribute('role') === 'alertdialog';
  //       let nextItemFocused = focusManager.focusNext({from, accept});
  //       if (!nextItemFocused || Object.keys(nextItemFocused).length === 0) {
  //         focusManager.focusPrevious({from, accept});
  //       }
  //     }
  //   };
  //   // runs only for unmount
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  let titleId = useId();
  let descriptionId = useSlotId();
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/toast');

  return {
    toastProps: {
      role: 'alertdialog',
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'] || titleId,
      'aria-describedby': props['aria-describedby'] || descriptionId,
      'aria-details': props['aria-details'],
      // Hide toasts that are animating out so VoiceOver doesn't announce them.
      'aria-hidden': animation === 'exiting' ? 'true' : undefined,
      tabIndex: 0
    },
    contentProps: {
      role: 'alert',
      'aria-atomic': 'true'
    },
    titleProps: {
      id: titleId
    },
    descriptionProps: {
      id: descriptionId
    },
    closeButtonProps: {
      'aria-label': stringFormatter.format('close'),
      onPress: () => state.close(key)
    }
  };
}
