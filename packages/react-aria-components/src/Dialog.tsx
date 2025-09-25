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
import {AriaDialogProps, useDialog, useId, useOverlayTrigger} from 'react-aria';
import {ButtonContext} from './Button';
import {ContextValue, DEFAULT_SLOT, Provider, SlotProps, StyleProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps, mergeProps, useResizeObserver} from '@react-aria/utils';
import {forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {HeadingContext} from './RSPContexts';
import {OverlayTriggerProps, OverlayTriggerState, useMenuTriggerState} from 'react-stately';
import {PopoverContext} from './Popover';
import {PressResponder} from '@react-aria/interactions';
import React, {createContext, ForwardedRef, forwardRef, JSX, ReactNode, useCallback, useContext, useRef, useState} from 'react';
import {RootMenuTriggerStateContext} from './Menu';

export interface DialogTriggerProps extends OverlayTriggerProps {
  children: ReactNode
}

export interface DialogRenderProps {
  close: () => void
}

export interface DialogProps extends AriaDialogProps, StyleProps, SlotProps, GlobalDOMAttributes<HTMLElement> {
  /** Children of the dialog. A function may be provided to access a function to close the dialog. */
  children?: ReactNode | ((opts: DialogRenderProps) => ReactNode)
}

export const DialogContext = createContext<ContextValue<DialogProps, HTMLElement>>(null);
export const OverlayTriggerStateContext = createContext<OverlayTriggerState | null>(null);

/**
 * A DialogTrigger opens a dialog when a trigger element is pressed.
 */
export function DialogTrigger(props: DialogTriggerProps): JSX.Element {
  // Use useMenuTriggerState instead of useOverlayTriggerState in case a menu is embedded in the dialog.
  // This is needed to handle submenus.
  let state = useMenuTriggerState(props);

  let buttonRef = useRef<HTMLButtonElement>(null);
  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'dialog'}, state, buttonRef);

  // Allows popover width to match trigger element
  let [buttonWidth, setButtonWidth] = useState<string | null>(null);
  let onResize = useCallback(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth + 'px');
    }
  }, [buttonRef]);

  useResizeObserver({
    ref: buttonRef,
    onResize: onResize
  });

  // Label dialog by the trigger as a fallback if there is no title slot.
  // This is done in RAC instead of hooks because otherwise we cannot distinguish
  // between context and props. Normally aria-labelledby overrides the title
  // but when sent by context we want the title to win.
  triggerProps.id = useId();
  overlayProps['aria-labelledby'] = triggerProps.id;

  return (
    <Provider
      values={[
        [OverlayTriggerStateContext, state],
        [RootMenuTriggerStateContext, state],
        [DialogContext, overlayProps],
        [PopoverContext, {
          trigger: 'DialogTrigger',
          triggerRef: buttonRef,
          'aria-labelledby': overlayProps['aria-labelledby'],
          style: {'--trigger-width': buttonWidth} as React.CSSProperties
        }]
      ]}>
      <PressResponder {...triggerProps} ref={buttonRef} isPressed={state.isOpen}>
        {props.children}
      </PressResponder>
    </Provider>
  );
}

/**
 * A dialog is an overlay shown above other content in an application.
 */
export const Dialog = /*#__PURE__*/ (forwardRef as forwardRefType)(function Dialog(props: DialogProps, ref: ForwardedRef<HTMLElement>) {
  let originalAriaLabelledby = props['aria-labelledby'];
  [props, ref] = useContextProps(props, ref, DialogContext);
  let {dialogProps, titleProps} = useDialog({
    ...props,
    // Only pass aria-labelledby from props, not context.
    // Context is used as a fallback below.
    'aria-labelledby': originalAriaLabelledby
  }, ref);
  let state = useContext(OverlayTriggerStateContext);

  if (!dialogProps['aria-label'] && !dialogProps['aria-labelledby']) {
    // If aria-labelledby exists on props, we know it came from context.
    // Use that as a fallback in case there is no title slot.
    if (props['aria-labelledby']) {
      dialogProps['aria-labelledby'] = props['aria-labelledby'];
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('If a Dialog does not contain a <Heading slot="title">, it must have an aria-label or aria-labelledby attribute for accessibility.');
    }
  }

  let renderProps = useRenderProps({
    defaultClassName: 'react-aria-Dialog',
    className: props.className,
    style: props.style,
    children: props.children,
    values: {
      close: state?.close || (() => {})
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <section
      {...mergeProps(DOMProps, renderProps, dialogProps)}
      ref={ref}
      slot={props.slot || undefined}>
      <Provider
        values={[
          [HeadingContext, {
            slots: {
              [DEFAULT_SLOT]: {},
              title: {...titleProps, level: 2}
            }
          }],
          [ButtonContext, {
            slots: {
              [DEFAULT_SLOT]: {},
              close: {
                onPress: () => state?.close()
              }
            }
          }]
        ]}>
        {renderProps.children}
      </Provider>
    </section>
  );
});
