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
import {BaseGridRowInteractionOpts, Direction, GridRowActionOpts, ToggleGridRowOpts, TreeTesterOpts, UserOpts} from './types';
import {formatTargetNode, getAltKey, getMetaKey, pressElement, triggerLongPress} from './utils';
import {within} from '@testing-library/dom';

interface TreeToggleExpansionOpts extends BaseGridRowInteractionOpts {}
interface TreeToggleRowOpts extends ToggleGridRowOpts {}
interface TreeRowActionOpts extends GridRowActionOpts {}

export class TreeTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _direction: Direction;
  private _tree: HTMLElement;

  constructor(opts: TreeTesterOpts) {
    let {root, user, interactionType, advanceTimer, direction} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._direction = direction || 'ltr';
    this._tree = root;
    if (root.getAttribute('role') !== 'treegrid') {
      let tree = within(root).queryByRole('treegrid');
      if (tree) {
        this._tree = tree;
      }
    }
  }

  /**
   * Set the interaction type used by the tree tester.
   */
  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  };

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
      row = (within(this.tree()!).getByText(indexOrText).closest('[role=row]'))! as HTMLElement;
    }

    return row;
  }

  private async keyboardNavigateToRow(opts: {row: HTMLElement, selectionOnNav?: 'default' | 'none'}) {
    let {row, selectionOnNav = 'default'} = opts;
    let altKey = getAltKey();
    let rows = this.rows();
    let targetIndex = rows.indexOf(row);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the tree');
    }

    if (document.activeElement !== this._tree && !this._tree.contains(document.activeElement)) {
      act(() => this._tree.focus());
    }

    let focusPrevKey = this._direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (document.activeElement === this.tree()) {
      await this.user.keyboard(`${selectionOnNav === 'none' ? `[${altKey}>]` : ''}[ArrowDown]${selectionOnNav === 'none' ? `[/${altKey}]` : ''}`);
    } else if (this._tree.contains(document.activeElement) && document.activeElement!.getAttribute('role') !== 'row') {
      do {
        await this.user.keyboard(`[${focusPrevKey}]`);
      } while (document.activeElement!.getAttribute('role') !== 'row');
    }
    let currIndex = rows.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the tree');
    }
    let direction = targetIndex > currIndex ? 'down' : 'up';

    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[${altKey}>]`);
    }
    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[/${altKey}]`);
    }
  };

  /**
   * Toggles the selection for the specified tree row. Defaults to using the interaction type set on the tree tester.
   * Note that this will endevor to always add/remove JUST the provided row to the set of selected rows.
   */
  async toggleRowSelection(opts: TreeToggleRowOpts): Promise<void> {
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
      throw new Error(`Target row "${formatTargetNode(opts.row)}" not found in the tree.`);
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
        // TODO add modifiers here? Maybe move into pressElement if we get more cases for different types of modifier keys
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[${metaKey}>]`);
        }
        await pressElement(this.user, row, interactionType);
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[/${metaKey}]`);
        }
      }
    }
  };

  /**
   * Toggles the expansion for the specified tree row. Defaults to using the interaction type set on the tree tester.
   */
  async toggleRowExpansion(opts: TreeToggleExpansionOpts): Promise<void> {
    let {
      row,
      interactionType = this._interactionType
    } = opts;
    if (!this.tree().contains(document.activeElement)) {
      act(() => this.tree().focus());
    }

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({indexOrText: row});
    }

    if (!row) {
      throw new Error(`Target row "${formatTargetNode(opts.row)}" not found in the tree.`);
    } else if (row.getAttribute('aria-expanded') == null) {
      throw new Error(`Target row "${formatTargetNode(opts.row)}" is not expandable.`);
    }

    if (row.getAttribute('aria-disabled') === 'true') {
      throw new Error(`Cannot toggle expansion on disabled row "${formatTargetNode(opts.row)}".`);
    }

    if (interactionType === 'mouse' || interactionType === 'touch') {
      let rowExpander = within(row).getAllByRole('button')[0]; // what happens if the button is not first? how can we differentiate?
      await pressElement(this.user, rowExpander, interactionType);
    } else if (interactionType === 'keyboard') {
      // TODO: We always Use Option/Ctrl when keyboard navigating so selection isn't changed
      // in selectionmode="replace"/highlight selection when navigating to the row that the user wants
      // to expand. Discuss if this is useful or not
      await this.keyboardNavigateToRow({row});
      let collapseKey = this._direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      let expandKey = this._direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      if (row.getAttribute('aria-expanded') === 'true') {
        await this.user.keyboard(`[${collapseKey}]`);
      } else {
        await this.user.keyboard(`[${expandKey}]`);
      }
    }
  };

  /**
   * Triggers the action for the specified tree row. Defaults to using the interaction type set on the tree tester.
   */
  async triggerRowAction(opts: TreeRowActionOpts): Promise<void> {
    let {
      row,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({indexOrText: row});
    }

    if (!row) {
      throw new Error(`Target row "${formatTargetNode(opts.row)}" not found in the tree.`);
    }

    if (row.getAttribute('aria-disabled') === 'true') {
      throw new Error(`Cannot trigger row action on disabled row "${formatTargetNode(opts.row)}".`);
    }

    if (needsDoubleClick) {
      await this.user.dblClick(row);
    } else if (interactionType === 'keyboard') {
      // TODO: same as above, uses the modifier key to make sure we don't modify selection state on row focus
      // as we keyboard navigate to the row we want activate
      await this.keyboardNavigateToRow({row});
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, row, interactionType);
    }
  };

  /**
   * Returns the tree.
   */
  tree(): HTMLElement {
    return this._tree;
  }

  /**
   * Returns the tree's rows if any.
   */
  rows(): HTMLElement[] {
    return within(this.tree()).queryAllByRole('row');
  }

  /**
   * Returns the tree's selected rows if any.
   */
  selectedRows(): HTMLElement[] {
    return this.rows().filter(row => row.getAttribute('aria-selected') === 'true');
  }

  /**
   * Returns the tree's cells if any. Can be filtered against a specific row if provided via `element`.
   */
  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.tree()} = opts;
    return within(element).queryAllByRole('gridcell');
  }
}
