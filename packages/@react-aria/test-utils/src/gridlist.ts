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

import {act} from './act';
import {Direction, GridListTesterOpts, GridRowActionOpts, ToggleGridRowOpts, UserOpts} from './types';
import {formatTargetNode, getAltKey, getMetaKey, pressElement, triggerLongPress} from './utils';
import {within} from '@testing-library/dom';

interface GridListToggleRowOpts extends ToggleGridRowOpts {}
interface GridListRowActionOpts extends GridRowActionOpts {}

export class GridListTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _direction: Direction;
  private _gridlist: HTMLElement;
  private _layout: GridListTesterOpts['layout'];

  constructor(opts: GridListTesterOpts) {
    let {root, user, interactionType, advanceTimer, direction, layout} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._direction = direction || 'ltr';
    this._layout = layout || 'stack';
    this._gridlist = root;
    if (root.getAttribute('role') !== 'grid') {
      let gridlist = within(root).queryByRole('grid');
      if (gridlist) {
        this._gridlist = gridlist;
      }
    }
  }

  /**
   * Set the interaction type used by the gridlist tester.
   */
  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  /**
   * Returns a row matching the specified index or text content.
   */
  findRow(opts: {indexOrText: number | string}): HTMLElement {
    let {
      indexOrText
    } = opts;

    let row;
    if (typeof indexOrText === 'number') {
      row = this.rows()[indexOrText];
    } else if (typeof indexOrText === 'string') {
      row = (within(this.gridlist()!).getByText(indexOrText).closest('[role=row]'))! as HTMLElement;
    }

    return row;
  }

  private async keyboardNavigateToRow(opts: {row: HTMLElement, selectionOnNav?: 'default' | 'none'}) {
    let {row, selectionOnNav = 'default'} = opts;
    let altKey = getAltKey();
    let rows = this.rows();
    let targetIndex = rows.indexOf(row);
    if (targetIndex === -1) {
      throw new Error('Row provided is not in the gridlist');
    }

    if (document.activeElement !== this._gridlist && !this._gridlist.contains(document.activeElement)) {
      act(() => this._gridlist.focus());
    }

    let focusPrevKey = this._direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (document.activeElement === this._gridlist) {
      await this.user.keyboard(`${selectionOnNav === 'none' ? `[${altKey}>]` : ''}[ArrowDown]${selectionOnNav === 'none' ? `[/${altKey}]` : ''}`);
    } else if (this._gridlist.contains(document.activeElement) && document.activeElement!.getAttribute('role') !== 'row') {
      do {
        await this.user.keyboard(`[${focusPrevKey}]`);
      } while (document.activeElement!.getAttribute('role') !== 'row');
    }
    let currIndex = rows.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the gridlist');
    }

    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[${altKey}>]`);
    }
    if (this._layout === 'grid') {
      while (document.activeElement !== row) {
        let curr = (document.activeElement as HTMLElement).getBoundingClientRect();
        let target = row.getBoundingClientRect();
        let key: string;
        // basically compare current position with desired position to determine if we need to go up/down/left/right
        // use 1 in the comparison here for subpixels since getBoundingClientRect returns subpixels precision
        if (Math.abs(curr.top - target.top) > 1) {
          key = curr.top < target.top ? 'ArrowDown' : 'ArrowUp';
        } else if (Math.abs(curr.left - target.left) > 1) {
          key = curr.left < target.left ? 'ArrowRight' : 'ArrowLeft';
        } else {
          // if the diff in current vs desired is < 1 but it is claiming we arent focused on the target
          // then we might be in a case where getBoundingClientRect isnt mocked
          throw new Error('Could not navigate to target row in grid layout. Did the test mock getBoundingClientRect?');
        }
        await this.user.keyboard(`[${key}]`);
      }
    } else {
      let direction = targetIndex > currIndex ? 'down' : 'up';
      for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
        await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
      }
    }
    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[/${altKey}]`);
    }
  };

  /**
   * Toggles the selection for the specified gridlist row. Defaults to using the interaction type set on the gridlist tester.
   * Note that this will endevor to always add/remove JUST the provided row to the set of selected rows.
   */
  async toggleRowSelection(opts: GridListToggleRowOpts): Promise<void> {
    let {
      row,
      needsLongPress,
      checkboxSelection = true,
      interactionType = this._interactionType,
      selectionBehavior = 'toggle'
    } = opts;

    let altKey = getAltKey();
    let metaKey = getMetaKey();

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({indexOrText: row});
    }

    if (!row) {
      throw new Error(`Target row "${formatTargetNode(opts.row)}" not found in the gridlist.`);
    }

    let rowCheckbox = within(row).queryByRole('checkbox');

    if (rowCheckbox?.getAttribute('disabled') === '' || row?.getAttribute('aria-disabled') === 'true') {
      throw new Error(`Cannot toggle selection on disabled row "${formatTargetNode(opts.row)}".`);
    }

    // this would be better than the check to do nothing in events.ts
    // also, it'd be good to be able to trigger selection on the row instead of having to go to the checkbox directly
    if (interactionType === 'keyboard' && (!checkboxSelection || !rowCheckbox)) {
      await this.keyboardNavigateToRow({row, selectionOnNav: selectionBehavior === 'replace' ? 'none' : 'default'});
      if (selectionBehavior === 'replace') {
        await this.user.keyboard(`[${altKey}>]`);
      }
      await this.user.keyboard('[Space]');
      if (selectionBehavior === 'replace') {
        await this.user.keyboard(`[/${altKey}]`);
      }
      return;
    }
    if (rowCheckbox && checkboxSelection) {
      await pressElement(this.user, rowCheckbox, interactionType);
    } else {
      let cell = within(row).getAllByRole('gridcell')[0];
      if (needsLongPress && interactionType === 'touch') {
        // Note that long press interactions with rows is strictly touch only for grid rows
        await triggerLongPress({element: cell, advanceTimer: this._advanceTimer!, pointerOpts: {pointerType: 'touch'}});
      } else {
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[${metaKey}>]`);
        }
        await pressElement(this.user, row, interactionType);
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[/${metaKey}]`);
        }
      }
    }
  }

  /**
   * Triggers the action for the specified gridlist row. Defaults to using the interaction type set on the gridlist tester.
   */
  async triggerRowAction(opts: GridListRowActionOpts): Promise<void> {
    let {
      row,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({indexOrText: row});
    }

    if (!row) {
      throw new Error(`Target row "${formatTargetNode(opts.row)}" not found in the gridlist.`);
    }

    if (row.getAttribute('aria-disabled') === 'true') {
      throw new Error(`Cannot trigger row action on disabled row "${formatTargetNode(opts.row)}".`);
    }

    if (needsDoubleClick) {
      await this.user.dblClick(row);
    } else if (interactionType === 'keyboard') {
      await this.keyboardNavigateToRow({row, selectionOnNav: 'none'});
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, row, interactionType);
    }
  }

  /**
   * Returns the gridlist.
   */
  gridlist(): HTMLElement {
    return this._gridlist;
  }

  /**
   * Returns the gridlist's rows if any.
   */
  rows(): HTMLElement[] {
    return within(this.gridlist()).queryAllByRole('row');
  }

  /**
   * Returns the gridlist's selected rows if any.
   */
  selectedRows(): HTMLElement[] {
    return this.rows().filter(row => row.getAttribute('aria-selected') === 'true');
  }

  /**
   * Returns the gridlist's cells if any. Can be filtered against a specific row if provided via `element`.
   */
  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.gridlist()} = opts;
    return within(element).queryAllByRole('gridcell');
  }
}
