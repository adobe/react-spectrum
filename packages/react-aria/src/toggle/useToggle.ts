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
  AriaLabelingProps,
  AriaValidationProps,
  DOMAttributesWithRef,
  FocusableDOMProps,
  InputDOMProps,
  PressEvents,
  RefObject,
  ValidationResult
} from '@react-types/shared';
import {ChangeEventHandler, InputHTMLAttributes, LabelHTMLAttributes, useState} from 'react';
import {filterDOMProps} from '../utils/filterDOMProps';
import {getEventTarget} from '../utils/shadowdom/DOMFunctions';
import {mergeProps} from '../utils/mergeProps';
import {
  privateValidationStateProp,
  useFormValidationState
} from 'react-stately/private/form/useFormValidationState';
import {ToggleProps, ToggleState} from 'react-stately/useToggleState';
import {useFocusable} from '../interactions/useFocusable';
import {useFormReset} from '../utils/useFormReset';
import {useFormValidation} from '../form/useFormValidation';
import {usePress} from '../interactions/usePress';
import {useSlotId2} from '../utils/useSlot';

export interface AriaToggleProps
  extends
    ToggleProps,
    FocusableDOMProps,
    AriaLabelingProps,
    AriaValidationProps,
    InputDOMProps,
    PressEvents {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current
   * element.
   */
  'aria-controls'?: string;
}

export interface ToggleAria extends ValidationResult {
  /** Props to be spread on the label element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  /** Props to be spread on the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  /** Props for the checkbox description element, if any. */
  descriptionProps: DOMAttributesWithRef<HTMLElement>;
  /** Props for the checkbox error message element, if any. */
  errorMessageProps: DOMAttributesWithRef<HTMLElement>;
  /** Whether the toggle is selected. */
  isSelected: boolean;
  /** Whether the toggle is in a pressed state. */
  isPressed: boolean;
  /** Whether the toggle is disabled. */
  isDisabled: boolean;
  /** Whether the toggle is read only. */
  isReadOnly: boolean;
  /** Whether the toggle is invalid. */
  isInvalid: boolean;
}

/**
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 */
export function useToggle(
  props: AriaToggleProps,
  state: ToggleState,
  ref: RefObject<HTMLInputElement | null>
): ToggleAria {
  let {
    isDisabled = false,
    isReadOnly = false,
    value,
    name,
    form,
    children,
    isRequired,
    validationBehavior = 'aria',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    onPressUp,
    onClick
  } = props;

  // Create validation state here because it doesn't make sense to add to general useToggleState.
  let validationState = useFormValidationState({...props, value: state.isSelected});
  let {isInvalid, validationErrors, validationDetails} = validationState.displayValidation;

  useFormValidation(props, validationState, ref);

  let onChange: ChangeEventHandler<HTMLInputElement> = e => {
    // since we spread props on label, onChange will end up there as well as in here.
    // so we have to stop propagation at the lowest level that we care about
    e.stopPropagation();
    state.setSelected(getEventTarget(e).checked);
  };

  let hasChildren = children != null;
  let hasAriaLabel = ariaLabel != null || ariaLabelledby != null;
  if (!hasChildren && !hasAriaLabel && process.env.NODE_ENV !== 'production') {
    console.warn(
      'If you do not provide children, you must specify an aria-label for accessibility'
    );
  }

  // Handle press state for keyboard interactions and cases where labelProps is not used.
  let {pressProps, isPressed} = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    onPressUp,
    onClick,
    isDisabled
  });

  // Handle press state on the label.
  let [isLabelPressed, setLabelPressed] = useState(false);
  let {pressProps: labelProps} = usePress({
    onPressStart(e) {
      // Keyboard interactions are handled directly on the input.
      if (e.pointerType === 'keyboard' || e.pointerType === 'virtual') {
        e.continuePropagation();
        return;
      }

      onPressStart?.(e);
      onPressChange?.(true);
      setLabelPressed(true);
    },
    onPressEnd(e) {
      // Keyboard interactions are handled directly on the input.
      if (e.pointerType === 'keyboard' || e.pointerType === 'virtual') {
        e.continuePropagation();
        return;
      }

      onPressEnd?.(e);
      onPressChange?.(false);
      setLabelPressed(false);
    },
    onPressUp(e) {
      if (e.pointerType === 'keyboard' || e.pointerType === 'virtual') {
        e.continuePropagation();
        return;
      }

      onPressUp?.(e);
    },
    onClick,
    onPress(e) {
      if (e.pointerType === 'keyboard' || e.pointerType === 'virtual') {
        e.continuePropagation();
        return;
      }

      onPress?.(e);
      state.toggle();
      ref.current?.focus();

      // @ts-expect-error
      let {[privateValidationStateProp]: groupValidationState} = props;

      let {commitValidation} = groupValidationState ? groupValidationState : validationState;

      commitValidation();
    },
    isDisabled: isDisabled || isReadOnly
  });

  let {focusableProps} = useFocusable(props, ref);
  let interactions = mergeProps(pressProps, focusableProps);
  let domProps = filterDOMProps(props, {labelable: true});

  useFormReset(ref, state.defaultSelected, state.setSelected);

  // Copied from useField because we don't want the label behavior that provides.
  let descriptionProps = useSlotId2();
  let errorMessageProps = useSlotId2();

  return {
    labelProps: mergeProps(labelProps, {onClick: e => e.preventDefault()}),
    inputProps: mergeProps(domProps, {
      checked: state.isSelected,
      'aria-required': (isRequired && validationBehavior === 'aria') || undefined,
      required: isRequired && validationBehavior === 'native',
      'aria-invalid': isInvalid || props.validationState === 'invalid' || undefined,
      'aria-errormessage': props['aria-errormessage'],
      'aria-controls': props['aria-controls'],
      'aria-readonly': isReadOnly || undefined,
      'aria-describedby':
        [descriptionProps.id, errorMessageProps.id, ariaDescribedby].filter(Boolean).join(' ') ||
        undefined,
      onChange,
      disabled: isDisabled,
      ...(value == null ? {} : {value}),
      name,
      form,
      type: 'checkbox',
      ...interactions
    }),
    descriptionProps,
    errorMessageProps,
    isSelected: state.isSelected,
    isPressed: isPressed || isLabelPressed,
    isDisabled,
    isReadOnly,
    isInvalid: isInvalid || props.validationState === 'invalid',
    validationErrors,
    validationDetails
  };
}
