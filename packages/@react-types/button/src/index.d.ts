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

import {AriaLabelingProps, FocusableDOMProps, FocusableProps, Key, PressEvents, StyleProps} from '@react-types/shared';
import {ElementType, JSXElementConstructor, ReactNode} from 'react';

interface ButtonProps extends PressEvents, FocusableProps {
  /** Whether the button is disabled. */
  isDisabled?: boolean,
  /** The content to display in the button. */
  children?: ReactNode
}

interface ToggleButtonProps extends ButtonProps {
  /** Whether the element should be selected (controlled). */
  isSelected?: boolean,
  /** Whether the element should be selected (uncontrolled). */
  defaultSelected?: boolean,
  /** Handler that is called when the element's selection state changes. */
  onChange?: (isSelected: boolean) => void
}

export interface AriaButtonElementTypeProps<T extends ElementType = 'button'> {
  /**
   * The HTML element or React element used to render the button, e.g. 'div', 'a', or `RouterLink`.
   * @default 'button'
   */
  elementType?: T | JSXElementConstructor<any>
}

export interface LinkButtonProps<T extends ElementType = 'button'> extends AriaButtonElementTypeProps<T> {
  /** A URL to link to if elementType="a". */
  href?: string,
  /** The target window for the link. */
  target?: string,
  /** The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). */
  rel?: string
}

interface AriaBaseButtonProps extends FocusableDOMProps, AriaLabelingProps {
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  'aria-expanded'?: boolean | 'true' | 'false',
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | 'true' | 'false',
  /** Identifies the element (or elements) whose contents or presence are controlled by the current element. */
  'aria-controls'?: string,
  /** Indicates the current "pressed" state of toggle buttons. */
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed',
  /** Indicates whether this element represents the current item within a container or set of related elements. */
  'aria-current'?: boolean | 'true' | 'false' | 'page' | 'step' | 'location' | 'date' | 'time',
  /**
   * The behavior of the button when used in an HTML form.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset',
  /**
   * Whether to prevent focus from moving to the button when pressing it.
   *
   * Caution, this can make the button inaccessible and should only be used when alternative keyboard interaction is provided,
   * such as ComboBox's MenuTrigger or a NumberField's increment/decrement control.
   */
  preventFocusOnPress?: boolean
}

export interface AriaButtonProps<T extends ElementType = 'button'> extends ButtonProps, LinkButtonProps<T>, AriaBaseButtonProps {}
export interface AriaToggleButtonProps<T extends ElementType = 'button'> extends ToggleButtonProps, Omit<AriaBaseButtonProps, 'aria-current'>, AriaButtonElementTypeProps<T> {}
export interface AriaToggleButtonGroupItemProps<E extends ElementType = 'button'> extends Omit<AriaToggleButtonProps<E>, 'id' | 'isSelected' | 'defaultSelected' | 'onChange'> {
  /** An identifier for the item in the `selectedKeys` of a ToggleButtonGroup. */
  id: Key
}

/** @deprecated */
type LegacyButtonVariant = 'cta' | 'overBackground';
export interface SpectrumButtonProps<T extends ElementType = 'button'> extends AriaBaseButtonProps, ButtonProps, LinkButtonProps<T>, StyleProps {
  /** The [visual style](https://spectrum.adobe.com/page/button/#Options) of the button. */
  variant: 'accent' | 'primary' | 'secondary' | 'negative' | LegacyButtonVariant,
  /** The background style of the button. */
  style?: 'fill' | 'outline',
  /** The static color style to apply. Useful when the button appears over a color background. */
  staticColor?: 'white' | 'black',
  /**
   * Whether to disable events immediately and display a loading spinner after a 1 second delay.
   */
  isPending?: boolean,
  /**
   * Whether the button should be displayed with a quiet style.
   * @deprecated
   */
  isQuiet?: boolean
}

export interface SpectrumActionButtonProps extends AriaBaseButtonProps, ButtonProps, StyleProps {
  /** Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). */
  isQuiet?: boolean,
  /** The static color style to apply. Useful when the button appears over a color background. */
  staticColor?: 'white' | 'black'
}

export interface SpectrumLogicButtonProps extends AriaBaseButtonProps, ButtonProps, StyleProps {
  /** The type of boolean sequence to be represented by the LogicButton. */
  variant: 'and' | 'or'
}

export interface SpectrumToggleButtonProps extends ToggleButtonProps, Omit<SpectrumActionButtonProps, 'aria-current'> {
  /** Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  isEmphasized?: boolean
}
