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
import {Collection, Node} from 'react-stately';
import {CollectionBuilder} from '@react-aria/collections';
import {ContextValue, Provider, RACValidation, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot, useSlottedContext} from './utils';
import {ExternalMenuStateContext, MenuContext} from './Menu';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from '@react-aria/utils';
import {FormContext} from './Form';
import {forwardRefType, RefObject} from '@react-types/shared';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, useCallback, useMemo, useRef} from 'react';
import {TextContext} from './Text';
import {useFilter} from 'react-aria';

export interface AutocompleteRenderProps {
  /**
   * Whether the autocomplete is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

export interface AutocompleteProps<T extends object> extends Omit<AriaAutocompleteProps<T>, 'children' | 'placeholder' | 'label' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>,  RenderProps<AutocompleteRenderProps>, SlotProps {
  /** The filter function used to determine if a option should be included in the autocomplete list. */
  defaultFilter?: (textValue: string, inputValue: string) => boolean
}

interface InternalAutocompleteContextValue {
  register: (callback: (string: any) => string) => void,
  filterFn: (nodeTextValue: string) => boolean
}

export const AutocompleteContext = createContext<ContextValue<AutocompleteProps<any>, HTMLDivElement>>(null);
export const AutocompleteStateContext = createContext<AutocompleteState<any> | null>(null);
// This context is to pass the register and filter down to whatever collection component is wrapped by the Autocomplete
export const InternalAutocompleteContext = createContext<InternalAutocompleteContextValue | null>(null);

function Autocomplete<T extends object>(props: AutocompleteProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, AutocompleteContext);
  let {children, isDisabled = false, defaultFilter} = props;

  // TODO: not quite sure if we need to do the below or if I can just do something like  <CollectionBuilder content={<Collection {...props} />}>
  // This approach is a 1:1 copy of ComboBox where this renders the Autocomplete's children (aka the Menu) in the fake DOM and constructs a collection which we can filter
  // via useAutocomplete state. Said state then gets propagated Menu via AutocompleteInner's context provider so that the Menu's rendered items are mirrored/match the filtered collection
  // I think we still have to do this, but geting a bit tripped up with thinking if we could simplify it somehow
  // let content = useMemo(() => (
  //   <MenuContext.Provider value={{items: props.items ?? props.defaultItems}}>
  //     {typeof children === 'function'
  //       ? children({
  //         isDisabled,
  //         defaultChildren: null
  //       })
  //       : children}
  //   </MenuContext.Provider>
  // ), [children, isDisabled, props.items, props.defaultItems]);

  // return (
  //   <CollectionBuilder content={content}>
  //     {collection => <AutocompleteInner props={props} collection={collection} autocompleteRef={ref} />}
  //   </CollectionBuilder>
  // );

  return (
    <AutocompleteInner autocompleteRef={ref} props={props} />
  );
}

interface AutocompleteInnerProps<T extends object> {
  props: AutocompleteProps<T>,
  // collection: Collection<Node<T>>,
  autocompleteRef: RefObject<HTMLDivElement | null>
}

// TODO: maybe we don't need inner anymore
function AutocompleteInner<T extends object>({props, autocompleteRef: ref}: AutocompleteInnerProps<T>) {
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
        [InternalAutocompleteContext, {register, filterFn}]
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
