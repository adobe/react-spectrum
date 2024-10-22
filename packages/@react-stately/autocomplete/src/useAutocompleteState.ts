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

import {FocusableProps, HelpTextProps, InputBase, LabelableProps, TextInputBase} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export interface AutocompleteState {
  /** The current value of the autocomplete input. */
  inputValue: string,
  /** Sets the value of the autocomplete input. */
  setInputValue(value: string): void,
  // TODO: debatable if this state hook needs to exist
  /** The id of the current aria-activedescendant of the autocomplete input. */
  focusedNodeId: string,
  /** Sets the id of the current aria-activedescendant of the autocomplete input. */
  setFocusedNodeId(value: string): void
}

// TODO: vet these props, maybe move out of here since most of these are the component's props rather than the state option
// TODO: clean up the packge json here
export interface AutocompleteProps extends InputBase, TextInputBase, FocusableProps<HTMLInputElement>, LabelableProps, HelpTextProps {
  /** The value of the autocomplete input (controlled). */
  inputValue?: string,
  /** The default value of the autocomplete input (uncontrolled). */
  defaultInputValue?: string,
  /** Handler that is called when the autocomplete input value changes. */
  onInputChange?: (value: string) => void
}

// TODO: get rid of this if we don't have any extra things to omit from the options
export interface AutocompleteStateOptions extends Omit<AutocompleteProps, 'children'> {}

/**
 * Provides state management for a autocomplete component.
 */
export function useAutocompleteState(props: AutocompleteStateOptions): AutocompleteState {
  let onInputChange = (value) => {
    if (props.onInputChange) {
      props.onInputChange(value);
    }

    // TODO: weird that this is handled here?
    setFocusedNodeId(null);
  };

  let [focusedNodeId, setFocusedNodeId] = useState(null);
  let [inputValue, setInputValue] = useControlledState(
    props.inputValue,
    '',
    onInputChange
  );

  return {
    inputValue,
    setInputValue,
    focusedNodeId,
    setFocusedNodeId
  };
}
