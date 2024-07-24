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

type InteractionType = 'mouse' | 'touch' | 'keyboard'

interface GridListOptions {
  user: any,
  interactionType?: InteractionType
}
export class GridListTester {
  private user;
  private _interactionType: InteractionType;
  private _gridlist: HTMLElement;


  constructor(opts: GridListOptions) {
    this.user = opts.user;
    this._interactionType = opts.interactionType || 'mouse';
  }

  setElement(element: HTMLElement) {
    this._gridlist = element;
  }

  setInteractionType(type: InteractionType) {
    this._interactionType = type;
  }

  // TODO: taken directly from table, move to somewhere sharable. Maybe can be used by the other utils
  // as well (not sure if the keyboard one is valid for all of them aka if we'd consider doing .focus directly on the element prior
  // to the actual keystroke as valid)
  private async pressElement(element: HTMLElement) {
    if (this._interactionType === 'mouse') {
      await this.user.click(element);
    } else if (this._interactionType === 'keyboard') {
      act(() => element.focus());
      await this.user.keyboard('[Space]');
    } else if (this._interactionType === 'touch') {
      await this.user.pointer({target: element, keys: '[TouchA]'});
    }
  }

  // TODO: support long press? This is also pretty much the same as table's toggleRowSelection so maybe can share
  // Maybe also support an option to force the click to happen on a specific part of the element (checkbox or row). That way
  // the user can test a specific type of interaction?
  async toggleRowSelection(opts: {index?: number, text?: string} = {}) {
    let {index, text} = opts;

    let row = this.findRow({index, text});
    let rowCheckbox = within(row).queryByRole('checkbox');
    if (rowCheckbox) {
      await this.pressElement(rowCheckbox);
    } else {
      let cell = within(row).getAllByRole('gridcell')[0];
      await this.pressElement(cell);
      // needsLongPress ? await triggerLongPress(cell) : await this.pressElement(cell);
    }

    // // Handle cases where the table may transition in response to the row selection/deselection
    // if (!jestFakeTimersAreEnabled()) {
    //   await act(async () => await new Promise((resolve) => setTimeout(resolve, 200)));
    // } else {
    //   act(() => {
    //     jest.runOnlyPendingTimers();
    //   });
    // }
  }

  // TODO: pretty much the same as table except it uses this.gridlist. Make common between the two by accepting an option for
  // an element?
  findRow(opts: {index?: number, text?: string}) {
    let {
      index,
      text
    } = opts;

    let row;
    if (index != null) {
      row = this.rows[index];
    } else if (text != null) {
      row = within(this.gridlist).getByText(text);
      while (row && row.getAttribute('role') !== 'row') {
        row = row.parentElement;
      }
    }

    return row;
  }

  // TODO add findCell? Do we need it since there is only one gridcell per row? See if the test need it

  // TODO: maybe also support triggering row action like in table? There is also a more difficult use case where the row
  // has a link, don't think we have a good way to determine that a list row might behave like a link

  // TODO: do we really need this getter? Theoretically the user already has the reference to the gridlist
  get gridlist() {
    if (!this._gridlist) {
      throw new Error('Gridlist element hasn\'t been set yet. Did you call `setElement()` yet?');
    }

    return this._gridlist;
  }

  get rows() {
    return within(this.gridlist).queryAllByRole('row');
  }

  // TODO: maybe have this accept a optional row element so it can return the cells specific to the provided row
  cells(opts: {element?: HTMLElement} = {}) {
    let {element} = opts;
    return within(element || this.gridlist).queryAllByRole('gridcell');
  }
}
