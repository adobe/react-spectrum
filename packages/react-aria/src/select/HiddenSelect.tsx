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

import {FocusableElement, Key, RefObject} from '@react-types/shared';
import {getEventTarget} from '../utils/shadowdom/DOMFunctions';
import React, {JSX, ReactNode, useCallback, useEffect, useRef} from 'react';
import {selectData} from './useSelect';
import {SelectionMode, SelectState} from 'react-stately/useSelectState';
import {useFormReset} from '../utils/useFormReset';
import {useFormValidation} from '../form/useFormValidation';
import {useVisuallyHidden} from '../visually-hidden/VisuallyHidden';

export interface AriaHiddenSelectProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string;

  /** The text label for the select. */
  label?: ReactNode;

  /** HTML form input name. */
  name?: string;

  /**
   * The `<form>` element to associate the input with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form).
   */
  form?: string;

  /** Sets the disabled state of the select and input. */
  isDisabled?: boolean;
}

export interface HiddenSelectProps<
  T,
  M extends SelectionMode = 'single'
> extends AriaHiddenSelectProps {
  /** State for the select. */
  state: SelectState<T, M>;

  /** A ref to the trigger element. */
  triggerRef: RefObject<FocusableElement | null>;
}

export interface AriaHiddenSelectOptions extends AriaHiddenSelectProps {
  /** A ref to the hidden `<select>` element. */
  selectRef?: RefObject<HTMLSelectElement | HTMLInputElement | null>;
}

export interface HiddenSelectAria {
  /** Props for the container element. */
  containerProps: React.HTMLAttributes<FocusableElement>;

  /** Props for the hidden input element. */
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;

  /** Props for the hidden select element. */
  selectProps: React.SelectHTMLAttributes<HTMLSelectElement>;
}

/**
 * Provides the behavior and accessibility implementation for a hidden `<select>` element, which
 * can be used in combination with `useSelect` to support browser form autofill, mobile form
 * navigation, and native HTML form submission.
 */
export function useHiddenSelect<T, M extends SelectionMode = 'single'>(
  props: AriaHiddenSelectOptions,
  state: SelectState<T, M>,
  triggerRef: RefObject<FocusableElement | null>
): HiddenSelectAria {
  let data = selectData.get(state) || {};
  let {autoComplete, name = data.name, form = data.form, isDisabled = data.isDisabled} = props;
  let {validationBehavior, isRequired} = data;
  let {visuallyHiddenProps} = useVisuallyHidden({
    style: {
      // Prevent page scrolling.
      position: 'fixed',
      top: 0,
      left: 0
    }
  });

  useFormReset(props.selectRef, state.defaultValue, state.setValue);
  useFormValidation(
    {
      validationBehavior,
      focus: () => triggerRef.current?.focus()
    },
    state,
    props.selectRef
  );

  let setValue = state.setValue;
  let subscribeToValueChange = state.subscribeToValueChange;
  let isDispatchingChange = useRef(false);
  let onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (isDispatchingChange.current) {
        return;
      }

      let eventTarget = getEventTarget(e);
      let value: string | string[];
      if (eventTarget.multiple) {
        value = Array.from(eventTarget.selectedOptions, option => option.value);
      } else {
        value = e.currentTarget.value;
      }

      setValue(value as any);
    },
    [setValue]
  );

  useEffect(() => {
    return subscribeToValueChange(value => {
      let select = props.selectRef?.current;
      if (!(select instanceof HTMLSelectElement)) {
        return;
      }

      let values = (Array.isArray(value) ? value : [value]).map(value => String(value ?? ''));
      let temporaryOptions: HTMLOptionElement[] = [];
      for (let value of values) {
        if (![...select.options].some(option => option.value === value)) {
          let option = select.ownerDocument.createElement('option');
          option.value = value;
          select.add(option);
          temporaryOptions.push(option);
        }
      }

      if (select.multiple) {
        let selectedValues = new Set(values);
        for (let option of select.options) {
          option.selected = selectedValues.has(option.value);
        }
      } else {
        let valueSetter = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(select),
          'value'
        )?.set;
        valueSetter?.call(select, values[0] ?? '');
      }

      isDispatchingChange.current = true;
      try {
        select.dispatchEvent(new Event('change', {bubbles: true}));
      } finally {
        for (let option of temporaryOptions) {
          option.remove();
        }
        isDispatchingChange.current = false;
      }
    });
  }, [props.selectRef, subscribeToValueChange]);

  // In Safari, the <select> cannot have `display: none` or `hidden` for autofill to work.
  // In Firefox, there must be a <label> to identify the <select> whereas other browsers
  // seem to identify it just by surrounding text.
  // The solution is to use <VisuallyHidden> to hide the elements, which clips the elements to a
  // 1px rectangle. In addition, we hide from screen readers with aria-hidden, and make the <select>
  // non tabbable with tabIndex={-1}.
  return {
    containerProps: {
      ...visuallyHiddenProps,
      'aria-hidden': true,
      // @ts-ignore
      ['data-react-aria-prevent-focus']: true,
      // @ts-ignore
      ['data-a11y-ignore']: 'aria-hidden-focus'
    },
    inputProps: {
      style: {display: 'none'}
    },
    selectProps: {
      tabIndex: -1,
      autoComplete,
      disabled: isDisabled,
      multiple: state.selectionManager.selectionMode === 'multiple',
      required: validationBehavior === 'native' && isRequired,
      name,
      form,
      value: (state.value as string | string[]) ?? '',
      onChange,
      onInput: onChange
    }
  };
}

/**
 * Renders a hidden native `<select>` element, which can be used to support browser
 * form autofill, mobile form navigation, and native form submission.
 */
export function HiddenSelect<T, M extends SelectionMode = 'single'>(
  props: HiddenSelectProps<T, M>
): JSX.Element | null {
  let {state, triggerRef, label, name} = props;
  let selectRef = useRef(null);
  let {containerProps, selectProps} = useHiddenSelect({...props, selectRef}, state, triggerRef);

  let values: (Key | null)[] = Array.isArray(state.value) ? state.value : [state.value];

  return (
    <div {...containerProps} data-testid="hidden-select-container">
      <label>
        {label}
        <select {...selectProps} ref={selectRef}>
          <option value="" label={'\u00A0'}>
            {'\u00A0'}
          </option>
          {/* Avoid rendering a large native select while preserving form and change event semantics. */}
          {state.collection.size <= 300
            ? [...state.collection.getKeys()].map(key => {
                let item = state.collection.getItem(key);
                if (item && item.type === 'item') {
                  return (
                    <option key={item.key} value={item.key}>
                      {item.textValue}
                    </option>
                  );
                }
              })
            : values.map((value, i) => (value != null ? <option key={i} value={value} /> : null))}
          {/* The collection may be empty during the initial render. */}
          {/* Rendering options for the current values ensures the select has a value immediately, */}
          {/* making FormData reads consistent. */}
          {state.collection.size === 0 &&
            name &&
            values.map((value, i) => <option key={i} value={value ?? ''} />)}
        </select>
      </label>
    </div>
  );
}
