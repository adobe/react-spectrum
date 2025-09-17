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

import {AriaSelectProps, HiddenSelect, useFocusRing, useListFormatter, useLocalizedStringFormatter, useSelect} from 'react-aria';
import {ButtonContext} from './Button';
import {Collection, Node, SelectState, useSelectState} from 'react-stately';
import {CollectionBuilder, createHideableComponent} from '@react-aria/collections';
import {ContextValue, Provider, RACValidation, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot, useSlottedContext} from './utils';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps, mergeProps, useResizeObserver} from '@react-aria/utils';
import {FormContext} from './Form';
import {forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ItemRenderProps} from './Collection';
import {LabelContext} from './Label';
import {ListBoxContext, ListStateContext} from './ListBox';
import {OverlayTriggerStateContext} from './Dialog';
import {PopoverContext} from './Popover';
import React, {createContext, ForwardedRef, forwardRef, Fragment, HTMLAttributes, ReactNode, useCallback, useContext, useMemo, useRef, useState} from 'react';
import {TextContext} from './Text';

type SelectionMode = 'single' | 'multiple';

export interface SelectRenderProps {
  /**
   * Whether the select is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the select is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the select is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the select is currently open.
   * @selector [data-open]
   */
  isOpen: boolean,
  /**
   * Whether the select is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * Whether the select is required.
   * @selector [data-required]
   */
  isRequired: boolean
}

export interface SelectProps<T extends object = {}, M extends SelectionMode = 'single'> extends Omit<AriaSelectProps<T, M>, 'children' | 'label' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior' | 'items'>, RACValidation, RenderProps<SelectRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * Temporary text that occupies the select when it is empty.
   * @default 'Select an item' (localized)
   */
  placeholder?: string
}

export const SelectContext = createContext<ContextValue<SelectProps<any, SelectionMode>, HTMLDivElement>>(null);
export const SelectStateContext = createContext<SelectState<unknown, SelectionMode> | null>(null);

/**
 * A select displays a collapsible list of options and allows a user to select one of them.
 */
export const Select = /*#__PURE__*/ (forwardRef as forwardRefType)(function Select<T extends object = {}, M extends SelectionMode = 'single'>(props: SelectProps<T, M>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, SelectContext);
  let {children, isDisabled = false, isInvalid = false, isRequired = false} = props;
  let content = useMemo(() => (
    typeof children === 'function'
      ? children({
        isOpen: false,
        isDisabled,
        isInvalid,
        isRequired,
        isFocused: false,
        isFocusVisible: false,
        defaultChildren: null
      })
      : children
  ), [children, isDisabled, isInvalid, isRequired]);

  return (
    <CollectionBuilder content={content}>
      {collection => <SelectInner props={props} collection={collection} selectRef={ref} />}
    </CollectionBuilder>
  );
});

// Contexts to clear inside the popover.
const CLEAR_CONTEXTS = [LabelContext, ButtonContext, TextContext];

interface SelectInnerProps<T extends object> {
  props: SelectProps<T, SelectionMode>,
  selectRef: ForwardedRef<HTMLDivElement>,
  collection: Collection<Node<T>>
}

function SelectInner<T extends object>({props, selectRef: ref, collection}: SelectInnerProps<T>) {
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let state = useSelectState({
    ...props,
    collection,
    children: undefined,
    validationBehavior
  });

  let {isFocusVisible, focusProps} = useFocusRing({within: true});

  // Get props for child elements from useSelect
  let buttonRef = useRef<HTMLButtonElement>(null);
  let [labelRef, label] = useSlot(
    !props['aria-label'] && !props['aria-labelledby']
  );
  let {
    labelProps,
    triggerProps,
    valueProps,
    menuProps,
    descriptionProps,
    errorMessageProps,
    hiddenSelectProps,
    ...validation
  } = useSelect({
    ...removeDataAttributes(props),
    label,
    validationBehavior
  }, state, buttonRef);

  // Make menu width match input + button
  let [buttonWidth, setButtonWidth] = useState<string | null>(null);
  let onResize = useCallback(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth + 'px');
    }
  }, [buttonRef]);

  useResizeObserver({
    ref: buttonRef,
    onResize: onResize
  });

  // Only expose a subset of state to renderProps function to avoid infinite render loop
  let renderPropsState = useMemo(() => ({
    isOpen: state.isOpen,
    isFocused: state.isFocused,
    isFocusVisible,
    isDisabled: props.isDisabled || false,
    isInvalid: validation.isInvalid || false,
    isRequired: props.isRequired || false
  }), [state.isOpen, state.isFocused, isFocusVisible, props.isDisabled, validation.isInvalid, props.isRequired]);

  let renderProps = useRenderProps({
    ...props,
    values: renderPropsState,
    defaultClassName: 'react-aria-Select'
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;

  let scrollRef = useRef(null);

  return (
    <Provider
      values={[
        [SelectContext, props],
        [SelectStateContext, state],
        [SelectValueContext, valueProps],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [ButtonContext, {...triggerProps, ref: buttonRef, isPressed: state.isOpen, autoFocus: props.autoFocus}],
        [OverlayTriggerStateContext, state],
        [PopoverContext, {
          trigger: 'Select',
          triggerRef: buttonRef,
          scrollRef,
          placement: 'bottom start',
          style: {'--trigger-width': buttonWidth} as React.CSSProperties,
          'aria-labelledby': menuProps['aria-labelledby'],
          clearContexts: CLEAR_CONTEXTS
        }],
        [ListBoxContext, {...menuProps, ref: scrollRef}],
        [ListStateContext, state],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }],
        [FieldErrorContext, validation]
      ]}>
      <div
        {...mergeProps(DOMProps, renderProps, focusProps)}
        ref={ref}
        slot={props.slot || undefined}
        data-focused={state.isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-open={state.isOpen || undefined}
        data-disabled={props.isDisabled || undefined}
        data-invalid={validation.isInvalid || undefined}
        data-required={props.isRequired || undefined}>
        {renderProps.children}
        <HiddenSelect
          {...hiddenSelectProps}
          autoComplete={props.autoComplete} />
      </div>
    </Provider>
  );
}

export interface SelectValueRenderProps<T> {
  /**
   * Whether the value is a placeholder.
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean,
  /**
   * The object value of the first selected item.
   * @deprecated
   */
  selectedItem: T | null,
  /** The object values of the currently selected items. */
  selectedItems: (T | null)[],
  /** The textValue of the currently selected items. */
  selectedText: string,
  /** The state of the select. */
  state: SelectState<T, 'single' | 'multiple'>
}

export interface SelectValueProps<T extends object> extends Omit<HTMLAttributes<HTMLElement>, keyof RenderProps<unknown>>, RenderProps<SelectValueRenderProps<T>> {}

export const SelectValueContext = createContext<ContextValue<SelectValueProps<any>, HTMLSpanElement>>(null);

/**
 * SelectValue renders the current value of a Select, or a placeholder if no value is selected.
 * It is usually placed within the button element.
 */
export const SelectValue = /*#__PURE__*/ createHideableComponent(function SelectValue<T extends object>(props: SelectValueProps<T>, ref: ForwardedRef<HTMLSpanElement>) {
  [props, ref] = useContextProps(props, ref, SelectValueContext);
  let state = useContext(SelectStateContext)! as SelectState<T, 'single' | 'multiple'>;
  let {placeholder} = useSlottedContext(SelectContext)!;
  let rendered = state.selectedItems.map((item) => {
    let rendered = item.props?.children;
    // If the selected item has a function as a child, we need to call it to render to React.JSX.
    if (typeof rendered === 'function') {
      let fn = rendered as (s: ItemRenderProps) => ReactNode;
      rendered = fn({
        isHovered: false,
        isPressed: false,
        isSelected: false,
        isFocused: false,
        isFocusVisible: false,
        isDisabled: false,
        selectionMode: 'single',
        selectionBehavior: 'toggle'
      });
    }

    return rendered;
  });

  let formatter = useListFormatter();
  let textValue = useMemo(() => state.selectedItems.map(item => item?.textValue), [state.selectedItems]);
  let selectionMode = state.selectionManager.selectionMode;
  let selectedText = useMemo(() => (
    selectionMode === 'single' 
      ? textValue[0] ?? '' 
      : formatter.format(textValue)
  ), [selectionMode, formatter, textValue]);

  let defaultChildren = useMemo(() => {
    if (selectionMode === 'single') {
      return rendered[0];
    }

    let parts = formatter.formatToParts(textValue);
    if (parts.length === 0) {
      return null;
    }

    let index = 0;
    return parts.map(part => {
      if (part.type === 'element') {
        return <Fragment key={index}>{rendered[index++]}</Fragment>;
      } else {
        return part.value;
      }
    });
  }, [selectionMode, formatter, textValue, rendered]);

  let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');

  let renderProps = useRenderProps({
    ...props,
    defaultChildren: defaultChildren ?? placeholder ?? stringFormatter.format('selectPlaceholder'),
    defaultClassName: 'react-aria-SelectValue',
    values: {
      selectedItem: state.selectedItems[0]?.value as T ?? null,
      selectedItems: useMemo(() => state.selectedItems.map(item => item.value as T ?? null), [state.selectedItems]),
      selectedText,
      isPlaceholder: state.selectedItems.length === 0,
      state
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <span ref={ref} {...DOMProps} {...renderProps} data-placeholder={state.selectedItems.length === 0 || undefined}>
      {/* clear description and error message slots */}
      <TextContext.Provider value={undefined}>
        {renderProps.children}
      </TextContext.Provider>
    </span>
  );
});
