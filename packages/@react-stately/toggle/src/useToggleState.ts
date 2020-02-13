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
import {CheckboxBase} from '@react-types/checkbox';
import {useControlledState} from '@react-stately/utils';

export interface ToggleState {
  isSelected: boolean,
  setSelected: (value:boolean) => void
}

export function useToggleState(props: CheckboxBase): ToggleState {
  let {isReadOnly, onChange} = props;

  // have to provide an empty function so useControlledState doesn't throw a fit
  // can't use useControlledState's prop calling because we need the event object from the change
  let [isSelected, setSelected] = useControlledState(props.isSelected, props.defaultSelected || false, () => {});

  function updateSelected(value) {
    setSelected(value);
    if (onChange && !isReadOnly) {
      onChange(value);
    }
  }

  return {
    isSelected,
    setSelected: updateSelected
  };
}
