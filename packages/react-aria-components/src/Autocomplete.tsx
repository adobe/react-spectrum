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

import {AriaAutocompleteProps, useAutocomplete} from '@react-aria/autocomplete';
import {AutocompleteState, useAutocompleteState} from '@react-stately/autocomplete';
import {ContextValue, Provider, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {forwardRefType, RefObject} from '@react-types/shared';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {MenuContext} from './Menu';
import React, {createContext, ForwardedRef, forwardRef, KeyboardEvent, useCallback, useMemo, useRef} from 'react';
import {TextContext} from './Text';
import {useFilter} from 'react-aria';

export interface AutocompleteRenderProps {
  /**
   * Whether the autocomplete is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

export interface AutocompleteProps extends Omit<AriaAutocompleteProps, 'children' | 'placeholder' | 'label' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>,  RenderProps<AutocompleteRenderProps>, SlotProps {
  /** The filter function used to determine if a option should be included in the autocomplete list. */
  defaultFilter?: (textValue: string, inputValue: string) => boolean
}

interface InternalAutocompleteContextValue {
  register: (callback: (event: KeyboardEvent) => string) => void,
  filterFn: (nodeTextValue: string) => boolean,
  inputValue: string
}

export const AutocompleteContext = createContext<ContextValue<AutocompleteProps, HTMLDivElement>>(null);
export const AutocompleteStateContext = createContext<AutocompleteState | null>(null);
// This context is to pass the register and filter down to whatever collection component is wrapped by the Autocomplete
export const InternalAutocompleteContext = createContext<InternalAutocompleteContextValue | null>(null);

function Autocomplete(props: AutocompleteProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, AutocompleteContext);

  return (
    <AutocompleteInner autocompleteRef={ref} props={props} />
  );
}
interface AutocompleteInnerProps {
  props: AutocompleteProps,
  // collection: Collection<Node<T>>,
  autocompleteRef: RefObject<HTMLDivElement | null>
}

// TODO: maybe we don't need inner anymore
function AutocompleteInner({props, autocompleteRef: ref}: AutocompleteInnerProps) {
  let {defaultFilter} = props;
  let state = useAutocompleteState(props);
  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let {contains} = useFilter({sensitivity: 'base'});
  let {
    inputProps,
    menuProps,
    labelProps,
    descriptionProps,
    register
  } = useAutocomplete({
    ...removeDataAttributes(props),
    label,
    inputRef
  }, state);

  let renderPropsState = useMemo(() => ({
    isDisabled: props.isDisabled || false
  }), [props.isDisabled]);

  let renderProps = useRenderProps({
    ...props,
    values: renderPropsState,
    defaultClassName: 'react-aria-Autocomplete'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  let filterFn = useCallback((nodeTextValue: string) => {
    if (defaultFilter) {
      return defaultFilter(nodeTextValue, state.inputValue);
    }
    return contains(nodeTextValue, state.inputValue);
  }, [state.inputValue, defaultFilter, contains]) ;

  return (
    <Provider
      values={[
        [AutocompleteStateContext, state],
        [LabelContext, {...labelProps, ref: labelRef}],
        [InputContext, {...inputProps, ref: inputRef}],
        [MenuContext, {...menuProps}],
        [TextContext, {
          slots: {
            description: descriptionProps
          }
        }],
        [GroupContext, {isDisabled: props.isDisabled || false}],
        [InternalAutocompleteContext, {register, filterFn, inputValue: state.inputValue}]
      ]}>
      <div
        {...DOMProps}
        {...renderProps}
        ref={ref}
        slot={props.slot || undefined}
        data-disabled={props.isDisabled || undefined} />
    </Provider>
  );
}

/**
 * A autocomplete combines a text input with a menu, allowing users to filter a list of options to items matching a query.
 */
const _Autocomplete = /*#__PURE__*/ (forwardRef as forwardRefType)(Autocomplete);
export {_Autocomplete as Autocomplete};
