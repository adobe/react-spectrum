/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes
} from 'react';
import {AriaLabelingProps, DOMAttributes, Orientation, RefObject} from '@react-types/shared';
import {AriaToggleButtonGroupItemProps} from '@react-types/button';
import {ToggleButtonAria, useToggleButton} from './useToggleButton';
import {ToggleGroupProps, ToggleGroupState, ToggleState} from '@react-stately/toggle';
import {useToolbar} from '@react-aria/toolbar';

export interface AriaToggleButtonGroupProps extends ToggleGroupProps, AriaLabelingProps {
  /**
   * The orientation of the the toggle button group.
   * @default 'horizontal'
   */
  orientation?: Orientation
}

export interface ToggleButtonGroupAria {
  /**
   * Props for the toggle button group container.
   */
  groupProps: DOMAttributes
}

export function useToggleButtonGroup(props: AriaToggleButtonGroupProps, state: ToggleGroupState, ref: RefObject<HTMLElement | null>): ToggleButtonGroupAria {
  let {isDisabled} = props;
  let {toolbarProps} = useToolbar(props, ref);

  return {
    groupProps: {
      ...toolbarProps,
      role: state.selectionMode === 'single' ? 'radiogroup' : toolbarProps.role,
      'aria-disabled': isDisabled
    }
  };
}

export type {AriaToggleButtonGroupItemProps};
export interface AriaToggleButtonGroupItemOptions<E extends ElementType> extends Omit<AriaToggleButtonGroupItemProps<E>, 'children'> {}

// Order with overrides is important: 'button' should be default
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'button'>, state: ToggleGroupState, ref: RefObject<HTMLButtonElement | null>): ToggleButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'a'>, state: ToggleGroupState, ref: RefObject<HTMLAnchorElement | null>): ToggleButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'div'>, state: ToggleGroupState, ref: RefObject<HTMLDivElement | null>): ToggleButtonAria<HTMLAttributes<HTMLDivElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'input'>, state: ToggleGroupState, ref: RefObject<HTMLInputElement | null>): ToggleButtonAria<InputHTMLAttributes<HTMLInputElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<'span'>, state: ToggleGroupState, ref: RefObject<HTMLSpanElement | null>): ToggleButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<ElementType>, state: ToggleGroupState, ref: RefObject<Element | null>): ToggleButtonAria<DOMAttributes>;
/**
 * Provides the behavior and accessibility implementation for a toggle button component.
 * ToggleButtons allow users to toggle a selection on or off, for example switching between two states or modes.
 */
export function useToggleButtonGroupItem(props: AriaToggleButtonGroupItemOptions<ElementType>, state: ToggleGroupState, ref: RefObject<any>): ToggleButtonAria<HTMLAttributes<any>> {
  let toggleState: ToggleState = {
    isSelected: state.selectedKeys.has(props.id),
    setSelected(isSelected) {
      state.setSelected(props.id, isSelected);
    },
    toggle() {
      state.toggleKey(props.id);
    }
  };

  let {isPressed, isSelected, isDisabled, buttonProps} = useToggleButton({
    ...props,
    id: undefined,
    isDisabled: props.isDisabled || state.isDisabled
  }, toggleState, ref);
  if (state.selectionMode === 'single') {
    buttonProps.role = 'radio';
    buttonProps['aria-checked'] = toggleState.isSelected;
    delete buttonProps['aria-pressed'];
  }

  return {
    isPressed,
    isSelected,
    isDisabled,
    buttonProps
  };
}
