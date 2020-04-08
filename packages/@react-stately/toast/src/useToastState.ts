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

import {ReactNode, useRef, useState} from 'react';
import {Timer} from './';
import {ToastProps, ToastState, ToastStateValue} from '@react-types/toast';

interface ToastStateProps {
  value?: ToastStateValue[]
}

const TOAST_TIMEOUT = 5000;

export function useToastState(props?: ToastStateProps): ToastState {
  const [toasts, setToasts] = useState(props && props.value || []);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const onAdd = (content: ReactNode, options: ToastProps) => {
    let tempToasts = [...toasts];
    let timer;

    // set timer to remove toasts
    if (!(options.actionLabel || options.timeout === 0)) {
      if (options.timeout < 0) {
        options.timeout = TOAST_TIMEOUT;
      }
      timer = new Timer(() => onRemove(options.toastKey), options.timeout || TOAST_TIMEOUT);
    }

    tempToasts.push({
      content,
      props: options,
      timer
    });
    setToasts(tempToasts);


  };

  const onRemove = (toastKey: string) => {
    let tempToasts = [...toastsRef.current].filter(item => {
      if (item.props.toastKey === toastKey && item.timer) {
        item.timer.clear();
      }
      return item.props.toastKey !== toastKey;
    });
    setToasts(tempToasts);
  };

  return {
    onAdd,
    onRemove,
    setToasts,
    toasts
  };
}
