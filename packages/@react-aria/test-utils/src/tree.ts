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
import {BaseGridRowInteractionOpts, GridRowActionOpts, ToggleGridRowOpts, TreeTesterOpts, UserOpts} from './types';
import {pressElement, triggerLongPress} from './events';

interface TreeToggleExpansionOpts extends BaseGridRowInteractionOpts {}
interface TreeToggleRowOpts extends ToggleGridRowOpts {}
interface TreeRowActionOpts extends GridRowActionOpts {}

// TODO: this ended up being pretty much the same as gridlist, refactor so it extends from gridlist
export class TreeTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _tree: HTMLElement;

  constructor(opts: TreeTesterOpts) {
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._tree = root;
    // TODO: should all helpers do this?
    let tree = within(root).queryByRole('treegrid');
    if (root.getAttribute('role') !== 'treegrid' && tree) {
      this._tree = tree;
    }
  }

  /**
   * Set the interaction type used by the tree tester.
   */
  setInteractionType(type: UserOpts['interactionType']) {
    this._interactionType = type;
  };

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
      row = (within(this.tree!).getByText(rowIndexOrText).closest('[role=row]'))! as HTMLElement;
    }

    return row;
  }

  // TODO: RTL
  private async keyboardNavigateToRow(opts: {row: HTMLElement}) {
    let {row} = opts;
    let rows = this.rows;
    let targetIndex = rows.indexOf(row);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the tree');
    }
    if (document.activeElement === this.tree) {
      await this.user.keyboard('[ArrowDown]');
    } else if (this._tree.contains(document.activeElement) && document.activeElement!.getAttribute('role') !== 'row') {
      do {
        await this.user.keyboard('[ArrowLeft]');
      } while (document.activeElement!.getAttribute('role') !== 'row');
    }
    let currIndex = rows.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the tree');
    }
    let direction = targetIndex > currIndex ? 'down' : 'up';

    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
  };

  /**
   * Toggles the selection for the specified tree row. Defaults to using the interaction type set on the tree tester.
   */
  async toggleRowSelection(opts: TreeToggleRowOpts) {
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
      throw new Error('Target row not found in the tree.');
    }

    let rowCheckbox = within(row).queryByRole('checkbox');

    // TODO: we early return here because the checkbox can't be keyboard navigated to if the row is disabled usually
    // but we may to check for disabledBehavior (aka if the disable row gets skipped when keyboard navigating or not)
    if (interactionType === 'keyboard' && (rowCheckbox?.getAttribute('disabled') === '' || row?.getAttribute('aria-disabled') === 'true')) {
      return;
    }

    // this would be better than the check to do nothing in events.ts
    // also, it'd be good to be able to trigger selection on the row instead of having to go to the checkbox directly
    if (interactionType === 'keyboard' && !checkboxSelection) {
      await this.keyboardNavigateToRow({row});
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
   * Toggles the expansion for the specified tree row. Defaults to using the interaction type set on the tree tester.
   */
  async toggleRowExpansion(opts: TreeToggleExpansionOpts) {
    let {
      row,
      interactionType = this._interactionType
    } = opts;
    if (!this.tree.contains(document.activeElement)) {
      await act(async () => {
        this.tree.focus();
      });
    }

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the tree.');
    } else if (row.getAttribute('aria-expanded') == null) {
      throw new Error('Target row is not expandable.');
    }

    if (interactionType === 'mouse' || interactionType === 'touch') {
      let rowExpander = within(row).getAllByRole('button')[0]; // what happens if the button is not first? how can we differentiate?
      await pressElement(this.user, rowExpander, interactionType);
    } else if (interactionType === 'keyboard') {
      if (row?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      await this.keyboardNavigateToRow({row});
      if (row.getAttribute('aria-expanded') === 'true') {
        await this.user.keyboard('[ArrowLeft]');
      } else {
        await this.user.keyboard('[ArrowRight]');
      }
    }
  };

  /**
   * Triggers the action for the specified tree row. Defaults to using the interaction type set on the tree tester.
   */
  async triggerRowAction(opts: TreeRowActionOpts) {
    let {
      row,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the tree.');
    }

    if (needsDoubleClick) {
      await this.user.dblClick(row);
    } else if (interactionType === 'keyboard') {
      if (row?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      if (document.activeElement !== this._tree || !this._tree.contains(document.activeElement)) {
        act(() => this._tree.focus());
      }

      await this.keyboardNavigateToRow({row});
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, row, interactionType);
    }
  };

  /**
   * Returns the tree.
   */
  get tree():  HTMLElement {
    return this._tree;
  }

  /**
   * Returns the tree's rows if any.
   */
  get rows(): HTMLElement[] {
    return within(this?.tree).queryAllByRole('row');
  }

  /**
   * Returns the tree's selected rows if any.
   */
  get selectedRows(): HTMLElement[] {
    return this.rows.filter(row => row.getAttribute('aria-selected') === 'true');
  }

  /**
   * Returns the tree's cells if any. Can be filtered against a specific row if provided via `element`.
   */
  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.tree} = opts;
    return within(element).queryAllByRole('gridcell');
  }
}
