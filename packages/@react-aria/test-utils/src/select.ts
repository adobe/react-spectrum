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
import {SelectTesterOpts, UserOpts} from './types';

interface SelectOpenOpts {
  /**
   * What interaction type to use when opening the select. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType']
}

interface SelectTriggerOptionOpts extends SelectOpenOpts {
  /**
   * The index, text, or node of the option to select. Option nodes can be sourced via `options()`.
   */
  option: number | string | HTMLElement
}

export class SelectTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _trigger: HTMLElement;

  constructor(opts: SelectTesterOpts) {
    let {root, user, interactionType} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    // Handle case where the wrapper element is provided rather than the Select's button (aka RAC)
    let triggerButton = within(root).queryByRole('button');
    if (triggerButton == null) {
      triggerButton = root;
    }
    this._trigger = triggerButton;
  }
  /**
   * Set the interaction type used by the select tester.
   */
  setInteractionType(type: UserOpts['interactionType']) {
    this._interactionType = type;
  }

  /**
   * Opens the select. Defaults to using the interaction type set on the select tester.
   */
  async open(opts: SelectOpenOpts = {}) {
    let {
      interactionType = this._interactionType
    } = opts;
    let trigger = this.trigger;
    let isDisabled = trigger.hasAttribute('disabled');

    if (interactionType === 'mouse') {
      await this.user.click(this._trigger);
    } else if (interactionType === 'keyboard') {
      act(() => trigger.focus());
      await this.user.keyboard('[Enter]');
    } else if (interactionType === 'touch') {
      await this.user.pointer({target: this._trigger, keys: '[TouchA]'});
    }

    await waitFor(() => {
      if (!isDisabled && trigger.getAttribute('aria-controls') == null) {
        throw new Error('No aria-controls found on select element trigger.');
      } else {
        return true;
      }
    });
    let listBoxId = trigger.getAttribute('aria-controls');
    await waitFor(() => {
      if (!isDisabled && (!listBoxId || document.getElementById(listBoxId) == null)) {
        throw new Error(`ListBox with id of ${listBoxId} not found in document.`);
      } else {
        return true;
      }
    });
  }

  /**
   * Closes the select.
   */
  async close() {
    let listbox = this.listbox;
    if (listbox) {
      act(() => listbox.focus());
      await this.user.keyboard('[Escape]');
    }

    await waitFor(() => {
      if (document.activeElement !== this._trigger) {
        throw new Error(`Expected the document.activeElement after closing the select dropdown to be the select component trigger but got ${document.activeElement}`);
      } else {
        return true;
      }
    });

    if (listbox && document.contains(listbox)) {
      throw new Error('Expected the select element listbox to not be in the document after closing the dropdown.');
    }
  }

  /**
   * Returns a option matching the specified index or text content.
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

  private async keyboardNavigateToOption(opts: {option: HTMLElement}) {
    let {option} = opts;
    let options = this.options();
    let targetIndex = options.indexOf(option);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the listbox');
    }
    if (document.activeElement === this.listbox) {
      await this.user.keyboard('[ArrowDown]');
    }
    let currIndex = options.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the listbox');
    }
    let direction = targetIndex > currIndex ? 'down' : 'up';

    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
  };

  /**
   * Selects the desired select option. Defaults to using the interaction type set on the select tester. If necessary, will open the select dropdown beforehand.
   * The desired option can be targeted via the option's node, the option's text, or the option's index.
   */
  async selectOption(opts: SelectTriggerOptionOpts) {
    let {
      option,
      interactionType = this._interactionType
    } = opts || {};
    let trigger = this.trigger;
    if (!trigger.getAttribute('aria-controls')) {
      await this.open();
    }
    let listbox = this.listbox;
    if (!listbox) {
      throw new Error('Select\'s listbox not found.');
    }

    if (listbox) {
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

        if (document.activeElement !== listbox || !listbox.contains(document.activeElement)) {
          act(() => listbox.focus());
        }
        await this.keyboardNavigateToOption({option});
        await this.user.keyboard('[Enter]');
      } else {
        // TODO: what if the user needs to scroll the list to find the option? What if there are multiple matches for text (hopefully the picker options are pretty unique)
        if (interactionType === 'mouse') {
          await this.user.click(option);
        } else {
          await this.user.pointer({target: option, keys: '[TouchA]'});
        }
      }

      if (option?.getAttribute('href') == null) {
        await waitFor(() => {
          if (document.activeElement !== this._trigger) {
            throw new Error(`Expected the document.activeElement after selecting an option to be the select component trigger but got ${document.activeElement}`);
          } else {
            return true;
          }
        });

        if (document.contains(listbox)) {
          throw new Error('Expected select element listbox to not be in the document after selecting an option');
        }
      }
    }
  }

  /**
   * Returns the select's options if present. Can be filtered to a subsection of the listbox if provided via `element`.
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
   * Returns the select's trigger.
   */
  get trigger(): HTMLElement {
    return this._trigger;
  }

  /**
   * Returns the select's listbox if present.
   */
  get listbox(): HTMLElement | null {
    let listBoxId = this.trigger.getAttribute('aria-controls');
    return listBoxId ? document.getElementById(listBoxId) : null;
  }

  /**
   * Returns the select's sections if present.
   */
  get sections(): HTMLElement[] {
    let listbox = this.listbox;
    return listbox ? within(listbox).queryAllByRole('group') : [];
  }
}
