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

import {ToggleStateOptions} from '@react-types/checkbox';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export type {ToggleStateOptions};

export interface ToggleState {
  /** Whether the toggle is selected. */
  readonly isSelected: boolean,

  /** Whether the toggle is selected by default. */
  readonly defaultSelected: boolean,

  /** Updates selection state. */
  setSelected(isSelected: boolean): void,

  /** Toggle the selection state. */
  toggle(): void
}

/**
 * Provides state management for toggle components like checkboxes and switches.
 */
export function useToggleState(props: ToggleStateOptions = {}): ToggleState {
  let {isReadOnly} = props;

  // have to provide an empty function so useControlledState doesn't throw a fit
  // can't use useControlledState's prop calling because we need the event object from the change
  let [isSelected, setSelected] = useControlledState(props.isSelected, props.defaultSelected || false, props.onChange);
  let [initialValue] = useState(isSelected);

  function updateSelected(value) {
    if (!isReadOnly) {
      setSelected(value);
    }
  }

  function toggleState() {
    if (!isReadOnly) {
      setSelected(!isSelected);
    }
  }

  return {
    isSelected,
    defaultSelected: props.defaultSelected ?? initialValue,
    setSelected: updateSelected,
    toggle: toggleState
  };
}
