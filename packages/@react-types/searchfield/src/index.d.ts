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

import {AriaTextFieldProps, SpectrumTextFieldProps, TextFieldProps} from '@react-types/textfield';
import {SpectrumTextInputBase} from '@react-types/shared';

export interface SearchFieldProps extends TextFieldProps {
  /** Handler that is called when the SearchField is submitted. */
  onSubmit?: (value: string) => void,

  /** Handler that is called when the clear button is pressed. */
  onClear?: () => void
}

export interface AriaSearchFieldProps extends SearchFieldProps, AriaTextFieldProps {
  /**
   * An enumerated attribute that defines what action label or icon to preset for the enter key on virtual keyboards. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint).
   */
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
}
export interface SpectrumSearchFieldProps extends SpectrumTextInputBase, Omit<AriaSearchFieldProps, 'isInvalid' | 'validationState'>, SpectrumTextFieldProps {}
