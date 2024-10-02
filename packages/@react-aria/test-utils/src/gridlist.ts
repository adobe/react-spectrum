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
import {BaseTesterOpts, UserOpts} from './user';
import {pressElement} from './events';

export interface GridListOptions extends UserOpts, BaseTesterOpts {
  user: any
}
export class GridListTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _gridlist: HTMLElement;


  constructor(opts: GridListOptions) {
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
   * Toggles the selection for the specified gridlist row using the interaction type set on the gridlist tester.
   */
  async toggleRowSelection(opts: {index?: number, text?: string, interactionType?: UserOpts['interactionType']} = {}) {
    let {index, text, interactionType = this._interactionType} = opts;

    let row = this.findRow({index, text});
    let rowCheckbox = within(row).queryByRole('checkbox');
    if (rowCheckbox) {
      await pressElement(this.user, rowCheckbox, interactionType);
    } else {
      let cell = within(row).getAllByRole('gridcell')[0];
      await pressElement(this.user, cell, interactionType);
    }
  }

  // TODO: pretty much the same as table except it uses this.gridlist. Make common between the two by accepting an option for
  // an element?
  private findRow(opts: {index?: number, text?: string}) {
    let {
      index,
      text
    } = opts;

    let row;
    if (index != null) {
      row = this.rows[index];
    } else if (text != null) {
      row = within(this?.gridlist).getByText(text);
      while (row && row.getAttribute('role') !== 'row') {
        row = row.parentElement;
      }
    }

    return row;
  }

  // TODO: There is a more difficult use case where the row has/behaves as link, don't think we have a good way to determine that unless the
  // user specificlly tells us
  /**
   * Triggers the action for the specified gridlist row using the interaction type set on the gridlist tester.
   */
  async triggerRowAction(opts: {index?: number, text?: string, needsDoubleClick?: boolean, interactionType?: UserOpts['interactionType']}) {
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
  }

  // TODO: do we really need this getter? Theoretically the user already has the reference to the gridlist
  /**
   * Returns the gridlist.
   */
  get gridlist(): HTMLElement | null {
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
   * Returns the gridlist's cells if any. Can be filtered against a specific row if provided.
   */
  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] | null {
    let {element} = opts;
    return within(element || this.gridlist).queryAllByRole('gridcell');
  }
}
