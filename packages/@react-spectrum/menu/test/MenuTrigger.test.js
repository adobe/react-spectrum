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

import {Button} from '@react-spectrum/button';
import {cleanup, fireEvent, render, waitForDomChange, within} from '@testing-library/react';
import {Item, Menu, MenuTrigger, Section} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';
import V2Button from '@react/react-spectrum/Button';
import V2Dropdown from '@react/react-spectrum/Dropdown';
import {Menu as V2Menu, MenuItem as V2MenuItem} from '@react/react-spectrum/Menu';

let triggerText = 'Menu Button';
let theme = {
  light: themeLight,
  medium: scaleMedium
};

let withSection = [
  {name: 'Heading 1', children: [
    {name: 'Foo'},
    {name: 'Bar'},
    {name: 'Baz'}
  ]}
];

function renderComponent(Component, triggerProps = {}, menuProps = {}) {
  if (Component === V2Dropdown) {
    return render(
      <Component {...triggerProps}>
        <V2Button
          variant="cta">
          {triggerText}
        </V2Button>
        <V2Menu {...menuProps}>
          <V2MenuItem value="foo">Foo</V2MenuItem>
          <V2MenuItem value="bar">Bar</V2MenuItem>
          <V2MenuItem value="baz">Baz</V2MenuItem>
        </V2Menu>
      </Component>
    );
  } else {
    return render(
      <Provider theme={theme}>
        <div data-testid="scrollable">
          <Component {...triggerProps}>
            <Button>
              {triggerText}
            </Button>
            <Menu items={withSection} itemKey="name" {...menuProps}>
              {item => (
                <Section items={item.children} title={item.name}>
                  {item => <Item childItems={item.children}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </Component>
        </div>
      </Provider>
    );
  }
}

describe('MenuTrigger', function () {
  let offsetWidth, offsetHeight;
  let onOpenChange = jest.fn();
  let onOpen = jest.fn();
  let onClose = jest.fn();
  let onSelect = jest.fn();
  let onSelectionChange = jest.fn();

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 1000);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    onOpenChange.mockClear();
    onOpen.mockClear();
    onClose.mockClear();
    onSelect.mockClear();
    onSelectionChange.mockClear();
    cleanup();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  function verifyMenuToggle(Component, triggerProps = {}, menuProps = {}, triggerEvent) {
    let tree = renderComponent(Component, triggerProps, menuProps);
    let triggerButton = tree.getByRole('button');

    if (Component === MenuTrigger) {
      expect(onOpenChange).toBeCalledTimes(0);
    } else {
      expect(onOpen).toBeCalledTimes(0);
      expect(onClose).toBeCalledTimes(0);
    }

    triggerEvent(triggerButton);

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);
    
    let menuItem1 = within(menu).getByText('Foo');
    let menuItem2 = within(menu).getByText('Bar');
    let menuItem3 = within(menu).getByText('Baz');
    expect(menuItem1).toBeTruthy();
    expect(menuItem2).toBeTruthy();
    expect(menuItem3).toBeTruthy();
  
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
    expect(triggerButton).toHaveAttribute('aria-controls', menu.id);
  
    if (Component === MenuTrigger) {
      expect(onOpenChange).toBeCalledTimes(1);
    } else {
      expect(onOpen).toBeCalledTimes(1);
      expect(onClose).toBeCalledTimes(0);
    }
  
    triggerEvent(triggerButton);
    expect(menu).not.toBeInTheDocument();  
    
    if (Component === MenuTrigger) {
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toBeCalledTimes(2);
    } else {
      expect(triggerButton).not.toHaveAttribute('aria-expanded');
      expect(onOpen).toBeCalledTimes(1);
      expect(onClose).toBeCalledTimes(1);
    }
  }

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    ${'V2Dropdown'}  | ${V2Dropdown}  | ${{}}
  `('$Name has default behavior (button renders, menu is closed)', function ({Component}) {
    let tree = renderComponent(Component);
    let triggerButton = tree.getByRole('button');
    expect(triggerButton).toBeTruthy();
    expect(triggerButton).toHaveAttribute('aria-haspopup', 'true');
    
    let buttonText = within(triggerButton).getByText(triggerText);
    expect(buttonText).toBeTruthy();

    let menuItem = tree.queryByText('Foo');
    expect(menuItem).toBeFalsy();

    if (Component === MenuTrigger) {
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(triggerButton).toHaveAttribute('type', 'button');
    }
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    ${'V2Dropdown'}  | ${V2Dropdown}  | ${{onOpen, onClose}}
  `('$Name toggles the menu display on button click', function ({Component, props}) {
    verifyMenuToggle(Component, props, {}, (button) => triggerPress(button));
  });

  // Enter and Space keypress tests are ommitted since useMenuTrigger doesn't have space and enter cases in it's key down
  // since usePress handles those cases

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
  `('$Name can toggle the menu display via ArrowUp key', function ({Component, props}) {
    verifyMenuToggle(Component, props, {}, (button) => fireEvent.keyDown(button, {key: 'ArrowUp', code: 38, charCode: 38}));
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    ${'V2Dropdown'}  | ${V2Dropdown}  | ${{onOpen, onClose}}
  `('$Name can toggle the menu display via ArrowDown key', function ({Component, props}) {
    verifyMenuToggle(Component, props, {}, (button) => fireEvent.keyDown(button, {key: 'ArrowDown', code: 40, charCode: 40}));
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, isOpen: true}}
  `('$Name supports a controlled open state ', async function ({Component, props}) {
    let tree = renderComponent(Component, props);
    expect(onOpenChange).toBeCalledTimes(0);

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();

    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    await waitForDomChange();

    menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(onOpenChange).toBeCalledTimes(1);
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, defaultOpen: true}}
  `('$Name supports a uncontrolled default open state ', async function ({Component, props}) {
    let tree = renderComponent(Component, props);
    expect(onOpenChange).toBeCalledTimes(0);

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();

    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    await waitForDomChange();

    expect(menu).not.toBeInTheDocument();
    expect(onOpenChange).toBeCalledTimes(1);
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, isDisabled: true}}
  `('$Name can be disabled', async function ({Component, props}) {
    let tree = renderComponent(Component, props);
    let button = tree.getByRole('button');
    triggerPress(button);
    let menu = tree.queryByRole('menu');
    expect(menu).toBeNull();
    expect(onOpenChange).toBeCalledTimes(0);
  });

  describe('default focus behavior', function () {
    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    `('$Name autofocuses the selected item on menu open', async function ({Component, props}) {
      let tree = renderComponent(Component, props, {selectedKeys: ['Bar']});
      let button = tree.getByRole('button');
      triggerPress(button);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitemradio');
      let selectedItem = menuItems[1];
      expect(selectedItem).toBe(document.activeElement);
      triggerPress(button);

      await waitForDomChange();
      expect(menu).not.toBeInTheDocument();

      // Opening menu via down arrow still autofocuses the selected item
      fireEvent.keyDown(button, {key: 'ArrowDown', code: 40, charCode: 40});
      await waitForDomChange();
      menu = tree.getByRole('menu');
      menuItems = within(menu).getAllByRole('menuitemradio');
      selectedItem = menuItems[1];
      expect(selectedItem).toBe(document.activeElement);
      triggerPress(button);
      await waitForDomChange();
      expect(menu).not.toBeInTheDocument();

      // Opening menu via up arrow still autofocuses the selected item
      fireEvent.keyDown(button, {key: 'ArrowUp', code: 38, charCode: 38});
      await waitForDomChange();
      menu = tree.getByRole('menu');
      menuItems = within(menu).getAllByRole('menuitemradio');
      selectedItem = menuItems[1];
      expect(selectedItem).toBe(document.activeElement);
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    `('$Name focuses the last item on ArrowUp if there isn\'t a selected item', async function ({Component, props}) {
      let tree = renderComponent(Component, props, {});
      let button = tree.getByRole('button');
      fireEvent.keyDown(button, {key: 'ArrowUp', code: 38, charCode: 38});
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitemradio');
      let selectedItem = menuItems[menuItems.length - 1];
      expect(selectedItem).toBe(document.activeElement);
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    `('$Name focuses the first item on ArrowDown if there isn\'t a selected item', async function ({Component, props}) {
      let tree = renderComponent(Component, props, {});
      let button = tree.getByRole('button');
      fireEvent.keyDown(button, {key: 'ArrowDown', code: 40, charCode: 40});
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitemradio');
      let selectedItem = menuItems[0];
      expect(selectedItem).toBe(document.activeElement);
    });
  });

  describe('menu popover closing behavior', function () {
    function triggerMenuItem(Component, triggerProps = {}, menuProps = {}, triggerEvent) {
      let tree = renderComponent(Component, triggerProps, menuProps);
      let triggerButton = tree.getByRole('button');
      triggerPress(triggerButton);

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      
      let menuItemRole = 'menuitem';
      if (Component === MenuTrigger) {
        if (menuProps.role === 'listbox') {
          menuItemRole = 'option';
        } else if (menuProps.selectionMode === 'single') {
          menuItemRole = 'menuitemradio';
        } else if (menuProps.selectionMode === 'multiple') {
          menuItemRole = 'menuitemcheckbox';
        }
      }
      
      let menuItems = within(menu).getAllByRole(menuItemRole);
      let itemToAction = menuItems[1];
      triggerEvent(itemToAction);

      return tree;
    }
    
    // New functionality in v3
    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    `('$Name closes the menu upon trigger body scroll', async function ({Component, props}) {
      let tree = renderComponent(Component, props);
      let button = tree.getByRole('button');
      triggerPress(button);
      await waitForDomChange();

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();

      let scrollable = tree.getByTestId('scrollable');
      fireEvent.scroll(scrollable);
      await waitForDomChange();
      expect(menu).not.toBeInTheDocument();
    });

    // Can't figure out why this isn't working for the v2 component
    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    `('$Name closes the menu upon clicking escape key', async function ({Component, props}) {
      let tree = renderComponent(Component, props);
      let button = tree.getByRole('button');
      triggerPress(button);
      await waitForDomChange();

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      fireEvent.keyDown(menu, {key: 'Escape', code: 27, charCode: 27});
      await waitForDomChange();
      expect(menu).not.toBeInTheDocument();
    });

    // Can't figure out why this isn't working for the v2 component
    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    `('$Name closes the menu upon clicking outside the menu', async function ({Component, props}) {
      let tree = renderComponent(Component, props);
      let button = tree.getByRole('button');
      triggerPress(button);
      await waitForDomChange();

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      fireEvent.mouseUp(document.body);
      await waitForDomChange();
      expect(menu).not.toBeInTheDocument();
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, closeOnSelect: false}}
      ${'V2Dropdown'}  | ${V2Dropdown}  | ${{onOpen, onClose, onSelect, closeOnSelect: false}}
    `('$Name doesn\'t close on menu item selection if closeOnSelect=false', async function ({Component, props}) {
      let tree = renderComponent(Component, props, {onSelectionChange});
      expect(onOpenChange).toBeCalledTimes(0);
      let button = tree.getByRole('button');
      triggerPress(button);
      await waitForDomChange();

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      if (Component === MenuTrigger) {
        expect(onOpenChange).toBeCalledTimes(1);
        expect(onSelectionChange).toBeCalledTimes(0);
      } else {
        expect(onOpen).toBeCalledTimes(1);
        expect(onClose).toBeCalledTimes(0);
        expect(onSelect).toBeCalledTimes(0);
      }

      let menuItem1 = within(menu).getByText('Foo');
      expect(menuItem1).toBeTruthy();
      triggerPress(menuItem1);
      
      if (Component === MenuTrigger) {
        expect(onSelectionChange).toBeCalledTimes(1);
      } else {
        expect(onSelect).toBeCalledTimes(1);
      }

      expect(menu).toBeInTheDocument();  
      
      if (Component === MenuTrigger) {
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(onOpenChange).toBeCalledTimes(1);
      } else {
        expect(button).toHaveAttribute('aria-expanded');
        expect(onOpen).toBeCalledTimes(1);
        expect(onClose).toBeCalledTimes(0);
      }
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, closeOnSelect: false}}
    `('$Name closes menu on item selection via ENTER press even if closeOnSelect=false', async function ({Component, props}) {
      let tree = renderComponent(Component, props, {onSelectionChange});
      expect(onOpenChange).toBeCalledTimes(0);
      let button = tree.getByRole('button');
      triggerPress(button);
      await waitForDomChange();

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onSelectionChange).toBeCalledTimes(0);


      let menuItem1 = within(menu).getByText('Foo');
      expect(menuItem1).toBeTruthy();
      fireEvent.keyDown(menuItem1, {key: 'Enter', code: 13, charCode: 13});
      expect(onSelectionChange).toBeCalledTimes(1);
      await waitForDomChange();
      expect(menu).not.toBeInTheDocument();  
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toBeCalledTimes(2);
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
      ${'V2Dropdown'}  | ${V2Dropdown}  | ${{}}
    `('$Name closes on menu item selection if toggled by mouse click', async function ({Component, props}) {
      let selectionModes = ['single', 'multiple', 'none'];
      for (let mode of selectionModes) {
        let tree = triggerMenuItem(Component, {}, {...props, selectionMode: mode}, (item) => triggerPress(item));
        let menu = tree.queryByRole('menu');
        expect(menu).toBeNull();
        cleanup();
      }
    });

    it.each`
    Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
      ${'V2Dropdown'}  | ${V2Dropdown}  | ${{}}
    `('$Name closes on menu item selection if toggled by ENTER key', async function ({Component, props}) {
      let selectionModes = ['single', 'multiple', 'none'];
      for (let mode of selectionModes) {
        let tree = triggerMenuItem(Component, {}, {...props, selectionMode: mode}, (item) => fireEvent.keyDown(item, {key: 'Enter', code: 13, charCode: 13}));
        let menu = tree.queryByRole('menu');
        expect(menu).toBeNull();
        cleanup();
      }
    });

    // V3 exclusive
    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    `('$Name doesn\'t close on menu item selection if toggled by SPACE key (all selection modes except "none")', async function ({Component, props}) {
      let selectionModes = ['single', 'multiple'];
      for (let mode of selectionModes) {
        let tree = triggerMenuItem(Component, {}, {...props, selectionMode: mode}, (item) => fireEvent.keyDown(item, {key: ' ', code: 32, charCode: 32}));
        let menu = tree.queryByRole('menu');
        expect(menu).toBeTruthy();
        cleanup();
      }
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{selectionMode: 'none'}}
      ${'V2Dropdown'}  | ${V2Dropdown}  | ${{}}
    `('$Name closes on menu item selection if toggled by SPACE key (selectionMode=none)', async function ({Component, props}) {
      let tree = triggerMenuItem(Component, {}, props, (item) => fireEvent.keyDown(item, {key: ' ', code: 32, charCode: 32}));
      let menu = tree.queryByRole('menu');
      expect(menu).toBeNull();
    });

  });
});
