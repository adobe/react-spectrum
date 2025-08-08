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
import {AriaLabelingProps, DOMProps, FocusEvents, KeyboardEvents, Node, ValueBase} from '@react-types/shared';
import {AriaTextFieldProps} from '@react-aria/textfield';
import {AutocompleteState, useAutocompleteState} from '@react-stately/autocomplete';
import {ContextValue, Provider, removeDataAttributes, SlotProps, SlottedContextValue, useSlottedContext} from './utils';
import {mergeProps} from '@react-aria/utils';
import React, {createContext, JSX, RefObject, useRef} from 'react';

export interface AutocompleteProps<T> extends AriaAutocompleteProps<T>, SlotProps {}

// TODO: naming
// IMO I think this could also contain the props that useSelectableCollection takes (minus the selection options?)
interface CollectionContextValue<T> extends DOMProps, AriaLabelingProps {
  filter?: (nodeTextValue: string, node: Node<T>) => boolean,
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus?: boolean,
  /** Whether typeahead is disabled. */
  disallowTypeAhead?: boolean,
  collectionRef?: RefObject<HTMLElement | null>
}

// TODO: naming, may omit value since that is specific controlled textfields
// for a case like a rich text editor, the specific value to filter against would need to come from
// the user. Though I guess they could have a separate "filterText" that they pass to Autocomplete that they would
// only set when the user types a certain symbol. That value wouldn't actually affect the textarea's value, just controlling filtering
interface FieldInputContextValue extends
  DOMProps,
  FocusEvents<HTMLInputElement>,
  Pick<KeyboardEvents, 'onKeyDown'>,
  Pick<ValueBase<string>, 'onChange' | 'value'>,
  Pick<AriaTextFieldProps, 'enterKeyHint' | 'aria-controls' | 'aria-autocomplete' | 'aria-activedescendant' | 'spellCheck' | 'autoCorrect' | 'autoComplete'> {}

export const AutocompleteContext = createContext<SlottedContextValue<Partial<AutocompleteProps<any>>>>(null);
export const AutocompleteStateContext = createContext<AutocompleteState | null>(null);

// TODO export from RAC, maybe move up and out of Autocomplete
export const CollectionContext = createContext<CollectionContextValue<any> | null>(null);
// TODO: too restrictive to type this as a HTMLInputElement? Needed for the ref merging that happens in TextField/SearchField
export const FieldInputContext = createContext<ContextValue<FieldInputContextValue, HTMLInputElement>>(null);

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
        [CollectionContext, {
          ...collectionProps,
          filter: filterFn,
          collectionRef: mergedCollectionRef
        }]
      ]}>
      {props.children}
    </Provider>
  );
};
