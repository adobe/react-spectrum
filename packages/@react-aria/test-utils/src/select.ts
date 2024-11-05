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
import {BaseTesterOpts, UserOpts} from './user';

export interface SelectOptions extends UserOpts, BaseTesterOpts {
  // TODO: I think the type grabbed from the testing library dist for UserEvent is breaking the build, will need to figure out a better place to grab from
  user?: any
}
export class SelectTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _trigger: HTMLElement;

  constructor(opts: SelectOptions) {
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

  setInteractionType = (type: UserOpts['interactionType']) => {
    this._interactionType = type;
  };

  open = async (opts: {interactionType?: UserOpts['interactionType']} = {}) => {
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
  };

  selectOption = async (opts: {optionText: string, interactionType?: UserOpts['interactionType']}) => {
    let {
      optionText,
      interactionType = this._interactionType
    } = opts || {};
    let trigger = this.trigger;
    if (!trigger.getAttribute('aria-controls')) {
      await this.open();
    }
    let listbox = this.listbox;
    if (listbox) {
      let option = within(listbox).getByText(optionText);
      if (interactionType === 'keyboard') {
        if (document.activeElement !== listbox || !listbox.contains(document.activeElement)) {
          act(() => listbox.focus());
        }

        // TODO: this simulates typeahead, do we want to add a helper util for that? Not sure if users would really need that for
        // their test
        await this.user.keyboard(optionText);
        await this.user.keyboard('[Enter]');
      } else {
        // TODO: what if the user needs to scroll the list to find the option? What if there are multiple matches for text (hopefully the picker options are pretty unique)
        if (interactionType === 'mouse') {
          await this.user.click(option);
        } else {
          await this.user.pointer({target: option, keys: '[TouchA]'});
        }
      }

      if (option.getAttribute('href') == null) {
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
  };

  close = async () => {
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
  };

  get trigger() {
    return this._trigger;
  }

  get listbox() {
    let listBoxId = this.trigger.getAttribute('aria-controls');
    return listBoxId ? document.getElementById(listBoxId) : undefined;
  }

  get options() {
    let listbox = this.listbox;
    return listbox ? within(listbox).queryAllByRole('option') : [];
  }

  get sections() {
    let listbox = this.listbox;
    return listbox ? within(listbox).queryAllByRole('group') : [];
  }
}
