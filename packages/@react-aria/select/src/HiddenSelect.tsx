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

import {FocusableElement, RefObject} from '@react-types/shared';
import React, {ReactNode, useRef} from 'react';
import {selectData} from './useSelect';
import {SelectState} from '@react-stately/select';
import {useFormReset} from '@react-aria/utils';
import {useFormValidation} from '@react-aria/form';
import {useInteractionModality} from '@react-aria/interactions';
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

  /** Sets the disabled state of the select and input. */
  isDisabled?: boolean
}

export interface HiddenSelectProps<T> extends AriaHiddenSelectProps {
  /** State for the select. */
  state: SelectState<T>,

  /** A ref to the trigger element. */
  triggerRef: RefObject<FocusableElement | null>
}

export interface AriaHiddenSelectOptions extends AriaHiddenSelectProps {
  /** A ref to the hidden `<select>` element. */
  selectRef?: RefObject<HTMLSelectElement | null>
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
export function useHiddenSelect<T>(props: AriaHiddenSelectOptions, state: SelectState<T>, triggerRef: RefObject<FocusableElement | null>): HiddenSelectAria {
  let data = selectData.get(state) || {};
  let {autoComplete, name = data.name, isDisabled = data.isDisabled} = props;
  let {validationBehavior, isRequired} = data;
  let modality = useInteractionModality();
  let {visuallyHiddenProps} = useVisuallyHidden();

  useFormReset(props.selectRef, state.selectedKey, state.setSelectedKey);
  useFormValidation({
    validationBehavior,
    focus: () => triggerRef.current.focus()
  }, state, props.selectRef);

  // In Safari, the <select> cannot have `display: none` or `hidden` for autofill to work.
  // In Firefox, there must be a <label> to identify the <select> whereas other browsers
  // seem to identify it just by surrounding text.
  // The solution is to use <VisuallyHidden> to hide the elements, which clips the elements to a
  // 1px rectangle. In addition, we hide from screen readers with aria-hidden, and make the <select>
  // non tabbable with tabIndex={-1}.
  //
  // In mobile browsers, there are next/previous buttons above the software keyboard for navigating
  // between fields in a form. These only support native form inputs that are tabbable. In order to
  // support those, an additional hidden input is used to marshall focus to the button. It is tabbable
  // except when the button is focused, so that shift tab works properly to go to the actual previous
  // input in the form. Using the <select> for this also works, but Safari on iOS briefly flashes
  // the native menu on focus, so this isn't ideal. A font-size of 16px or greater is required to
  // prevent Safari from zooming in on the input when it is focused.
  //
  // If the current interaction modality is null, then the user hasn't interacted with the page yet.
  // In this case, we set the tabIndex to -1 on the input element so that automated accessibility
  // checkers don't throw false-positives about focusable elements inside an aria-hidden parent.
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
      type: 'text',
      tabIndex: modality == null || state.isFocused || state.isOpen ? -1 : 0,
      style: {fontSize: 16},
      onFocus: () => triggerRef.current.focus(),
      disabled: isDisabled
    },
    selectProps: {
      tabIndex: -1,
      autoComplete,
      disabled: isDisabled,
      required: validationBehavior === 'native' && isRequired,
      name,
      value: state.selectedKey ?? '',
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => state.setSelectedKey(e.target.value)
    }
  };
}

/**
 * Renders a hidden native `<select>` element, which can be used to support browser
 * form autofill, mobile form navigation, and native form submission.
 */
export function HiddenSelect<T>(props: HiddenSelectProps<T>) {
  let {state, triggerRef, label, name, isDisabled} = props;
  let selectRef = useRef(null);
  let {containerProps, inputProps, selectProps} = useHiddenSelect({...props, selectRef}, state, triggerRef);

  // If used in a <form>, use a hidden input so the value can be submitted to a server.
  // If the collection isn't too big, use a hidden <select> element for this so that browser
  // autofill will work. Otherwise, use an <input type="hidden">.
  if (state.collection.size <= 300) {
    return (
      <div {...containerProps} data-testid="hidden-select-container">
        <input {...inputProps} />
        <label>
          {label}
          <select {...selectProps} ref={selectRef}>
            <option />
            {[...state.collection.getKeys()].map(key => {
              let item = state.collection.getItem(key);
              if (item.type === 'item') {
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
    return (
      <input
        type="hidden"
        autoComplete={selectProps.autoComplete}
        name={name}
        disabled={isDisabled}
        value={state.selectedKey ?? ''} />
    );
  }

  return null;
}
