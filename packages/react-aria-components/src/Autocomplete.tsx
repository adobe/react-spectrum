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
import {AriaComboBoxProps, useFilter} from 'react-aria';
import {ButtonContext} from './Button';
import {Collection, ComboBoxState, Node} from 'react-stately';
import {CollectionBuilder} from '@react-aria/collections';
import {ContextValue, Provider, RACValidation, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot, useSlottedContext} from './utils';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps, useResizeObserver} from '@react-aria/utils';
import {FormContext} from './Form';
import {forwardRefType, RefObject} from '@react-types/shared';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {ListBoxContext, ListStateContext} from './ListBox';
import {OverlayTriggerStateContext} from './Dialog';
import {PopoverContext} from './Popover';
import React, {createContext, ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState} from 'react';
import {TextContext} from './Text';
import { useAutocomplete } from '@react-aria/autocomplete';
import { useAutocompleteState } from '@react-stately/autocomplete';

export interface AutocompleteRenderProps {
  // /**
  //  * Whether the combobox is currently open.
  //  * @selector [data-open]
  //  */
  // isOpen: boolean,
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

// TODO get rid of any other combobox specific props here
export interface AutocompleteProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children' | 'placeholder' | 'label' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>, RACValidation, RenderProps<AutocompleteProps>, SlotProps {
  /** The filter function used to determine if a option should be included in the autocomplete list. */
  defaultFilter?: (textValue: string, inputValue: string) => boolean,
  /**
   * Whether the text or key of the selected item is submitted as part of an HTML form.
   * When `allowsCustomValue` is `true`, this option does not apply and the text is always submitted.
   * @default 'key'
   */
  formValue?: 'text' | 'key'
  // /** Whether the combo box allows the menu to be open when the collection is empty. */
  // allowsEmptyCollection?: boolean
}

export const AutocompleteContext = createContext<ContextValue<AutocompleteProps<any>, HTMLDivElement>>(null);
export const ComboBoxStateContext = createContext<ComboBoxState<any> | null>(null);

function Autocomplete<T extends object>(props: AutocompleteProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, AutocompleteContext);
  let {children, isDisabled = false, isInvalid = false, isRequired = false} = props;
  let content = useMemo(() => (
    <ListBoxContext.Provider value={{items: props.items ?? props.defaultItems}}>
      {typeof children === 'function'
        ? children({
          isOpen: false,
          isDisabled,
          isInvalid,
          isRequired,
          defaultChildren: null
        })
        : children}
    </ListBoxContext.Provider>
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
    // If props.items isn't provided, rely on collection filtering (aka listbox.items is provided or defaultItems provided to Combobox)
    items: props.items,
    children: undefined,
    collection,
    validationBehavior
  });
  // console.log('state', state)

  let buttonRef = useRef<HTMLButtonElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);
  let listBoxRef = useRef<HTMLDivElement>(null);
  let popoverRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();

  // TODO: replace with useAutocomplete
  let {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useAutocomplete({
    ...removeDataAttributes(props),
    label,
    inputRef,
    buttonRef,
    listBoxRef,
    popoverRef,
    name: formValue === 'text' ? name : undefined,
    validationBehavior
  }, state);


  // TODO: comment these out when you get Autocomplete working in the story
  // Make menu width match input + button
  // let [menuWidth, setMenuWidth] = useState<string | null>(null);
  // let onResize = useCallback(() => {
  //   if (inputRef.current) {
  //     let buttonRect = buttonRef.current?.getBoundingClientRect();
  //     let inputRect = inputRef.current.getBoundingClientRect();
  //     let minX = buttonRect ? Math.min(buttonRect.left, inputRect.left) : inputRect.left;
  //     let maxX = buttonRect ? Math.max(buttonRect.right, inputRect.right) : inputRect.right;
  //     setMenuWidth((maxX - minX) + 'px');
  //   }
  // }, [buttonRef, inputRef, setMenuWidth]);

  // useResizeObserver({
  //   ref: inputRef,
  //   onResize: onResize
  // });

  // Only expose a subset of state to renderProps function to avoid infinite render loop
  let renderPropsState = useMemo(() => ({
    // isOpen: state.isOpen,
    isDisabled: props.isDisabled || false,
    isInvalid: validation.isInvalid || false,
    isRequired: props.isRequired || false
  }), [state.isOpen, props.isDisabled, validation.isInvalid, props.isRequired]);

  let renderProps = useRenderProps({
    ...props,
    values: renderPropsState,
    // TODO rename
    defaultClassName: 'react-aria-ComboBox'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [ComboBoxStateContext, state],
        [LabelContext, {...labelProps, ref: labelRef}],
        // [ButtonContext, {...buttonProps, ref: buttonRef, isPressed: state.isOpen}],
        [InputContext, {...inputProps, ref: inputRef}],
        // TODO: get rid of the popover stuff and trigger
        // [OverlayTriggerStateContext, state],
        // [PopoverContext, {
        //   ref: popoverRef,
        //   triggerRef: inputRef,
        //   scrollRef: listBoxRef,
        //   placement: 'bottom start',
        //   isNonModal: true,
        //   trigger: 'ComboBox',
        //   // style: {'--trigger-width': menuWidth} as React.CSSProperties
        // }],
        [ListBoxContext, {...listBoxProps, ref: listBoxRef}],
        [ListStateContext, state],
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
        // data-open={state.isOpen || undefined}
        data-disabled={props.isDisabled || undefined}
        data-invalid={validation.isInvalid || undefined}
        data-required={props.isRequired || undefined} />
      {name && formValue === 'key' && <input type="hidden" name={name} value={state.selectedKey ?? ''} />}
    </Provider>
  );
}

/**
 * A autocomplete combines a text input with a listbox, allowing users to filter a list of options to items matching a query.
 */
const _Autocomplete = /*#__PURE__*/ (forwardRef as forwardRefType)(Autocomplete);
export {_Autocomplete as Autocomplete};
