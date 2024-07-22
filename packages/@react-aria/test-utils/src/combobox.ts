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

type InteractionType = 'mouse' | 'touch' | 'keyboard'

interface ComboBoxOptions {
  user: any,
  interactionType?: InteractionType
}
export class ComboBoxTester {
  private user;
  private _interactionType: InteractionType;
  private _combobox: HTMLElement;
  private _trigger: HTMLElement;

  constructor(opts: ComboBoxOptions) {
    this.user = opts.user;
    this._interactionType = opts.interactionType || 'mouse';
  }

  setElement(element: HTMLElement) {
    this._combobox = element;
    // Handle case where element provided is a wrapper around the combobox
    let combobox = within(element).queryByRole('combobox');
    if (combobox) {
      this._combobox = combobox;
    }

    let trigger = within(element).queryByRole('button', {hidden: true});
    if (trigger) {
      this._trigger = trigger;
    }
    // TODO: how to find button if user doesn't provide an element that wraps both of them? Perhaps
    // have a setTrigger?
  }

  setInteractionType(type: InteractionType) {
    this._interactionType = type;
  }

  async setText(opts: {text: string}) {
    let {text} = opts;

    if (!this._combobox) {
      throw new Error('Combobox element hasn\'t beeen set yet, please call setElement(element) to set which combobox to target.');
    }

    act(() => this._combobox.focus());
    await this.user.keyboard(text);
  }

  async open(opts: {triggerBehavior?: 'focus' | 'manual'}) {
    let {triggerBehavior} = opts;

    if (this._interactionType === 'mouse') {
      if (triggerBehavior === 'focus') {
        await this.user.click(this.combobox);
      } else {
        await this.user.click(this.trigger);
      }
    } else if (this._interactionType === 'keyboard') {
      act(() => this._trigger.focus());
      if (triggerBehavior !== 'focus') {
        await this.user.keyboard('{ArrowDown}');
      }
    } else if (this._interactionType === 'touch') {
      if (triggerBehavior === 'focus') {
        // TODO: add long press support once I figure out how to make it generic and not specific to jest
        await this.user.pointer({target: this.combobox, keys: '[TouchA]'});
      } else {
        await this.user.pointer({target: this.trigger, keys: '[TouchA]'});
      }
    }

    await waitFor(() => {
      if (this.combobox.getAttribute('aria-controls') == null) {
        throw new Error('No aria-controls found on combobox trigger element.');
      } else {
        return true;
      }
    });
    let listBoxId = this.combobox.getAttribute('aria-controls');
    await waitFor(() => {
      if (!listBoxId || document.getElementById(listBoxId) == null) {
        throw new Error(`Listbox with id of ${listBoxId} not found in document.`);
      } else {
        return true;
      }
    });
  }

  async selectOption(opts: {option?: HTMLElement, optionText?: string, triggerBehavior?: 'focus' | 'manual'}) {
    let {optionText, option, triggerBehavior} = opts;
    if (!this.combobox.getAttribute('aria-controls')) {
      await this.open({triggerBehavior});
    }

    let listbox = this.listbox;
    if (listbox) {
      if (!option && optionText) {
        option = within(listbox).getByText(optionText);
      }

      // TODO: keyboard method of selecting the the option is a bit tricky unless I simply simulate the user pressing the down arrow
      // the required amount of times to reach the option. For now just click the option even in keyboard mode
      if (this._interactionType === 'mouse' || this._interactionType === 'keyboard') {
        await this.user.click(option);
      } else {
        await this.user.pointer({target: option, keys: '[TouchA]'});
      }

      if (option && option.getAttribute('href') == null) {
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

  get combobox() {
    if (!this._combobox) {
      throw new Error('Combobox input element hasn\'t been set yet. Did you call `setElement()` yet?');
    }

    return this._combobox;
  }

  get trigger() {
    if (!this._trigger) {
      throw new Error('Combobox trigger element hasn\'t been set yet. Did you call `setElement()` yet?');
    }

    return this._trigger;
  }

  get listbox() {
    let listBoxId = this._combobox.getAttribute('aria-controls');
    return listBoxId ? document.getElementById(listBoxId) : undefined;
  }

  get options(): HTMLElement[] | never[] {
    let listbox = this.listbox;
    let options = [];
    if (listbox) {
      options = within(listbox).queryAllByRole('option');
    }

    return options;
  }

  get sections() {
    let listbox = this.listbox;
    if (listbox) {
      return within(listbox).queryAllByRole('group');
    } else {
      return [];
    }
  }
}
