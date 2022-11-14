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

import {AriaLabelingProps, AsyncLoadable, CollectionBase, DOMProps, FocusableProps, HelpTextProps, InputBase, LabelableProps, LoadingState, SingleSelection, SpectrumLabelableProps, SpectrumTextInputBase, StyleProps, TextInputBase, Validation} from '@react-types/shared';

export type MenuTriggerAction = 'focus' | 'input' | 'manual';

export interface CommandPaletteProps<T> extends CollectionBase<T>, Omit<SingleSelection, 'disallowEmptySelection'>, InputBase, TextInputBase, Validation, FocusableProps, LabelableProps, HelpTextProps {
  /** The list of CommandPalette items (uncontrolled). */
  defaultItems?: Iterable<T>,
  /** The list of CommandPalette items (controlled). */
  items?: Iterable<T>,
  /** Method that is called when the open state of the menu changes. Returns the new open state and the action that caused the opening of the menu. */
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void,
  /** The value of the CommandPalette input (controlled). */
  inputValue?: string,
  /** The default value of the CommandPalette input (uncontrolled). */
  defaultInputValue?: string,
  /** Handler that is called when the CommandPalette input value changes. */
  onInputChange?: (value: string) => void,
  /**
   * The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  name?: string
}

export interface AriaCommandPaletteProps<T> extends CommandPaletteProps<T>, DOMProps, AriaLabelingProps {
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean
}

export interface SpectrumCommandPaletteProps<T> extends SpectrumTextInputBase, Omit<AriaCommandPaletteProps<T>, 'menuTrigger'>, SpectrumLabelableProps, StyleProps, Omit<AsyncLoadable, 'isLoading'> {
  /** The current loading state of the CommandPalette. Determines whether or not the progress circle should be shown. */
  loadingState?: LoadingState
}
