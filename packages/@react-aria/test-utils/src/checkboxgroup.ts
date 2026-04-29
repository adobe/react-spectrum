/*
 * Copyright 2025 Adobe. All rights reserved.
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
import {CheckboxGroupTesterOpts, UserOpts} from './types';
import {pressElement} from './events';

interface TriggerCheckboxOptions {
  /**
   * What interaction type to use when triggering a checkbox. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType'],
  /**
   * The index, text, or node of the checkbox to toggle selection for.
   */
  checkbox: number | string | HTMLElement
}

export class CheckboxGroupTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _checkboxgroup: HTMLElement;


  constructor(opts: CheckboxGroupTesterOpts) {
    let {root, user, interactionType} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';

    this._checkboxgroup = root;
    let checkboxgroup = within(root).queryAllByRole('group');
    if (checkboxgroup.length > 0) {
      this._checkboxgroup = checkboxgroup[0];
    }
  }

  /**
   * Set the interaction type used by the checkbox group tester.
   */
  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  /**
   * Returns a checkbox matching the specified index or text content.
   */
  findCheckbox(opts: {checkboxIndexOrText: number | string}): HTMLElement {
    let {
      checkboxIndexOrText
    } = opts;

    let checkbox;
    if (typeof checkboxIndexOrText === 'number') {
      checkbox = this.checkboxes[checkboxIndexOrText];
    } else if (typeof checkboxIndexOrText === 'string') {
      let label = within(this.checkboxgroup).getByText(checkboxIndexOrText);

      // Label may wrap the checkbox, or the actual label may be a sibling span, or the checkbox div could have the label within it
      if (label) {
        checkbox = within(label).queryByRole('checkbox');
        if (!checkbox) {
          let labelWrapper = label.closest('label');
          if (labelWrapper) {
            checkbox = within(labelWrapper).queryByRole('checkbox');
          } else {
            checkbox = label.closest('[role=checkbox]');
          }
        }
      }
    }

    return checkbox;
  }

  private async keyboardNavigateToCheckbox(opts: {checkbox: HTMLElement}) {
    let {checkbox} = opts;
    let checkboxes = this.checkboxes;
    checkboxes = checkboxes.filter(checkbox => !(checkbox.hasAttribute('disabled') || checkbox.getAttribute('aria-disabled') === 'true'));
    if (checkboxes.length === 0) {
      throw new Error('Checkbox group doesnt have any non-disabled checkboxes. Please double check your checkbox group.');
    }

    let targetIndex = checkboxes.indexOf(checkbox);
    if (targetIndex === -1) {
      throw new Error('Checkbox provided is not in the checkbox group.');
    }

    if (!this.checkboxgroup.contains(document.activeElement)) {
      act(() => checkboxes[0].focus());
    }

    let currIndex = checkboxes.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('Active element is not in the checkbox group.');
    }

    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.tab({shift: targetIndex < currIndex});
    }
  };

  /**
   * Toggles the specified checkbox. Defaults to using the interaction type set on the checkbox tester.
   */
  async toggleCheckbox(opts: TriggerCheckboxOptions): Promise<void> {
    let {
      checkbox,
      interactionType = this._interactionType
    } = opts;

    if (typeof checkbox === 'string' || typeof checkbox === 'number') {
      checkbox = this.findCheckbox({checkboxIndexOrText: checkbox});
    }

    if (!checkbox) {
      throw new Error('Target checkbox not found in the checkboxgroup.');
    } else if (checkbox.hasAttribute('disabled')) {
      throw new Error('Target checkbox is disabled.');
    }

    if (interactionType === 'keyboard') {
      await this.keyboardNavigateToCheckbox({checkbox});
      await this.user.keyboard('[Space]');
    } else {
      await pressElement(this.user, checkbox, interactionType);
    }
  }

  /**
   * Returns the checkboxgroup.
   */
  get checkboxgroup(): HTMLElement {
    return this._checkboxgroup;
  }

  /**
   * Returns the checkboxes.
   */
  get checkboxes(): HTMLElement[] {
    return within(this.checkboxgroup).queryAllByRole('checkbox');
  }

  /**
   * Returns the currently selected checkboxes in the checkboxgroup if any.
   */
  get selectedCheckboxes(): HTMLElement[] {
    return this.checkboxes.filter(checkbox => (checkbox as HTMLInputElement).checked || checkbox.getAttribute('aria-checked') === 'true');
  }
}
