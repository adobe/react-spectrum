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
import {BaseTesterOpts, UserOpts} from './user';
import {pressElement, triggerLongPress} from './events';
export interface TableOptions extends UserOpts, BaseTesterOpts {
  user: any,
  advanceTimer: UserOpts['advanceTimer']
}

// TODO: Previously used logic like https://github.com/testing-library/react-testing-library/blame/c63b873072d62c858959c2a19e68f8e2cc0b11be/src/pure.js#L16
// but https://github.com/testing-library/dom-testing-library/issues/987#issuecomment-891901804 indicates that it may falsely indicate that fake timers are enabled
// when they aren't
export class TableTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _table: HTMLElement;

  constructor(opts: TableOptions) {
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._table = root;
  }

  setInteractionType = (type: UserOpts['interactionType']) => {
    this._interactionType = type;
  };

  toggleRowSelection = async (opts: {index?: number, text?: string, needsLongPress?: boolean, interactionType?: UserOpts['interactionType']} = {}) => {
    let {
      index,
      text,
      needsLongPress,
      interactionType = this._interactionType
    } = opts;

    let row = this.findRow({index, text});
    let rowCheckbox = within(row).queryByRole('checkbox');
    if (rowCheckbox) {
      await pressElement(this.user, rowCheckbox, interactionType);
    } else {
      let cell = within(row).getAllByRole('gridcell')[0];
      if (needsLongPress && interactionType === 'touch') {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }

        // Note that long press interactions with rows is strictly touch only for grid rows
        await triggerLongPress({element: cell, advanceTimer: this._advanceTimer, pointerOpts: {pointerType: 'touch'}});
        // TODO: interestingly enough, we need to do a followup click otherwise future row selections may not fire properly?
        // To reproduce, try removing this, forcing toggleRowSelection to hit "needsLongPress ? await triggerLongPress(cell) : await action(cell);" and
        // run Table.test's "should support long press to enter selection mode on touch" test to see what happens
        await fireEvent.click(cell);
      } else {
        await pressElement(this.user, cell, interactionType);
      }
    }

    // Handle cases where the table may transition in response to the row selection/deselection
    await act(async () => {
      if (this._advanceTimer == null) {
        throw new Error('No advanceTimers provided for table transition.');
      }

      await this._advanceTimer(200);
    });
  };

  toggleSort = async (opts: {index?: number, text?: string, interactionType?: UserOpts['interactionType']} = {}) => {
    let {
      index,
      text,
      interactionType = this._interactionType
    } = opts;

    let columnheader;
    if (index != null) {
      columnheader = this.columns[index];
    } else if (text != null) {
      columnheader = within(this.rowGroups[0]).getByText(text);
      while (columnheader && !/columnheader/.test(columnheader.getAttribute('role'))) {
        columnheader = columnheader.parentElement;
      }
    }

    let menuButton = within(columnheader).queryByRole('button');
    if (menuButton) {
      let currentSort = columnheader.getAttribute('aria-sort');
      // TODO: Focus management is all kinda of messed up if I just use .focus and Space to open the sort menu. Seems like
      // the focused key doesn't get properly set to the desired column header. Have to do this strange flow where I focus the
      // column header except if the active element is already the menu button within the column header
      if (interactionType === 'keyboard' && document.activeElement !== menuButton) {
        await pressElement(this.user, columnheader, interactionType);
      } else {
        await pressElement(this.user, menuButton, interactionType);
      }

      await waitFor(() => {
        if (menuButton.getAttribute('aria-controls') == null) {
          throw new Error('No aria-controls found on table column dropdown menu trigger element.');
        } else {
          return true;
        }
      });

      let menuId = menuButton.getAttribute('aria-controls');
      await waitFor(() => {
        if (!menuId || document.getElementById(menuId) == null) {
          throw new Error(`Table column header menu with id of ${menuId} not found in document.`);
        } else {
          return true;
        }
      });

      if (menuId) {
        let menu = document.getElementById(menuId);
        if (menu) {
          if (currentSort === 'ascending') {
            await pressElement(this.user, within(menu).getAllByRole('menuitem')[1], interactionType);
          } else {
            await pressElement(this.user, within(menu).getAllByRole('menuitem')[0], interactionType);
          }

          await waitFor(() => {
            if (document.contains(menu)) {
              throw new Error('Expected table column menu listbox to not be in the document after selecting an option');
            } else {
              return true;
            }
          });
        }
      }

      // Handle cases where the table may transition in response to the row selection/deselection
      await act(async () => {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for table transition.');
        }

        await this._advanceTimer(200);
      });

      await waitFor(() => {
        if (document.activeElement !== menuButton) {
          throw new Error(`Expected the document.activeElement to be the table column menu button but got ${document.activeElement}`);
        } else {
          return true;
        }
      });
    } else {
      await pressElement(this.user, columnheader, interactionType);
    }
  };
  // TODO: should there be a util for triggering a row action? Perhaps there should be but it would rely on the user teling us the config of the
  // table. Maybe we could rely on the user knowing to trigger a press/double click? We could have the user pass in "needsDoubleClick"
  // It is also iffy if there is any row selected because then the table is in selectionMode and the below actions will simply toggle row selection
  triggerRowAction = async (opts: {index?: number, text?: string, needsDoubleClick?: boolean, interactionType?: UserOpts['interactionType']} = {}) => {
    let {
      index,
      text,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    let row = this.findRow({index, text});
    if (row) {
      if (needsDoubleClick) {
        await this.user.dblClick(row);
      } else if (interactionType === 'keyboard') {
        act(() => row.focus());
        await this.user.keyboard('[Enter]');
      } else {
        await pressElement(this.user, row, interactionType);
      }
    }
  };

  // TODO: should there be utils for drag and drop and column resizing? For column resizing, I'm not entirely convinced that users will be doing that in their tests.
  // For DnD, it might be tricky to do for keyboard DnD since we wouldn't know what valid drop zones there are... Similarly, for simulating mouse drag and drop the coordinates depend
  // on the mocks the user sets up for their row height/etc.
  // Additionally, should we also support keyboard navigation/typeahead? Those felt like they could be very easily replicated by the user via user.keyboard already and don't really
  // add much value if we provide that to them

  toggleSelectAll = async (opts: {interactionType?: UserOpts['interactionType']} = {}) => {
    let {
      interactionType = this._interactionType
    } = opts;
    let checkbox = within(this.table).getByLabelText('Select All');
    if (interactionType === 'keyboard') {
      // TODO: using the .focus -> trigger keyboard Enter approach doesn't work for some reason, for now just trigger select all with click.
      await this.user.click(checkbox);
    } else {
      await pressElement(this.user, checkbox, interactionType);
    }
  };

  findRow = (opts: {index?: number, text?: string} = {}) => {
    let {
      index,
      text
    } = opts;

    let row;
    let rows = this.rows;
    let bodyRowGroup = this.rowGroups[1];
    if (index != null) {
      row = rows[index];
    } else if (text != null) {
      row = within(bodyRowGroup).getByText(text);
      while (row && row.getAttribute('role') !== 'row') {
        row = row.parentElement;
      }
    }

    return row;
  };

  findCell = (opts: {text: string}) => {
    let {
      text
    } = opts;

    let cell = within(this.table).getByText(text);
    if (cell) {
      while (cell && !/gridcell|rowheader|columnheader/.test(cell.getAttribute('role') || '')) {
        if (cell.parentElement) {
          cell = cell.parentElement;
        } else {
          break;
        }
      }
    }

    return cell;
  };

  get table() {
    return this._table;
  }

  get rowGroups() {
    let table = this._table;
    return table ? within(table).queryAllByRole('rowgroup') : [];
  }

  get columns() {
    let headerRowGroup = this.rowGroups[0];
    return headerRowGroup ? within(headerRowGroup).queryAllByRole('columnheader') : [];
  }

  get rows() {
    let bodyRowGroup = this.rowGroups[1];
    return bodyRowGroup ? within(bodyRowGroup).queryAllByRole('row') : [];
  }

  get selectedRows() {
    return this.rows.filter(row => row.getAttribute('aria-selected') === 'true');
  }

  get rowHeaders() {
    let table = this.table;
    return table ? within(table).queryAllByRole('rowheader') : [];
  }

  get cells() {
    let table = this.table;
    return table ? within(table).queryAllByRole('gridcell') : [];
  }
}
