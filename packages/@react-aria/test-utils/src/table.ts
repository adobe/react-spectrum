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

import {act, fireEvent, waitFor, within} from '@testing-library/react';
// TODO: better place to get this type
import {UserEvent} from '@testing-library/user-event/dist/types/setup/setup';

type InteractionType = 'mouse' | 'touch' | 'keyboard'

interface TableOptions {
  user: UserEvent,
  interactionType?: InteractionType
}

// TODO: move somewhere central if it ends up being used
// TODO will probably need to add a check for fake timers for this one
// https://github.com/testing-library/react-testing-library/blame/c63b873072d62c858959c2a19e68f8e2cc0b11be/src/pure.js#L16
function jestFakeTimersAreEnabled() {
  if (typeof jest !== 'undefined' && jest !== null) {
    // Logic for this is from https://github.com/testing-library/react-testing-library/blame/c63b873072d62c858959c2a19e68f8e2cc0b11be/src/pure.js#L16
    // ts ignore the _isMockFunction check
    // @ts-ignore
    return setTimeout._isMockFunction === true || // modern timers
      // eslint-disable-next-line prefer-object-has-own -- No Object.hasOwn in all target environments we support.
      Object.prototype.hasOwnProperty.call(setTimeout, 'clock');
  }
  return false;
}


async function triggerLongPress(element: HTMLElement, pointerOpts = {}, timerType: 'fake' | 'real' = 'fake', waitTime: number = 500) {
  await fireEvent.pointerDown(element, {pointerType: 'touch', ...pointerOpts});
  if (timerType === 'real') {
    await act(async () => await new Promise((resolve) => setTimeout(resolve, waitTime)));
  } else {
    act(() => {
      jest.advanceTimersByTime(waitTime);
    });
  }

  await fireEvent.pointerUp(element, {pointerType: 'touch', ...pointerOpts});
}

export class TableTester {
  private user: UserEvent;
  // TODO: support this in the functions below?
  private _interactionType;
  private _table: HTMLElement;
  // TODO see if I actually want any of the below, try just having the gettings fetch the rows and columns for now
  // private _rows: HTMLElement[];
  // private _columns: HTMLElement[];
  // private _rowgroups: HTMLElement[];

  constructor(opts: TableOptions) {
    this.user = opts.user;
    this._interactionType = opts.interactionType || 'mouse';
  }

  setTable(element: HTMLElement) {
    this._table = element;
    // This can potentially become stale? Double check, if so replace with getters that refetch the rows and columns
    // this._rowgroups = within(this._element).getAllByRole('rowgroup');
    // this._columns = within(this._rowgroups[0]).getAllByRole('columnheader');
    // this._rows = within(this._rowgroups[1]).getAllByRole('row');
  }

  setInteractionType(type: InteractionType) {
    this._interactionType = type;
  }

  // TODO need to actually try this toggleRow selection with long press out, see if I even need to do the timers
  // (probably do since I can't just use waitFor since there might not be something to actually "waitFor" instead)
  async toggleRowSelection(opts: {index?: number, text?: string, needsLongPress?: boolean}) {
    let {
      index,
      text,
      needsLongPress
    } = opts;
    jestFakeTimersAreEnabled();
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
      needsLongPress ? await triggerLongPress(cell) : await this.user.click(cell);
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
      // TODO: check the below if we still need timers

      // if (this.timerType === 'fake') {
      //   act(() => jest.runAllTimers());
      // } else {
      await waitFor(() => expect(menuButton).toHaveAttribute('aria-controls'));
      // }

      let menuId = menuButton.getAttribute('aria-controls');
      await waitFor(() => expect(document.getElementById(menuId)).toBeInTheDocument());
      let menu = document.getElementById(menuId);
      if (currentSort === 'ascending') {
        await this.user.click(within(menu).getAllByRole('menuitem')[1]);
      } else {
        await this.user.click(within(menu).getAllByRole('menuitem')[0]);
      }

      // TODO check if we still need
      // if (this.timerType === 'fake') {
      //   act(() => jest.runAllTimers());
      // }

      await waitFor(() => expect(document.activeElement).toBe(menuButton));
      expect(menu).not.toBeInTheDocument();
    } else {
      await this.user.click(columnheader);
    }
  }

  async toggleSelectAll() {
    let checkbox = within(this._table).getByLabelText('Select All');
    await this.user.click(checkbox);
  }

  get table() {
    if (!this._table) {
      console.error('Table element hasn\'t been set yet. Did you call `setTable()` yet?');
    }

    return this._table;
  }

  // TODO: for now make the getters always grab the latest set of elements, might be expesive though
  get rowgroups() {
    return within(this._table).getAllByRole('rowgroup');
  }

  get columns() {
    return within(this.rowgroups[0]).getAllByRole('columnheader');
  }

  get rows() {
    return within(this.rowgroups[1]).getAllByRole('row');
  }
}
