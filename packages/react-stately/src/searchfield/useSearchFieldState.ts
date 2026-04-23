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

import {TextFieldProps, TextFieldState, useTextFieldState} from '../textfield/useTextFieldState';
import {useAction} from '../utils/useAction';

export interface SearchFieldProps extends TextFieldProps {
  /** Handler that is called when the SearchField is submitted. */
  onSubmit?: (value: string) => void,

  /** Handler that is called when the clear button is pressed. */
  onClear?: () => void,

  /** Async action that is called when the SearchField is submitted. */
  submitAction?: (value: string) => void | Promise<void>,
  
  /** Async action that is called when the clear button is pressed. */
  clearAction?: () => void | Promise<void>
}

export interface SearchFieldState extends TextFieldState {
  /** Clears the search field. */
  clear(): void,
  /** Submits the search field. */
  submit(): void
}

/**
 * Provides state management for a search field.
 */
export function useSearchFieldState(props: SearchFieldProps): SearchFieldState {
  let state = useTextFieldState(props);
  let [submitAction, isSubmitPending] = useAction(props.submitAction);
  let [clearAction, isClearPending] = useAction(props.clearAction);

  return {
    ...state,
    clear() {
      clearAction?.();
      state.setValue('');
      props.onClear?.();
    },
    submit() {
      submitAction?.(state.value);
      props.onSubmit?.(state.value);
    },
    isPending: state.isPending || isSubmitPending || isClearPending
  };
}
