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

import {act, waitFor, within} from '@testing-library/react';
import {ComboBoxTesterOpts, UserOpts} from './types';

interface ComboBoxOpenOpts {
  /**
   * Whether the combobox opens on focus or needs to be manually opened via user action.
   * @default 'manual'
   */
  triggerBehavior?: 'focus' | 'manual',
  /**
   * What interaction type to use when opening the combobox. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType']
}

interface ComboBoxSelectOpts extends ComboBoxOpenOpts {
  /**
   * The index, text, or node of the option to select. Option nodes can be sourced via `options()`.
   */
  option: number | string | HTMLElement
}

export class ComboBoxTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _combobox: HTMLElement;
  private _trigger: HTMLElement;

  constructor(opts: ComboBoxTesterOpts) {
    let {root, trigger, user, interactionType} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';

    // Handle case where element provided is a wrapper around the combobox. The expectation is that the user at least uses a ref/data attribute to
    // query their combobox/combobox wrapper (in the case of RSP) which they then pass to thhis
    this._combobox = root;
    let combobox = within(root).queryByRole('combobox');
    if (combobox) {
      this._combobox = combobox;
    }

    // This is for if user need to directly set the trigger button element (aka the element provided in setElement was the combobox input or the trigger is somewhere unexpected)
    if (trigger) {
      this._trigger = trigger;
    } else {
      let trigger = within(root).queryByRole('button', {hidden: true});
      if (trigger) {
        this._trigger = trigger;
      } else {
        // For cases like https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/ where the combobox
        // is also the trigger button
        this._trigger = this._combobox;
      }
    }
  }

  /**
   * Set the interaction type used by the combobox tester.
   */
  setInteractionType(type: UserOpts['interactionType']) {
    this._interactionType = type;
  }

  /**
   * Opens the combobox dropdown. Defaults to using the interaction type set on the combobox tester.
   */
  async open(opts: ComboBoxOpenOpts = {}) {
    let {triggerBehavior = 'manual', interactionType = this._interactionType} = opts;
    let trigger = this.trigger;
    let combobox = this.combobox;
    let isDisabled = trigger!.hasAttribute('disabled');

    if (interactionType === 'mouse') {
      if (triggerBehavior === 'focus') {
        await this.user.click(combobox);
      } else {
        await this.user.click(trigger);
      }
    } else if (interactionType === 'keyboard' && this._trigger != null) {
      act(() => this._trigger!.focus());
      if (triggerBehavior !== 'focus') {
        await this.user.keyboard('{ArrowDown}');
      }
    } else if (interactionType === 'touch') {
      if (triggerBehavior === 'focus') {
        await this.user.pointer({target: combobox, keys: '[TouchA]'});
      } else {
        await this.user.pointer({target: trigger, keys: '[TouchA]'});
      }
    }

    await waitFor(() => {
      if (!isDisabled && combobox.getAttribute('aria-controls') == null) {
        throw new Error('No aria-controls found on combobox trigger element.');
      } else {
        return true;
      }
    });
    let listBoxId = combobox.getAttribute('aria-controls');
    await waitFor(() => {
      if (!isDisabled && (!listBoxId || document.getElementById(listBoxId) == null)) {
        throw new Error(`Listbox with id of ${listBoxId} not found in document.`);
      } else {
        return true;
      }
    });
  }

  /**
   * Returns an option matching the specified index or text content.
   */
  findOption(opts: {optionIndexOrText: number | string}): HTMLElement {
    let {
      optionIndexOrText
    } = opts;

    let option;
    let options = this.options();
    let listbox = this.listbox;

    if (typeof optionIndexOrText === 'number') {
      option = options[optionIndexOrText];
    } else if (typeof optionIndexOrText === 'string' && listbox != null) {
      option = (within(listbox!).getByText(optionIndexOrText).closest('[role=option]'))! as HTMLElement;
    }

    return option;
  }

  /**
   * Selects the desired combobox option. Defaults to using the interaction type set on the combobox tester. If necessary, will open the combobox dropdown beforehand.
   * The desired option can be targeted via the option's node, the option's text, or the option's index.
   */
  async selectOption(opts: ComboBoxSelectOpts) {
    let {option, triggerBehavior, interactionType = this._interactionType} = opts;
    if (!this.combobox.getAttribute('aria-controls')) {
      await this.open({triggerBehavior});
    }

    let listbox = this.listbox;
    if (!listbox) {
      throw new Error('Combobox\'s listbox not found.');
    }

    if (listbox) {
      if (typeof option === 'string' || typeof option === 'number') {
        option = this.findOption({optionIndexOrText: option});
      }

      if (!option) {
        throw new Error('Target option not found in the listbox.');
      }

      // TODO: keyboard method of selecting the the option is a bit tricky unless I simply simulate the user pressing the down arrow
      // the required amount of times to reach the option. For now just click the option even in keyboard mode
      if (interactionType === 'mouse' || interactionType === 'keyboard') {
        await this.user.click(option);
      } else {
        await this.user.pointer({target: option, keys: '[TouchA]'});
      }

      if (option.getAttribute('href') == null) {
        await waitFor(() => {
          if (document.contains(listbox)) {
            throw new Error('Expected listbox element to not be in the document after selecting an option');
          } else {
            return true;
          }
        });
      }
    } else {
      throw new Error("Attempted to select a option in the combobox, but the listbox wasn't found.");
    }
  }

  /**
   * Closes the combobox dropdown.
   */
  async close() {
    let listbox = this.listbox;
    if (listbox) {
      act(() => this.combobox.focus());
      await this.user.keyboard('[Escape]');

      await waitFor(() => {
        if (document.contains(listbox)) {
          throw new Error('Expected listbox element to not be in the document after selecting an option');
        } else {
          return true;
        }
      });
    }
  }

  /**
   * Returns the combobox.
   */
  get combobox(): HTMLElement {
    return this._combobox;
  }

  /**
   * Returns the combobox trigger button.
   */
  get trigger(): HTMLElement {
    return this._trigger;
  }

  /**
   * Returns the combobox's listbox if present.
   */
  get listbox(): HTMLElement | null {
    let listBoxId = this.combobox.getAttribute('aria-controls');
    return listBoxId ? document.getElementById(listBoxId) || null : null;
  }

  /**
   * Returns the combobox's sections if present.
   */
  get sections(): HTMLElement[] {
    let listbox = this.listbox;
    return listbox ? within(listbox).queryAllByRole('group') : [];
  }

  /**
   * Returns the combobox's options if present. Can be filtered to a subsection of the listbox if provided via `element`.
   */
  options(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.listbox} = opts;
    let options = [];
    if (element) {
      options = within(element).queryAllByRole('option');
    }

    return options;
  }

  /**
   * Returns the currently focused option in the combobox's dropdown if any.
   */
  get focusedOption(): HTMLElement | null {
    let focusedOptionId = this.combobox.getAttribute('aria-activedescendant');
    return focusedOptionId ? document.getElementById(focusedOptionId) : null;
  }
}
