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

import {act, fireEvent, within} from '@testing-library/react';
import {BaseTesterOpts, UserOpts} from './user';
import {pressElement, triggerLongPress} from './events';
export interface TreeOptions extends UserOpts, BaseTesterOpts {
  user?: any
}

// TODO: Previously used logic like https://github.com/testing-library/react-testing-library/blame/c63b873072d62c858959c2a19e68f8e2cc0b11be/src/pure.js#L16
// but https://github.com/testing-library/dom-testing-library/issues/987#issuecomment-891901804 indicates that it may falsely indicate that fake timers are enabled
// when they aren't
export class TreeTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _tree: HTMLElement;

  constructor(opts: TreeOptions) {
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._tree = within(root).getByRole('treegrid');
  }

  setInteractionType = (type: UserOpts['interactionType']) => {
    this._interactionType = type;
  };

  toggleRowSelection = async (opts: {
    index?: number,
    text?: string,
    needsLongPress?: boolean,
    // if false, will use the row to select instead of the checkbox directly
    checkboxSelection?: boolean,
    interactionType?: UserOpts['interactionType']
  } = {}) => {
    let {
      index,
      text,
      needsLongPress,
      checkboxSelection = true,
      interactionType = this._interactionType
    } = opts;
    let row = this.findRow({index, text});
    let rowCheckbox = within(row).queryByRole('checkbox');
    // Would be nice to get rid of this check
    if (rowCheckbox?.getAttribute('disabled') === '') {
      return;
    }

    // this would be better than the check to do nothing in events.ts
    // also, it'd be good to be able to trigger selection on the row instead of having to go to the checkbox directly
    if (interactionType === 'keyboard' && !checkboxSelection) {
      await this.keyboardNavigateToRow({row});
      await this.user.keyboard('{Space}');
      return;
    }
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
  };

  expandItem = async (opts: {index?: number, text?: string, interactionType?: UserOpts['interactionType']} = {}) => {
    let {
      index,
      text,
      interactionType = this._interactionType
    } = opts;
    if (!this.tree.contains(document.activeElement)) {
      await act(async () => {
        this.tree.focus();
      });
    }

    let row = this.findRow({index, text});

    if (row.getAttribute('aria-expanded') === 'true') {
      return;
    }

    if (interactionType === 'mouse' || interactionType === 'touch') {
      let rowExpander = within(row).getAllByRole('button')[0]; // what happens if the button is not first? how can we differentiate?
      await pressElement(this.user, rowExpander, interactionType);
    } else if (interactionType === 'keyboard') {
      await this.keyboardNavigateToRow({row});
      await this.user.keyboard('[ArrowRight]');
    }
  };

  collapseItem = async (opts: {index?: number, text?: string, interactionType?: UserOpts['interactionType']} = {}) => {
    let {
      index,
      text,
      interactionType = this._interactionType
    } = opts;
    if (!this.tree.contains(document.activeElement)) {
      await act(async () => {
        this.tree.focus();
      });
    }

    let row = this.findRow({index, text});

    if (row.getAttribute('aria-expanded') === 'false') {
      return;
    }

    if (interactionType === 'mouse' || interactionType === 'touch') {
      let rowExpander = within(row).getAllByRole('button')[0]; // what happens if the button is not first? how can we differentiate?
      await pressElement(this.user, rowExpander, interactionType);
    } else if (interactionType === 'keyboard') {
      await this.keyboardNavigateToRow({row});
      await this.user.keyboard('[ArrowLeft]');
    }
  };

  keyboardNavigateToRow = async (opts: {row: HTMLElement}) => {
    let {row} = opts;
    let rows = this.rows;
    let targetIndex = rows.indexOf(row);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the menu');
    }
    if (document.activeElement === this.tree) {
      await this.user.keyboard('[ArrowDown]');
    } else if (document.activeElement!.getAttribute('role') !== 'row') {
      do {
        await this.user.keyboard('[ArrowLeft]');
      } while (document.activeElement!.getAttribute('role') !== 'row');
    }
    let currIndex = rows.indexOf(document.activeElement as HTMLElement);
    if (targetIndex === -1) {
      throw new Error('ActiveElement is not in the menu');
    }
    let direction = targetIndex > currIndex ? 'down' : 'up';

    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
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
    let checkbox = within(this.tree).getByLabelText('Select All');
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

    let cell = within(this.tree).getByText(text);
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

  get tree() {
    return this._tree;
  }

  get rowGroups() {
    let tree = this.tree;
    return tree ? within(tree).queryAllByRole('rowgroup') : [];
  }

  get columns() {
    let headerRowGroup = this.rowGroups[0];
    return headerRowGroup ? within(headerRowGroup).queryAllByRole('columnheader') : [];
  }

  get rows() {
    return within(this.tree).queryAllByRole('row') ?? [];
  }

  get selectedRows() {
    return this.rows.filter(row => row.getAttribute('aria-selected') === 'true');
  }
}
