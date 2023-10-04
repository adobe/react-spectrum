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

import {act, waitFor, within} from '@testing-library/react';

interface SelectOptions {
  // TODO: maybe accept a selector instead? will we ever need to refresh the node in case it becomes stale?
  element: HTMLElement,
  timerType?: 'fake' | 'real',
  // User from user-event 14
  user: any
}

// TODO: replace with updated userEvent stuff
export class SelectTester {
  element: HTMLElement;
  timerType: 'fake' | 'real';
  trigger: HTMLElement;
  listbox: HTMLElement;
  user: any; // TODO: import UserEvent type from user event library

  constructor(opts: SelectOptions) {
    let {
      element,
      timerType = 'fake',
      user
    } = opts;
    this.element = element;
    this.timerType = timerType;
    this.user = user;
  }

  // TODO: Refactor and pull out all of these in favor of creating a user object that a user can import.
  // TODO: Can determing whether we are using real vs fake timers based on what the end user passes to https://testing-library.com/docs/user-event/options/#advancetimers
  // alternatively, maybe can just support fake timers and manually enable fake timers in our util funcs and disabled them after the func call?

  // TODO: Do we really need a discrete open function or should it all be put into selectOption? Figure the user might want to run assertions
  // on the open dropdown perhaps
  async open() {
    // Handle case where the wrapper element is provided rather than the Select's button (aka RAC)
    let triggerButton = within(this.element).queryByRole('button');
    if (triggerButton == null) {
      triggerButton = this.element;
    }
    this.trigger = triggerButton;

    await this.user.click(triggerButton);
    if (this.timerType === 'fake') {
      act(() => jest.runAllTimers());
    } else {
      await waitFor(() => expect(triggerButton).toHaveAttribute('aria-controls'));
    }
    let listBoxId = triggerButton.getAttribute('aria-controls');
    await waitFor(() => expect(document.getElementById(listBoxId)).toBeInTheDocument());
    this.listbox = document.getElementById(listBoxId);
  }

  async selectOption(optionText) {
    await this.open();
    // TODO: what if the user needs to scroll the list to find the option? What if there are multiple matches for text (hopefully the picker options are pretty unique)
    let option = within(this.listbox).getByText(optionText);
    await this.user.click(option);
    if (this.timerType === 'fake') {
      act(() => jest.runAllTimers());
    }

    await waitFor(() => expect(document.activeElement).toBe(this.trigger));
    expect(this.listbox).not.toBeInTheDocument();
  }

  // TODO: add close()
  // TODO: various getters? getHiddenSelect, getOption, getLabel, getTriggerElement? Or just have user access them via picker.trigger and stuff
  // TODO: what about assertions like picker.hasText? Or just rely on user using `expect(picker.trigger).toHaveTextContent('Three');`
}
