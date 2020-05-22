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

import {ButtonProps} from '@react-types/button';
import {mergeProps} from '@react-aria/utils';
import {RefObject} from 'react';
import {useDOMPropsResponder, usePress} from '@react-aria/interactions';
import {useFocusable} from '@react-aria/focus';

interface AriaButtonProps extends ButtonProps {
  isSelected?: boolean,
  validationState?: 'valid' | 'invalid', // used by FieldButton (e.g. DatePicker, ComboBox)
  'aria-expanded'?: boolean | 'false' | 'true',
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog',
  'aria-controls'?: string,
  type?: 'button' | 'submit',
  tabIndex?: number,
  id?: string,
  'aria-label'?: string,
  'aria-labelledby'?: string,
  'aria-describedby'?: string,
}

interface ButtonAria {
  /** Props for the button element. */
  buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>,
  /** Whether the button is currently pressed. */
  isPressed: boolean
}

/**
 * Provides the behavior and accessibility implementation for a button component. Handles mouse, keyboard, and touch interactions, 
 * focus behavior, and ARIA props for both native button elements and custom element types.
 * @param props - props to be applied to the button
 * @param ref - a ref to a DOM element for the button
 */
export function useButton(props: AriaButtonProps, ref: RefObject<HTMLElement>): ButtonAria {
  let {
    elementType = 'button',
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressChange,
    // @ts-ignore
    onClick: deprecatedOnClick,
    href,
    target,
    tabIndex,
    isSelected,
    validationState,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    'aria-controls': ariaControls,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedBy,
    type = 'button'
  } = props;
  let additionalProps;
  if (elementType !== 'button') {
    additionalProps = {
      role: 'button',
      tabIndex: isDisabled ? undefined : (tabIndex || 0),
      href: elementType === 'a' && isDisabled ? undefined : href,
      target: elementType === 'a' ? target : undefined,
      type: elementType === 'input' ? type : undefined,
      disabled: elementType === 'input' ? isDisabled : undefined,
      'aria-disabled': !isDisabled || elementType === 'input' ? undefined : isDisabled
    };
  }

  let {pressProps, isPressed} = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    isDisabled,
    ref
  });

  let {contextProps} = useDOMPropsResponder(ref);
  let {focusableProps} = useFocusable(props, ref);
  let handlers = mergeProps(pressProps, focusableProps);
  let interactions = mergeProps(contextProps, handlers);

  return {
    isPressed, // Used to indicate press state for visual
    buttonProps: mergeProps(interactions, {
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedBy,  
      'aria-haspopup': ariaHasPopup,
      'aria-expanded': ariaExpanded || (ariaHasPopup && isSelected),
      'aria-controls': ariaControls,
      'aria-checked': isSelected,
      'aria-invalid': validationState === 'invalid' ? true : null,
      disabled: isDisabled,
      type,
      ...(additionalProps || {}),
      onClick: (e) => {
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn('onClick is deprecated, please use onPress');
        }
      }
    })
  };
}
