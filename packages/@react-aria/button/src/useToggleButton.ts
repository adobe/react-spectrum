/*
 * Copyright 2020 Adobe. All rights reserved.
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
  InputHTMLAttributes,
  RefObject
} from 'react';
import {AriaToggleButtonProps} from '@react-types/button';
import {ButtonAria, useButton} from './useButton';
import {chain, mergeProps} from '@react-aria/utils';
import {DOMAttributes} from '@react-types/shared';
import {ToggleState} from '@react-stately/toggle';

export interface AriaToggleButtonOptions<E extends ElementType> extends Omit<AriaToggleButtonProps<E>, 'children'> {}

export interface ToggleButtonAria<T> extends ButtonAria<T> {
  /** Whether the button is selected. */
  isSelected: boolean,
  /** Whether the button is disabled. */
  isDisabled: boolean
}

// Order with overrides is important: 'button' should be default
export function useToggleButton(props: AriaToggleButtonOptions<'button'>, state: ToggleState, ref: RefObject<HTMLButtonElement | null>): ToggleButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<'a'>, state: ToggleState, ref: RefObject<HTMLAnchorElement | null>): ToggleButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<'div'>, state: ToggleState, ref: RefObject<HTMLDivElement | null>): ToggleButtonAria<HTMLAttributes<HTMLDivElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<'input'>, state: ToggleState, ref: RefObject<HTMLInputElement | null>): ToggleButtonAria<InputHTMLAttributes<HTMLInputElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<'span'>, state: ToggleState, ref: RefObject<HTMLSpanElement | null>): ToggleButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function useToggleButton(props: AriaToggleButtonOptions<ElementType>, state: ToggleState, ref: RefObject<Element | null>): ToggleButtonAria<DOMAttributes>;
/**
 * Provides the behavior and accessibility implementation for a toggle button component.
 * ToggleButtons allow users to toggle a selection on or off, for example switching between two states or modes.
 */
export function useToggleButton(props: AriaToggleButtonOptions<ElementType>, state: ToggleState, ref: RefObject<any>): ToggleButtonAria<HTMLAttributes<any>> {
  const {isSelected} = state;
  const {isPressed, buttonProps} = useButton({
    ...props,
    onPress: chain(state.toggle, props.onPress)
  }, ref);

  return {
    isPressed,
    isSelected,
    isDisabled: props.isDisabled || false,
    buttonProps: mergeProps(buttonProps, {
      'aria-pressed': isSelected
    })
  };
}
