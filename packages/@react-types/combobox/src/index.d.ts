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

import {CollectionBase, DOMProps, FocusableProps, InputBase, SingleSelection, SpectrumLabelableProps, StyleProps, TextInputBase, Validation} from '@react-types/shared';

export interface ComboBoxProps<T> extends CollectionBase<T>, SingleSelection, InputBase, TextInputBase, DOMProps, Validation, FocusableProps {
  defaultItems?: Iterable<T>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  inputValue?: string,
  defaultInputValue?: string,
  onInputChange?: (value: string) => void,
  allowsCustomValue?: boolean,
  completionMode?: 'suggest' | 'complete',
  menuTrigger?: 'focus' | 'input' | 'manual',
  shouldFlip?: boolean
}

export interface SpectrumComboBoxProps<T> extends ComboBoxProps<T>, SpectrumLabelableProps, StyleProps {
  isQuiet?: boolean,
  direction?: 'bottom' | 'top'
}
