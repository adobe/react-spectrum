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
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from '@react-aria/utils';
import {FormContext} from './Form';
import {forwardRefType, RefObject} from '@react-types/shared';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {MenuContext, MenuStateContext} from './Menu';
import React, {createContext, ForwardedRef, forwardRef, useMemo, useRef} from 'react';
import {TextContext} from './Text';
import {useFilter} from 'react-aria';

export interface AutocompleteRenderProps {
  /**
   * Whether the autocomplete is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the autocomplete is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * Whether the autocomplete is required.
   * @selector [data-required]
   */
  isRequired: boolean
}

export interface AutocompleteProps<T extends object> extends Omit<AriaAutocompleteProps<T>, 'children' | 'placeholder' | 'label' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>, RACValidation, RenderProps<AutocompleteRenderProps>, SlotProps {
  /** The filter function used to determine if a option should be included in the autocomplete list. */
  defaultFilter?: (textValue: string, inputValue: string) => boolean,
  /**
   * Whether the text or key of the selected item is submitted as part of an HTML form.
   * When `allowsCustomValue` is `true`, this option does not apply and the text is always submitted.
   * @default 'key'
   */
  formValue?: 'text' | 'key'
}

export const AutocompleteContext = createContext<ContextValue<AutocompleteProps<any>, HTMLDivElement>>(null);
export const AutocompleteStateContext = createContext<AutocompleteState<any> | null>(null);

function Autocomplete<T extends object>(props: AutocompleteProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, AutocompleteContext);
  let {children, isDisabled = false, isInvalid = false, isRequired = false} = props;

  // TODO: not quite sure if we need to do the below or if I can just do something like  <CollectionBuilder content={<Collection {...props} />}>
  // This approach is a 1:1 copy of ComboBox where this renders the Autocomplete's children (aka the Menu) in the fake DOM and constructs a collection which we can filter
  // via useAutocomplete state. Said state then gets propagated Menu via AutocompleteInner's context provider so that the Menu's rendered items are mirrored/match the filtered collection
  // I think we still have to do this, but geting a bit tripped up with thinking if we could simplify it somehow
  let content = useMemo(() => (
    <MenuContext.Provider value={{items: props.items ?? props.defaultItems}}>
      {typeof children === 'function'
        ? children({
          isDisabled,
          isInvalid,
          isRequired,
          defaultChildren: null
        })
        : children}
    </MenuContext.Provider>
  ), [children, isDisabled, isInvalid, isRequired, props.items, props.defaultItems]);

  return (
    <CollectionBuilder content={content}>
      {collection => <AutocompleteInner props={props} collection={collection} autocompleteRef={ref} />}
    </CollectionBuilder>
  );
}

interface AutocompleteInnerProps<T extends object> {
  props: AutocompleteProps<T>,
  collection: Collection<Node<T>>,
  autocompleteRef: RefObject<HTMLDivElement | null>
}

function AutocompleteInner<T extends object>({props, collection, autocompleteRef: ref}: AutocompleteInnerProps<T>) {
  let {
    name,
    formValue = 'key',
    allowsCustomValue
  } = props;
  if (allowsCustomValue) {
    formValue = 'text';
  }

  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let {contains} = useFilter({sensitivity: 'base'});
  let state = useAutocompleteState({
    defaultFilter: props.defaultFilter || contains,
    ...props,
    // If props.items isn't provided, rely on collection filtering (aka menu.items is provided or defaultItems provided to Autocomplete)
    items: props.items,
    children: undefined,
    collection,
    validationBehavior
  });

  let inputRef = useRef<HTMLInputElement>(null);
  let menuRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();

  let {
    inputProps,
    menuProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useAutocomplete({
    ...removeDataAttributes(props),
    label,
    inputRef,
    menuRef,
    name: formValue === 'text' ? name : undefined,
    validationBehavior
  }, state);

  // Only expose a subset of state to renderProps function to avoid infinite render loop
  let renderPropsState = useMemo(() => ({
    isDisabled: props.isDisabled || false,
    isInvalid: validation.isInvalid || false,
    isRequired: props.isRequired || false
  }), [props.isDisabled, validation.isInvalid, props.isRequired]);

  let renderProps = useRenderProps({
    ...props,
    values: renderPropsState,
    defaultClassName: 'react-aria-Autocomplete'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [AutocompleteStateContext, state],
        [LabelContext, {...labelProps, ref: labelRef}],
        [InputContext, {...inputProps, ref: inputRef}],
        [MenuContext, {...menuProps, ref: menuRef}],
        // TODO: this would need to match the state type of whatever child component the autocomplete
        // is filtering against... Ideally we'd somehow have the child component communicate its state upwards, upon which we we would filter it from here
        // and send it back down but that feels circular. However we need a single SelectionManager to be used by the autocomplete and filtered collection's hooks
        // so that the concepts of "selectedKey"/"focused"
        // @ts-ignore
        [MenuStateContext, state],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }],
        [GroupContext, {isInvalid: validation.isInvalid, isDisabled: props.isDisabled || false}],
        [FieldErrorContext, validation]
      ]}>
      <div
        {...DOMProps}
        {...renderProps}
        ref={ref}
        slot={props.slot || undefined}
        data-focused={state.isFocused || undefined}
        data-disabled={props.isDisabled || undefined}
        data-invalid={validation.isInvalid || undefined}
        data-required={props.isRequired || undefined} />
      {name && formValue === 'key' && <input type="hidden" name={name} value={state.selectedKey ?? ''} />}
    </Provider>
  );
}

/**
 * A autocomplete combines a text input with a menu, allowing users to filter a list of options to items matching a query.
 */
const _Autocomplete = /*#__PURE__*/ (forwardRef as forwardRefType)(Autocomplete);
export {_Autocomplete as Autocomplete};
