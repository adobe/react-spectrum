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
import React, {InputHTMLAttributes, JSX, ReactNode, useCallback, useRef} from 'react';
import {selectData} from './useSelect';
import {SelectionMode} from '@react-types/select';
import {SelectState} from '@react-stately/select';
import {useFormReset} from '@react-aria/utils';
import {useFormValidation} from '@react-aria/form';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export interface AriaHiddenSelectProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string,

  /** The text label for the select. */
  label?: ReactNode,

  /** HTML form input name. */
  name?: string,

  /**
   * The `<form>` element to associate the input with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form).
   */
  form?: string,

  /** Sets the disabled state of the select and input. */
  isDisabled?: boolean
}

export interface HiddenSelectProps<T, M extends SelectionMode = 'single'> extends AriaHiddenSelectProps {
  /** State for the select. */
  state: SelectState<T, M>,

  /** A ref to the trigger element. */
  triggerRef: RefObject<FocusableElement | null>
}

export interface AriaHiddenSelectOptions extends AriaHiddenSelectProps {
  /** A ref to the hidden `<select>` element. */
  selectRef?: RefObject<HTMLSelectElement | HTMLInputElement | null>
}

export interface HiddenSelectAria {
  /** Props for the container element. */
  containerProps: React.HTMLAttributes<FocusableElement>,

  /** Props for the hidden input element. */
  inputProps: React.InputHTMLAttributes<HTMLInputElement>,

  /** Props for the hidden select element. */
  selectProps: React.SelectHTMLAttributes<HTMLSelectElement>
}

/**
 * Provides the behavior and accessibility implementation for a hidden `<select>` element, which
 * can be used in combination with `useSelect` to support browser form autofill, mobile form
 * navigation, and native HTML form submission.
 */
export function useHiddenSelect<T, M extends SelectionMode = 'single'>(props: AriaHiddenSelectOptions, state: SelectState<T, M>, triggerRef: RefObject<FocusableElement | null>): HiddenSelectAria {
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
  useFormValidation({
    validationBehavior,
    focus: () => triggerRef.current?.focus()
  }, state, props.selectRef);

  let setValue = state.setValue;
  let onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.multiple) {
      setValue(Array.from(
        e.target.selectedOptions,
        (option) => option.value
      ) as any);
    } else {
      setValue(e.currentTarget.value as any);
    }
  }, [setValue]);

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
export function HiddenSelect<T, M extends SelectionMode = 'single'>(props: HiddenSelectProps<T, M>): JSX.Element | null {
  let {state, triggerRef, label, name, form, isDisabled} = props;
  let selectRef = useRef(null);
  let inputRef = useRef(null);
  let {containerProps, selectProps} = useHiddenSelect({...props, selectRef: state.collection.size <= 300 ? selectRef : inputRef}, state, triggerRef);

  // If used in a <form>, use a hidden input so the value can be submitted to a server.
  // If the collection isn't too big, use a hidden <select> element for this so that browser
  // autofill will work. Otherwise, use an <input type="hidden">.
  if (state.collection.size <= 300) {
    return (
      <div {...containerProps} data-testid="hidden-select-container">
        <label>
          {label}
          <select {...selectProps} ref={selectRef}>
            <option />
            {[...state.collection.getKeys()].map(key => {
              let item = state.collection.getItem(key);
              if (item && item.type === 'item') {
                return (
                  <option
                    key={item.key}
                    value={item.key}>
                    {item.textValue}
                  </option>
                );
              }
            })}
          </select>
        </label>
      </div>
    );
  } else if (name) {
    let data = selectData.get(state) || {};
    let {validationBehavior} = data;

    // Always render at least one hidden input to ensure required form submission.
    let values: (Key | null)[] = Array.isArray(state.value) ? state.value : [state.value];
    if (values.length === 0) {
      values = [null];
    }
    
    let res = values.map((value, i) => {
      let inputProps: InputHTMLAttributes<HTMLInputElement> = {
        type: 'hidden',
        autoComplete: selectProps.autoComplete,
        name,
        form,
        disabled: isDisabled,
        value: value ?? ''
      };

      if (validationBehavior === 'native') {
        // Use a hidden <input type="text"> rather than <input type="hidden">
        // so that an empty value blocks HTML form submission when the field is required.
        return (
          <input
            key={i}
            {...inputProps}
            ref={i === 0 ? inputRef : null}
            style={{display: 'none'}}
            type="text"
            required={i === 0 ? selectProps.required : false}
            onChange={() => {/** Ignore react warning. */}} />
        );
      }

      return (
        <input key={i} {...inputProps} ref={i === 0 ? inputRef : null} />
      );
    });

    return <>{res}</>;
  }

  return null;
}
