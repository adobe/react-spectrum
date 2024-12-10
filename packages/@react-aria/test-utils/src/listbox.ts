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

import {act, fireEvent, within} from '@testing-library/react';
import {ListboxTesterOpts, UserOpts} from './types';
import {pressElement, triggerLongPress} from './events';

// TODO: write docs, use in tests

interface ListboxToggleOptionOpts {
  /**
   * What interaction type to use when toggling selection for an option. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType'],
  /**
   * The index, text, or node of the option to toggle selection for.
   */
  option: number | string | HTMLElement,
  /**
   * Whether the option should be triggered by Space or Enter in keyboard modality.
   * @default 'Enter'
   */
  keyboardActivation?: 'Space' | 'Enter',
  /**
   * Whether the option needs to be long pressed to be selected. Depends on the listbox's implementation.
   */
  needsLongPress?: boolean
}

interface ListboxOptionActionOpts extends Omit<ListboxToggleOptionOpts, 'keyboardActivation' | 'needsLongPress'> {
  /**
   * Whether or not the option needs a double click to trigger the option action. Depends on the listbox's implementation.
   */
  needsDoubleClick?: boolean
}

export class ListboxTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _listbox: HTMLElement;

  constructor(opts: ListboxTesterOpts) {
    let {root, user, interactionType} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._listbox = root;
    this._advanceTimer = advanceTimer;
  }

  /**
   * Set the interaction type used by the listbox tester.
   */
  setInteractionType(type: UserOpts['interactionType']) {
    this._interactionType = type;
  }

  // TODO: now that we have listbox, perhaps select can make use of this tester internally
  /**
   * Returns a option matching the specified index or text content.
   */
  findOption(opts: {optionIndexOrText: number | string}): HTMLElement {
    let {
      optionIndexOrText
    } = opts;

    let option;
    let options = this.options();

    if (typeof optionIndexOrText === 'number') {
      option = options[optionIndexOrText];
    } else if (typeof optionIndexOrText === 'string') {
      option = (within(this.listbox!).getByText(optionIndexOrText).closest('[role=option]'))! as HTMLElement;
    }

    return option;
  }

  // TODO: this is basically the same as menu except for the error message, refactor later so that they share
  private async keyboardNavigateToOption(opts: {option: HTMLElement}) {
    let {option} = opts;
    let options = this.options();
    let targetIndex = options.indexOf(option);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the listbox');
    }
    if (document.activeElement === this._listbox) {
      await this.user.keyboard('[ArrowDown]');
    }
    let currIndex = options.indexOf(document.activeElement as HTMLElement);
    if (targetIndex === -1) {
      throw new Error('ActiveElement is not in the listbox');
    }
    let direction = targetIndex > currIndex ? 'down' : 'up';

    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
  };

  // TODO: may need to support long press for touch for certain configurations
  /**
   * Toggles the selection for the specified listbox option. Defaults to using the interaction type set on the listbox tester.
   */
  async toggleOptionSelection(opts: ListboxToggleOptionOpts) {
    let {option, needsLongPress, keyboardActivation, interactionType = this._interactionType} = opts;

    if (typeof option === 'string' || typeof option === 'number') {
      option = this.findOption({optionIndexOrText: option});
    }

    if (!option) {
      throw new Error('Target option not found in the menu.');
    }

    if (interactionType === 'keyboard') {
      if (document.activeElement !== this._listbox || !this._listbox.contains(document.activeElement)) {
        act(() => this._listbox.focus());
      }

      await this.keyboardNavigateToOption({option});
      await this.user.keyboard(`[${keyboardActivation}]`);
    } else {

      if (needsLongPress && interactionType === 'touch') {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }

        // Note that long press interactions with rows is strictly touch only for grid rows
        await triggerLongPress({element: option, advanceTimer: this._advanceTimer, pointerOpts: {pointerType: 'touch'}});
        // TODO: see if we need this for listbox, was needed for table
        await fireEvent.click(option);
      } else {
        await pressElement(this.user, option, interactionType);
      }
    }
  }

  /**
   * Triggers the action for the specified listbox option. Defaults to using the interaction type set on the menu tester.
   */
  async triggerOptionAction(opts: ListboxOptionActionOpts) {
    let {
      option,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof option === 'string' || typeof option === 'number') {
      option = this.findOption({optionIndexOrText: option});
    }

    if (!option) {
      throw new Error('Target option not found in the listbox.');
    }

    if (needsDoubleClick) {
      await this.user.dblClick(option);
    } else if (interactionType === 'keyboard') {
      if (document.activeElement !== this._listbox || !this._listbox.contains(document.activeElement)) {
        act(() => this._listbox.focus());
      }

      await this.keyboardNavigateToOption({option});
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, option, interactionType);
    }
  }

  /**
   * Returns the listbox.
   */
  get listbox(): HTMLElement {
    return this._listbox;
  }

  /**
   * Returns the listbox options. Can be filtered to a subsection of the listbox if provided via `element`.
   */
  options(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this._listbox} = opts;
    let options = [];
    if (element) {
      options = within(element).queryAllByRole('option');
    }

    return options;
  }

  /**
   * Returns the listbox's selected options if any.
   */
  get selectedOptions(): HTMLElement[] {
    return this.options().filter(row => row.getAttribute('aria-selected') === 'true');
  }

  /**
   * Returns the listbox's sections if any.
   */
  get sections(): HTMLElement[] {
    return within(this._listbox).queryAllByRole('group');
  }
}
