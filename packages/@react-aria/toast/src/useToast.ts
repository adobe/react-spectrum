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
import {RefObject, useEffect, useRef} from 'react';
import {useFocusManager} from '@react-aria/focus';
import {useId, useLayoutEffect, useSlotId} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaToastProps<T> extends AriaLabelingProps {
  /** The toast object. */
  toast: QueuedToast<T>
}

export interface ToastAria {
  /** Props for the toast container element. */
  toastProps: DOMAttributes,
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
export function useToast<T>(props: AriaToastProps<T>, state: ToastState<T>, ref: RefObject<FocusableElement>): ToastAria {
  let {
    key,
    timer,
    timeout,
    animation
  } = props.toast;
  let focusManager = useFocusManager();

  useEffect(() => {
    if (!timer) {
      return;
    }

    timer.reset(timeout);
    return () => {
      timer.pause();
    };
  }, [timer, timeout]);

  // Restore focus to the toast container on unmount.
  // If there are no more toasts, the container will be unmounted
  // and will restore focus to wherever focus was before the user
  // focused the toast region.
  let focusOnUnmount = useRef(null);
  useLayoutEffect(() => {
    let container = ref.current.closest('[role=region]') as HTMLElement;
    return () => {
      if (container && container.contains(document.activeElement) && state.visibleToasts.filter(t => t.animation !== 'exiting').length < 1) {
        // Focus must be delayed for focus ring to appear, but we can't wait
        // until useEffect cleanup to check if focus was inside the container.
        focusOnUnmount.current = container;
      }
    };
  }, [ref, state.visibleToasts]);

  // eslint-disable-next-line
  useEffect(() => {
    return () => {
      if (focusOnUnmount.current) {
        focusOnUnmount.current.focus();
      }
    };
  }, [ref]);

  let titleId = useId();
  let descriptionId = useSlotId();
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/toast');

  let onClosePress = () => {
    state.close(key);
    // Only move focus when there is another Toast. At this point,
    // state.visibleToasts still includes Toast being removed.
    if (state.visibleToasts?.length > 1) {
      let nextItemFocused = focusManager.focusNext();
      if (!nextItemFocused || Object.keys(nextItemFocused).length === 0) {
        focusManager.focusPrevious();
      }
    }
  };

  return {
    toastProps: {
      role: 'alert',
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'] || titleId,
      'aria-describedby': props['aria-describedby'] || descriptionId,
      'aria-details': props['aria-details'],
      // Hide toasts that are animating out so VoiceOver doesn't announce them.
      'aria-hidden': animation === 'exiting' ? 'true' : undefined
    },
    titleProps: {
      id: titleId
    },
    descriptionProps: {
      id: descriptionId
    },
    closeButtonProps: {
      'aria-label': stringFormatter.format('close'),
      onPress: onClosePress
    }
  };
}
