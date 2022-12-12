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
import {useId, useLayoutEffect, useSlotId} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaToastProps<T> extends AriaLabelingProps {
  toast: QueuedToast<T>
}

export interface ToastAria {
  toastProps: DOMAttributes,
  titleProps: DOMAttributes,
  descriptionProps: DOMAttributes,
  closeButtonProps: AriaButtonProps
}

export function useToast<T>(props: AriaToastProps<T>, state: ToastState<T>, ref: RefObject<FocusableElement>): ToastAria {
  let {
    key,
    timer,
    timeout
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

  // Restore focus to the toast container on unmount.
  // If there are no more toasts, the container will be unmounted
  // and will restore focus to wherever focus was before the user
  // focused the toast region.
  useLayoutEffect(() => {
    let container = ref.current.closest('[role=region]') as HTMLElement;
    return () => {
      if (container && container.contains(document.activeElement)) {
        container.focus();
      }
    };
  }, [ref]);


  let titleId = useId();
  let descriptionId = useSlotId();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);

  return {
    toastProps: {
      role: 'alert',
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'] || titleId,
      'aria-describedby': props['aria-descibedby'] || descriptionId,
      'aria-details': props['aria-details']
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
