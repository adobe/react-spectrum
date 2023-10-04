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

import {act, fireEvent, waitFor, within} from '@testing-library/react';

interface TableOptions {
  element: HTMLElement,
  timerType?: 'fake' | 'real',
  // User from user-event 14
  user: any
}

// TODO: move to general util file and replace our existing one with this
async function triggerLongPress(element: HTMLElement, pointerOpts = {}, timerType: 'fake' | 'real' = 'fake', waitTime: number = 500) {
  fireEvent.pointerDown(element, {pointerType: 'touch', ...pointerOpts});
  if (timerType === 'real') {
    await act(async () => await new Promise((resolve) => setTimeout(resolve, waitTime)));
  } else {
    act(() => {
      jest.advanceTimersByTime(waitTime);
    });
  }

  fireEvent.pointerUp(element, {pointerType: 'touch', ...pointerOpts});
}

export class TableTester {
  element: HTMLElement;
  timerType: 'fake' | 'real';
  rows: HTMLElement[];
  columns: HTMLElement[];
  user: any;
  private rowgroups: HTMLElement[];

  constructor(opts: TableOptions) {
    let {
      element,
      timerType = 'fake',
      user
    } = opts;
    this.element = element;
    this.timerType = timerType;
    this.user = user;
    // This can potentially become stale? Double check, if so replace with getters that refetch the rows and columns
    this.rowgroups = within(this.element).getAllByRole('rowgroup');
    this.columns = within(this.rowgroups[0]).getAllByRole('columnheader');
    this.rows = within(this.rowgroups[1]).getAllByRole('row');
  }

  async toggleRowSelection(opts: {index?: number, text?: string, needsLongPress?: boolean}) {
    let {
      index,
      text,
      needsLongPress
    } = opts;

    let row;
    if (index) {
      row = this.rows[index];
    } else if (text) {
      row = within(this.rowgroups[1]).getByText(text);
      while (row && !/^row$/.test(row.getAttribute('role'))) {
        row = row.parentElement;
      }
    }

    let rowCheckbox = within(row).queryByRole('checkbox');
    if (rowCheckbox) {
      await this.user.click(rowCheckbox);
    } else {
      let cell = within(row).getAllByRole('gridcell')[0];
      needsLongPress ? triggerLongPress(cell) : await this.user.click(cell);
    }
  }

  async toggleSort(opts: {index?: number, text?: string}) {
    let {
      index,
      text
    } = opts;

    let columnheader;

    if (index) {
      columnheader = this.columns[index];
    } else if (text) {
      columnheader = within(this.rowgroups[0]).getByText(text);
      while (columnheader && !/columnheader/.test(columnheader.getAttribute('role'))) {
        columnheader = columnheader.parentElement;
      }
    }

    // TODO: this menu button pattern toggling should go into the menu tester class and reused
    let menuButton = within(columnheader).queryByRole('button');
    if (menuButton) {
      let currentSort = columnheader.getAttribute('aria-sort');
      await this.user.click(menuButton);
      if (this.timerType === 'fake') {
        act(() => jest.runAllTimers());
      } else {
        await waitFor(() => expect(menuButton).toHaveAttribute('aria-controls'));
      }

      let menuId = menuButton.getAttribute('aria-controls');
      await waitFor(() => expect(document.getElementById(menuId)).toBeInTheDocument());
      let menu = document.getElementById(menuId);
      if (currentSort === 'ascending') {
        await this.user.click(within(menu).getAllByRole('menuitem')[1]);
      } else {
        await this.user.click(within(menu).getAllByRole('menuitem')[0]);
      }

      if (this.timerType === 'fake') {
        act(() => jest.runAllTimers());
      }

      await waitFor(() => expect(document.activeElement).toBe(menuButton));
      expect(menu).not.toBeInTheDocument();
    } else {
      await this.user.click(columnheader);
    }
  }

  async toggleSelectAll() {
    let checkbox = within(this.element).getByLabelText('Select All');
    await this.user.click(checkbox);
  }
}
