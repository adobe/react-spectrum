/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {AriaToastProps, AriaToastRegionProps} from '@react-aria/toast';
import {ButtonContext} from './Button';
import {createPortal} from 'react-dom';
import {ContextValue, DEFAULT_SLOT, Provider, RenderProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {forwardRefType} from '@react-types/shared';
import {QueuedToast, ToastQueue, ToastState, useToastQueue} from '@react-stately/toast';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, ReactElement, ReactNode, useContext, useRef} from 'react';
import {TextContext} from './Text';
import {useObjectRef} from '@react-aria/utils';
import {useToast, useToastRegion} from '@react-aria/toast';
import { useFocusRing, mergeProps } from 'react-aria';

const ToastStateContext = createContext<ToastState<any> | null>(null);

export interface ToastRegionRenderProps<T> {
  visibleToasts: QueuedToast<T>[],
  /**
   * Whether the thumb is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the thumb is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean
}

export interface ToastRegionProps<T> extends AriaToastRegionProps, StyleRenderProps<ToastRegionRenderProps<T>> {
  toastQueue: ToastQueue<T>,
  children: (renderProps: {toast: QueuedToast<T>}) => ReactElement
}

export const ToastRegion = /*#__PURE__*/ (forwardRef as forwardRefType)(function ToastRegion<T>(props: ToastRegionProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  let state = useToastQueue(props.toastQueue);
  let objectRef = useObjectRef(ref);
  let {regionProps} = useToastRegion(props, state, objectRef);

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderProps = useRenderProps({
    ...props,
    children: undefined,
    defaultClassName: 'react-aria-ToastRegion',
    values: {
      visibleToasts: state.visibleToasts,
      isFocused,
      isFocusVisible
    }
  });

  let region = (
    <ToastStateContext.Provider value={state}>
      <div
        {...renderProps}
        {...mergeProps(regionProps, focusProps)}
        ref={objectRef}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        {typeof props.children === 'function' ? <ToastList {...props}  style={{display: 'contents'}} /> : props.children}
      </div>
    </ToastStateContext.Provider>
  );

  return state.visibleToasts.length > 0 && typeof document !== 'undefined'
    ? createPortal(region, document.body)
    : null;
});

export const ToastList = /*#__PURE__*/ (forwardRef as forwardRefType)(function ToastList<T>(props: ToastRegionProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  let state = useContext(ToastStateContext)!;
  return (
    <ol style={props.style} className={props.className}>
      {state.visibleToasts.map((toast) => (
        <li key={toast.key} style={{display: 'contents'}}>
          {props.children({toast})}
        </li>
      ))}
    </ol>
  );
});

export interface ToastRenderProps<T> {
  toast: QueuedToast<T>,
  /**
   * Whether the thumb is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the thumb is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean
}

export interface ToastProps<T> extends AriaToastProps<T>, RenderProps<ToastRenderProps<T>> {

}

export const Toast = /*#__PURE__*/ (forwardRef as forwardRefType)(function Toast<T>(props: ToastProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  let state = useContext(ToastStateContext)!;
  let objectRef = useObjectRef(ref);
  let {toastProps, contentProps, titleProps, descriptionProps, closeButtonProps} = useToast(
    props,
    state,
    objectRef
  );

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Toast',
    values: {
      toast: props.toast,
      isFocused,
      isFocusVisible
    }
  });

  return (
    <div
      {...renderProps}
      {...mergeProps(toastProps, focusProps)}
      ref={objectRef}
      inert={props.inert}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <Provider
        values={[
          [ToastContentContext, contentProps],
          [TextContext, {
            slots: {
              [DEFAULT_SLOT]: {},
              title: titleProps,
              description: descriptionProps
            }
          }],
          [ButtonContext, {
            slots: {
              [DEFAULT_SLOT]: {},
              close: closeButtonProps
            }
          }]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
});

export const ToastContentContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLDivElement>>({});

export const ToastContent = /*#__PURE__*/ forwardRef(function ToastContent(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ToastContentContext);
  return (
    <div className="react-aria-ToastContent" {...props} ref={ref}>
      {props.children}
    </div>
  );
});
