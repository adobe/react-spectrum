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
import {Direction, Orientation, RadioGroupTesterOpts, UserOpts} from './types';
import {pressElement} from './events';

interface TriggerRadioOptions {
  /**
   * What interaction type to use when triggering a radio. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType'],
  /**
   * The index, text, or node of the radio to toggle selection for.
   */
  radio: number | string | HTMLElement
}

export class RadioGroupTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _radiogroup: HTMLElement;
  private _direction: Direction;

  constructor(opts: RadioGroupTesterOpts) {
    let {root, user, interactionType, direction} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._direction = direction || 'ltr';

    this._radiogroup = root;
    let radiogroup = within(root).queryAllByRole('radiogroup');
    if (radiogroup.length > 0) {
      this._radiogroup = radiogroup[0];
    }
  }

  /**
   * Set the interaction type used by the radio tester.
   */
  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  /**
   * Returns a radio matching the specified index or text content.
   */
  findRadio(opts: {radioIndexOrText: number | string}): HTMLElement {
    let {
      radioIndexOrText
    } = opts;

    let radio;
    if (typeof radioIndexOrText === 'number') {
      radio = this.radios[radioIndexOrText];
    } else if (typeof radioIndexOrText === 'string') {
      let label = within(this.radiogroup).getByText(radioIndexOrText);
      // Label may wrap the radio, or the actual label may be a sibling span, or the radio div could have the label within it
      if (label) {
        radio = within(label).queryByRole('radio');
        if (!radio) {
          let labelWrapper = label.closest('label');
          if (labelWrapper) {
            radio = within(labelWrapper).queryByRole('radio');
          } else {
            radio = label.closest('[role=radio]');
          }
        }
      }
    }

    return radio;
  }

  private async keyboardNavigateToRadio(opts: {radio: HTMLElement, orientation?: Orientation}) {
    let {radio, orientation = 'vertical'} = opts;
    let radios = this.radios;
    radios = radios.filter(radio => !(radio.hasAttribute('disabled') || radio.getAttribute('aria-disabled') === 'true'));
    if (radios.length === 0) {
      throw new Error('Radio group doesnt have any non-disabled radios. Please double check your radio group.');
    }

    let targetIndex = radios.indexOf(radio);
    if (targetIndex === -1) {
      throw new Error('Radio provided is not in the radio group.');
    }

    if (!this.radiogroup.contains(document.activeElement)) {
      let selectedRadio = this.selectedRadio;
      if (selectedRadio != null) {
        act(() => selectedRadio.focus());
      } else {
        act(() => radios[0]?.focus());
      }
    }

    let currIndex = radios.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('Active element is not in the radio group.');
    }

    let arrowUp = 'ArrowUp';
    let arrowDown = 'ArrowDown';
    if (orientation === 'horizontal') {
      if (this._direction === 'ltr') {
        arrowUp = 'ArrowLeft';
        arrowDown = 'ArrowRight';
      } else {
        arrowUp = 'ArrowRight';
        arrowDown = 'ArrowLeft';
      }
    }

    let movementDirection = targetIndex > currIndex ? 'down' : 'up';
    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${movementDirection === 'down' ? arrowDown : arrowUp}]`);
    }
  };

  /**
   * Triggers the specified radio. Defaults to using the interaction type set on the radio tester.
   */
  async triggerRadio(opts: TriggerRadioOptions): Promise<void> {
    let {
      radio,
      interactionType = this._interactionType
    } = opts;

    if (typeof radio === 'string' || typeof radio === 'number') {
      radio = this.findRadio({radioIndexOrText: radio});
    }

    if (!radio) {
      throw new Error('Target radio not found in the radio group.');
    } else if (radio.hasAttribute('disabled')) {
      throw new Error('Target radio is disabled.');
    }

    if (interactionType === 'keyboard') {
      let radioOrientation = this._radiogroup.getAttribute('aria-orientation') || 'horizontal';
      await this.keyboardNavigateToRadio({radio, orientation: radioOrientation as Orientation});
    } else {
      await pressElement(this.user, radio, interactionType);
    }
  }

  /**
   * Returns the radiogroup.
   */
  get radiogroup(): HTMLElement {
    return this._radiogroup;
  }

  /**
   * Returns the radios.
   */
  get radios(): HTMLElement[] {
    return within(this.radiogroup).queryAllByRole('radio');
  }

  /**
   * Returns the currently selected radio in the radiogroup if any.
   */
  get selectedRadio(): HTMLElement | null {
    return this.radios.find(radio => (radio as HTMLInputElement).checked) || null;
  }
}
