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

import {cleanup, fireEvent, render, waitForDomChange, within} from '@testing-library/react';
import {Item, Menu, Section} from '../';
import {MenuContext} from '../src/context';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';
import {Menu as V2Menu, MenuDivider as V2MenuDivider, MenuHeading as V2MenuHeading, MenuItem as V2MenuItem} from '@react/react-spectrum/Menu';

let menuId = 'menu-id';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

let withSection = [
  {name: 'Heading 1', children: [
    {name: 'Foo'},
    {name: 'Bar'},
    {name: 'Baz'}
  ]},
  {name: 'Heading 2', children: [
    {name: 'Blah'},
    {name: 'Bleh'}
  ]}
];

function renderComponent(Component, contextProps = {}, props) {
  if (Component === V2Menu) {
    return render(
      <V2Menu id={menuId} {...props}>
        <V2MenuHeading>
          Heading 1
        </V2MenuHeading>
        <V2MenuItem role="menuitemradio" value="foo">
          Foo
        </V2MenuItem>
        <V2MenuItem role="menuitemradio" value="bar">
          Bar
        </V2MenuItem>
        <V2MenuItem role="menuitemradio" value="baz" disabled>
          Baz
        </V2MenuItem>
        <V2MenuDivider />
        <V2MenuHeading>
          Heading 2
        </V2MenuHeading>
        <V2MenuItem role="menuitemradio" value="blah">
          Blah
        </V2MenuItem>
        <V2MenuItem role="menuitemradio" value="bleh">
          Bleh
        </V2MenuItem>
      </V2Menu>
    );
  } else {
    return render(
      <Provider theme={theme}>
        <MenuContext.Provider value={contextProps}>
          <Menu id={menuId} items={withSection} itemKey="name" {...props}>
            {item => (
              <Section items={item.children} title={item.name}>
                {item => <Item childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </MenuContext.Provider>
      </Provider>
    );
  }
}

describe('Menu', function () {
  let offsetWidth, offsetHeight;
  let onSelectionChange = jest.fn();
  let onSelect = jest.fn();

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 1000);
  });

  afterEach(() => {
    onSelectionChange.mockClear();
    cleanup();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });
  
  it.each`
    Name        | Component | props
    ${'Menu'}   | ${Menu}   | ${{}}
    ${'V2Menu'} | ${V2Menu} | ${{}}
  `('$Name renders properly', async function ({Component}) {
    let tree = renderComponent(Component);
    await waitForDomChange();
    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    if (Component === Menu) {
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    }
    
    let headings = within(menu).getAllByRole('heading');
    expect(headings.length).toBe(2);

    for (let heading of headings) {
      expect(heading).toHaveAttribute('aria-level', '3');
    }
    let heading1 = within(menu).getByText('Heading 1');
    let heading2 = within(menu).getByText('Heading 2');
    expect(heading1).toBeTruthy();
    expect(heading2).toBeTruthy();

    let dividers = within(menu).getAllByRole('separator');
    expect(dividers.length).toBe(1);

    let items = within(menu).getAllByRole('menuitemradio');
    expect(items.length).toBe(5);
    for (let item of items) {
      if (Component === Menu) {
        expect(item).toHaveAttribute('tabindex');
        expect(item).toHaveAttribute('aria-checked');
        expect(item).toHaveAttribute('aria-disabled');
      }
    }
    let item1 = within(menu).getByText('Foo');
    let item2 = within(menu).getByText('Bar');
    let item3 = within(menu).getByText('Baz');
    let item4 = within(menu).getByText('Blah');
    let item5 = within(menu).getByText('Bleh');

    expect(item1).toBeTruthy();
    expect(item2).toBeTruthy();
    expect(item3).toBeTruthy();
    expect(item4).toBeTruthy();
    expect(item5).toBeTruthy();
    expect(item3).toBeTruthy();
  });

  it.each`
    Name        | Component | props
    ${'Menu'}   | ${Menu}   | ${{autoFocus: true}}
    ${'V2Menu'} | ${V2Menu} | ${{}}
  `('$Name allows user to change menu item focus via up/down arrow keys', async function ({Component, props}) {
    let tree = renderComponent(Component, {}, props);
    if (Component === V2Menu) {
      await waitForDomChange();
    }
    let menu = tree.getByRole('menu');
    let menuItems = within(menu).getAllByRole('menuitemradio');
    let selectedItem = menuItems[0];
    expect(selectedItem).toBe(document.activeElement);
    fireEvent.keyDown(selectedItem, {key: 'ArrowDown', code: 40, charCode: 40});
    let nextSelectedItem = menuItems[1];
    expect(nextSelectedItem).toBe(document.activeElement);
    fireEvent.keyDown(nextSelectedItem, {key: 'ArrowUp', code: 38, charCode: 38});
    expect(selectedItem).toBe(document.activeElement);
  });

  // V3 only behavior
  it.each`
    Name        | Component | props
    ${'Menu'}   | ${Menu}   | ${{autoFocus: true, wrapAround: true}}
  `('$Name wraps focus from first to last/last to first item if up/down arrow is pressed if wrapAround is true', async function ({Component, props}) {
    let tree = renderComponent(Component, {}, props);
    if (Component === V2Menu) {
      await waitForDomChange();
    }
    let menu = tree.getByRole('menu');
    let menuItems = within(menu).getAllByRole('menuitemradio');
    let firstItem = menuItems[0];
    expect(firstItem).toBe(document.activeElement);
    fireEvent.keyDown(firstItem, {key: 'ArrowUp', code: 38, charCode: 38});
    let lastItem = menuItems[menuItems.length - 1];
    expect(lastItem).toBe(document.activeElement);
    fireEvent.keyDown(lastItem, {key: 'ArrowDown', code: 40, charCode: 40});
    expect(firstItem).toBe(document.activeElement);
  });

  it.each`
    Name        | Component | props
    ${'Menu'}   | ${Menu}   | ${{role: 'listbox', defaultSelectedKeys: ['Blah']}}
  `('$Name renders with the right aria props if menu role is listbox', async function ({Component, props}) {
    let tree = renderComponent(Component, {}, props);
    await waitForDomChange();
    let menu = tree.getByRole('listbox');
    let menuItems = within(menu).getAllByRole('option');
    expect(menuItems.length).toBe(5);

    let selectedItem = menuItems[3];
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');

    let nonSelectedItem = menuItems[1];
    expect(nonSelectedItem).toHaveAttribute('aria-selected', 'false');
  });
  
  describe('supports single selection', function () {
    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, defaultSelectedKeys: ['Blah'], autoFocus: true}}
    `('$Name supports defaultSelectedKeys (uncontrolled)', async function ({Component, props}) {
      // Check that correct menu item is selected by default
      let tree = renderComponent(Component, {}, props);
      if (Component === V2Menu) {
        await waitForDomChange();
      }
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitemradio');
      let selectedItem = menuItems[3];
      expect(selectedItem).toBe(document.activeElement);
      expect(selectedItem).toHaveAttribute('aria-checked', 'true');
      expect(selectedItem).toHaveAttribute('tabindex', '0');
      let itemText = within(selectedItem).getByText('Blah');
      expect(itemText).toBeTruthy();
      let checkmark = within(selectedItem).getByRole('img');
      expect(checkmark).toBeTruthy();
    
      // Select a different menu item via enter
      let nextSelectedItem = menuItems[4];
      fireEvent.keyDown(nextSelectedItem, {key: 'Enter', code: 13, charCode: 13});
      expect(nextSelectedItem).toHaveAttribute('aria-checked', 'true');
      itemText = within(nextSelectedItem).getByText('Bleh');
      expect(itemText).toBeTruthy();
      checkmark = within(nextSelectedItem).getByRole('img');
      expect(checkmark).toBeTruthy();

      // Make sure there is only a single checkmark in the entire menu
      let checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(1);

      expect(onSelectionChange).toBeCalledTimes(1);
      expect(onSelectionChange.mock.calls[0][0].has('Bleh')).toBeTruthy();
    });

    it.each`
    Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, selectedKeys: ['Blah'], autoFocus: true}}
    `('$Name supports selectedKeys (controlled)', async function ({Component, props}) {
      // Check that correct menu item is selected by default
      let tree = renderComponent(Component, {}, props);
      if (Component === V2Menu) {
        await waitForDomChange();
      }
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitemradio');
      let selectedItem = menuItems[3];
      expect(selectedItem).toBe(document.activeElement);
      expect(selectedItem).toHaveAttribute('aria-checked', 'true');
      expect(selectedItem).toHaveAttribute('tabindex', '0');
      let itemText = within(selectedItem).getByText('Blah');
      expect(itemText).toBeTruthy();
      let checkmark = within(selectedItem).getByRole('img');
      expect(checkmark).toBeTruthy();
    
      // Select a different menu item via enter
      let nextSelectedItem = menuItems[4];
      fireEvent.keyDown(nextSelectedItem, {key: 'Enter', code: 13, charCode: 13});
      expect(nextSelectedItem).toHaveAttribute('aria-checked', 'false');
      expect(selectedItem).toHaveAttribute('aria-checked', 'true');
      checkmark = within(selectedItem).getByRole('img');
      expect(checkmark).toBeTruthy();

      // Make sure there is only a single checkmark in the entire menu
      let checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(1);

      expect(onSelectionChange).toBeCalledTimes(1);
      expect(onSelectionChange.mock.calls[0][0].has('Bleh')).toBeTruthy();
    });

    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange}}
      ${'V2Menu'} | ${V2Menu} | ${{onSelect}}
    `('$Name supports using space key to change item selection', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitemradio');
    
      // Trigger a menu item via space
      let item = menuItems[4];
      fireEvent.keyDown(item, {key: ' ', code: 32, charCode: 32});
      if (Component === Menu) {
        expect(item).toHaveAttribute('aria-checked', 'true');
        let checkmark = within(item).getByRole('img');
        expect(checkmark).toBeTruthy();
  
        // Make sure there is only a single checkmark in the entire menu
        let checkmarks = tree.getAllByRole('img');
        expect(checkmarks.length).toBe(1);
      }

      // Verify onSelectionChange is called
      if (Component === Menu) {
        expect(onSelectionChange).toBeCalledTimes(1);
        expect(onSelectionChange.mock.calls[0][0].has('Bleh')).toBeTruthy();
      } else {
        expect(onSelect).toBeCalledTimes(1);
        expect(onSelect.mock.calls[0][0]).toBe('bleh');
      }
    });

    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange}}
      ${'V2Menu'} | ${V2Menu} | ${{onSelect}}
    `('$Name supports using click to change item selection', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitemradio');
    
      // Trigger a menu item via press
      let item = menuItems[4];
      triggerPress(item);
      if (Component === Menu) {
        expect(item).toHaveAttribute('aria-checked', 'true');
        let checkmark = within(item).getByRole('img');
        expect(checkmark).toBeTruthy();
  
        // Make sure there is only a single checkmark in the entire menu
        let checkmarks = tree.getAllByRole('img');
        expect(checkmarks.length).toBe(1);
      }

      // Verify onSelectionChange is called
      if (Component === Menu) {
        expect(onSelectionChange).toBeCalledTimes(1);
        expect(onSelectionChange.mock.calls[0][0].has('Bleh')).toBeTruthy();
      } else {
        expect(onSelect).toBeCalledTimes(1);
        expect(onSelect.mock.calls[0][0]).toBe('bleh');
      }
    });
    
    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, disabledKeys: ['Baz']}}
      ${'V2Menu'} | ${V2Menu} | ${{onSelect}}
    `('$Name supports disabled items', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitemradio');
    
      // Attempt to trigger the disabled item
      let disabledItem = menuItems[2];
      triggerPress(disabledItem);
      expect(disabledItem).toHaveAttribute('aria-checked', 'false');
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true');

      // Make sure there are no checkmarks
      let checkmarks = tree.queryAllByRole('img');
      expect(checkmarks.length).toBe(0);

      // Verify onSelectionChange is not called
      if (Component === Menu) {
        expect(onSelectionChange).toBeCalledTimes(0);
      } else {
        expect(onSelect).toBeCalledTimes(0);
      }
    });
  });

  describe('supports multi selection', function () {
    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, selectionMode: 'multiple'}}
    `('$Name supports selecting multiple items', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      
      // Make sure nothing is checked by default
      let checkmarks = tree.queryAllByRole('img');
      expect(checkmarks.length).toBe(0);

      let menuItems = within(menu).getAllByRole('menuitemcheckbox');
      let firstItem = menuItems[3];
      triggerPress(firstItem);
      expect(firstItem).toHaveAttribute('aria-checked', 'true');
      let checkmark = within(firstItem).getByRole('img');
      expect(checkmark).toBeTruthy();
    
      // Select a different menu item
      let secondItem = menuItems[1];
      triggerPress(secondItem);
      expect(secondItem).toHaveAttribute('aria-checked', 'true');
      checkmark = within(secondItem).getByRole('img');
      expect(checkmark).toBeTruthy();

      // Make sure there are multiple checkmark in the entire menu
      checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(2);

      expect(onSelectionChange).toBeCalledTimes(2);
      expect(onSelectionChange.mock.calls[0][0].has('Blah')).toBeTruthy();
      expect(onSelectionChange.mock.calls[1][0].has('Bar')).toBeTruthy();
    });

    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, selectionMode: 'multiple', defaultSelectedKeys: ['Foo', 'Bar']}}
    `('$Name supports multiple defaultSelectedKeys (uncontrolled)', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      
      // Make sure two items are checked by default
      let checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(2);

      let menuItems = within(menu).getAllByRole('menuitemcheckbox');
      let firstItem = menuItems[0];
      let secondItem = menuItems[1];
      
      expect(firstItem).toHaveAttribute('aria-checked', 'true');
      expect(secondItem).toHaveAttribute('aria-checked', 'true');
      let itemText = within(firstItem).getByText('Foo');
      expect(itemText).toBeTruthy();
      itemText = within(secondItem).getByText('Bar');
      expect(itemText).toBeTruthy();
      let checkmark = within(firstItem).getByRole('img');
      expect(checkmark).toBeTruthy();
      checkmark = within(secondItem).getByRole('img');
      expect(checkmark).toBeTruthy();
         
      // Select a different menu item
      let thirdItem = menuItems[4];
      triggerPress(thirdItem);
      expect(thirdItem).toHaveAttribute('aria-checked', 'true');
      checkmark = within(thirdItem).getByRole('img');
      expect(checkmark).toBeTruthy();

      // Make sure there are now three checkmarks
      checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(3);

      expect(onSelectionChange).toBeCalledTimes(1);
      expect(onSelectionChange.mock.calls[0][0].has('Bleh')).toBeTruthy();
      expect(onSelectionChange.mock.calls[0][0].has('Foo')).toBeTruthy();
      expect(onSelectionChange.mock.calls[0][0].has('Bar')).toBeTruthy();
    });

    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, selectionMode: 'multiple', selectedKeys: ['Foo', 'Bar']}}
    `('$Name supports multiple selectedKeys (controlled)', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      
      // Make sure two items are checked by default
      let checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(2);

      let menuItems = within(menu).getAllByRole('menuitemcheckbox');
      let firstItem = menuItems[0];
      let secondItem = menuItems[1];
      
      expect(firstItem).toHaveAttribute('aria-checked', 'true');
      expect(secondItem).toHaveAttribute('aria-checked', 'true');
      let itemText = within(firstItem).getByText('Foo');
      expect(itemText).toBeTruthy();
      itemText = within(secondItem).getByText('Bar');
      expect(itemText).toBeTruthy();
      let checkmark = within(firstItem).getByRole('img');
      expect(checkmark).toBeTruthy();
      checkmark = within(secondItem).getByRole('img');
      expect(checkmark).toBeTruthy();
        
      // Select a different menu item
      let thirdItem = menuItems[4];
      triggerPress(thirdItem);
      expect(thirdItem).toHaveAttribute('aria-checked', 'false');
      checkmark = within(thirdItem).queryByRole('img');
      expect(checkmark).toBeNull();

      // Make sure there are still two checkmarks
      checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(2);

      expect(onSelectionChange).toBeCalledTimes(1);
      expect(onSelectionChange.mock.calls[0][0].has('Bleh')).toBeTruthy();
    });

    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, selectionMode: 'multiple', defaultSelectedKeys: ['Foo', 'Bar']}}
    `('$Name supports deselection', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      
      // Make sure two items are checked by default
      let checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(2);

      let menuItems = within(menu).getAllByRole('menuitemcheckbox');
      let firstItem = menuItems[0];
      let secondItem = menuItems[1];
      
      expect(firstItem).toHaveAttribute('aria-checked', 'true');
      expect(secondItem).toHaveAttribute('aria-checked', 'true');
      let itemText = within(firstItem).getByText('Foo');
      expect(itemText).toBeTruthy();
      itemText = within(secondItem).getByText('Bar');
      expect(itemText).toBeTruthy();
      let checkmark = within(firstItem).getByRole('img');
      expect(checkmark).toBeTruthy();
      checkmark = within(secondItem).getByRole('img');
      expect(checkmark).toBeTruthy();
         
      // Deselect the first item
      triggerPress(firstItem);
      expect(firstItem).toHaveAttribute('aria-checked', 'false');
      checkmark = within(firstItem).queryByRole('img');
      expect(checkmark).toBeNull();

      // Make sure there only a single checkmark now
      checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(1);

      expect(onSelectionChange).toBeCalledTimes(1);
      expect(onSelectionChange.mock.calls[0][0].has('Bar')).toBeTruthy();
    });

    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, selectionMode: 'multiple', defaultSelectedKeys: ['Foo', 'Bar'], disabledKeys: ['Baz']}}
    `('$Name supports disabledKeys', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');

      // Attempt to trigger disabled item
      let menuItems = within(menu).getAllByRole('menuitemcheckbox');
      let disabledItem = menuItems[2];
      triggerPress(disabledItem);
      
      expect(disabledItem).toHaveAttribute('aria-checked', 'false');
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
         
      // Make sure that only two items are checked still
      let checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(2);

      expect(onSelectionChange).toBeCalledTimes(0);
    });
  });

  describe('supports no selection', function () {
    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, selectionMode: 'none'}}
    `('$Name prevents selection of any items', async function ({Component, props}) {
      let tree = renderComponent(Component, {}, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      
      // Make sure nothing is checked by default
      let checkmarks = tree.queryAllByRole('img');
      expect(checkmarks.length).toBe(0);

      // Attempt to select a variety of items via enter, space, and click
      let menuItems = within(menu).getAllByRole('menuitem');
      let firstItem = menuItems[3];
      let secondItem = menuItems[4];
      let thirdItem = menuItems[1];
      triggerPress(firstItem);
      fireEvent.keyDown(secondItem, {key: ' ', code: 32, charCode: 32});
      fireEvent.keyDown(thirdItem, {key: 'Enter', code: 13, charCode: 13});
      expect(firstItem).not.toHaveAttribute('aria-checked', 'true');
      expect(secondItem).not.toHaveAttribute('aria-checked', 'true');
      expect(thirdItem).not.toHaveAttribute('aria-checked', 'true');
      
      // Make sure nothing is still checked
      checkmarks = tree.queryAllByRole('img');
      expect(checkmarks.length).toBe(0);
      expect(onSelectionChange).toBeCalledTimes(0);
    });
  });
});
