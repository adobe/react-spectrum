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

import {AriaMenuProps, useMenu, useMenuItem} from '../';
import {Item} from '@react-stately/collections';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';
import {useTreeState} from '@react-stately/tree';

function Menu<T extends object>(props: AriaMenuProps<T> & {onSelect: () => void}) {
  // Create menu state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = React.useRef(null);
  let {menuProps} = useMenu(props, state, ref);

  return (
    <ul {...menuProps} ref={ref}>
      {[...state.collection].map((item) => (
        <MenuItem key={item.key} item={item} state={state} onAction={props.onSelect} />
      ))}
    </ul>
  );
}

function MenuItem({item, state, onAction}) {
  // Get props for the menu item element
  let ref = React.useRef(null);
  let {menuItemProps, isSelected} = useMenuItem(
    {key: item.key, onAction},
    state,
    ref
  );

  return (
    <li {...menuItemProps} ref={ref}>
      {item.rendered}
      {isSelected && <span aria-hidden="true">✅</span>}
    </li>
  );
}

describe('useMenuTrigger', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
  });

  it('calls an onAction passed directly to useMenuItem', async () => {
    let onSelect = jest.fn();
    let {getAllByRole} = render(
      <Menu onSelect={onSelect} aria-label={'test menu'}>
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
        <Item key="3">Three</Item>
      </Menu>
    );
    let items = getAllByRole('menuitem');
    await user.click(items[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
