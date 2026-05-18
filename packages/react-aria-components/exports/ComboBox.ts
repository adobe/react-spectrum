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

// Mark as a client only package. This will cause a build time error if you try
// to import it from a React Server Component in a framework like Next.js.
import 'client-only';

export {
  ComboBox,
  ComboBoxValue,
  ComboBoxContext,
  ComboBoxStateContext,
  ComboBoxValueContext
} from '../src/ComboBox';
export {useFilter} from 'react-aria/useFilter';

export type {
  ComboBoxProps,
  ComboBoxRenderProps,
  ComboBoxValueProps,
  ComboBoxValueRenderProps
} from '../src/ComboBox';
export type {ComboBoxState} from 'react-stately/useComboBoxState';
export type {Filter} from 'react-aria/useFilter';

export {Button} from '../src/Button';
export type {ButtonProps, ButtonRenderProps} from '../src/Button';

export {Input} from '../src/Input';
export type {InputProps, InputRenderProps} from '../src/Input';

export {Label} from '../src/Label';
export type {LabelProps} from '../src/Label';

export {Text} from '../src/Text';
export type {TextProps} from '../src/Text';

export {FieldError} from '../src/FieldError';
export type {FieldErrorProps, FieldErrorRenderProps} from '../src/FieldError';
export type {ValidationResult} from '@react-types/shared';

export {Popover} from '../src/Popover';
export type {PopoverProps, PopoverRenderProps} from '../src/Popover';

export {ListBoxLoadMoreItem, ListBox, ListBoxItem, ListBoxSection} from '../src/ListBox';
export {Collection, type CollectionProps} from 'react-aria/Collection';
export type {
  ListBoxProps,
  ListBoxRenderProps,
  ListBoxItemProps,
  ListBoxItemRenderProps,
  ListBoxSectionProps,
  ListBoxLoadMoreItemProps
} from '../src/ListBox';

export type {Key} from '@react-types/shared';
