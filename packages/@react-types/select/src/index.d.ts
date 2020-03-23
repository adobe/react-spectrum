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

import {Alignment, CollectionBase, DimensionValue, DOMProps, InputBase, LabelableProps, SingleSelection, SpectrumLabelableProps, StyleProps, TextInputBase} from '@react-types/shared';

export interface SelectProps<T> extends CollectionBase<T>, InputBase, LabelableProps, TextInputBase, SingleSelection {
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  shouldFlip?: boolean
}

export interface SpectrumPickerProps<T> extends SelectProps<T>, SpectrumLabelableProps, DOMProps, StyleProps {
  isQuiet?: boolean,
  align?: Alignment,
  direction?: 'bottom' | 'top',
  menuWidth?: DimensionValue
}
