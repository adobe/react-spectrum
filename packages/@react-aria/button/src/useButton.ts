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
import {AriaButtonProps} from '@react-types/button';
import {filterDOMProps} from '@react-aria/utils';
import {mergeProps} from '@react-aria/utils';
import {useFocusable} from '@react-aria/focus';
import {usePress} from '@react-aria/interactions';


export interface ButtonAria<T> {
  /** Props for the button element. */
  buttonProps: T,
  /** Whether the button is currently pressed. */
  isPressed: boolean
}

/* eslint-disable no-redeclare */
export function useButton(props: AriaButtonProps<'a'>, ref: RefObject<HTMLAnchorElement>): ButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
export function useButton(props: AriaButtonProps<'button'>, ref: RefObject<HTMLButtonElement>): ButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
export function useButton(props: AriaButtonProps<'div'>, ref: RefObject<HTMLDivElement>): ButtonAria<HTMLAttributes<HTMLDivElement>>;
export function useButton(props: AriaButtonProps<'input'>, ref: RefObject<HTMLInputElement>): ButtonAria<InputHTMLAttributes<HTMLInputElement>>;
export function useButton(props: AriaButtonProps<'span'>, ref: RefObject<HTMLSpanElement>): ButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function useButton(props: AriaButtonProps<ElementType>, ref: RefObject<HTMLElement>): ButtonAria<HTMLAttributes<HTMLElement>>;
/**
 * Provides the behavior and accessibility implementation for a button component. Handles mouse, keyboard, and touch interactions,
 * focus behavior, and ARIA props for both native button elements and custom element types.
 * @param props - Props to be applied to the button.
 * @param ref - A ref to a DOM element for the button.
 */
export function useButton(props: AriaButtonProps<ElementType>, ref: RefObject<any>): ButtonAria<HTMLAttributes<any>> {
/* eslint-enable no-redeclare */
  let {
    elementType = 'button',
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressChange,
    // @ts-ignore - undocumented
    preventFocusOnPress,
    // @ts-ignore
    onClick: deprecatedOnClick,
    href,
    target,
    rel,
    type = 'button'
  } = props;
  let additionalProps;
  if (elementType === 'button') {
    additionalProps = {
      type,
      disabled: isDisabled
    };
  } else {
    additionalProps = {
      role: 'button',
      tabIndex: isDisabled ? undefined : 0,
      href: elementType === 'a' && isDisabled ? undefined : href,
      target: elementType === 'a' ? target : undefined,
      type: elementType === 'input' ? type : undefined,
      disabled: elementType === 'input' ? isDisabled : undefined,
      'aria-disabled': !isDisabled || elementType === 'input' ? undefined : isDisabled,
      rel: elementType === 'a' ? rel : undefined
    };
  }

  let {pressProps, isPressed} = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    isDisabled,
    preventFocusOnPress,
    ref
  });

  let {focusableProps} = useFocusable(props, ref);
  // enter triggers form submit on key down
  // since enter is a special key for submitting forms and it occurs on key down
  // spacebar trigger form submit on key up, this is because it's actually a 'click'
  let submitProps = {onKeyDown: undefined, onKeyUp: undefined};
  if (type === 'submit') {
    // we must use `click` because if we try to use `form.submit` it will bypass the onSubmit handler
    // as a result, no one can preventDefault on the form, so instead we use click on the button
    // see step 6 https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#firing-submission-events
    submitProps.onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        ref.current?.click();
      }
    };
    submitProps.onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        ref.current?.click();
      }
    };
  }
  let buttonProps = mergeProps(submitProps, focusableProps, pressProps, filterDOMProps(props, {labelable: true}));

  return {
    isPressed, // Used to indicate press state for visual
    buttonProps: mergeProps(additionalProps, buttonProps, {
      'aria-haspopup': props['aria-haspopup'],
      'aria-expanded': props['aria-expanded'],
      'aria-controls': props['aria-controls'],
      'aria-pressed': props['aria-pressed'],
      onClick: (e) => {
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn('onClick is deprecated, please use onPress');
        }
      }
    })
  };
}
