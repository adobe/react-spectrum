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

import {AriaCheckboxGroupItemProps} from '@react-types/checkbox';
import {CheckboxAria, useCheckbox} from './useCheckbox';
import {checkboxGroupData} from './utils';
import {CheckboxGroupState} from '@react-stately/checkbox';
import {DEFAULT_VALIDATION_RESULT, privateValidationStateProp, useFormValidationState} from '@react-stately/form';
import {RefObject, ValidationResult} from '@react-types/shared';
import {useEffect, useRef} from 'react';
import {useToggleState} from '@react-stately/toggle';

/**
 * Provides the behavior and accessibility implementation for a checkbox component contained within a checkbox group.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useCheckboxGroupState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function useCheckboxGroupItem(props: AriaCheckboxGroupItemProps, state: CheckboxGroupState, inputRef: RefObject<HTMLInputElement | null>): CheckboxAria {
  const toggleState = useToggleState({
    isReadOnly: props.isReadOnly || state.isReadOnly,
    isSelected: state.isSelected(props.value),
    onChange(isSelected) {
      if (isSelected) {
        state.addValue(props.value);
      } else {
        state.removeValue(props.value);
      }

      if (props.onChange) {
        props.onChange(isSelected);
      }
    }
  });

  let {name, descriptionId, errorMessageId, validationBehavior} = checkboxGroupData.get(state)!;
  validationBehavior = props.validationBehavior ?? validationBehavior;

  // Local validation for this checkbox.
  let {realtimeValidation} = useFormValidationState({
    ...props,
    value: toggleState.isSelected,
    // Server validation is handled at the group level.
    name: undefined,
    validationBehavior: 'aria'
  });

  // Update the checkbox group state when realtime validation changes.
  let nativeValidation = useRef(DEFAULT_VALIDATION_RESULT);
  let updateValidation = () => {
    state.setInvalid(props.value, realtimeValidation.isInvalid ? realtimeValidation : nativeValidation.current);
  };

  useEffect(updateValidation);

  // Combine group and checkbox level validation.
  let combinedRealtimeValidation = state.realtimeValidation.isInvalid ? state.realtimeValidation : realtimeValidation;
  let displayValidation = validationBehavior === 'native' ? state.displayValidation : combinedRealtimeValidation;

  let res = useCheckbox({
    ...props,
    isReadOnly: props.isReadOnly || state.isReadOnly,
    isDisabled: props.isDisabled || state.isDisabled,
    name: props.name || name,
    isRequired: props.isRequired ?? state.isRequired,
    validationBehavior,
    [privateValidationStateProp]: {
      realtimeValidation: combinedRealtimeValidation,
      displayValidation,
      resetValidation: state.resetValidation,
      commitValidation: state.commitValidation,
      updateValidation(v: ValidationResult) {
        nativeValidation.current = v;
        updateValidation();
      }
    }
  }, toggleState, inputRef);

  return {
    ...res,
    inputProps: {
      ...res.inputProps,
      'aria-describedby': [
        props['aria-describedby'],
        state.isInvalid ? errorMessageId : null,
        descriptionId
      ].filter(Boolean).join(' ') || undefined
    }
  };
}
