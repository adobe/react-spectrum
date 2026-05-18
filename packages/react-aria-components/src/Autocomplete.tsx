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

import {AriaAutocompleteProps, useAutocomplete} from 'react-aria/useAutocomplete';
import {
  AriaLabelingProps,
  DOMProps,
  FocusableElement,
  FocusEvents,
  KeyboardEvents,
  Node,
  ValueBase
} from '@react-types/shared';
import {AriaTextFieldProps} from 'react-aria/useTextField';
import {
  AutocompleteState,
  useAutocompleteState
} from 'react-stately/private/autocomplete/useAutocompleteState';
import {
  ContextValue,
  Provider,
  removeDataAttributes,
  SlotProps,
  SlottedContextValue,
  useSlottedContext
} from './utils';
import {mergeProps} from 'react-aria/mergeProps';
import React, {createContext, JSX, useRef} from 'react';

export interface AutocompleteProps<T = object> extends AriaAutocompleteProps<T>, SlotProps {}
export const AutocompleteContext =
  createContext<SlottedContextValue<Partial<AutocompleteProps<any>>>>(null);
export const AutocompleteStateContext = createContext<AutocompleteState | null>(null);

export interface SelectableCollectionContextValue<T> extends DOMProps, AriaLabelingProps {
  filter?: (nodeTextValue: string, node: Node<T>) => boolean;
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus?: boolean;
  /** Whether typeahead is disabled. */
  disallowTypeAhead?: boolean;
}
interface FieldInputContextValue<T = FocusableElement>
  extends
    DOMProps,
    FocusEvents<T>,
    KeyboardEvents,
    Pick<ValueBase<string>, 'onChange' | 'value'>,
    Pick<
      AriaTextFieldProps,
      | 'enterKeyHint'
      | 'aria-controls'
      | 'aria-autocomplete'
      | 'aria-activedescendant'
      | 'spellCheck'
      | 'autoCorrect'
      | 'autoComplete'
    > {}

export const SelectableCollectionContext =
  createContext<ContextValue<SelectableCollectionContextValue<any>, HTMLElement>>(null);
export const FieldInputContext =
  createContext<ContextValue<FieldInputContextValue, FocusableElement>>(null);

/**
 * An autocomplete allows users to search or filter a list of suggestions.
 */
export function Autocomplete<T extends object>(props: AutocompleteProps<T>): JSX.Element {
  let ctx = useSlottedContext(AutocompleteContext, props.slot);
  props = mergeProps(ctx, props);
  let {filter, disableAutoFocusFirst} = props;
  let state = useAutocompleteState(props);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let collectionRef = useRef<HTMLElement>(null);
  let {
    inputProps,
    collectionProps,
    collectionRef: mergedCollectionRef,
    filter: filterFn
  } = useAutocomplete(
    {
      ...removeDataAttributes(props),
      filter,
      disableAutoFocusFirst,
      inputRef,
      collectionRef
    },
    state
  );

  return (
    <Provider
      values={[
        [AutocompleteStateContext, state],
        [
          FieldInputContext,
          {
            ...inputProps,
            ref: inputRef
          }
        ],
        [
          SelectableCollectionContext,
          {
            ...collectionProps,
            filter: filterFn,
            ref: mergedCollectionRef
          }
        ]
      ]}>
      {props.children}
    </Provider>
  );
}
