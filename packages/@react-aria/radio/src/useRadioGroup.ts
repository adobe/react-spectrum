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

import {FocusEvent} from '@react-types/shared';
import {HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes} from 'react';
import {RadioGroupProps} from '@react-types/radio';
import {RadioGroupState} from '@react-stately/radio';
import {useFocusWithin} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';

interface RadioGroupAria {
  radioGroupProps: HTMLAttributes<HTMLElement>,
  labelProps: LabelHTMLAttributes<HTMLElement>,
  radioProps: InputHTMLAttributes<HTMLInputElement>
}

export function useRadioGroup(props: RadioGroupProps, state: RadioGroupState): RadioGroupAria {
  let defaultGroupId = `${useId()}-group`;
  let {
    name = defaultGroupId
  } = props;
  let {labelProps, fieldProps} = useLabel(props);

  // When the radio group loses focus, reset the focusable radio to null if
  // there is no selection. This allows tabbing into the group from either
  // direction to go to the first or last radio.
  let {focusWithinProps} = useFocusWithin({
    onBlurWithin() {
      if (!state.selectedRadio) {
        state.setFocusableRadio(null);
      }
    }
  });

  return {
    radioGroupProps: {
      role: 'radiogroup',
      ...fieldProps,
      ...focusWithinProps
    },
    labelProps,
    radioProps: {
      name,
      onFocus: (e: FocusEvent) => e.continuePropagation()
    }
  };
}
