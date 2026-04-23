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

import {FocusableProps, InputBase, Validation} from '@react-types/shared';
import {ReactNode, useState} from 'react';
import {useControlledStateAction} from '../utils/useControlledStateAction';

export interface ToggleStateOptions extends InputBase {
  /**
   * Whether the element should be selected (uncontrolled).
   */
  defaultSelected?: boolean,
  /**
   * Whether the element should be selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void,
  /**
   * Async action that is called when the state changes.
   * During the action, the button is in a pending state.
   * Only supported in React 19 and later.
   */
  changeAction?: (isSelected: boolean) => void | Promise<void>
}

export interface ToggleProps extends ToggleStateOptions, Validation<boolean>, FocusableProps {
  /**
   * The label for the element.
   */
  children?: ReactNode,
  /**
   * The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string
}

export interface ToggleState {
  /** Whether the toggle is selected. */
  readonly isSelected: boolean,

  /** Whether the toggle is selected by default. */
  readonly defaultSelected: boolean,

  /** Whether the change action is pending. */
  readonly isPending: boolean,

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

  let [isSelected, isPending, setSelected] = useControlledStateAction(props.isSelected, props.defaultSelected || false, props.onChange, props.changeAction);
  let [initialValue] = useState(isSelected);

  function updateSelected(value) {
    if (!isReadOnly) {
      setSelected(value);
    }
  }

  function toggleState() {
    updateSelected(!isSelected);
  }

  return {
    isSelected,
    defaultSelected: props.defaultSelected ?? initialValue,
    isPending,
    setSelected: updateSelected,
    toggle: toggleState
  };
}
