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

import {RadioGroupProps} from '@react-types/radio';
import React, {useState} from 'react';
import {useControlledState} from '@react-stately/utils';

export interface RadioGroupState {
  selectedRadio: string | undefined,
  setSelectedRadio: (value: string) => void,
  focusableRadio: string | undefined,
  setFocusableRadio: (value: string) => void,
}

export function useRadioGroupState(props: RadioGroupProps): RadioGroupState {
  let [selectedRadio, setSelected] = useControlledState(props.value, props.defaultValue, props.onChange);

  let activeChildren = React.Children.toArray(props.children).filter(child => !child.props.isDisabled);
  let defaultFocusableRadio = selectedRadio || activeChildren[0] && activeChildren[0].props.value;

  let [focusableRadio, setFocusableRadio] = useState(defaultFocusableRadio);

  let setSelectedRadio = (value) => {
    if (!props.isReadOnly) {
      setSelected(value);
    }
    setFocusableRadio(value);
  };

  return {selectedRadio, setSelectedRadio, focusableRadio, setFocusableRadio};
}
