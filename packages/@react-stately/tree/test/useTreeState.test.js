/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {KeyboardNavigation} from '../stories/useTreeState.stories';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('useTreeState', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  it('should be keyboard navigable', async () => {
    let {getAllByRole} = render(<KeyboardNavigation />);
    await user.tab();
    let items = getAllByRole('treeitem');
    expect(items.length).toBe(2);
    expect(document.activeElement).toBe(items[0]);

    // at Animals, expand
    // don't bother to check the text, what matters is where we are positionally
    fireEvent.keyDown(document.activeElement, {key: 'Enter'});
    fireEvent.keyUp(document.activeElement, {key: 'Enter'});
    items = getAllByRole('treeitem');
    expect(items.length).toBe(6);
    expect(document.activeElement).toBe(items[0]);

    // move to Aardvark
    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    expect(document.activeElement).toBe(items[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    // at Bear now, expand again
    fireEvent.keyDown(document.activeElement, {key: 'Enter'});
    fireEvent.keyUp(document.activeElement, {key: 'Enter'});
    items = getAllByRole('treeitem');
    expect(items.length).toBe(8);
    expect(document.activeElement).toBe(items[2]);

    // move to Black Bear
    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    expect(document.activeElement).toBe(items[3]);
  });
});
