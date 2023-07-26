/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface SelectOptions {
  // TODO: maybe accept a selector instead? will we ever need to refresh the node in case it becomes stale?
  element: HTMLElement,
  timerType?: 'fake' | 'real'
}

// TODO: replace with updated userEvent stuff
export class SelectTester {
  element: HTMLElement;
  timerType: 'fake' | 'real';
  trigger: HTMLElement;
  listbox: HTMLElement;

  constructor(opts: SelectOptions) {
    let {
      element,
      timerType = 'fake'
    } = opts;
    this.element = element;
    this.timerType = timerType;
  }

  // Do we really need a discrete open function or should it all be put into selectOption? Figure the user might want to run assertions
  // on the open dropdown perhaps
  async open() {
    // Handle case where the wrapper element is provided rather than the Select's button (aka RAC)
    let triggerButton = within(this.element).queryByRole('button');
    if (triggerButton == null) {
      triggerButton = this.element;
    }
    this.trigger = triggerButton;

    userEvent.click(triggerButton);
    if (this.timerType === 'fake') {
      act(() => jest.runAllTimers());
    } else {
      // Wait a flat amount of time so listbox popover can appear and aria-hide all other listboxes
      // But what if the transition the user uses is greater than 400ms? Should I requery the trigger until it becomes aria-hidden?
      await act(async () => await new Promise((resolve) => setTimeout(resolve, 400)));
    }
    // TODO: how to distinguish the picker's listbox from other listboxes? For now I rely on ariaHideOutside to hide all other ones
    // Perhaps I would wait for aria-controls to appear on the triggerButton and then do a querySelector to find the matching element with that id
    // Alternatively, I could just wait for the option text to appear/disappear and skip querying for the listbox entirely (feels more brittle)
    // Another option is that we supply custom data attributes ourselves that will always exist on the components and use those for lookup
    this.listbox = await screen.findByRole('listbox', {hidden: false});
  }

  async selectOption(optionText) {
    await this.open();
    // TODO: what if the user needs to scroll the list to find the option? What if there are multiple matches for text (hopefully the picker options are pretty unique)
    let option = within(this.listbox).getByText(optionText);
    userEvent.click(option);
    if (this.timerType === 'fake') {
      act(() => jest.runAllTimers());
    }

    await waitFor(() => {
      expect(document.activeElement).toBe(this.trigger);
    }, {interval: 100});
  }

  // TODO: add close()
  // TODO: various getters? getHiddenSelect, getOption, getLabel, getTriggerElement? Or just have user access them via picker.trigger and stuff
  // TODO: what about assertions like picker.hasText? Or just rely on user using `expect(picker.trigger).toHaveTextContent('Three');`
}
