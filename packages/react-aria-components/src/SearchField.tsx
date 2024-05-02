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

import {AriaSearchFieldProps, useSearchField} from 'react-aria';
import {ButtonContext} from './Button';
import {ContextValue, forwardRefType, Provider, RACValidation, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot, useSlottedContext} from './utils';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from '@react-aria/utils';
import {FormContext} from './Form';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {SearchFieldState, useSearchFieldState} from 'react-stately';
import {TextContext} from './Text';

export interface SearchFieldRenderProps {
  /**
   * Whether the search field is empty.
   * @selector [data-empty]
   */
  isEmpty: boolean,
  /**
   * Whether the search field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the search field is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean,
  /**
   * State of the search field.
   */
  state: SearchFieldState
}

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>, RACValidation, RenderProps<SearchFieldRenderProps>, SlotProps {}

export const SearchFieldContext = createContext<ContextValue<SearchFieldProps, HTMLDivElement>>(null);

function SearchField(props: SearchFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, SearchFieldContext);
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let state = useSearchFieldState({
    ...props,
    validationBehavior
  });

  let {labelProps, inputProps, clearButtonProps, descriptionProps, errorMessageProps, ...validation} = useSearchField({
    ...removeDataAttributes(props),
    label,
    validationBehavior
  }, state, inputRef);

  let renderProps = useRenderProps({
    ...props,
    values: {
      isEmpty: state.value === '',
      isDisabled: props.isDisabled || false,
      isInvalid: validation.isInvalid || false,
      state
    },
    defaultClassName: 'react-aria-SearchField'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...DOMProps}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-empty={state.value === '' || undefined}
      data-disabled={props.isDisabled || undefined}
      data-invalid={validation.isInvalid || undefined}>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}],
          [InputContext, {...inputProps, ref: inputRef}],
          [ButtonContext, clearButtonProps],
          [TextContext, {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }],
          [GroupContext, {isInvalid: validation.isInvalid, isDisabled: props.isDisabled || false}],
          [FieldErrorContext, validation]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A search field allows a user to enter and clear a search query.
 */
const _SearchField = /*#__PURE__*/ (forwardRef as forwardRefType)(SearchField);
export {_SearchField as SearchField};
