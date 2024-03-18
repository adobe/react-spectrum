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

import {AriaToggleButtonProps, HoverEvents, mergeProps, useFocusRing, useHover, useToggleButton} from 'react-aria';
import {ButtonRenderProps} from './Button';
import {ContextValue, forwardRefType, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {ToggleState, useToggleState} from 'react-stately';

export interface ToggleButtonRenderProps extends ButtonRenderProps {
  /**
   * Whether the button is currently selected.
   * @selector [data-selected]
   */
  isSelected: boolean,
  /**
   * State of the toggle button.
   */
  state: ToggleState
}

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, 'children' | 'elementType'>, HoverEvents, SlotProps, RenderProps<ToggleButtonRenderProps> {}

export const ToggleButtonContext = createContext<ContextValue<ToggleButtonProps, HTMLButtonElement>>({});

function ToggleButton(props: ToggleButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ToggleButtonContext);
  let state = useToggleState(props);
  let {buttonProps, isPressed} = useToggleButton(props, state, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);
  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isPressed, isFocused, isSelected: state.isSelected, isFocusVisible, isDisabled: props.isDisabled || false, state},
    defaultClassName: 'react-aria-ToggleButton'
  });

  return (
    <button
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-focused={isFocused || undefined}
      data-disabled={props.isDisabled || undefined}
      data-pressed={isPressed || undefined}
      data-selected={state.isSelected || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined} />
  );
}

/**
 * A toggle button allows a user to toggle a selection on or off, for example switching between two states or modes.
 */
const _ToggleButton = /*#__PURE__*/ (forwardRef as forwardRefType)(ToggleButton);
export {_ToggleButton as ToggleButton};
