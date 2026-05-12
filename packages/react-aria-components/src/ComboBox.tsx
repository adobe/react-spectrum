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
import {AriaComboBoxProps, useComboBox} from 'react-aria/useComboBox';

import {ButtonContext} from './Button';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  Provider,
  RACValidation,
  removeDataAttributes,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps,
  useSlot,
  useSlottedContext
} from './utils';
import {Collection, Node} from '@react-types/shared';
import {CollectionBuilder} from 'react-aria/CollectionBuilder';
import {ComboBoxState, useComboBoxState} from 'react-stately/useComboBoxState';
import {createHideableComponent} from 'react-aria/private/collections/Hidden';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FormContext} from './Form';
import {GlobalDOMAttributes, Key, RefObject} from '@react-types/shared';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {ListBoxContext, ListStateContext} from './ListBox';
import {OverlayTriggerStateContext} from './Dialog';
import {PopoverContext} from './Popover';
import React, {
  createContext,
  ForwardedRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import {TextContext} from './Text';
import {useFilter} from 'react-aria/useFilter';
import {useListFormatter} from 'react-aria/useListFormatter';
import {useResizeObserver} from 'react-aria/private/utils/useResizeObserver';

type SelectionMode = 'single' | 'multiple';

export interface ComboBoxRenderProps {
  /**
   * Whether the combobox is currently open.
   *
   * @selector [data-open]
   */
  isOpen: boolean;
  /**
   * Whether the combobox is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the combobox is invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the combobox is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
  /**
   * Whether the combobox is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
}

export interface ComboBoxProps<T extends object, M extends SelectionMode = 'single'>
  extends
    Omit<
      AriaComboBoxProps<T, M>,
      | 'children'
      | 'placeholder'
      | 'label'
      | 'description'
      | 'errorMessage'
      | 'validationState'
      | 'validationBehavior'
    >,
    RACValidation,
    RenderProps<ComboBoxRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-ComboBox'
   */
  className?: ClassNameOrFunction<ComboBoxRenderProps>;
  /** The filter function used to determine if a option should be included in the combo box list. */
  defaultFilter?: (textValue: string, inputValue: string) => boolean;
  /**
   * Whether the text or key of the selected item is submitted as part of an HTML form. When
   * `allowsCustomValue` is `true`, this option does not apply and the text is always submitted.
   *
   * @default 'key'
   */
  formValue?: 'text' | 'key';
  /** Whether the combo box allows the menu to be open when the collection is empty. */
  allowsEmptyCollection?: boolean;
}

export const ComboBoxContext =
  createContext<ContextValue<ComboBoxProps<any, SelectionMode>, HTMLDivElement>>(null);
export const ComboBoxStateContext = createContext<ComboBoxState<any, SelectionMode> | null>(null);

/**
 * A combo box combines a text input with a listbox, allowing users to filter a list of options to
 * items matching a query.
 */
export const ComboBox = /*#__PURE__*/ createHideableComponent(function ComboBox<
  T extends object,
  M extends SelectionMode = 'single'
>(props: ComboBoxProps<T, M>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ComboBoxContext);
  let {
    children,
    isDisabled = false,
    isInvalid = false,
    isRequired = false,
    isReadOnly = false
  } = props;
  let content = useMemo(
    () => (
      <ListBoxContext.Provider value={{items: props.items ?? props.defaultItems}}>
        {typeof children === 'function'
          ? children({
              isOpen: false,
              isDisabled,
              isInvalid,
              isRequired,
              defaultChildren: null,
              isReadOnly
            })
          : children}
      </ListBoxContext.Provider>
    ),
    [children, isDisabled, isInvalid, isRequired, isReadOnly, props.items, props.defaultItems]
  );

  return (
    <CollectionBuilder content={content}>
      {collection => <ComboBoxInner props={props} collection={collection} comboBoxRef={ref} />}
    </CollectionBuilder>
  );
});

// Contexts to clear inside the popover.
const CLEAR_CONTEXTS = [LabelContext, ButtonContext, InputContext, GroupContext, TextContext];

interface ComboBoxInnerProps<T extends object> {
  props: ComboBoxProps<T, SelectionMode>;
  collection: Collection<Node<T>>;
  comboBoxRef: RefObject<HTMLDivElement | null>;
}

function ComboBoxInner<T extends object>({
  props,
  collection,
  comboBoxRef: ref
}: ComboBoxInnerProps<T>) {
  let {name, formValue = 'key', allowsCustomValue} = props;
  if (allowsCustomValue) {
    formValue = 'text';
  }

  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let {contains} = useFilter({sensitivity: 'base'});
  let state = useComboBoxState({
    ...props,
    defaultFilter: props.defaultFilter || contains,
    // If props.items isn't provided, rely on collection filtering (aka listbox.items is provided or defaultItems provided to Combobox)
    items: props.items,
    children: undefined,
    collection,
    validationBehavior
  });

  let buttonRef = useRef<HTMLButtonElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);
  let groupRef = useRef<HTMLDivElement>(null);
  let listBoxRef = useRef<HTMLDivElement>(null);
  let popoverRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot(!props['aria-label'] && !props['aria-labelledby']);
  let {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    valueProps,
    ...validation
  } = useComboBox(
    {
      ...removeDataAttributes(props),
      label,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
      name: formValue === 'text' ? name : undefined,
      validationBehavior
    },
    state
  );

  // Make menu width match input + button
  // Left for backward compatibility in case a <Group> is not rendered.
  let [menuWidth, setMenuWidth] = useState<string | null>(null);
  let onResize = useCallback(() => {
    if (inputRef.current && !groupRef.current) {
      let buttonRect = buttonRef.current?.getBoundingClientRect();
      let inputRect = inputRef.current.getBoundingClientRect();
      let minX = buttonRect ? Math.min(buttonRect.left, inputRect.left) : inputRect.left;
      let maxX = buttonRect ? Math.max(buttonRect.right, inputRect.right) : inputRect.right;
      setMenuWidth(maxX - minX + 'px');
    }
  }, [buttonRef, inputRef, setMenuWidth]);

  useResizeObserver({
    ref: inputRef,
    onResize: onResize
  });

  // Position popover relative to group if available, otherwise input.
  let triggerRef = useMemo(
    () => ({
      get current() {
        return groupRef.current || inputRef.current;
      }
    }),
    [groupRef, inputRef]
  );

  // Only expose a subset of state to renderProps function to avoid infinite render loop
  let renderPropsState = useMemo(
    () => ({
      isOpen: state.isOpen,
      isDisabled: props.isDisabled || false,
      isInvalid: validation.isInvalid || false,
      isRequired: props.isRequired || false,
      isReadOnly: props.isReadOnly || false
    }),
    [state.isOpen, props.isDisabled, validation.isInvalid, props.isRequired, props.isReadOnly]
  );

  let renderProps = useRenderProps({
    ...props,
    values: renderPropsState,
    defaultClassName: 'react-aria-ComboBox'
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;

  let inputs: ReactElement[] = [];
  if (name && formValue === 'key') {
    let values: (Key | null)[] = Array.isArray(state.value) ? state.value : [state.value];
    if (values.length === 0) {
      values = [null];
    }

    inputs = values.map((value, i) => (
      <input key={i} type="hidden" name={name} form={props.form} value={value ?? ''} />
    ));
  }

  return (
    <Provider
      values={[
        [ComboBoxStateContext, state],
        [LabelContext, {...labelProps, ref: labelRef}],
        [ButtonContext, {...buttonProps, ref: buttonRef, isPressed: state.isOpen}],
        [InputContext, {...inputProps, ref: inputRef}],
        [OverlayTriggerStateContext, state],
        [
          PopoverContext,
          {
            ref: popoverRef,
            triggerRef,
            scrollRef: listBoxRef,
            placement: 'bottom start',
            isNonModal: true,
            trigger: 'ComboBox',
            style: {'--trigger-width': menuWidth} as React.CSSProperties,
            clearContexts: CLEAR_CONTEXTS
          }
        ],
        [ListBoxContext, {...listBoxProps, ref: listBoxRef}],
        [ListStateContext, state],
        [
          TextContext,
          {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }
        ],
        [
          GroupContext,
          {ref: groupRef, isInvalid: validation.isInvalid, isDisabled: props.isDisabled || false}
        ],
        [FieldErrorContext, validation],
        [ComboBoxValueContext, valueProps]
      ]}>
      <dom.div
        {...DOMProps}
        {...renderProps}
        ref={ref}
        slot={props.slot || undefined}
        data-focused={state.isFocused || undefined}
        data-open={state.isOpen || undefined}
        data-disabled={props.isDisabled || undefined}
        data-readonly={props.isReadOnly || undefined}
        data-invalid={validation.isInvalid || undefined}
        data-required={props.isRequired || undefined}>
        {renderProps.children}
        {inputs}
      </dom.div>
    </Provider>
  );
}

export interface ComboBoxValueRenderProps<T> {
  /**
   * Whether the value is a placeholder.
   *
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean;
  /** The object values of the currently selected items. */
  selectedItems: (T | null)[];
  /** The textValue of the currently selected items. */
  selectedText: string;
  /** The state of the ComboBox. */
  state: ComboBoxState<T, 'single' | 'multiple'>;
}

export interface ComboBoxValueProps<T extends object>
  extends
    Omit<HTMLAttributes<HTMLElement>, keyof RenderProps<unknown>>,
    RenderProps<ComboBoxValueRenderProps<T>, 'div'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-ComboBoxValue'
   */
  className?: ClassNameOrFunction<ComboBoxValueRenderProps<T>>;
  /** A value to display when no items are selected. */
  placeholder?: ReactNode;
}

export const ComboBoxValueContext =
  createContext<ContextValue<ComboBoxValueProps<any>, HTMLDivElement>>(null);

/**
 * ComboBoxValue renders the selected values of a ComboBox, or a placeholder if no value is
 * selected. By default, the items are rendered as a comma separated list. Use the render function
 * to customize this.
 */
export const ComboBoxValue = /*#__PURE__*/ createHideableComponent(function ComboBoxValue<
  T extends object
>(props: ComboBoxValueProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ComboBoxValueContext);
  let state = useContext(ComboBoxStateContext)!;
  let formatter = useListFormatter();
  let selectedText = useMemo(
    () =>
      formatter.format(
        state.selectedItems.map(item => item?.textValue || '').filter(v => v !== '')
      ),
    [formatter, state.selectedItems]
  );

  let renderProps = useRenderProps({
    ...props,
    defaultChildren: selectedText || props.placeholder,
    defaultClassName: 'react-aria-ComboBoxValue',
    values: {
      selectedItems: useMemo(
        () => state.selectedItems.map(item => (item.value as T) ?? null),
        [state.selectedItems]
      ),
      selectedText,
      isPlaceholder: state.selectedItems.length === 0,
      state
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <dom.div
      ref={ref}
      {...DOMProps}
      {...renderProps}
      data-placeholder={state.selectedItems.length === 0 || undefined}
    />
  );
});
