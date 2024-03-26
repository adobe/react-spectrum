/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, {createContext, useContext, useRef} from 'react';
import {ToastState, useToastState} from '@react-stately/toast';
import {useButton} from 'react-aria';
import {useToast, useToastRegion} from '../src';

const ToastContext = createContext<ToastState<string>>(null);

export function ToastContainer({children, ...otherProps}) {
  let state = useToastState<string>(otherProps);
  return (
    <ToastContext.Provider value={state}>
      {children(state)}
      <ToastRegion />
    </ToastContext.Provider>
  );
}

function ToastRegion() {
  let state = useContext(ToastContext);
  let ref = useRef();
  let {regionProps} = useToastRegion({}, state, ref);
  return (
    <div {...regionProps} ref={ref} style={{position: 'fixed', bottom: 0, right: 0}}>
      {state.visibleToasts.map(toast => (
        <Toast key={toast.key} toast={toast} />
      ))}
    </div>
  );
}

function Toast(props) {
  let state = useContext(ToastContext);
  let ref = useRef(null);
  let {toastProps, contentProps, titleProps, closeButtonProps} = useToast(props, state, ref);
  let buttonRef = useRef();
  let {buttonProps} = useButton(closeButtonProps, buttonRef);

  return (
    <div {...toastProps} ref={ref} style={{margin: 20, display: 'flex', gap: 5}}>
      <div {...contentProps} {...titleProps}>{props.toast.content}</div>
      <button {...buttonProps} ref={buttonRef}>x</button>
    </div>
  );
}
