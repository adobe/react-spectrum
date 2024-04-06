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

import {AriaSwitchProps, HoverEvents, mergeProps, useFocusRing, useHover, useSwitch, VisuallyHidden} from 'react-aria';
import {ContextValue, forwardRefType, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps, mergeRefs, useObjectRef} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef, MutableRefObject} from 'react';
import {ToggleState, useToggleState} from 'react-stately';

export interface SwitchProps extends Omit<AriaSwitchProps, 'children'>, HoverEvents, RenderProps<SwitchRenderProps>, SlotProps {
  /**
   * A ref for the HTML input element.
   */
  inputRef?: MutableRefObject<HTMLInputElement>
}

export interface SwitchRenderProps {
  /**
   * Whether the switch is selected.
   * @selector [data-selected]
   */
  isSelected: boolean,
  /**
   * Whether the switch is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the switch is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the switch is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the switch is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the switch is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the switch is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean,
  /**
   * State of the switch.
   */
  state: ToggleState
}

export const SwitchContext = createContext<ContextValue<SwitchProps, HTMLLabelElement>>(null);

function Switch(props: SwitchProps, ref: ForwardedRef<HTMLLabelElement>) {
  let {
    inputRef: userProvidedInputRef = null,
    ...otherProps
  } = props;
  [props, ref] = useContextProps(otherProps, ref, SwitchContext);
  let inputRef = useObjectRef(mergeRefs(userProvidedInputRef, props.inputRef !== undefined ? props.inputRef : null));
  let state = useToggleState(props);
  let {labelProps, inputProps, isSelected, isDisabled, isReadOnly, isPressed} = useSwitch({
    ...removeDataAttributes(props),
    // ReactNode type doesn't allow function children.
    children: typeof props.children === 'function' ? true : props.children
  }, state, inputRef);
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let isInteractionDisabled = props.isDisabled || props.isReadOnly;

  let {hoverProps, isHovered} = useHover({
    ...props,
    isDisabled: isInteractionDisabled
  });

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Switch',
    values: {
      isSelected,
      isPressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly,
      state
    }
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <label
      {...mergeProps(DOMProps, labelProps, hoverProps, renderProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-selected={isSelected || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}>
      <VisuallyHidden elementType="span">
        <input {...mergeProps(inputProps, focusProps)} ref={inputRef} />
      </VisuallyHidden>
      {renderProps.children}
    </label>
  );
}

/**
 * A switch allows a user to turn a setting on or off.
 */
const _Switch = /*#__PURE__*/ (forwardRef as forwardRefType)(Switch);
export {_Switch as Switch};
