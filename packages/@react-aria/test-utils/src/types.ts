/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export type Orientation = 'horizontal' | 'vertical';
export type Direction = 'ltr' | 'rtl';

// https://github.com/testing-library/dom-testing-library/issues/939#issuecomment-830771708 is an interesting way of allowing users to configure the timers
// curent way is like https://testing-library.com/docs/user-event/options/#advancetimers,
export interface UserOpts {
  /**
   * The interaction type (mouse, touch, keyboard) that the test util user will use when interacting with a component. This can be overridden
   * at the aria pattern tester level if needed.
   * @default mouse
   */
  interactionType?: 'mouse' | 'touch' | 'keyboard',
  // If using fake timers user should provide something like (time) => jest.advanceTimersByTime(time))}.
  // A real timer user would pass (waitTime) => new Promise((resolve) => setTimeout(resolve, waitTime))
  // Time is in ms.
  /**
   * A function used by the test utils to advance timers during interactions. Required for certain aria patterns (e.g. table). This can be overridden
   * at the aria pattern tester level if needed.
   */
  advanceTimer?: (time: number) => unknown | Promise<unknown>
}

export interface BaseTesterOpts extends UserOpts {
  /** @private */
  user?: any,
  /** The base element for the given tester (e.g. the table, menu trigger button, etc). */
  root: HTMLElement
}

export interface CheckboxGroupTesterOpts extends BaseTesterOpts {}

export interface ComboBoxTesterOpts extends BaseTesterOpts {
  /**
   * The base element for the combobox. If provided the wrapping element around the target combobox (as is the the case with a ref provided to RSP ComboBox),
   * will automatically search for the combobox element within.
   */
  root: HTMLElement,
  /**
   * The node of the combobox trigger button if any. If not provided, we will try to automatically use any button
   * within the `root` provided or that the `root` serves as the trigger.
   */
  trigger?: HTMLElement
}

export interface DialogTesterOpts extends BaseTesterOpts {
  /**
   * The trigger element for the dialog.
   */
  root: HTMLElement,
  /**
   * The overlay type of the dialog. Used to inform the tester how to find the dialog.
   */
  overlayType?: 'modal' | 'popover'
}

export interface GridListTesterOpts extends BaseTesterOpts {}

export interface ListBoxTesterOpts extends BaseTesterOpts {
  /**
   * A function used by the test utils to advance timers during interactions.
   */
  advanceTimer?: UserOpts['advanceTimer']
}

export interface MenuTesterOpts extends BaseTesterOpts {
  /**
   * The trigger element for the menu.
   */
  root: HTMLElement,
  /**
   * Whether the current menu is a submenu.
   */
  isSubmenu?: boolean,
  /**
   * The root menu of the menu tree. Only available if the menu is a submenu.
   */
  rootMenu?: HTMLElement
}

export interface RadioGroupTesterOpts extends BaseTesterOpts {
  /**
   * The horizontal layout direction, typically affected by locale.
   * @default 'ltr'
   */
  direction?: Direction
}

export interface SelectTesterOpts extends BaseTesterOpts {
  /**
   * The trigger element for the select. If provided the wrapping element around the target select (as is the case with a ref provided to RSP Select),
   * will automatically search for the select's trigger element within.
   */
  root: HTMLElement
}

export interface TableTesterOpts extends BaseTesterOpts {
  /**
   * A function used by the test utils to advance timers during interactions.
   */
  advanceTimer?: UserOpts['advanceTimer']
}

export interface TabsTesterOpts extends BaseTesterOpts {
  /**
   * The horizontal layout direction, typically affected by locale.
   * @default 'ltr'
   */
  direction?: Direction
}

export interface TreeTesterOpts extends BaseTesterOpts {
  /**
   * A function used by the test utils to advance timers during interactions.
   */
  advanceTimer?: UserOpts['advanceTimer']
}

export interface BaseGridRowInteractionOpts {
  /**
   * The index, text, or node of the row to target.
   */
  row: number | string | HTMLElement,
  /**
   * What interaction type to use when interacting with the row. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType']
}

export interface ToggleGridRowOpts extends BaseGridRowInteractionOpts {
  /**
   * Whether the row needs to be long pressed to be selected. Depends on the components implementation.
   */
  needsLongPress?: boolean,
  /**
   * Whether the checkbox should be used to select the row. If false, will attempt to select the row via press.
   * @default 'true'
   */
  checkboxSelection?: boolean,
  // TODO: this api feels a bit confusing tbh...
  /**
   * Whether the grid has a selectionBehavior of "toggle" or "replace" (aka highlight selection). This affects the user operations
   * required to toggle row selection by adding modifier keys during user actions, useful when performing multi-row selection in a "selectionBehavior: 'replace'" grid.
   * If you would like to still simulate user actions (aka press) without these modifiers keys for a "selectionBehavior: replace" grid, simply omit this option.
   * See the "Selection Behavior" section of the appropriate React Aria Component docs for more information (e.g. https://react-spectrum.adobe.com/react-aria/Tree.html#selection-behavior).
   *
   * @default 'toggle'
   */
  selectionBehavior?: 'toggle' | 'replace'
}

export interface GridRowActionOpts extends BaseGridRowInteractionOpts {
  /**
   * Whether or not the row needs a double click to trigger the row action. Depends on the components implementation.
   */
  needsDoubleClick?: boolean
}
