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

import {AriaToggleButtonProps, HoverEvents, mergeProps, useFocusRing, useHover, useToggleButton, useToggleButtonGroupItem} from 'react-aria';
import {ButtonRenderProps} from './Button';
import {ContextValue, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {forwardRefType, GlobalDOMAttributes, Key} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {ToggleGroupStateContext} from './ToggleButtonGroup';
import {ToggleState, useToggleState} from 'react-stately';

export interface ToggleButtonRenderProps extends Omit<ButtonRenderProps, 'isPending'> {
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

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, 'children' | 'elementType' | 'id'>, HoverEvents, SlotProps, RenderProps<ToggleButtonRenderProps>, Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /** When used in a ToggleButtonGroup, an identifier for the item in `selectedKeys`. When used standalone, a DOM id. */
  id?: Key
}

export const ToggleButtonContext = createContext<ContextValue<ToggleButtonProps, HTMLButtonElement>>({});

/**
 * A toggle button allows a user to toggle a selection on or off, for example switching between two states or modes.
 */
export const ToggleButton = /*#__PURE__*/ (forwardRef as forwardRefType)(function ToggleButton(props: ToggleButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ToggleButtonContext);
  let groupState = useContext(ToggleGroupStateContext);
  let state = useToggleState(groupState && props.id != null ? {
    isSelected: groupState.selectedKeys.has(props.id),
    onChange(isSelected) {
      groupState.setSelected(props.id!, isSelected);
    }
  } : props);

  let {buttonProps, isPressed, isSelected, isDisabled} = groupState && props.id != null
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ? useToggleButtonGroupItem({...props, id: props.id}, groupState, ref)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    : useToggleButton({...props, id: props.id != null ? String(props.id) : undefined}, state, ref);

  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    values: {isHovered, isPressed, isFocused, isSelected: state.isSelected, isFocusVisible, isDisabled, state},
    defaultClassName: 'react-aria-ToggleButton'
  });

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <button
      {...mergeProps(DOMProps, renderProps, buttonProps, focusProps, hoverProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-focused={isFocused || undefined}
      data-disabled={isDisabled || undefined}
      data-pressed={isPressed || undefined}
      data-selected={isSelected || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <SelectionIndicatorContext.Provider value={{isSelected}}>
        {renderProps.children}
      </SelectionIndicatorContext.Provider>
    </button>
  );
});
