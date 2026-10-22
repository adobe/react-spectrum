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

import {AriaToastProps, useToast} from '../../src/toast/useToast';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  JSX,
  useContext,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import {ToastState, ToastStateProps, useToastState} from 'react-stately/useToastState';
import {useButton} from '../../src/button/useButton';
import {useToastRegion} from '../../src/toast/useToastRegion';

interface ToastContainerProps extends ToastStateProps {
  isAnimated?: boolean;
}

interface ToastRegionProps {
  isAnimated?: boolean;
}

interface AnimatePresenceProps {
  children: JSX.Element[];
}

const ToastContext = createContext<ToastState<string> | null>(null);

export const ToastContainer = forwardRef(function ToastContainer(
  props: ToastContainerProps,
  ref: ForwardedRef<ToastState<string>>
) {
  let {isAnimated, ...otherProps} = props;

  let state = useToastState<string>(otherProps);
  useImperativeHandle(ref, () => state, [state]);

  return (
    <ToastContext.Provider value={state}>
      <ToastRegion isAnimated={isAnimated} />
    </ToastContext.Provider>
  );
});

function ToastRegion(props: ToastRegionProps) {
  let {isAnimated} = props;

  let state = useContext(ToastContext)!;
  let ref = useRef(null);
  let {regionProps} = useToastRegion({}, state, ref);

  let children: JSX.Element | JSX.Element[] = state.visibleToasts.map(toast => (
    <Toast key={toast.key} toast={toast} />
  ));

  if (isAnimated) {
    children = <AnimatePresence>{children}</AnimatePresence>;
  }

  return (
    <div
      {...regionProps}
      ref={ref}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
      {children}
    </div>
  );
}

function Toast(props: AriaToastProps<string>) {
  let state = useContext(ToastContext)!;
  let ref = useRef(null);
  let {toastProps, contentProps, titleProps, closeButtonProps} = useToast(props, state, ref);
  let buttonRef = useRef(null);
  let {buttonProps} = useButton(closeButtonProps, buttonRef);

  return (
    <div {...toastProps} ref={ref} style={{margin: 20, display: 'flex', gap: 5}}>
      <div {...contentProps}>
        <div {...titleProps}>{props.toast.content}</div>
      </div>
      <button {...buttonProps} ref={buttonRef}>
        x
      </button>
    </div>
  );
}

// TODO: Okay to import motion/react here?
function AnimatePresence({children}: AnimatePresenceProps) {
  let [prevChildren, setPrevChildren] = useState(children);
  let [exiting, setExiting] = useState<JSX.Element[]>([]);

  if (children !== prevChildren) {
    let keys = children.map(child => child.key);
    let removed = [...exiting, ...prevChildren].filter(child => !keys.includes(child.key));
    setPrevChildren(children);
    setExiting(removed);
  }

  return [...exiting, ...children].map(child => {
    let isExiting = exiting.includes(child);
    return (
      <div
        key={child.key}
        style={{opacity: isExiting ? 0 : 1, transition: 'opacity 3s'}}
        onTransitionEnd={() => {
          if (isExiting) {
            setExiting(exiting => exiting.filter(c => c !== child));
          }
        }}>
        {child}
      </div>
    );
  });
}
