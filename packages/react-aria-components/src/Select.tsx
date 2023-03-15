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

import {AriaSelectProps} from '@react-types/select';
import {ButtonContext} from './Button';
import {ContextValue, Provider, RenderProps, slotCallbackSymbol, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {createContext, ForwardedRef, forwardRef, HTMLAttributes, ReactNode, useCallback, useContext, useRef, useState} from 'react';
import {HiddenSelect, useSelect} from 'react-aria';
import {LabelContext} from './Label';
import {ListBoxContext, ListBoxProps} from './ListBox';
import {PopoverContext} from './Popover';
import React from 'react';
import {SelectState, useSelectState} from 'react-stately';
import {TextContext} from './Text';
import {useCollection} from './Collection';
import {useResizeObserver} from '@react-aria/utils';

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children' | 'label' | 'description' | 'errorMessage'>, RenderProps<SelectState<T>>, SlotProps {}

interface SelectValueContext {
  state: SelectState<unknown>,
  valueProps: HTMLAttributes<HTMLElement>
}

export const SelectContext = createContext<ContextValue<SelectProps<any>, HTMLDivElement>>(null);
const InternalSelectContext = createContext<SelectValueContext>(null);

function Select<T extends object>(props: SelectProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, SelectContext);
  let [listBoxProps, setListBoxProps] = useState<ListBoxProps<any>>({children: []});

  let {portal, collection} = useCollection({
    items: props.items ?? listBoxProps.items,
    children: listBoxProps.children
  });
  let state = useSelectState({
    ...props,
    collection,
    children: null
  });

  // Get props for child elements from useSelect
  let buttonRef = useRef<HTMLButtonElement>(null);
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    triggerProps,
    valueProps,
    menuProps,
    descriptionProps,
    errorMessageProps
  } = useSelect({...props, label}, state, buttonRef);

  // Make menu width match input + button
  let [buttonWidth, setButtonWidth] = useState(null);
  let onResize = useCallback(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth + 'px');
    }
  }, [buttonRef]);

  useResizeObserver({
    ref: buttonRef,
    onResize: onResize
  });

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-Select'
  });

  return (
    <Provider
      values={[
        [InternalSelectContext, {state, valueProps}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [ButtonContext, {...triggerProps, ref: buttonRef, isPressed: state.isOpen}],
        [PopoverContext, {
          state,
          triggerRef: buttonRef,
          preserveChildren: true,
          placement: 'bottom start',
          style: {'--button-width': buttonWidth} as React.CSSProperties
        }],
        [ListBoxContext, {state, [slotCallbackSymbol]: setListBoxProps, ...menuProps}],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div {...renderProps} ref={ref} slot={props.slot}>
        {props.children}
      </div>
      {portal}
      <HiddenSelect
        state={state}
        triggerRef={buttonRef}
        label={label}
        name={props.name} />
    </Provider>
  );
}

/**
 * A select displays a collapsible list of options and allows a user to select one of them.
 */
const _Select = forwardRef(Select);
export {_Select as Select};

export interface SelectValueRenderProps {
  /**
   * Whether the value is a placeholder.
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean,
  /** The rendered value of the currently selected item. */
  selectedItem: ReactNode
}

export interface SelectValueProps extends Omit<HTMLAttributes<HTMLElement>, keyof RenderProps<unknown>>, RenderProps<SelectValueRenderProps> {}

function SelectValue(props: SelectValueProps, ref: ForwardedRef<HTMLSpanElement>) {
  let {state, valueProps} = useContext(InternalSelectContext);
  let renderProps = useRenderProps({
    ...props,
    defaultChildren: state.selectedItem?.rendered || 'Select an item',
    defaultClassName: 'react-aria-SelectValue',
    values: {
      selectedItem: state.selectedItem?.rendered,
      isPlaceholder: !state.selectedItem
    }
  });

  return (
    <span ref={ref} {...valueProps} {...renderProps} data-placeholder={!state.selectedItem || undefined}>
      {/* clear description and error message slots */}
      <TextContext.Provider value={undefined}>
        {renderProps.children}
      </TextContext.Provider>
    </span>
  );
}

/**
 * SelectValue renders the current value of a Select, or a placeholder if no value is selected.
 * It is usually placed within the button element.
 */
const _SelectValue = forwardRef(SelectValue);
export {_SelectValue as SelectValue};
