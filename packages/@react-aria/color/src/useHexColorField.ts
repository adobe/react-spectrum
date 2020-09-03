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

import {AriaHexColorFieldProps} from '@react-types/color';
import {HexColorFieldState} from '@react-stately/color';
import {HTMLAttributes, LabelHTMLAttributes, RefObject, useEffect} from 'react';
import {mergeProps, useId} from '@react-aria/utils';
import {useFocus} from '@react-aria/interactions';
import {useLabel} from '@react-aria/label';
import {useTextField} from '@react-aria/textfield';

interface HexColorFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  inputFieldProps: HTMLAttributes<HTMLInputElement>
}

export function useHexColorField(
  props: AriaHexColorFieldProps,
  state: HexColorFieldState,
  ref: RefObject<HTMLInputElement>
): HexColorFieldAria {
  const inputId = useId();
  let {labelProps, fieldProps} = useLabel(props);

  return {
    labelProps,
    inputFieldProps: {
      id: inputId,
      ...fieldProps,
    }
  };
}
