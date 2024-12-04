/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaAutocompleteProps, CollectionOptions, useAutocomplete} from '@react-aria/autocomplete';
import {AutocompleteState, useAutocompleteState} from '@react-stately/autocomplete';
import {ContextValue, Provider, removeDataAttributes, SlotProps, useContextProps} from './utils';
import {InputContext} from './Input';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useRef} from 'react';

export interface AutocompleteProps extends AriaAutocompleteProps, SlotProps {}

interface InternalAutocompleteContextValue {
  filterFn: (nodeTextValue: string) => boolean,
  collectionProps: CollectionOptions,
  collectionRef: RefObject<HTMLElement | null>
}

export const AutocompleteContext = createContext<ContextValue<AutocompleteProps, HTMLInputElement>>(null);
export const AutocompleteStateContext = createContext<AutocompleteState | null>(null);
// This context is to pass the register and filter down to whatever collection component is wrapped by the Autocomplete
export const InternalAutocompleteContext = createContext<InternalAutocompleteContextValue | null>(null);

/**
 * A autocomplete combines a text input with a menu, allowing users to filter a list of options to items matching a query.
 */


export const Autocomplete = forwardRef(function Autocomplete(props: AutocompleteProps, ref: ForwardedRef<HTMLInputElement>) {
  [props, ref] = useContextProps(props, ref, AutocompleteContext);
  let {defaultFilter} = props;
  let state = useAutocompleteState(props);
  let collectionRef = useRef<HTMLElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  let {
    inputProps,
    collectionProps,
    collectionRef: mergedCollectionRef,
    filterFn
  } = useAutocomplete({
    ...removeDataAttributes(props),
    defaultFilter,
    collectionRef,
    inputRef
  }, state);

  return (
    <Provider
      values={[
        [AutocompleteStateContext, state],
        [InputContext, {...inputProps, ref: inputRef}],
        [InternalAutocompleteContext, {
          filterFn,
          collectionProps,
          collectionRef: mergedCollectionRef
        }]
      ]}>
      {props.children}
    </Provider>
  );
});
