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

import {act, within} from '@testing-library/react';
import {getAltKey, getMetaKey, pressElement, triggerLongPress} from './events';
import {ListBoxTesterOpts, UserOpts} from './types';

interface ListBoxToggleOptionOpts {
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
  needsLongPress?: boolean,
  /**
   * Whether the listbox has a selectionBehavior of "toggle" or "replace" (aka highlight selection). This affects the user operations
   * required to toggle option selection by adding modifier keys during user actions, useful when performing multi-option selection in a "selectionBehavior: 'replace'" listbox.
   * If you would like to still simulate user actions (aka press) without these modifiers keys for a "selectionBehavior: replace" listbox, simply omit this option.
   * See the [RAC Listbox docs](https://react-spectrum.adobe.com/react-aria/ListBox.html#selection-behavior) for more info on this behavior.
   *
   * @default 'toggle'
   */
    selectionBehavior?: 'toggle' | 'replace'
}

interface ListBoxOptionActionOpts extends Omit<ListBoxToggleOptionOpts, 'keyboardActivation' | 'needsLongPress'> {
  /**
   * Whether or not the option needs a double click to trigger the option action. Depends on the listbox's implementation.
   */
  needsDoubleClick?: boolean
}

export class ListBoxTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _listbox: HTMLElement;

  constructor(opts: ListBoxTesterOpts) {
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._listbox = root;
    this._advanceTimer = advanceTimer;
  }

  /**
   * Set the interaction type used by the listbox tester.
   */
  setInteractionType(type: UserOpts['interactionType']): void {
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
  // TODO: this also doesn't support grid layout yet
  private async keyboardNavigateToOption(opts: {option: HTMLElement, selectionOnNav?: 'default' | 'none'}) {
    let {option, selectionOnNav = 'default'} = opts;
    let altKey = getAltKey();
    let options = this.options();
    let targetIndex = options.indexOf(option);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the listbox');
    }

    if (document.activeElement !== this._listbox && !this._listbox.contains(document.activeElement)) {
      act(() => this._listbox.focus());
      await this.user.keyboard(`${selectionOnNav === 'none' ? `[${altKey}>]` : ''}[ArrowDown]${selectionOnNav === 'none' ? `[/${altKey}]` : ''}`);
    }

    let currIndex = options.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the listbox');
    }

    let direction = targetIndex > currIndex ? 'down' : 'up';
    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[${altKey}>]`);
    }
    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[/${altKey}]`);
    }
  };

  /**
   * Toggles the selection for the specified listbox option. Defaults to using the interaction type set on the listbox tester.
   */
  async toggleOptionSelection(opts: ListBoxToggleOptionOpts): Promise<void> {
    let {
      option,
      needsLongPress,
      keyboardActivation = 'Enter',
      interactionType = this._interactionType,
      selectionBehavior = 'toggle'
    } = opts;

    let altKey = getAltKey();
    let metaKey = getMetaKey();

    if (typeof option === 'string' || typeof option === 'number') {
      option = this.findOption({optionIndexOrText: option});
    }

    if (!option) {
      throw new Error('Target option not found in the listbox.');
    }

    if (interactionType === 'keyboard') {
      if (option?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      await this.keyboardNavigateToOption({option, selectionOnNav: selectionBehavior === 'replace' ? 'none' : 'default'});
      if (selectionBehavior === 'replace') {
        await this.user.keyboard(`[${altKey}>]`);
      }
      await this.user.keyboard(`[${keyboardActivation}]`);
      if (selectionBehavior === 'replace') {
        await this.user.keyboard(`[/${altKey}]`);
      }
    } else {
      if (needsLongPress && interactionType === 'touch') {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }

        await triggerLongPress({element: option, advanceTimer: this._advanceTimer, pointerOpts: {pointerType: 'touch'}});
      } else {
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[${metaKey}>]`);
        }
        await pressElement(this.user, option, interactionType);
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[/${metaKey}]`);
        }
      }
    }
  }

  /**
   * Triggers the action for the specified listbox option. Defaults to using the interaction type set on the listbox tester.
   */
  async triggerOptionAction(opts: ListBoxOptionActionOpts): Promise<void> {
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
      if (option?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      await this.keyboardNavigateToOption({option, selectionOnNav: 'none'});
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
