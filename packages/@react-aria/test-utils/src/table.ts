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

type InteractionType = 'mouse' | 'touch' | 'keyboard'

interface TableOptions {
  user: any,
  interactionType?: InteractionType
}

// TODO: move somewhere central if it ends up being used in multiple places
// TODO: figure out how to replace this generically so it isn't jest specific
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

async function triggerLongPress(element: HTMLElement, pointerOpts = {}, waitTime: number = 500) {
  // TODO: note that this only works if the code from installPointerEvent is called somewhere in the test BEFORE the
  // render. Perhaps we should rely on the user setting that up since I'm not sure there is a great way to set that up here in the
  // util before first render. Will need to document it well

  await fireEvent.pointerDown(element, {pointerType: 'touch', ...pointerOpts});
  // TODO: if we can make this generic, perhaps the user should pass a parameter of some sort to indicate that fake timers are
  // being used or not
  if (!jestFakeTimersAreEnabled()) {
    await act(async () => await new Promise((resolve) => setTimeout(resolve, waitTime)));
  } else {
    act(() => {
      // TODO: make generic
      jest.advanceTimersByTime(waitTime);
    });
  }

  await fireEvent.pointerUp(element, {pointerType: 'touch', ...pointerOpts});
  // TODO: interestingly enough, we need to do a followup click otherwise future row selections may not fire properly?
  // To reproduce, try removing this, forcing toggleRowSelection to hit "needsLongPress ? await triggerLongPress(cell) : await action(cell);" and
  // run Table.test's "should support long press to enter selection mode on touch" test to see what happens
  await fireEvent.click(element);
}

export class TableTester {
  private user;
  private _interactionType;
  private _table: HTMLElement;

  constructor(opts: TableOptions) {
    this.user = opts.user;
    this._interactionType = opts.interactionType || 'mouse';
  }

  setElement = (element: HTMLElement) => {
    this._table = element;
  };

  setInteractionType = (type: InteractionType) => {
    this._interactionType = type;
  };

  private pressElement = async (element: HTMLElement) => {
    if (this._interactionType === 'mouse') {
      await this.user.click(element);
    } else if (this._interactionType === 'keyboard') {
      // TODO: For the keyboard flow, I wonder if it would be reasonable to just do fireEvent directly on the obtained row node or if we should
      // stick to simulting an actual user's keyboard operations as closely as possible
      // There are problems when using this approach though, actions like trying to trigger the select all checkbox and stuff behave oddly.
      act(() => element.focus());
      await this.user.keyboard('[Space]');
    } else if (this._interactionType === 'touch') {
      await this.user.pointer({target: element, keys: '[TouchA]'});
    }
  };

  toggleRowSelection = async (opts: {index?: number, text?: string, needsLongPress?: boolean} = {}) => {
    let {
      index,
      text,
      needsLongPress
    } = opts;

    let row = this.findRow({index, text});
    let rowCheckbox = within(row).queryByRole('checkbox');
    if (rowCheckbox) {
      await this.pressElement(rowCheckbox);
    } else {
      let cell = within(row).getAllByRole('gridcell')[0];
      needsLongPress ? await triggerLongPress(cell) : await this.pressElement(cell);
    }

    // Handle cases where the table may transition in response to the row selection/deselection
    if (!jestFakeTimersAreEnabled()) {
      await act(async () => await new Promise((resolve) => setTimeout(resolve, 200)));
    } else {
      act(() => {
        jest.runOnlyPendingTimers();
      });
    }
  };

  toggleSort = async (opts: {index?: number, text?: string} = {}) => {
    let {
      index,
      text
    } = opts;

    let columnheader;
    if (index != null) {
      columnheader = this.getColumns()[index];
    } else if (text != null) {
      columnheader = within(this.getRowGroups()[0]).getByText(text);
      while (columnheader && !/columnheader/.test(columnheader.getAttribute('role'))) {
        columnheader = columnheader.parentElement;
      }
    }

    // TODO: this menu button pattern toggling should go into the menu tester class and reused
    let menuButton = within(columnheader).queryByRole('button');
    if (menuButton) {
      let currentSort = columnheader.getAttribute('aria-sort');
      // TODO: Focus management is all kinda of messed up if I just use .focus and Space to open the sort menu. Seems like
      // the focused key doesn't get properly set to the desired column header. Have to do this strange flow where I focus the
      // column header except if the active element is already the menu button within the column header
      if (this._interactionType === 'keyboard' && document.activeElement !== menuButton) {
        await this.pressElement(columnheader);
      } else {
        await this.pressElement(menuButton);
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
            await this.pressElement(within(menu).getAllByRole('menuitem')[1]);
          } else {
            await this.pressElement(within(menu).getAllByRole('menuitem')[0]);
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
      // TODO: make this generic instead of specific to jest
      // TODO: note that this was moved here because react 17 needs the timers run for the focus to make it onto the button in certain circumstances
      if (!jestFakeTimersAreEnabled()) {
        await act(async () => await new Promise((resolve) => setTimeout(resolve, 200)));
      } else {
        act(() => {
          jest.runOnlyPendingTimers();
        });
      }

      await waitFor(() => {
        if (document.activeElement !== menuButton) {
          throw new Error(`Expected the document.activeElement to be the table column menu button but got ${document.activeElement}`);
        } else {
          return true;
        }
      });


    } else {
      await this.pressElement(columnheader);
    }
  };
  // TODO: should there be a util for triggering a row action? Perhaps there should be but it would rely on the user teling us the config of the
  // table. Maybe we could rely on the user knowing to trigger a press/double click? We could have the user pass in "needsDoubleClick"
  // It is also iffy if there is any row selected because then the table is in selectionMode and the below actions will simply toggle row selection
  triggerRowAction = async (opts: {index?: number, text?: string, needsDoubleClick?: boolean} = {}) => {
    let {
      index,
      text,
      needsDoubleClick
    } = opts;

    let row = this.findRow({index, text});
    if (row) {
      if (needsDoubleClick) {
        await this.user.dblClick(row);
      } else if (this._interactionType === 'keyboard') {
        act(() => row.focus());
        await this.user.keyboard('[Enter]');
      } else {
        await this.pressElement(row);
      }
    }
  };

  // TODO: should there be utils for drag and drop and column resizing? For column resizing, I'm not entirely convinced that users will be doing that in their tests.
  // For DnD, it might be tricky to do for keyboard DnD since we wouldn't know what valid drop zones there are... Similarly, for simulating mouse drag and drop the coordinates depend
  // on the mocks the user sets up for their row height/etc.
  // Additionally, should we also support keyboard navigation/typeahead? Those felt like they could be very easily replicated by the user via user.keyboard already and don't really
  // add much value if we provide that to them

  toggleSelectAll = async () => {
    let checkbox = within(this._table).getByLabelText('Select All');
    if (this._interactionType === 'keyboard') {
      // TODO: using the .focus -> trigger keyboard Enter approach doesn't work for some reason, for now just trigger select all with click.
      await this.user.click(checkbox);
    } else {
      await this.pressElement(checkbox);
    }
  };

  findRow = (opts: {index?: number, text?: string} = {}) => {
    let {
      index,
      text
    } = opts;

    let row;
    let rows = this.getRows();
    let bodyRowGroup = this.getRowGroups()[1];
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

    let cell = within(this._table).getByText(text);
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

  getTable = () => {
    if (!this._table) {
      throw new Error('Table element hasn\'t been set yet. Did you call `setTable()` yet?');
    }

    return this._table;
  };

  // TODO: for now make the getters always grab the latest set of elements, might be expesive though
  // After some benchmark testing it doesn't seem to make much of a difference though, seemingly negligible
  getRowGroups = () => {
    let table = this._table;
    return table ? within(table).queryAllByRole('rowgroup') : [];
  };

  getColumns = () => {
    let headerRowGroup = this.getRowGroups()[0];
    return headerRowGroup ? within(headerRowGroup).queryAllByRole('columnheader') : [];
  };

  getRows = () => {
    let bodyRowGroup = this.getRowGroups()[1];
    return bodyRowGroup ? within(bodyRowGroup).queryAllByRole('row') : [];
  };

  getRowHeaders = () => {
    let table = this._table;
    return table ? within(this._table).queryAllByRole('rowheader') : [];
  };

  getCells = () => {
    let table = this._table;
    return table ? within(table).queryAllByRole('gridcell') : [];
  };
}
