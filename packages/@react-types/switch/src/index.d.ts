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

import {AriaLabelingProps, FocusableDOMProps, FocusableProps, InputBase, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

interface SwitchBase extends InputBase, FocusableProps {
  /**
   * The content to render as the Switch's label.
   */
  children?: ReactNode,
  /**
   * Whether the Switch should be selected (uncontrolled).
   */
  defaultSelected?: boolean,
  /**
   * Whether the Switch should be selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler that is called when the Switch's selection state changes.
   */
  onChange?: (isSelected: boolean) => void,
  /**
   * The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string,
  /**
   * The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  name?: string
}
export interface SwitchProps extends SwitchBase {}
export interface AriaSwitchBase extends SwitchBase, FocusableDOMProps, AriaLabelingProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  'aria-controls'?: string
}
export interface AriaSwitchProps extends SwitchProps, AriaSwitchBase {}

export interface SpectrumSwitchProps extends AriaSwitchProps, StyleProps {
  /**
   * This prop sets the emphasized style which provides visual prominence.
   */
  isEmphasized?: boolean
}
