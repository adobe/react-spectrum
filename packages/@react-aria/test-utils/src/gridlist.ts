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

import {act, within} from '@testing-library/react';
import {GridListTesterOpts, UserOpts} from './types';
import {pressElement} from './events';

interface GridListToggleRowOpts {
  /**
   * What interaction type to use when toggling the row selection. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType'],
  /**
   * The index, text, or node of the row to toggle selection for.
   */
  row: number | string | HTMLElement
}

interface GridListRowActionOpts extends GridListToggleRowOpts {
  /**
   * Whether or not the grid list needs a double click to trigger the row action. Depends on the grid list's implementation.
   */
  needsDoubleClick?: boolean
}

export class GridListTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _gridlist: HTMLElement;


  constructor(opts: GridListTesterOpts) {
    let {root, user, interactionType} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._gridlist = root;
  }

  /**
   * Set the interaction type used by the gridlist tester.
   */
  setInteractionType(type: UserOpts['interactionType']) {
    this._interactionType = type;
  }

  // TODO: support long press? This is also pretty much the same as table's toggleRowSelection so maybe can share
  // For now, don't include long press, see if people need it or if we should just expose long press as a separate util if it isn't very common
  // If the current way of passing in the user specified advance timers is ok, then I'd be find including long press
  // Maybe also support an option to force the click to happen on a specific part of the element (checkbox or row). That way
  // the user can test a specific type of interaction?
  /**
   * Toggles the selection for the specified gridlist row. Defaults to using the interaction type set on the gridlist tester.
   */
  async toggleRowSelection(opts: GridListToggleRowOpts) {
    let {row, interactionType = this._interactionType} = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the gridlist.');
    }

    let rowCheckbox = within(row).queryByRole('checkbox');
    if (rowCheckbox) {
      await pressElement(this.user, rowCheckbox, interactionType);
    } else {
      let cell = within(row).getAllByRole('gridcell')[0];
      await pressElement(this.user, cell, interactionType);
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
    if (typeof rowIndexOrText === 'number') {
      row = this.rows[rowIndexOrText];
    } else if (typeof rowIndexOrText === 'string') {
      row = (within(this.gridlist!).getByText(rowIndexOrText).closest('[role=row]'))! as HTMLElement;
    }

    return row;
  }

  // TODO: There is a more difficult use case where the row has/behaves as link, don't think we have a good way to determine that unless the
  // user specificlly tells us
  /**
   * Triggers the action for the specified gridlist row. Defaults to using the interaction type set on the gridlist tester.
   */
  async triggerRowAction(opts: GridListRowActionOpts) {
    let {
      row,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the gridlist.');
    }

    if (needsDoubleClick) {
      await this.user.dblClick(row);
    } else if (interactionType === 'keyboard') {
      // TODO: make use of keyboardNavigateToOption
      act(() => row.focus());
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, row, interactionType);
    }
  }

  /**
   * Returns the gridlist.
   */
  get gridlist(): HTMLElement {
    return this._gridlist;
  }

  /**
   * Returns the gridlist's rows if any.
   */
  get rows(): HTMLElement[] {
    return within(this?.gridlist).queryAllByRole('row');
  }

  /**
   * Returns the gridlist's selected rows if any.
   */
  get selectedRows(): HTMLElement[] {
    return this.rows.filter(row => row.getAttribute('aria-selected') === 'true');
  }

  /**
   * Returns the gridlist's cells if any. Can be filtered against a specific row if provided via `element`.
   */
  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.gridlist} = opts;
    return within(element).queryAllByRole('gridcell');
  }
}
