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

import {
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  FocusEvents,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  Orientation,
  PressEvents,
  SpectrumHelpTextProps,
  SpectrumLabelableProps,
  StyleProps,
  Validation,
  ValueBase
} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface ToggleStateOptions extends InputBase {
  /**
   * Whether the element should be selected (uncontrolled).
   */
  defaultSelected?: boolean,
  /**
   * Whether the element should be selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void
}

export interface ToggleProps extends ToggleStateOptions, Validation<boolean>, FocusableProps {
  /**
   * The label for the element.
   */
  children?: ReactNode,
  /**
   * The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string
}

export interface AriaToggleProps extends ToggleProps, FocusableDOMProps, AriaLabelingProps, AriaValidationProps, InputDOMProps, PressEvents {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  'aria-controls'?: string
}

export interface CheckboxGroupProps extends ValueBase<string[]>, Pick<InputDOMProps, 'name'>, InputBase, LabelableProps, HelpTextProps, Validation<string[]> {}

export interface CheckboxProps extends ToggleProps {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean
}

export interface AriaCheckboxProps extends CheckboxProps, InputDOMProps, AriaToggleProps {}

export interface AriaCheckboxGroupProps extends CheckboxGroupProps, InputDOMProps, DOMProps, AriaLabelingProps, AriaValidationProps, FocusEvents {}

export interface AriaCheckboxGroupItemProps extends Omit<AriaCheckboxProps, 'isSelected' | 'defaultSelected'> {
  value: string
}

export interface SpectrumCheckboxProps extends Omit<AriaCheckboxProps, 'onClick'>, StyleProps {
  /**
   * This prop sets the emphasized style which provides visual prominence.
   */
  isEmphasized?: boolean,
  /**
   * A slot name for the component. Slots allow the component to receive props from a parent component.
   * An explicit `null` value indicates that the local props completely override all props received from a parent.
   * @private
   */
  slot?: string | null
}

export interface SpectrumCheckboxGroupProps extends AriaCheckboxGroupProps, SpectrumLabelableProps, Validation<string[]>, StyleProps, SpectrumHelpTextProps {
  /**
   * The Checkboxes contained within the CheckboxGroup.
   */
  children: ReactElement<CheckboxProps> | ReactElement<CheckboxProps>[],
  /**
   * The axis the checkboxes should align with.
   * @default 'vertical'
   */
  orientation?: Orientation,
  /**
   * By default, checkboxes are not emphasized (gray).
   * The emphasized (blue) version provides visual prominence.
   */
  isEmphasized?: boolean
}
