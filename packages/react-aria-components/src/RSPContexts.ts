/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, DOMProps, FocusableElement, FocusEvents, KeyboardEvents, Node, ValueBase} from '@react-types/shared';
import {AriaTextFieldProps} from '@react-aria/textfield';
import {CheckboxProps} from './Checkbox';
import {ColorAreaProps} from './ColorArea';
import {ColorFieldProps} from './ColorField';
import {ColorSliderProps} from './ColorSlider';
import {ColorWheelProps} from './ColorWheel';
import {ContextValue} from './utils';
import {createContext} from 'react';
import {HeadingProps} from './Heading';

// This file is a temporary workaround for a tree shaking issue in SWC (the minifier used by Parcel).
// These are the contexts consumed by React Spectrum components that don't use the implementation from RAC
// (they use hooks). When included in the same file as the implementation, Parcel includes both the context
// and implementation even if only the context is imported. We moved these contexts to a separate file so
// that the implementation does not get included in the bundle. This will be removed once the tree shaking
// issue is fixed.
export const CheckboxContext = createContext<ContextValue<CheckboxProps, HTMLLabelElement>>(null);
export const ColorAreaContext = createContext<ContextValue<Partial<ColorAreaProps>, HTMLDivElement>>(null);
export const ColorFieldContext = createContext<ContextValue<ColorFieldProps, HTMLDivElement>>(null);
export const ColorSliderContext = createContext<ContextValue<Partial<ColorSliderProps>, HTMLDivElement>>(null);
export const ColorWheelContext = createContext<ContextValue<Partial<ColorWheelProps>, HTMLDivElement>>(null);
export const HeadingContext = createContext<ContextValue<HeadingProps, HTMLHeadingElement>>({});

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
