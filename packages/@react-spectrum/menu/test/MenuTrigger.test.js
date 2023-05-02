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

import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {action} from '@storybook/addon-actions';
import {ActionButton, Button} from '@react-spectrum/button';
import {Content, Footer} from '@react-spectrum/view';
import {DEFAULT_LONG_PRESS_TIME, installPointerEvent, triggerLongPress, triggerPress, triggerTouch} from '@react-spectrum/test-utils';
import {Dialog} from '@react-spectrum/dialog';
import {Heading, Text} from '@react-spectrum/text';
import {Item, Menu, MenuDialogTrigger, MenuTrigger, Section} from '../';
import {Link} from '@react-spectrum/link';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

let triggerText = 'Menu Button';

let withSection = [
  {name: 'Heading 1', children: [
    {name: 'Foo'},
    {name: 'Bar'},
    {name: 'Baz'}
  ]}
];

function renderComponent(Component, triggerProps = {}, menuProps = {}, buttonProps = {}) {
  return render(
    <Provider theme={theme}>
      <div data-testid="scrollable">
        <Component {...triggerProps}>
          <Button {...buttonProps}>
            {triggerText}
          </Button>
          <Menu items={withSection} {...menuProps}>
            {item => (
              <Section key={item.name} items={item.children} title={item.name}>
                {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </Component>
      </div>
    </Provider>
  );
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
    jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
    jest.useFakeTimers();
  });

  afterEach(() => {
    onOpenChange.mockClear();
    onOpen.mockClear();
    onClose.mockClear();
    onSelect.mockClear();
    onSelectionChange.mockClear();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  function verifyMenuToggle(Component, triggerProps = {}, menuProps = {}, triggerEvent) {
    let tree = renderComponent(Component, triggerProps, menuProps);
    let triggerButton = tree.getByRole('button');

    expect(onOpenChange).toBeCalledTimes(0);

    triggerEvent(triggerButton);
    act(() => {jest.runAllTimers();});

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

    triggerEvent(triggerButton, menu);
    act(() => {jest.runAllTimers();});
    expect(menu).not.toBeInTheDocument();

    if (Component === MenuTrigger) {
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toBeCalledTimes(2);
    } else {
      expect(triggerButton).not.toHaveAttribute('aria-expanded');
      expect(onOpen).toBeCalledTimes(1);
    }
  }

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
  `('$Name has default behavior (button renders, menu is closed)', function ({Component}) {
    let tree = renderComponent(Component);
    let triggerButton = tree.getByRole('button');
    expect(triggerButton).toBeTruthy();
    expect(triggerButton).toHaveAttribute('aria-haspopup', 'true');

    let buttonText = within(triggerButton).getByText(triggerText);
    expect(buttonText).toBeTruthy();

    let menuItem = tree.queryByText('Foo');
    expect(menuItem).toBeFalsy();

    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    expect(triggerButton).toHaveAttribute('type', 'button');
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
  `('$Name toggles the menu display on button click', function ({Component, props}) {
    verifyMenuToggle(Component, props, {}, (button) => triggerPress(button));
  });

  // Enter and Space keypress tests are ommitted since useMenuTrigger doesn't have space and enter cases in it's key down
  // since usePress handles those cases

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
  `('$Name can toggle the menu display via ArrowUp key', function ({Component, props}) {
    verifyMenuToggle(Component, props, {}, (button, menu) => {
      if (!menu) {
        fireEvent.keyDown(button, {key: 'ArrowUp', code: 38, charCode: 38});
      } else {
        fireEvent.keyDown(menu, {key: 'Escape'});
      }
    });
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
  `('$Name can toggle the menu display via ArrowDown key', function ({Component, props}) {
    verifyMenuToggle(Component, props, {}, (button, menu) => {
      if (!menu) {
        fireEvent.keyDown(button, {key: 'ArrowDown', code: 40, charCode: 40});
      } else {
        fireEvent.keyDown(menu, {key: 'Escape'});
      }
    });
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, isOpen: true}}
  `('$Name supports a controlled open state ', function ({Component, props}) {
    let tree = renderComponent(Component, props);
    act(() => {jest.runAllTimers();});
    expect(onOpenChange).toBeCalledTimes(0);

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();

    let triggerButton = tree.getByText('Menu Button');
    triggerPress(triggerButton);
    act(() => {jest.runAllTimers();});

    menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(onOpenChange).toBeCalledTimes(1);
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, defaultOpen: true}}
  `('$Name supports a uncontrolled default open state ', function ({Component, props}) {
    let tree = renderComponent(Component, props);
    act(() => {jest.runAllTimers();});
    expect(onOpenChange).toBeCalledTimes(0);

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();

    let triggerButton = tree.getByText('Menu Button');
    triggerPress(triggerButton);
    act(() => {jest.runAllTimers();});

    expect(menu).not.toBeInTheDocument();
    expect(onOpenChange).toBeCalledTimes(1);
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
  `('$Name does not trigger on disabled button', function ({Component, props}) {
    let tree = renderComponent(Component, props, {}, {isDisabled: true});
    let button = tree.getByRole('button');
    triggerPress(button);
    act(() => {jest.runAllTimers();});
    let menu = tree.queryByRole('menu');
    expect(menu).toBeNull();
    expect(onOpenChange).toBeCalledTimes(0);
  });

  describe('default focus behavior', function () {
    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    `('$Name autofocuses the selected item on menu open', function ({Component, props}) {
      let tree = renderComponent(Component, props, {selectedKeys: ['Bar']});
      act(() => {jest.runAllTimers();});
      let button = tree.getByRole('button');
      triggerPress(button);
      act(() => {jest.runAllTimers();});
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let selectedItem = menuItems[1];
      expect(selectedItem).toBe(document.activeElement);
      triggerPress(button);
      act(() => {jest.runAllTimers();});

      expect(menu).not.toBeInTheDocument();
      act(() => {jest.runAllTimers();});

      // Opening menu via down arrow still autofocuses the selected item
      fireEvent.keyDown(button, {key: 'ArrowDown', code: 40, charCode: 40});
      fireEvent.keyUp(button, {key: 'ArrowDown', code: 40, charCode: 40});
      act(() => {jest.runAllTimers();});
      menu = tree.getByRole('menu');
      menuItems = within(menu).getAllByRole('menuitem');
      selectedItem = menuItems[1];
      expect(selectedItem).toBe(document.activeElement);
      triggerPress(button);
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();

      // Opening menu via up arrow still autofocuses the selected item
      fireEvent.keyDown(button, {key: 'ArrowUp', code: 38, charCode: 38});
      menu = tree.getByRole('menu');
      menuItems = within(menu).getAllByRole('menuitem');
      selectedItem = menuItems[1];
      expect(selectedItem).toBe(document.activeElement);
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    `('$Name focuses the last item on ArrowUp if there isn\'t a selected item', function ({Component, props}) {
      let tree = renderComponent(Component, props, {});
      let button = tree.getByRole('button');
      fireEvent.keyDown(button, {key: 'ArrowUp', code: 38, charCode: 38});
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitem');
      let selectedItem = menuItems[menuItems.length - 1];
      expect(selectedItem).toBe(document.activeElement);
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    `('$Name focuses the first item on ArrowDown if there isn\'t a selected item', function ({Component, props}) {
      let tree = renderComponent(Component, props, {});
      let button = tree.getByRole('button');
      fireEvent.keyDown(button, {key: 'ArrowDown', code: 40, charCode: 40});
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitem');
      let selectedItem = menuItems[0];
      expect(selectedItem).toBe(document.activeElement);
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    `('$Name moves focus via ArrowDown and ArrowUp', function ({Component, props}) {
      let tree = render(
        <Provider theme={theme}>
          <div data-testid="scrollable">
            <MenuTrigger>
              <Button>
                {triggerText}
              </Button>
              <Menu>
                <Item key="1">One</Item>
                <Item key="">Two</Item>
                <Item key="3">Three</Item>
              </Menu>
            </MenuTrigger>
          </div>
        </Provider>
      );

      let button = tree.getByRole('button');
      fireEvent.keyDown(button, {key: 'ArrowDown', code: 40, charCode: 40});
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitem');
      let selectedItem = menuItems[0];
      expect(selectedItem).toBe(document.activeElement);

      fireEvent.keyDown(menu, {key: 'ArrowDown', code: 40, charCode: 40});
      expect(menuItems[1]).toBe(document.activeElement);

      fireEvent.keyDown(menu, {key: 'ArrowDown', code: 40, charCode: 40});
      expect(menuItems[2]).toBe(document.activeElement);

      fireEvent.keyDown(menu, {key: 'ArrowUp', code: 38, charCode: 38});
      expect(menuItems[1]).toBe(document.activeElement);
    });
  });

  describe('menu popover closing behavior', function () {
    let tree;
    afterEach(() => {
      if (tree) {
        tree.unmount();
      }
      tree = null;
    });

    function openAndTriggerMenuItem(tree, role, selectionMode, triggerEvent) {
      let triggerButton = tree.getByRole('button');
      act(() => triggerPress(triggerButton));
      act(() => jest.runAllTimers());

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();

      let menuItemRole = 'menuitem';
      if (role === 'listbox') {
        menuItemRole = 'option';
      } else if (selectionMode === 'single') {
        menuItemRole = 'menuitemradio';
      } else if (selectionMode === 'multiple') {
        menuItemRole = 'menuitemcheckbox';
      }

      let menuItems = within(menu).getAllByRole(menuItemRole);
      let itemToAction = menuItems[1];
      act(() => {
        triggerEvent(itemToAction);
      });
      act(() => {jest.runAllTimers();}); // FocusScope useLayoutEffect cleanup
      act(() => {jest.runAllTimers();}); // FocusScope raf
    }

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    `('$Name closes the menu upon clicking escape key', function ({Component, props}) {
      tree = renderComponent(Component, props);
      let button = tree.getByRole('button');
      triggerPress(button);
      act(() => {jest.runAllTimers();});

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      fireEvent.keyDown(menu, {key: 'Escape', code: 27, charCode: 27});
      act(() => {jest.runAllTimers();}); // FocusScope useLayoutEffect cleanup
      act(() => {jest.runAllTimers();}); // FocusScope raf
      expect(menu).not.toBeInTheDocument();
      expect(document.activeElement).toBe(button);
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    `('$Name does not clear selection with escape', function ({Component, props}) {
      let onSelectionChange = jest.fn();
      tree = renderComponent(Component, props, {selectionMode: 'multiple', defaultSelectedKeys: ['Foo'], onSelectionChange});
      let button = tree.getByRole('button');
      triggerPress(button);
      act(() => {jest.runAllTimers();});
      expect(onSelectionChange).not.toHaveBeenCalled();

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      expect(within(menu).getAllByRole('menuitemcheckbox')[0]).toHaveAttribute('aria-checked', 'true');
      fireEvent.keyDown(menu, {key: 'Escape', code: 27, charCode: 27});
      act(() => {jest.runAllTimers();}); // FocusScope useLayoutEffect cleanup
      act(() => {jest.runAllTimers();}); // FocusScope raf
      expect(menu).not.toBeInTheDocument();
      expect(document.activeElement).toBe(button);
      expect(onSelectionChange).not.toHaveBeenCalled();

      // reopen and make sure we still have the selection
      triggerPress(button);
      act(() => {jest.runAllTimers();});
      expect(onSelectionChange).not.toHaveBeenCalled();

      menu = tree.getByRole('menu');
      expect(within(menu).getAllByRole('menuitemcheckbox')[0]).toHaveAttribute('aria-checked', 'true');
      expect(menu).toBeTruthy();
      fireEvent.keyDown(menu, {key: 'Escape', code: 27, charCode: 27});
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    `('$Name closes the menu upon clicking outside the menu', function ({Component, props}) {
      tree = renderComponent(Component, props);
      let button = tree.getByRole('button');
      triggerPress(button);
      act(() => {jest.runAllTimers();});

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);
      act(() => {jest.runAllTimers();}); // FocusScope useLayoutEffect cleanup
      act(() => {jest.runAllTimers();}); // FocusScope raf
      expect(menu).not.toBeInTheDocument();
      expect(document.activeElement).toBe(button);
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, closeOnSelect: false}}
    `('$Name doesn\'t close on menu item selection if closeOnSelect=false', function ({Component, props}) {
      tree = renderComponent(Component, props, {selectionMode: 'single', onSelectionChange});
      expect(onOpenChange).toBeCalledTimes(0);
      let button = tree.getByRole('button');
      triggerPress(button);
      act(() => {jest.runAllTimers();});

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
    `('$Name doesn\'t closes menu on item selection via ENTER press if closeOnSelect=false', function ({Component, props}) {
      tree = renderComponent(Component, props, {selectionMode: 'single', onSelectionChange});
      expect(onOpenChange).toBeCalledTimes(0);
      let button = tree.getByRole('button');
      triggerPress(button);
      act(() => {jest.runAllTimers();});

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onSelectionChange).toBeCalledTimes(0);


      let menuItem1 = within(menu).getByText('Foo');
      expect(menuItem1).toBeTruthy();
      fireEvent.keyDown(menuItem1, {key: 'Enter', code: 13, charCode: 13});
      fireEvent.keyUp(menuItem1, {key: 'Enter', code: 13, charCode: 13});
      act(() => {jest.runAllTimers();});
      expect(onSelectionChange).toBeCalledTimes(1);
      expect(menu).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange).toBeCalledTimes(1);
    });

    it.each`
      Name                      | Component      | props | menuProps
      ${'MenuTrigger multiple'} | ${MenuTrigger} | ${{}} | ${{selectionMode: 'multiple'}}
    `('$Name doesn\'t close menu on item selection via mouse with multiple selection', function ({Component, props, menuProps}) {
      tree = renderComponent(Component, props, menuProps);
      openAndTriggerMenuItem(tree, props.role, menuProps.selectionMode, (item) => triggerPress(item));

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
    });

    it.each`
      Name                      | Component      | props | menuProps
      ${'MenuTrigger single'}   | ${MenuTrigger} | ${{}} | ${{selectionMode: 'single'}}
      ${'MenuTrigger multiple'} | ${MenuTrigger} | ${{closeOnSelect: true}} | ${{selectionMode: 'multiple'}}
      ${'MenuTrigger none'}     | ${MenuTrigger} | ${{}} | ${{selectionMode: 'none'}}
    `('$Name closes on menu item selection if toggled by mouse click', function ({Component, props, menuProps}) {
      tree = renderComponent(Component, props, menuProps);
      openAndTriggerMenuItem(tree, props.role, menuProps.selectionMode, (item) => triggerPress(item));

      let menu = tree.queryByRole('menu');
      expect(menu).toBeNull();
      expect(document.activeElement).toBe(tree.getByRole('button'));
    });

    it.each`
      Name                      | Component      | props | menuProps
      ${'MenuTrigger single'}   | ${MenuTrigger} | ${{}} | ${{selectionMode: 'single'}}
      ${'MenuTrigger multiple'} | ${MenuTrigger} | ${{}} | ${{selectionMode: 'multiple'}}
      ${'MenuTrigger none'}     | ${MenuTrigger} | ${{}} | ${{selectionMode: 'none'}}
    `('$Name closes on menu item selection if toggled by ENTER key', function ({Component, props, menuProps}) {
      tree = renderComponent(Component, props, menuProps);
      openAndTriggerMenuItem(tree, props.role, menuProps.selectionMode, (item) => fireEvent.keyDown(item, {key: 'Enter', code: 13, charCode: 13}));

      let menu = tree.queryByRole('menu');
      expect(menu).toBeNull();
      expect(document.activeElement).toBe(tree.getByRole('button'));
    });

    it.each`
      Name                      | Component      | props | menuProps
      ${'MenuTrigger single'}   | ${MenuTrigger} | ${{}} | ${{selectionMode: 'single'}}
      ${'MenuTrigger multiple'} | ${MenuTrigger} | ${{}} | ${{selectionMode: 'multiple'}}
    `('$Name doesn\'t close on menu item selection if toggled by SPACE key (all selection modes except "none")', function ({Component, props, menuProps}) {
      tree = renderComponent(Component, props, menuProps);
      openAndTriggerMenuItem(tree, props.role, menuProps.selectionMode, (item) => fireEvent.keyDown(item, {key: ' ', code: 32, charCode: 32}));

      let menu = tree.queryByRole('menu');
      expect(menu).toBeTruthy();
    });

    it.each`
      Name                  | Component      | props | menuProps
      ${'MenuTrigger none'} | ${MenuTrigger} | ${{}} | ${{selectionMode: 'none'}}
    `('$Name closes on menu item selection if toggled by SPACE key (selectionMode=none)', function ({Component, props, menuProps}) {
      tree = renderComponent(Component, props, menuProps);
      openAndTriggerMenuItem(tree, props.role, menuProps.selectionMode, (item) => fireEvent.keyDown(item, {key: ' ', code: 32, charCode: 32}));

      let menu = tree.queryByRole('menu');
      expect(menu).toBeNull();
      expect(document.activeElement).toBe(tree.getByRole('button'));
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    `('$Name closes the menu when blurring the menu', function ({Component, props}) {
      tree = renderComponent(Component, props, {});
      expect(onOpenChange).toBeCalledTimes(0);
      let button = tree.getByRole('button');
      triggerPress(button);
      act(() => {jest.runAllTimers();});

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      act(() => {document.activeElement.blur();});
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toBeCalledTimes(2);
    });

    it.each`
      Name                      | Component      | props | menuProps
      ${'MenuTrigger single'}   | ${MenuTrigger} | ${{}} | ${{selectionMode: 'single'}}
      ${'MenuTrigger multiple'} | ${MenuTrigger} | ${{}} | ${{selectionMode: 'multiple'}}
      ${'MenuTrigger none'}     | ${MenuTrigger} | ${{}} | ${{selectionMode: 'none'}}
    `('$Name ignores repeating keyboard events', function ({Component, props, menuProps}) {
      tree = renderComponent(Component, props, menuProps);
      openAndTriggerMenuItem(tree, props.role, menuProps.selectionMode, (item) => fireEvent.keyDown(item, {key: 'Enter', code: 13, charCode: 13, repeat: true}));

      let menu = tree.queryByRole('menu');
      expect(menu).toBeTruthy();
    });

    it('tabs to the next element after the trigger and closes the menu', function () {
      tree = render(
        <Provider theme={theme}>
          <input data-testid="before-input" />
          <MenuTrigger onOpenChange={onOpenChange}>
            <Button>
              {triggerText}
            </Button>
            <Menu items={withSection}>
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
          <input data-testid="after-input" />
        </Provider>
      );

      let button = tree.getByRole('button');
      triggerPress(button);
      act(() => {jest.runAllTimers();});

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      fireEvent.keyDown(document.activeElement, {key: 'Tab'});
      act(() => {jest.runAllTimers();});

      expect(document.activeElement).toBe(tree.getByTestId('after-input'));

      expect(menu).not.toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toBeCalledTimes(2);
    });

    it('should have a hidden dismiss button for screen readers', function () {
      let {getByRole, getAllByLabelText} = render(
        <Provider theme={theme}>
          <MenuTrigger onOpenChange={onOpenChange}>
            <Button>
              {triggerText}
            </Button>
            <Menu items={withSection}>
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
        </Provider>
      );

      let button = getByRole('button');
      act(() => {
        triggerPress(button);
      });
      act(() => jest.runAllTimers());

      let menu = getByRole('menu');
      expect(menu).toBeTruthy();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      let buttons = getAllByLabelText('Dismiss');
      expect(buttons.length).toBe(2);

      act(() => {
        fireEvent.click(buttons[0]);
      });
      act(() => {jest.runAllTimers();}); // FocusScope useLayoutEffect cleanup
      act(() => {jest.runAllTimers();}); // FocusScope raf
      expect(onOpenChange).toHaveBeenCalledTimes(2);

      expect(menu).not.toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(document.activeElement).toBe(button);
    });

    it('should forward ref to the button', function () {
      let ref = React.createRef();
      let {getByRole} = render(
        <Provider theme={theme}>
          <MenuTrigger ref={ref}>
            <Button>
              {triggerText}
            </Button>
            <Menu items={withSection}>
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
        </Provider>
      );

      expect(ref.current.UNSAFE_getDOMNode()).toBe(getByRole('button'));
    });

    it('works with a ref on both the button and menu trigger', function () {
      let menuTriggerRef = React.createRef();
      let buttonRef = React.createRef();
      let {getByRole} = render(
        <Provider theme={theme}>
          <MenuTrigger ref={menuTriggerRef}>
            <Button ref={buttonRef}>
              {triggerText}
            </Button>
            <Menu items={withSection}>
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
        </Provider>
      );

      expect(menuTriggerRef.current.UNSAFE_getDOMNode()).toBe(getByRole('button'));
      expect(buttonRef.current.UNSAFE_getDOMNode()).toBe(getByRole('button'));
    });
  });

  it('should not show checkmarks if selectionMode not defined', function () {
    let {queryByRole} = render(
      <Menu aria-label="foo" selectedKeys={['alpha']}>
        <Item key="alpha">Alpha</Item>
        <Item key="bravo">Bravo</Item>
      </Menu>
    );
    let checkmark = queryByRole('img', {hidden: true});
    expect(checkmark).toBeNull();
  });

  it('two menus can not be open at the same time', function () {
    let {getAllByRole, getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button>
            {triggerText}
          </Button>
          <Menu items={withSection}>
            <Item key="alpha">Alpha</Item>
            <Item key="bravo">Bravo</Item>
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <Button>
            {triggerText}
          </Button>
          <Menu items={withSection}>
            <Item key="whiskey">Whiskey</Item>
            <Item key="tango">Tango</Item>
            <Item key="foxtrot">Foxtrot</Item>
          </Menu>
        </MenuTrigger>
      </Provider>
    );
    let [button1, button2] = getAllByRole('button');
    triggerPress(button1);
    act(() => jest.runAllTimers());
    let menu = getByRole('menu');
    let menuItem1 = within(menu).getByText('Alpha');
    expect(menuItem1).toBeInTheDocument();

    // pressing once on button 2 should close menu1, but not open menu2 yet
    triggerPress(button2);
    act(() => {jest.runAllTimers();}); // FocusScope useLayoutEffect cleanup
    act(() => {jest.runAllTimers();}); // FocusScope raf
    expect(queryByRole('menu')).toBeNull();

    // second press of button2 should open menu2
    triggerPress(button2);
    act(() => jest.runAllTimers());
    let menu2 = getByRole('menu');
    let menu2Item1 = within(menu2).getByText('Whiskey');
    expect(menu2Item1).toBeInTheDocument();
  });

  describe('MenuTrigger trigger="longPress" open behavior', function () {
    installPointerEvent();

    const ERROR_MENU_NOT_FOUND = new Error('Menu not found');
    const getMenuOrThrow = (tree, button) => {
      try {
        let menu = tree.getByRole('menu');
        expect(menu).toBeTruthy();
        expect(menu).toHaveAttribute('aria-labelledby', button.id);
      } catch (e) {
        throw ERROR_MENU_NOT_FOUND;
      }
    };

    it('should open the menu on longPress', function () {
      const props = {onOpenChange, trigger: 'longPress'};
      verifyMenuToggle(MenuTrigger, props, {}, (button, menu) => {
        expect(button).toHaveAttribute('aria-describedby');
        expect(document.getElementById(button.getAttribute('aria-describedby'))).toHaveTextContent('Long press or press Alt + ArrowDown to open menu');

        if (!menu) {
          triggerLongPress(button);
        } else {
          triggerTouch(button);
        }
      });
    });

    it('should not open menu on click', function () {
      const props = {onOpenChange, trigger: 'longPress'};
      let tree = renderComponent(MenuTrigger, props, {});
      let button = tree.getByRole('button');

      act(() => {
        triggerTouch(button);
        setTimeout(() => {
          expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
        }, 0, tree, button);
        jest.runAllTimers();
      });
    });

    it(`should not open menu on short press (default threshold set to ${DEFAULT_LONG_PRESS_TIME}ms)`, function () {
      const props = {onOpenChange, trigger: 'longPress'};
      let tree = renderComponent(MenuTrigger, props, {});
      let button = tree.getByRole('button');

      act(() => {
        triggerTouch(button);
        setTimeout(() => {
          expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
        }, DEFAULT_LONG_PRESS_TIME / 2, tree, button);
        jest.runAllTimers();
      });
    });

    it('should not open the menu on Enter', function () {
      const props = {onOpenChange, trigger: 'longPress'};
      let tree = renderComponent(MenuTrigger, props, {});
      let button = tree.getByRole('button');
      act(() => {
        triggerTouch(button);
        setTimeout(() => {
          expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
        }, 0, tree, button);
        jest.runAllTimers();
      });
    });

    it('should not open the menu on Space', function () {
      const props = {onOpenChange, trigger: 'longPress'};
      let tree = renderComponent(MenuTrigger, props, {});
      let button = tree.getByRole('button');
      act(() => {
        triggerTouch(button);
        setTimeout(() => {
          expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
        }, 0, tree, button);
        jest.runAllTimers();
      });
    });

    it('should open the menu on Alt+ArrowUp', function () {
      const props = {onOpenChange, trigger: 'longPress'};
      verifyMenuToggle(MenuTrigger, props, {}, (button, menu) => {
        if (!menu) {
          fireEvent.keyDown(button, {key: 'ArrowUp', altKey: true});
        } else {
          triggerTouch(button);
        }
      });
    });

    it('should open the menu on Alt+ArrowDown', function () {
      const props = {onOpenChange, trigger: 'longPress'};
      verifyMenuToggle(MenuTrigger, props, {}, (button, menu) => {
        if (!menu) {
          fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
        } else {
          triggerTouch(button);
        }
      });
    });
  });

  describe('MenuTrigger trigger="longPress" focus behavior', function () {
    installPointerEvent();

    function expectMenuItemToBeActive(tree, idx) {
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let selectedItem = menuItems[idx < 0 ? menuItems.length + idx : idx];
      expect(selectedItem).toBe(document.activeElement);
      return menu;
    }

    it('should focus the selected item on menu open', function () {
      let tree = renderComponent(MenuTrigger, {trigger: 'longPress'}, {selectedKeys: ['Bar']});
      let button = tree.getByRole('button');
      act(() => {
        triggerLongPress(button);
        jest.runAllTimers();
      });
      let menu = expectMenuItemToBeActive(tree, 1);
      act(() => {
        triggerTouch(button);
        jest.runAllTimers();
      });
      expect(menu).not.toBeInTheDocument();

      // Opening menu via Alt+ArrowUp still autofocuses the selected item
      fireEvent.keyDown(button, {key: 'ArrowUp', altKey: true});
      menu = expectMenuItemToBeActive(tree, 1);

      act(() => {
        triggerTouch(button);
        jest.runAllTimers();
      });
      expect(menu).not.toBeInTheDocument();

      // Opening menu via Alt+ArrowDown still autofocuses the selected item
      fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
      menu = expectMenuItemToBeActive(tree, 1);

      act(() => {
        triggerTouch(button);
        jest.runAllTimers();
      });
      expect(menu).not.toBeInTheDocument();
    });

    it('should focus the last item on Alt+ArrowUp if no selectedKeys specified', function () {
      let tree = renderComponent(MenuTrigger, {trigger: 'longPress'}, {});
      let button = tree.getByRole('button');
      fireEvent.keyDown(button, {key: 'ArrowUp', altKey: true});
      expectMenuItemToBeActive(tree, -1);
    });

    it('should focus the first item on Alt+ArrowDown if no selectedKeys specified', function () {
      let tree = renderComponent(MenuTrigger, {trigger: 'longPress'}, {});
      let button = tree.getByRole('button');
      fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
      expectMenuItemToBeActive(tree, 0);
    });
  });

  describe('sub dialogs', function () {
    let tree;
    afterEach(() => {
      if (tree) {
        tree.unmount();
      }
      tree = null;
    });

    describe('unavailable item', function () {
      let renderTree = (options = {}) => {
        let {providerProps = {}} = options;
        let {locale = 'en-US'} = providerProps;
        tree = render(
          <Provider theme={theme} locale={locale}>
            <MenuTrigger>
              <ActionButton>Menu</ActionButton>
              <Menu onAction={action('onAction')}>
                <Item key="1">One</Item>
                <MenuDialogTrigger isUnavailable>
                  <Item key="foo" textValue="Hello">
                    <Text>Hello</Text>
                    <Text slot="description">Is it me you're looking for?</Text>
                  </Item>
                  <Dialog>
                    <Heading>Lionel Richie says:</Heading>
                    <Content>I can see it in your eyes</Content>
                  </Dialog>
                </MenuDialogTrigger>
                <Item key="3">Three</Item>
                <Item key="5">Five</Item>
                <MenuDialogTrigger isUnavailable>
                  <Item key="bar" textValue="Choose a college major">Choose a College Major</Item>
                  <Dialog>
                    <Heading>Choosing a College Major</Heading>
                    <Content>What factors should I consider when choosing a college major?</Content>
                    <Footer>Visit this link before choosing this action. <Link>Learn more</Link></Footer>
                  </Dialog>
                </MenuDialogTrigger>
              </Menu>
            </MenuTrigger>
          </Provider>
        );
      };
      let openMenu = () => {
        let triggerButton = tree.getByRole('button');
        triggerPress(triggerButton);
        act(() => {jest.runAllTimers();});

        return tree.getByRole('menu');
      };

      it('adds the expected spectrum icon', function () {
        renderTree();
        let menu = openMenu();
        let unavailableItem = within(menu).getAllByRole('menuitem')[1];
        expect(unavailableItem).toBeVisible();

        let icon = within(unavailableItem).getByRole('img', {hidden: true});
        expect(icon).not.toHaveAttribute('aria-hidden');
      });

      it('can open a sub dialog with hover', function () {
        renderTree();
        let menu = openMenu();
        let menuItems = within(menu).getAllByRole('menuitem');
        let unavailableItem = menuItems[1];
        expect(unavailableItem).toBeVisible();
        expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

        fireEvent.mouseEnter(unavailableItem);
        act(() => {jest.runAllTimers();});
        let dialog = tree.getByRole('dialog');
        expect(dialog).toBeVisible();

        fireEvent.mouseLeave(unavailableItem);
        fireEvent.mouseEnter(menuItems[2]);
        act(() => {jest.runAllTimers();});
        expect(menu).toBeVisible();
        expect(dialog).not.toBeInTheDocument();
        expect(document.activeElement).toBe(menuItems[2]);
      });

      it('can open a sub dialog with keyboard', function () {
        renderTree();
        let menu = openMenu();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
        fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
        let unavailableItem = within(menu).getAllByRole('menuitem')[1];
        expect(document.activeElement).toBe(unavailableItem);

        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});

        let dialog = tree.getByRole('dialog');
        expect(dialog).toBeVisible();
      });

      it('will close sub dialogs as you hover other items even if you click open it', function () {
        renderTree();
        let menu = openMenu();
        let menuItems = within(menu).getAllByRole('menuitem');
        let unavailableItem = menuItems[1];
        expect(unavailableItem).toBeVisible();
        expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

        fireEvent.mouseEnter(unavailableItem);
        fireEvent.mouseDown(unavailableItem);
        fireEvent.mouseUp(unavailableItem);
        act(() => {jest.runAllTimers();});
        let dialog = tree.getByRole('dialog');
        expect(dialog).toBeVisible();

        fireEvent.mouseLeave(unavailableItem);
        fireEvent.mouseEnter(menuItems[2]);
        act(() => {jest.runAllTimers();});
        expect(dialog).not.toBeVisible();

        fireEvent.mouseLeave(menuItems[2]);
        fireEvent.mouseEnter(menuItems[3]);
        act(() => {jest.runAllTimers();});
        fireEvent.mouseLeave(menuItems[3]);
        fireEvent.mouseEnter(menuItems[4]);
        act(() => {jest.runAllTimers();});

        expect(menu).toBeVisible();
        dialog = tree.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(document.activeElement).toBe(dialog);

        userEvent.tab();
        act(() => {jest.runAllTimers();});
        let link = screen.getByRole('link');
        expect(document.activeElement).toBe(link);

        userEvent.tab();
        act(() => {jest.runAllTimers();});
        expect(dialog).not.toBeInTheDocument();
        expect(document.activeElement).toBe(menuItems[4]);
      });

      it('will close everything if the user shift tabs out of the subdialog', function () {
        renderTree();
        let menu = openMenu();
        let menuItems = within(menu).getAllByRole('menuitem');
        let unavailableItem = menuItems[4];
        expect(unavailableItem).toBeVisible();
        expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

        fireEvent.mouseEnter(unavailableItem);
        act(() => {jest.runAllTimers();});
        let dialog = tree.getByRole('dialog');
        expect(dialog).toBeVisible();

        expect(document.activeElement).toBe(dialog);

        userEvent.tab({shift: true});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});
        expect(dialog).not.toBeInTheDocument();

        expect(document.activeElement).toBe(unavailableItem);
      });

      it('will close everything if the user shift tabs out of the subdialog', function () {
        renderTree({providerProps: {locale: 'ar-AE'}});
        let menu = openMenu();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
        fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
        let unavailableItem = within(menu).getAllByRole('menuitem')[1];
        expect(document.activeElement).toBe(unavailableItem);

        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft'});

        let dialog = tree.getByRole('dialog');
        expect(dialog).toBeVisible();
      });
    });
  });
});
