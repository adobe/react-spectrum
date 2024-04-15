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

import {waitFor, within} from '@testing-library/react';

type InteractionType = 'pointer' | 'touch' | 'keyboard'

// TODO: replace with updated userEvent stuff
export class SelectTester {
  user;
  interactionType: InteractionType;
  element: HTMLElement;
  trigger: HTMLElement;
  listbox: HTMLElement;

  constructor(opts) {
    // let {
    //   element,
    //   timerType = 'fake'
    // } = opts;
    // this.element = element;
    // this.timerType = timerType;
    this.user = opts.user;
  }

  setElement(element: HTMLElement) {
    this.element = element;
  }

  setInteractionType(type: InteractionType) {
    this.interactionType = type;
  }

  async open() {
    if (!this.element) {
      console.error('Select element hasn\'t beeen set yet, please call setElement(element) to set which element to target.')
      return;
    }

    // Handle case where the wrapper element is provided rather than the Select's button (aka RAC)
    let triggerButton = within(this.element).queryByRole('button');
    if (triggerButton == null) {
      triggerButton = this.element;
    }
    this.trigger = triggerButton;

    // TODO: Handle the touch/keyboard version
    await this.user.click(triggerButton);

    // TODO: so far this seems to work with real and fake timers. If we do run into a situation where we need to advance timers in here,
    // we can do something like detecting if fake timers (like in https://github.com/testing-library/react-testing-library/blame/c63b873072d62c858959c2a19e68f8e2cc0b11be/src/pure.js#L16)
    // are enabled and advance by a specific amount of time (here it would be doing advanceTimersBy perhaps by the transtion time or runOnlyPendingTimers)
    // Alternatively, maybe we need to accept an option for https://testing-library.com/docs/user-event/options/#advancetimers
    await waitFor(() => expect(triggerButton).toHaveAttribute('aria-controls'));
    let listBoxId = triggerButton.getAttribute('aria-controls');
    await waitFor(() => expect(document.getElementById(listBoxId)).toBeInTheDocument());
    this.listbox = document.getElementById(listBoxId);
  }

  async selectOption(optionText) {
    await this.open();
    // TODO: what if the user needs to scroll the list to find the option? What if there are multiple matches for text (hopefully the picker options are pretty unique)
    let option = within(this.listbox).getByText(optionText);
    await this.user.click(option);
    await waitFor(() => expect(document.activeElement).toBe(this.trigger));
    expect(this.listbox).not.toBeInTheDocument();
  }

  // TODO: add close()
  // TODO: various getters? getHiddenSelect, getOption, getLabel, getTriggerElement? Or just have user access them via picker.trigger and stuff
  // TODO: what about assertions like picker.hasText? Or just rely on user using `expect(picker.trigger).toHaveTextContent('Three');`
}
