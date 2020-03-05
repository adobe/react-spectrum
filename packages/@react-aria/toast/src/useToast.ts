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

import {chain} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, ImgHTMLAttributes} from 'react';
import intlMessages from '../intl/*.json';
import {PressProps} from '@react-aria/interactions';
import {ToastProps, ToastState} from '@react-types/toast';
import {useFocus, useHover} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface ToastAriaProps extends ToastProps {}

interface ToastAria {
  toastProps: HTMLAttributes<HTMLElement>,
  iconProps: ImgHTMLAttributes<HTMLElement>,
  actionButtonProps: PressProps,
  closeButtonProps: DOMProps & PressProps
}

export function useToast(props: ToastAriaProps, state: ToastState): ToastAria {
  let {
    id,
    toastKey,
    onAction,
    onClose,
    shouldCloseOnAction,
    timer,
    variant
  } = props;
  let {
    onRemove
  } = state;
  let formatMessage = useMessageFormatter(intlMessages);

  const handleAction = (...args) => {
    if (onAction) {
      onAction(...args);
    }

    if (shouldCloseOnAction) {
      onClose && onClose(...args);
      onRemove && onRemove(toastKey);
    }
  };

  let iconProps = variant ? {alt: formatMessage(variant)} : {};

  let pauseTimer = () => {
    timer && timer.pause();
  };

  let resumeTimer = () => {
    timer && timer.resume();
  };

  let {hoverProps} = useHover({
    onHover: pauseTimer,
    onHoverEnd: resumeTimer
  });

  let {focusProps} = useFocus({
    onFocus: pauseTimer,
    onBlur: resumeTimer
  });

  return {
    toastProps: {
      ...hoverProps,
      id: useId(id),
      role: 'alert'
    },
    iconProps,
    actionButtonProps: {
      ...focusProps,
      onPress: handleAction
    },
    closeButtonProps: {
      'aria-label': formatMessage('close'),
      ...focusProps,
      onPress: chain(onClose, () => onRemove(toastKey))
    }
  };
}
