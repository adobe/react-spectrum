/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, DOMProps, FocusableElement, FocusEvents, KeyboardEvents, Node, ValueBase} from '@react-types/shared';
import {AriaTextFieldProps} from '@react-aria/textfield';
import {ContextValue} from './utils';
import {createContext} from 'react';

export interface SelectableCollectionContextValue<T> extends DOMProps, AriaLabelingProps {
  filter?: (nodeTextValue: string, node: Node<T>) => boolean,
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus?: boolean,
  /** Whether typeahead is disabled. */
  disallowTypeAhead?: boolean
}

interface FieldInputContextValue<T = FocusableElement> extends
  DOMProps,
  FocusEvents<T>,
  KeyboardEvents,
  Pick<ValueBase<string>, 'onChange' | 'value'>,
  Pick<AriaTextFieldProps, 'enterKeyHint' | 'aria-controls' | 'aria-autocomplete' | 'aria-activedescendant' | 'spellCheck' | 'autoCorrect' | 'autoComplete'> {}

export const SelectableCollectionContext = createContext<ContextValue<SelectableCollectionContextValue<any>, HTMLElement>>(null);
export const FieldInputContext = createContext<ContextValue<FieldInputContextValue, FocusableElement>>(null);
