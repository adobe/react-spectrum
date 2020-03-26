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

import {AllHTMLAttributes} from 'react';
import {mergeProps} from '@react-aria/utils';
import {RadioGroupState} from '@react-stately/radio';
import {RadioProps} from '@react-types/radio';
import {useFocusable} from '@react-aria/focus';
import {usePressableInput} from '@react-aria/interactions';

interface RadioAriaProps extends RadioProps {
  isRequired?: boolean,
  isReadOnly?: boolean,
  name?: string,
  focusableRadio?: string | undefined
}

interface RadioAria {
  inputProps: AllHTMLAttributes<HTMLInputElement>
}

export function useRadio(props: RadioAriaProps, state: RadioGroupState): RadioAria {
  let {
    value,
    isRequired,
    isReadOnly,
    isDisabled,
    name,
    autoFocus,
    focusableRadio
  } = props;
  let {
    selectedRadio,
    setSelectedRadio
  } = state;

  let checked = selectedRadio === value;

  let onChange = (e) => {
    e.stopPropagation();

    setSelectedRadio(value);
  };

  let {pressProps} = usePressableInput({
    isDisabled
  });

  let {focusableProps} = useFocusable(props);
  let interactions = mergeProps(pressProps, focusableProps);

  return {
    inputProps: {
      type: 'radio',
      name,
      tabIndex: focusableRadio === value ? 0 : -1,
      disabled: isDisabled,
      readOnly: isReadOnly,
      required: isRequired,
      checked,
      'aria-checked': checked,
      onChange,
      autoFocus,
      ...interactions
    }
  };
}
