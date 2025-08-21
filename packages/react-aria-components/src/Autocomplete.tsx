/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaAutocompleteProps, useAutocomplete} from '@react-aria/autocomplete';
import {AutocompleteState, useAutocompleteState} from '@react-stately/autocomplete';
import {FieldInputContext, SelectableCollectionContext} from './context';
import {mergeProps} from '@react-aria/utils';
import {Provider, removeDataAttributes, SlotProps, SlottedContextValue, useSlottedContext} from './utils';
import React, {createContext, JSX, useRef} from 'react';

export interface AutocompleteProps<T = object> extends AriaAutocompleteProps<T>, SlotProps {}
export const AutocompleteContext = createContext<SlottedContextValue<Partial<AutocompleteProps<any>>>>(null);
export const AutocompleteStateContext = createContext<AutocompleteState | null>(null);

/**
 * An autocomplete combines a TextField or SearchField with a Menu or ListBox, allowing users to search or filter a list of suggestions.
 */
export function Autocomplete<T extends object>(props: AutocompleteProps<T>): JSX.Element {
  let ctx = useSlottedContext(AutocompleteContext, props.slot);
  props = mergeProps(ctx, props);
  let {filter, disableAutoFocusFirst} = props;
  let state = useAutocompleteState(props);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let collectionRef = useRef<HTMLElement>(null);
  let {
    textFieldProps,
    collectionProps,
    collectionRef: mergedCollectionRef,
    filter: filterFn
  } = useAutocomplete({
    ...removeDataAttributes(props),
    filter,
    disableAutoFocusFirst,
    inputRef,
    collectionRef
  }, state);

  return (
    <Provider
      values={[
        [AutocompleteStateContext, state],
        [FieldInputContext, {
          ...textFieldProps,
          ref: inputRef
        }],
        [SelectableCollectionContext, {
          ...collectionProps,
          filter: filterFn,
          ref: mergedCollectionRef
        }]
      ]}>
      {props.children}
    </Provider>
  );
};
