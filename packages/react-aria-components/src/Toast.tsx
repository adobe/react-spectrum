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

import {AriaToastProps, AriaToastRegionProps, mergeProps, useFocusRing, useHover, useLocale, useToast, useToastRegion} from 'react-aria';
import {ButtonContext} from './Button';
import {ContextValue, DEFAULT_SLOT, Provider, RenderProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {createPortal} from 'react-dom';
import {forwardRefType} from '@react-types/shared';
import {QueuedToast, ToastQueue, ToastState, useToastQueue} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, JSX, ReactElement, useContext} from 'react';
import {TextContext} from './Text';
import {useObjectRef} from '@react-aria/utils';

const ToastStateContext = createContext<ToastState<any> | null>(null);

export interface ToastRegionRenderProps<T> {
  /** A list of all currently visible toasts. */
  visibleToasts: QueuedToast<T>[],
  /**
   * Whether the toast region is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the toast region is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  isHovered: boolean
}

export interface ToastRegionProps<T> extends AriaToastRegionProps, StyleRenderProps<ToastRegionRenderProps<T>> {
  /** The queue of toasts to display. */
  queue: ToastQueue<T>,
  /** A function to render each toast. */
  children: (renderProps: {toast: QueuedToast<T>}) => ReactElement
}

/**
 * A ToastRegion displays one or more toast notifications.
 */
export const ToastRegion = /*#__PURE__*/ (forwardRef as forwardRefType)(function ToastRegion<T>(props: ToastRegionProps<T>, ref: ForwardedRef<HTMLDivElement>): JSX.Element | null {
  let state = useToastQueue(props.queue);
  let objectRef = useObjectRef(ref);
  let {regionProps} = useToastRegion(props, state, objectRef);

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let {hoverProps, isHovered} = useHover({});
  let renderProps = useRenderProps({
    ...props,
    children: undefined,
    defaultClassName: 'react-aria-ToastRegion',
    values: {
      visibleToasts: state.visibleToasts,
      isHovered,
      isFocused,
      isFocusVisible
    }
  });

  let {direction} = useLocale();

  let region = (
    <ToastStateContext.Provider value={state}>
      <div
        {...renderProps}
        {...mergeProps(regionProps, focusProps, hoverProps)}
        dir={direction}
        ref={objectRef}
        data-hovered={isHovered || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        {typeof props.children === 'function' ? <ToastList {...props} className={undefined} style={{display: 'contents'}} /> : props.children}
      </div>
    </ToastStateContext.Provider>
  );

  return state.visibleToasts.length > 0 && typeof document !== 'undefined'
    ? createPortal(region, document.body)
    : null;
});

// TODO: possibly export this so additional children can be added to the region, outside the list.
export const ToastList = /*#__PURE__*/ (forwardRef as forwardRefType)(function ToastList<T>(props: ToastRegionProps<T>, ref: ForwardedRef<HTMLOListElement>) {
  let state = useContext(ToastStateContext)!;
  let {hoverProps, isHovered} = useHover({});
  let renderProps = useRenderProps({
    ...props,
    children: undefined,
    defaultClassName: 'react-aria-ToastList',
    values: {
      visibleToasts: state.visibleToasts,
      isFocused: false,
      isFocusVisible: false,
      isHovered
    }
  });

  return (
    // @ts-ignore
    // eslint-disable-next-line
    <ol {...hoverProps} {...renderProps} ref={ref} onClick={props.onClick}>
      {state.visibleToasts.map((toast) => (
        <li key={toast.key} style={{display: 'contents'}}>
          {props.children({toast})}
        </li>
      ))}
    </ol>
  );
});

export interface ToastRenderProps<T> {
  /**
   * The toast object to display.
   */
  toast: QueuedToast<T>,
  /**
   * Whether the toast is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the toast is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean
}

export interface ToastProps<T> extends AriaToastProps<T>, RenderProps<ToastRenderProps<T>> {}

/**
 * A Toast displays a brief, temporary notification of actions, errors, or other events in an application.
 */
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
    // eslint-disable-next-line
    <div
      {...renderProps}
      {...mergeProps(toastProps, focusProps)}
      ref={objectRef}
      // @ts-ignore
      inert={props.inert}
      // @ts-ignore
      onClick={props.onClick}
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

/**
 * ToastContent wraps the main content of a toast notification.
 */
export const ToastContent = /*#__PURE__*/ forwardRef(function ToastContent(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ToastContentContext);
  return (
    <div className="react-aria-ToastContent" {...props} ref={ref}>
      {props.children}
    </div>
  );
});
