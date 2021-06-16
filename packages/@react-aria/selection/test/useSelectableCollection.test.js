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

import {Item} from '@react-stately/collections';
import {List} from '../stories/List';
import React from 'react';
import {render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('useSelectableCollection', () => {
  it('selects the first item it focuses if selectOnFocus', () => {
    let {getAllByRole} = render(
      <List selectionMode="single">
        <Item>Paco de Lucia</Item>
        <Item>Vicente Amigo</Item>
        <Item>Gerardo Nunez</Item>
      </List>
    );
    let listitems = getAllByRole('listitem');
    expect(listitems[0]).not.toHaveAttribute('aria-selected');
    userEvent.tab();
    expect(document.activeElement).toBe(listitems[0]);
    expect(listitems[0]).toHaveAttribute('aria-selected', 'true');
  });
});
