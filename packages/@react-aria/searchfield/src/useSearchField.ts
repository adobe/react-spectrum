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

import {AriaButtonProps} from '@react-types/button';
import {AriaSearchFieldProps} from '@react-types/searchfield';
import {chain} from '@react-aria/utils';
import {DOMAttributes, RefObject, ValidationResult} from '@react-types/shared';
import {InputHTMLAttributes, LabelHTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {SearchFieldState} from '@react-stately/searchfield';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';

export interface SearchFieldAria extends ValidationResult {
  /** Props for the text field's visible label element (if any). */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the clear button. */
  clearButtonProps: AriaButtonProps,
  /** Props for the searchfield's description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the searchfield's error message element, if any. */
  errorMessageProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a search field.
 * @param props - Props for the search field.
 * @param state - State for the search field, as returned by `useSearchFieldState`.
 * @param inputRef - A ref to the input element.
 */
export function useSearchField(
  props: AriaSearchFieldProps,
  state: SearchFieldState,
  inputRef: RefObject<HTMLInputElement | null>
): SearchFieldAria {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/searchfield');
  let {
    isDisabled,
    isReadOnly,
    onSubmit,
    onClear,
    type = 'search'
  } = props;

  let onKeyDown = (e) => {
    const key = e.key;

    if (key === 'Enter' && (isDisabled || isReadOnly)) {
      e.preventDefault();
    }

    if (isDisabled || isReadOnly) {
      return;
    }

    // for backward compatibility;
    // otherwise, "Enter" on an input would trigger a form submit, the default browser behavior
    if (key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit(state.value);
    }

    if (key === 'Escape') {
      // Also check the inputRef value for the case where the value was set directly on the input element instead of going through
      // the hook
      if (state.value === '' && (!inputRef.current || inputRef.current.value === '')) {
        e.continuePropagation();
      } else {
        e.preventDefault();
        state.setValue('');
        if (onClear) {
          onClear();
        }
      }
    }
  };

  let onClearButtonClick = () => {
    state.setValue('');

    if (onClear) {
      onClear();
    }
  };

  let onPressStart = () => {
    // this is in PressStart for mobile so that touching the clear button doesn't remove focus from
    // the input and close the keyboard
    inputRef.current?.focus();
  };

  let {labelProps, inputProps, descriptionProps, errorMessageProps, ...validation} = useTextField({
    ...props,
    value: state.value,
    onChange: state.setValue,
    onKeyDown: !isReadOnly ? chain(onKeyDown, props.onKeyDown) : props.onKeyDown,
    type
  }, inputRef);

  return {
    labelProps,
    inputProps: {
      ...inputProps,
      // already handled by useSearchFieldState
      defaultValue: undefined
    },
    clearButtonProps: {
      'aria-label': stringFormatter.format('Clear search'),
      excludeFromTabOrder: true,
      preventFocusOnPress: true,
      isDisabled: isDisabled || isReadOnly,
      onPress: onClearButtonClick,
      onPressStart
    },
    descriptionProps,
    errorMessageProps,
    ...validation
  };
}
