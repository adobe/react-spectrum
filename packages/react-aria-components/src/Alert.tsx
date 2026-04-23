/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextValue, RenderProps, useContextProps, useRenderProps} from './utils';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import React, {createContext, ForwardedRef, forwardRef, useEffect, useRef} from 'react';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useObjectRef} from 'react-aria/useObjectRef';

export interface AlertProps extends RenderProps<AlertRenderProps>, DOMProps {
  /**
   * Whether to automatically focus the alert when it first renders.
   */
  autoFocus?: boolean
}

export interface AlertRenderProps {
  /**
   * Whether the button is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the button is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean
}

export const AlertContext = createContext<ContextValue<AlertProps, HTMLDivElement>>(null);

export const Alert = forwardRef(function Alert(props: AlertProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, AlertContext);
  let domProps = filterDOMProps(props, {global: true})!;
  let {isFocused, isFocusVisible, focusProps} = useFocusRing({autoFocus: props.autoFocus});
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Alert',
    values: {
      isFocused,
      isFocusVisible
    }
  });

  let autoFocusRef = useRef(props.autoFocus);
  let domRef = useObjectRef(ref);
  useEffect(() => {
    if (autoFocusRef.current && domRef.current) {
      domRef.current.focus();
    }
    autoFocusRef.current = false;
  }, [domRef]);

  return (
    <div
      {...domProps}
      {...focusProps}
      {...renderProps}
      ref={domRef}
      role="alert"
      tabIndex={props.autoFocus ? -1 : undefined} />
  );
});
