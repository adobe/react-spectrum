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
import {AriaButtonProps, mergeProps, useButton, useFocusRing, useHover} from 'react-aria';
import {ContextValue, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

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
   * @selector :focus
   */
  isFocused: boolean,
  /**
   * Whether the button is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the button is disabled.
   * @selector :disabled
   */
  isDisabled: boolean
}

export interface ButtonProps extends Omit<AriaButtonProps, 'children' | 'href' | 'target' | 'rel' | 'elementType'>, SlotProps, RenderProps<ButtonRenderProps> {}
interface ButtonContextValue extends ButtonProps {
  isPressed?: boolean
}

export const ButtonContext = createContext<ContextValue<ButtonContextValue, HTMLButtonElement>>({});

function Button(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ButtonContext);
  let ctx = props as ButtonContextValue;
  let {buttonProps, isPressed} = useButton(props, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);
  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isPressed, isFocused, isFocusVisible, isDisabled: props.isDisabled || false},
    defaultClassName: 'react-aria-Button'
  });

  return (
    <button
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot}
      data-pressed={ctx.isPressed || isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined} />
  );
}

/**
 * A button allows a user to perform an action, with mouse, touch, and keyboard interactions.
 */
const _Button = forwardRef(Button);
export {_Button as Button};
