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

import {AriaButtonProps, useButton} from 'react-aria/useButton';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps
} from './utils';
import {createHideableComponent} from 'react-aria/private/collections/Hidden';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {GlobalDOMAttributes} from '@react-types/shared';
import {HoverEvents} from '@react-types/shared';
import {mergeProps} from 'react-aria/mergeProps';
import {ProgressBarContext} from './ProgressBar';
import React, {createContext, ForwardedRef} from 'react';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';

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
   * Whether the button's action is pending.
   * @selector [data-pending]
   */
  isPending: boolean
}

export interface ButtonProps extends Omit<AriaButtonProps, 'children' | 'href' | 'target' | 'rel' | 'elementType'>, HoverEvents, SlotProps, RenderProps<ButtonRenderProps, 'button'>, Omit<GlobalDOMAttributes<HTMLButtonElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-Button'
   */
  className?: ClassNameOrFunction<ButtonRenderProps>
}

interface ButtonContextValue extends ButtonProps {
  isPressed?: boolean
}

export const ButtonContext = createContext<ContextValue<ButtonContextValue, HTMLButtonElement>>({});

/**
 * A button allows a user to perform an action, with mouse, touch, and keyboard interactions.
 */
export const Button = /*#__PURE__*/ createHideableComponent(function Button(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ButtonContext);
  let ctx = props as ButtonContextValue;
  let {buttonProps, progressBarProps, isPressed, isPending} = useButton(props, ref);
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
    isPending
  };

  let renderProps = useRenderProps({
    ...props,
    values: renderValues,
    defaultClassName: 'react-aria-Button'
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.onClick;

  return (
    <dom.button
      {...mergeProps(DOMProps, renderProps, buttonProps, focusProps, hoverProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-disabled={props.isDisabled || undefined}
      data-pressed={renderValues.isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-pending={isPending || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <ProgressBarContext.Provider value={progressBarProps}>
        {renderProps.children}
      </ProgressBarContext.Provider>
    </dom.button>
  );
});
