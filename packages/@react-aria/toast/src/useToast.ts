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

import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, ImgHTMLAttributes} from 'react';
import intlMessages from '../intl/*.json';
import {PressProps} from '@react-aria/interactions';
import {ToastProps} from '@react-types/toast';
import {useId} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface AriaToastProps extends ToastProps {
  id?: string
}

interface ToastAria {
  toastProps: HTMLAttributes<HTMLElement>,
  iconProps: ImgHTMLAttributes<HTMLElement>,
  actionButtonProps: PressProps,
  closeButtonProps: DOMProps & PressProps
}

export function useToast(props: AriaToastProps): ToastAria {
  let {
    id,
    onAction,
    onClose,
    shouldCloseOnAction,
    variant
  } = props;
  let formatMessage = useMessageFormatter(intlMessages);

  const handleAction = (...args) => {
    if (onAction) {
      onAction(...args);
    }

    if (shouldCloseOnAction && onClose) {
      onClose(...args);
    }
  };

  let iconProps = variant ? {alt: formatMessage(variant)} : {};

  return {
    toastProps: {
      id: useId(id),
      role: 'alert'
    },
    iconProps,
    actionButtonProps: {
      onPress: handleAction
    },
    closeButtonProps: {
      'aria-label': formatMessage('close'),
      onPress: onClose
    }
  };
}
