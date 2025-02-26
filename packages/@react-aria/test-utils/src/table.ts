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
import {GridRowActionOpts, TableTesterOpts, ToggleGridRowOpts, UserOpts} from './types';
import {pressElement, triggerLongPress} from './events';

interface TableToggleRowOpts extends ToggleGridRowOpts {}
interface TableToggleSortOpts {
  /**
   * The index, text, or node of the column to toggle selection for.
   */
  column: number | string | HTMLElement,
  /**
   * What interaction type to use when sorting the column. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType']
}
interface TableRowActionOpts extends GridRowActionOpts {}

export class TableTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _table: HTMLElement;

  constructor(opts: TableTesterOpts) {
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._table = root;
  }

  /**
   * Set the interaction type used by the table tester.
   */
  setInteractionType(type: UserOpts['interactionType']) {
    this._interactionType = type;
  }

  /**
   * Toggles the selection for the specified table row. Defaults to using the interaction type set on the table tester.
   */
  async toggleRowSelection(opts: TableToggleRowOpts) {
    let {
      row,
      needsLongPress,
      checkboxSelection = true,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the table.');
    }

    let rowCheckbox = within(row).queryByRole('checkbox');

    if (interactionType === 'keyboard' && !checkboxSelection) {
      // TODO: for now focus the row directly until I add keyboard navigation
      await act(async () => {
        row.focus();
      });
      await this.user.keyboard('{Space}');
      return;
    }
    if (rowCheckbox && checkboxSelection) {
      await pressElement(this.user, rowCheckbox, interactionType);
    } else {
      let cell = within(row).getAllByRole('gridcell')[0];
      if (needsLongPress && interactionType === 'touch') {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }

        // Note that long press interactions with rows is strictly touch only for grid rows
        await triggerLongPress({element: cell, advanceTimer: this._advanceTimer, pointerOpts: {pointerType: 'touch'}});
      } else {
        await pressElement(this.user, cell, interactionType);
      }
    }
  };

  /**
   * Toggles the sort order for the specified table column. Defaults to using the interaction type set on the table tester.
   */
  async toggleSort(opts: TableToggleSortOpts) {
    let {
      column,
      interactionType = this._interactionType
    } = opts;

    let columnheader;
    if (typeof column === 'number') {
      columnheader = this.columns[column];
    } else if (typeof column === 'string') {
      columnheader = within(this.rowGroups[0]).getByText(column);
      while (columnheader && !/columnheader/.test(columnheader.getAttribute('role'))) {
        columnheader = columnheader.parentElement;
      }
    } else {
      columnheader = column;
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
      if (!this._advanceTimer) {
        throw new Error('No advanceTimers provided for table transition.');
      }

      await act(async () => {
        await this._advanceTimer?.(200);
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
  }

  /**
   * Triggers the action for the specified table row. Defaults to using the interaction type set on the table tester.
   */
  async triggerRowAction(opts: TableRowActionOpts) {
    let {
      row,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the table.');
    }

    if (needsDoubleClick) {
      await this.user.dblClick(row);
    } else if (interactionType === 'keyboard') {
      // TODO: add keyboard navigation instead of focusing the row directly. Will need to consider if the focus in in the columns
      act(() => row.focus());
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, row, interactionType);
    }
  }

  // TODO: should there be utils for drag and drop and column resizing? For column resizing, I'm not entirely convinced that users will be doing that in their tests.
  // For DnD, it might be tricky to do for keyboard DnD since we wouldn't know what valid drop zones there are... Similarly, for simulating mouse drag and drop the coordinates depend
  // on the mocks the user sets up for their row height/etc.
  // Additionally, should we also support keyboard navigation/typeahead? Those felt like they could be very easily replicated by the user via user.keyboard already and don't really
  // add much value if we provide that to them
  /**
   * Toggle selection for all rows in the table. Defaults to using the interaction type set on the table tester.
   */
  async toggleSelectAll(opts: {interactionType?: UserOpts['interactionType']} = {}) {
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
  }

  /**
   * Returns a row matching the specified index or text content.
   */
  findRow(opts: {rowIndexOrText: number | string}): HTMLElement {
    let {
      rowIndexOrText
    } = opts;

    let row;
    let rows = this.rows;
    let bodyRowGroup = this.rowGroups[1];
    if (typeof rowIndexOrText === 'number') {
      row = rows[rowIndexOrText];
    } else if (typeof rowIndexOrText === 'string') {
      row = within(bodyRowGroup).getByText(rowIndexOrText);
      while (row && row.getAttribute('role') !== 'row') {
        row = row.parentElement;
      }
    }

    return row;
  }

  /**
   * Returns a cell matching the specified text content.
   */
  findCell(opts: {text: string}) {
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
  }

  /**
   * Returns the table.
   */
  get table(): HTMLElement {
    return this._table;
  }

  /**
   * Returns the row groups within the table.
   */
  get rowGroups(): HTMLElement[] {
    let table = this._table;
    return table ? within(table).queryAllByRole('rowgroup') : [];
  }

  /**
   * Returns the columns within the table.
   */
  get columns(): HTMLElement[] {
    let headerRowGroup = this.rowGroups[0];
    return headerRowGroup ? within(headerRowGroup).queryAllByRole('columnheader') : [];
  }

  /**
   * Returns the rows within the table if any.
   */
  get rows(): HTMLElement[] {
    let bodyRowGroup = this.rowGroups[1];
    return bodyRowGroup ? within(bodyRowGroup).queryAllByRole('row') : [];
  }

  /**
   * Returns the currently selected rows within the table if any.
   */
  get selectedRows(): HTMLElement[] {
    return this.rows.filter(row => row.getAttribute('aria-selected') === 'true');
  }

  /**
   * Returns the row headers within the table if any.
   */
  get rowHeaders(): HTMLElement[] {
    return within(this.table).queryAllByRole('rowheader');
  }

  /**
   * Returns the cells within the table if any. Can be filtered against a specific row if provided via `element`.
   */
  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.table} = opts;
    return within(element).queryAllByRole('gridcell');
  }
}
