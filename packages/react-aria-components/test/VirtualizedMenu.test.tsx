/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button, ListLayout, Menu, MenuItem, MenuTrigger, Popover, Virtualizer} from '..';
import React from 'react';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';

let items = Array.from({length: 50}, (_, index) => {
  // Return the object structure for each element
  return {
    id: index + 1,
    name: `Object ${index + 1}`,
    value: Math.random()
  };
});
const VirtualizedExample = () => {
  return (
    <MenuTrigger>
      <Button aria-label="Actions">
        Menu ☰
      </Button>
      <Popover>
        <Virtualizer
          layout={ListLayout}
          layoutOptions={{rowHeight: 25}}>
          <Menu items={items}>
            {(item) => {
              return <MenuItem>{item.name}</MenuItem>;
            }}
          </Menu>
        </Virtualizer>
      </Popover>
    </MenuTrigger>
  );
};

// @ts-ignore
window.getComputedStyle = (el) => el.style;

describe('virtualized menu', () => {
  let user;
  let testUtilUser = new User({advanceTimer: jest.advanceTimersByTime});
  beforeAll(function () {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });
  it('should support virtualized menu', async () => {
    jest.restoreAllMocks(); // don't mock scrollTop for this test
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);

    let {getAllByRole, container} = render(<VirtualizedExample />);
    let tester = testUtilUser.createTester('Menu', {user, root: container});
    tester.setInteractionType('mouse');
    await tester.open();
    let items = getAllByRole('menuitem');
    let menu = tester.menu;
    expect(menu).toBeInTheDocument();
    expect(items[0]).toHaveAttribute('aria-posinset', '1');
    expect(items[0]).toHaveAttribute('aria-setsize', '50');
    expect(items[items.length - 1]).toHaveAttribute('aria-posinset', items.length.toString());
    expect(items.length).toBeLessThan(50);

    await user.keyboard('{End}');
    items = getAllByRole('menuitem');
    expect(items.length).toBeLessThan(50);
    expect(items[items.length - 1]).toHaveAttribute('aria-posinset', '50');
  });
});
