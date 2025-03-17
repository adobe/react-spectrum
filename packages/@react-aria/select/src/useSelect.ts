/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaButtonProps} from '@react-types/button';
import {AriaListBoxOptions} from '@react-aria/listbox';
import {AriaSelectProps} from '@react-types/select';
import {chain, filterDOMProps, mergeProps, useId} from '@react-aria/utils';
import {DOMAttributes, KeyboardDelegate, RefObject, ValidationResult} from '@react-types/shared';
import {FocusEvent, useMemo} from 'react';
import {ListKeyboardDelegate, useTypeSelect} from '@react-aria/selection';
import {SelectState} from '@react-stately/select';
import {setInteractionModality} from '@react-aria/interactions';
import {useCollator} from '@react-aria/i18n';
import {useField} from '@react-aria/label';
import {useMenuTrigger} from '@react-aria/menu';

export interface AriaSelectOptions<T> extends Omit<AriaSelectProps<T>, 'children'> {
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate
}

export interface SelectAria<T> extends ValidationResult {
  /** Props for the label element. */
  labelProps: DOMAttributes,

  /** Props for the popup trigger element. */
  triggerProps: AriaButtonProps,

  /** Props for the element representing the selected value. */
  valueProps: DOMAttributes,

  /** Props for the popup. */
  menuProps: AriaListBoxOptions<T>,

  /** Props for the select's description element, if any. */
  descriptionProps: DOMAttributes,

  /** Props for the select's error message element, if any. */
  errorMessageProps: DOMAttributes
}

interface SelectData {
  isDisabled?: boolean,
  isRequired?: boolean,
  name?: string,
  validationBehavior?: 'aria' | 'native'
}

export const selectData = new WeakMap<SelectState<any>, SelectData>();

/**
 * Provides the behavior and accessibility implementation for a select component.
 * A select displays a collapsible list of options and allows a user to select one of them.
 * @param props - Props for the select.
 * @param state - State for the select, as returned by `useListState`.
 */
export function useSelect<T>(props: AriaSelectOptions<T>, state: SelectState<T>, ref: RefObject<HTMLElement | null>): SelectAria<T> {
  let {
    keyboardDelegate,
    isDisabled,
    isRequired,
    name,
    validationBehavior = 'aria'
  } = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let delegate = useMemo(() => keyboardDelegate || new ListKeyboardDelegate(state.collection, state.disabledKeys, ref, collator), [keyboardDelegate, state.collection, state.disabledKeys, collator, ref]);

  let {menuTriggerProps, menuProps} = useMenuTrigger<T>(
    {
      isDisabled,
      type: 'listbox'
    },
    state,
    ref
  );

  let onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft': {
        // prevent scrolling containers
        e.preventDefault();

        let key = state.selectedKey != null ? delegate.getKeyAbove?.(state.selectedKey) : delegate.getFirstKey?.();
        if (key) {
          state.setSelectedKey(key);
        }
        break;
      }
      case 'ArrowRight': {
        // prevent scrolling containers
        e.preventDefault();

        let key = state.selectedKey != null ? delegate.getKeyBelow?.(state.selectedKey) : delegate.getFirstKey?.();
        if (key) {
          state.setSelectedKey(key);
        }
        break;
      }
    }
  };

  let {typeSelectProps} = useTypeSelect({
    keyboardDelegate: delegate,
    selectionManager: state.selectionManager,
    onTypeSelect(key) {
      state.setSelectedKey(key);
    }
  });

  let {isInvalid, validationErrors, validationDetails} = state.displayValidation;
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    labelElementType: 'span',
    isInvalid,
    errorMessage: props.errorMessage || validationErrors
  });

  typeSelectProps.onKeyDown = typeSelectProps.onKeyDownCapture;
  delete typeSelectProps.onKeyDownCapture;

  let domProps = filterDOMProps(props, {labelable: true});
  let triggerProps = mergeProps(typeSelectProps, menuTriggerProps, fieldProps);

  let valueId = useId();

  selectData.set(state, {
    isDisabled,
    isRequired,
    name,
    validationBehavior
  });

  return {
    labelProps: {
      ...labelProps,
      onClick: () => {
        if (!props.isDisabled) {
          ref.current?.focus();

          // Show the focus ring so the user knows where focus went
          setInteractionModality('keyboard');
        }
      }
    },
    triggerProps: mergeProps(domProps, {
      ...triggerProps,
      isDisabled,
      onKeyDown: chain(triggerProps.onKeyDown, onKeyDown, props.onKeyDown),
      onKeyUp: props.onKeyUp,
      'aria-labelledby': [
        valueId,
        triggerProps['aria-labelledby'],
        triggerProps['aria-label'] && !triggerProps['aria-labelledby'] ? triggerProps.id : null
      ].filter(Boolean).join(' '),
      onFocus(e: FocusEvent) {
        if (state.isFocused) {
          return;
        }

        if (props.onFocus) {
          props.onFocus(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(true);
        }

        state.setFocused(true);
      },
      onBlur(e: FocusEvent) {
        if (state.isOpen) {
          return;
        }

        if (props.onBlur) {
          props.onBlur(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(false);
        }

        state.setFocused(false);
      }
    }),
    valueProps: {
      id: valueId
    },
    menuProps: {
      ...menuProps,
      autoFocus: state.focusStrategy || true,
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      disallowEmptySelection: true,
      linkBehavior: 'selection',
      onBlur: (e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
          return;
        }

        if (props.onBlur) {
          props.onBlur(e);
        }

        if (props.onFocusChange) {
          props.onFocusChange(false);
        }

        state.setFocused(false);
      },
      'aria-labelledby': [
        fieldProps['aria-labelledby'],
        triggerProps['aria-label'] && !fieldProps['aria-labelledby'] ? triggerProps.id : null
      ].filter(Boolean).join(' ')
    },
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails
  };
}
