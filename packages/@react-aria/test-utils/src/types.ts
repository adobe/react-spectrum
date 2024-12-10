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

// https://github.com/testing-library/dom-testing-library/issues/939#issuecomment-830771708 is an interesting way of allowing users to configure the timers
// curent way is like https://testing-library.com/docs/user-event/options/#advancetimers,
export interface UserOpts {
  /**
   * The interaction type (mouse, touch, keyboard) that the test util user will use when interacting with a component. This can be overridden
   * at the aria pattern tester level if needed.
   * @default mouse
   */
  interactionType?: 'mouse' | 'touch' | 'keyboard',
  // If using fake timers user should provide something like (time) => jest.advanceTimersByTime(time))}
  // A real timer user would pass async () => await new Promise((resolve) => setTimeout(resolve, waitTime))
  // Time is in ms.
  /**
   * A function used by the test utils to advance timers during interactions. Required for certain aria patterns (e.g. table). This can be overridden
   * at the aria pattern tester level if needed.
   */
  advanceTimer?: (time?: number) => void | Promise<unknown>
}

export interface BaseTesterOpts extends UserOpts {
  /** @private */
  user: any,
  /** The base element for the given tester (e.g. the table, menu trigger button, etc). */
  root: HTMLElement
}

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

export interface GridListTesterOpts extends BaseTesterOpts {}

export interface ListboxTesterOpts extends BaseTesterOpts {
  /**
   * A function used by the test utils to advance timers during interactions.
   */
  advanceTimer: UserOpts['advanceTimer']
}

export interface MenuTesterOpts extends BaseTesterOpts {
  /**
   * The trigger element for the menu.
   */
  root: HTMLElement,
  /**
   * Whether the current menu is a submenu.
   */
  isSubmenu?: boolean
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
  advanceTimer: UserOpts['advanceTimer']
}
