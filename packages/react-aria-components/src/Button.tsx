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

import {announce} from '@react-aria/live-announcer';
import {
  AriaButtonProps,
  HoverEvents,
  mergeProps,
  useButton,
  useFocusRing,
  useHover,
  useId
} from 'react-aria';
import {
  ContextValue,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps
} from './utils';
import {createHideableComponent} from '@react-aria/collections';
import {filterDOMProps} from '@react-aria/utils';
import {ProgressBarContext} from './ProgressBar';
import React, {createContext, ForwardedRef, useEffect, useRef} from 'react';

export interface ButtonRenderProps {
  /**
   * Whether the button is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the button is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the button is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the button is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the button is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the button is currently in a pending state.
   * @selector [data-pending]
   */
  isPending: boolean
}

export interface ButtonProps extends Omit<AriaButtonProps, 'children' | 'href' | 'target' | 'rel' | 'elementType'>, HoverEvents, SlotProps, RenderProps<ButtonRenderProps> {
  /**
   * The `<form>` element to associate the button with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   */
  form?: string,
  /**
   * The URL that processes the information submitted by the button.
   * Overrides the action attribute of the button's form owner.
   */
  formAction?: string,
  /** Indicates how to encode the form data that is submitted. */
  formEncType?: string,
  /** Indicates the HTTP method used to submit the form. */
  formMethod?: string,
  /** Indicates that the form is not to be validated when it is submitted. */
  formNoValidate?: boolean,
  /** Overrides the target attribute of the button's form owner. */
  formTarget?: string,
  /** Submitted as a pair with the button's value as part of the form data. */
  name?: string,
  /** The value associated with the button's name when it's submitted with the form data. */
  value?: string,
  /**
   * Whether the button is in a pending state. This disables press and hover events
   * while retaining focusability, and announces the pending state to screen readers.
   */
  isPending?: boolean
}

interface ButtonContextValue extends ButtonProps {
  isPressed?: boolean
}

const additionalButtonHTMLAttributes = new Set(['form', 'formAction', 'formEncType', 'formMethod', 'formNoValidate', 'formTarget', 'name', 'value']);

export const ButtonContext = createContext<ContextValue<ButtonContextValue, HTMLButtonElement>>({});

/**
 * A button allows a user to perform an action, with mouse, touch, and keyboard interactions.
 */
export const Button = /*#__PURE__*/ createHideableComponent(function Button(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ButtonContext);
  props = disablePendingProps(props);
  let ctx = props as ButtonContextValue;
  let {isPending} = ctx;
  let {buttonProps, isPressed} = useButton(props, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover({
    ...props,
    isDisabled: props.isDisabled || isPending
  });
  let renderValues = {
    isHovered,
    isPressed: (ctx.isPressed || isPressed) && !isPending,
    isFocused,
    isFocusVisible,
    isDisabled: props.isDisabled || false,
    isPending: isPending ?? false
  };

  let renderProps = useRenderProps({
    ...props,
    values: renderValues,
    defaultClassName: 'react-aria-Button'
  });

  let buttonId = useId(buttonProps.id);
  let progressId = useId();

  let ariaLabelledby = buttonProps['aria-labelledby'];
  if (isPending) {
    // aria-labelledby wins over aria-label
    // https://www.w3.org/TR/accname-1.2/#computation-steps
    if (ariaLabelledby) {
      ariaLabelledby = `${ariaLabelledby} ${progressId}`;
    } else if (buttonProps['aria-label']) {
      ariaLabelledby = `${buttonId} ${progressId}`;
    }
  }

  let wasPending = useRef(isPending);
  useEffect(() => {
    let message = {'aria-labelledby': ariaLabelledby || buttonId};
    if (!wasPending.current && isFocused && isPending) {
      announce(message, 'assertive');
    } else if (wasPending.current && isFocused && !isPending) {
      announce(message, 'assertive');
    }
    wasPending.current = isPending;
  }, [isPending, isFocused, ariaLabelledby, buttonId]);

  // When the button is in a pending state, we want to stop implicit form submission (ie. when the user presses enter on a text input).
  // We do this by changing the button's type to button.
  return (
    <button
      {...filterDOMProps(props, {propNames: additionalButtonHTMLAttributes})}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...renderProps}
      type={buttonProps.type === 'submit' && isPending ? 'button' : buttonProps.type}
      id={buttonId}
      ref={ref}
      aria-labelledby={ariaLabelledby}
      slot={props.slot || undefined}
      aria-disabled={isPending ? 'true' : buttonProps['aria-disabled']}
      data-disabled={props.isDisabled || undefined}
      data-pressed={renderValues.isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-pending={isPending || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <ProgressBarContext.Provider value={{id: progressId}}>
        {renderProps.children}
      </ProgressBarContext.Provider>
    </button>
  );
});

function disablePendingProps(props) {
  // Don't allow interaction while isPending is true
  if (props.isPending) {
    props.onPress = undefined;
    props.onPressStart = undefined;
    props.onPressEnd = undefined;
    props.onPressChange = undefined;
    props.onPressUp = undefined;
    props.onKeyDown = undefined;
    props.onKeyUp = undefined;
    props.onClick = undefined;
    props.href = undefined;
  }
  return props;
}
