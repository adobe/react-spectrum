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
import {UserOpts} from './user';

interface ComboBoxOptions extends UserOpts {
  user: any
}
// TODO: Probably should set up some base classes to reduce duplication of this setup (user/interactiontype)
// advanceTimer isn't used in all places
export class ComboBoxTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _combobox: HTMLElement | undefined;
  private _trigger: HTMLElement | undefined;

  constructor(opts: ComboBoxOptions) {
    this.user = opts.user;
    this._interactionType = opts.interactionType || 'mouse';
  }

  setElement = (element: HTMLElement) => {
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
  };

  // TODO: This is for if user need to directly set the trigger button element (aka the element provided in setElement was the combobox input or the trigger is somewhere unexpected)
  setTrigger = (element: HTMLElement) => {
    this._trigger = element;
  };

  setInteractionType = (type: UserOpts['interactionType']) => {
    this._interactionType = type;
  };

  open = async (opts: {triggerBehavior?: 'focus' | 'manual'} = {}) => {
    let {triggerBehavior = 'manual'} = opts;
    let trigger = this.getTrigger();
    let combobox = this.getCombobox();
    let isDisabled = trigger.hasAttribute('disabled');

    if (this._interactionType === 'mouse') {
      if (triggerBehavior === 'focus') {
        await this.user.click(combobox);
      } else {
        await this.user.click(trigger);
      }
    } else if (this._interactionType === 'keyboard' && this._trigger != null) {
      act(() => this._trigger!.focus());
      if (triggerBehavior !== 'focus') {
        await this.user.keyboard('{ArrowDown}');
      }
    } else if (this._interactionType === 'touch') {
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
  };

  selectOption = async (opts: {option?: HTMLElement, optionText?: string, triggerBehavior?: 'focus' | 'manual'} = {}) => {
    let {optionText, option, triggerBehavior} = opts;
    if (!this.getCombobox().getAttribute('aria-controls')) {
      await this.open({triggerBehavior});
    }

    let listbox = this.getListbox();
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
  };

  close = async () => {
    let listbox = this.getListbox();
    if (listbox) {
      act(() => this.getCombobox().focus());
      await this.user.keyboard('[Escape]');

      await waitFor(() => {
        if (document.contains(listbox)) {
          throw new Error('Expected listbox element to not be in the document after selecting an option');
        } else {
          return true;
        }
      });
    }
  };

  getCombobox = () => {
    if (!this._combobox) {
      throw new Error('Combobox input element hasn\'t been set yet. Did you call `setElement()` yet?');
    }

    return this._combobox;
  };

  getTrigger = () => {
    if (!this._trigger) {
      throw new Error('Combobox trigger element hasn\'t been set yet. Did you call `setElement()` or `setTrigger()` yet?');
    }

    return this._trigger;
  };

  getListbox = () => {
    let listBoxId = this.getCombobox().getAttribute('aria-controls');
    return listBoxId ? document.getElementById(listBoxId) || undefined : undefined;
  };

  getOptions = (opts: {element?: HTMLElement} = {}): HTMLElement[] | never[] => {
    let {element} = opts;
    element = element || this.getListbox();
    let options = [];
    if (element) {
      options = within(element).queryAllByRole('option');
    }

    return options;
  };

  getSections = () => {
    let listbox = this.getListbox();
    if (listbox) {
      return within(listbox).queryAllByRole('group');
    } else {
      return [];
    }
  };

  getFocusedOption = () =>  {
    let focusedOptionId = this.getCombobox().getAttribute('aria-activedescendant');
    return focusedOptionId ? document.getElementById(focusedOptionId) : undefined;
  };
}
