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
import {AriaMenuTests} from 'react-aria-components/test/AriaMenu.test-util';
import {Content, Footer} from '@react-spectrum/view';
import {ContextualHelpTrigger, Item, Menu, MenuTrigger, Section, SubmenuTrigger} from '../';
import {
  DEFAULT_LONG_PRESS_TIME,
  installPointerEvent,
  pointerMap,
  simulateDesktop,
  triggerLongPress
} from '@react-spectrum/test-utils-internal';
import {Dialog} from '@react-spectrum/dialog';
import {Heading, Text} from '@react-spectrum/text';
import {Link} from '@react-spectrum/link';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {UNSTABLE_PortalProvider} from '@react-aria/overlays';
import {User} from '@react-aria/test-utils';
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
  let user;
  let windowSpy;
  let testUtilUser = new User();
  let originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

  beforeAll(function () {
    user = userEvent.setup({delay: null, pointerMap});
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 1000);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    simulateDesktop();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    windowSpy = jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
  });

  afterEach(() => {
    onOpenChange.mockClear();
    onOpen.mockClear();
    onClose.mockClear();
    onSelect.mockClear();
    onSelectionChange.mockClear();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    offsetWidth.mockRestore();
    offsetHeight.mockRestore();
    window.HTMLElement.prototype.scrollIntoView.mockRestore();
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    jest.useRealTimers();
  });

  async function verifyMenuToggle(Component, triggerProps = {}, menuProps = {}, triggerEvent) {
    let tree = renderComponent(Component, triggerProps, menuProps);
    let triggerButton = tree.getByRole('button');
    let menuTester = testUtilUser.createTester('Menu', {root: triggerButton});

    expect(onOpenChange).toBeCalledTimes(0);

    await triggerEvent(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = menuTester.menu;
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);

    let menuItem1 = within(menu).getByText('Foo');
    let menuItem2 = within(menu).getByText('Bar');
    let menuItem3 = within(menu).getByText('Baz');
    expect(menuItem1).toBeInTheDocument();
    expect(menuItem2).toBeInTheDocument();
    expect(menuItem3).toBeInTheDocument();

    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
    expect(triggerButton).toHaveAttribute('aria-controls', menu.id);

    if (Component === MenuTrigger) {
      expect(onOpenChange).toBeCalledTimes(1);
    } else {
      expect(onOpen).toBeCalledTimes(1);
      expect(onClose).toBeCalledTimes(0);
    }

    await triggerEvent(triggerButton, menu);
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

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, isOpen: true}}
  `('$Name supports a controlled open state ', async function ({Component, props}) {
    let tree = renderComponent(Component, props);
    act(() => {jest.runAllTimers();});
    expect(onOpenChange).toBeCalledTimes(0);

    let menu = tree.getByRole('menu');
    expect(menu).toBeInTheDocument();

    let triggerButton = tree.getByText('Menu Button');
    await user.click(triggerButton);
    act(() => {jest.runAllTimers();});

    expect(menu).toBeInTheDocument();
    expect(onOpenChange).toBeCalledTimes(1);
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, defaultOpen: true}}
  `('$Name supports a uncontrolled default open state ', async function ({Component, props}) {
    let tree = renderComponent(Component, props);
    act(() => {jest.runAllTimers();});
    expect(onOpenChange).toBeCalledTimes(0);

    let menu = tree.getByRole('menu');
    expect(menu).toBeInTheDocument();

    let triggerButton = tree.getByText('Menu Button');
    await user.click(triggerButton);
    act(() => {jest.runAllTimers();});

    expect(menu).not.toBeInTheDocument();
    expect(onOpenChange).toBeCalledTimes(1);
  });

  describe('menu popover closing behavior', function () {
    let tree;
    afterEach(() => {
      if (tree) {
        tree.unmount();
      }
      tree = null;
    });

    async function openAndTriggerMenuItem(tree, role, selectionMode, triggerEvent) {
      let menuTester = testUtilUser.createTester('Menu', {root: tree.container});
      await menuTester.open();
      let menuItems = menuTester.options();
      let itemToAction = menuItems[1];
      await triggerEvent(itemToAction);
      act(() => {jest.runAllTimers();}); // FocusScope useLayoutEffect cleanup
      act(() => {jest.runAllTimers();}); // FocusScope raf
    }

    // TODO: Implement in RAC
    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, closeOnSelect: false}}
    `('$Name doesn\'t close on menu item selection if closeOnSelect=false', async function ({Component, props}) {
      tree = renderComponent(Component, props, {selectionMode: 'single', onSelectionChange});
      let menuTester = testUtilUser.createTester('Menu', {root: tree.container});
      expect(onOpenChange).toBeCalledTimes(0);
      await menuTester.open();

      if (Component === MenuTrigger) {
        expect(onOpenChange).toBeCalledTimes(1);
        expect(onSelectionChange).toBeCalledTimes(0);
      } else {
        expect(onOpen).toBeCalledTimes(1);
        expect(onClose).toBeCalledTimes(0);
        expect(onSelect).toBeCalledTimes(0);
      }

      await menuTester.selectOption({option: 'Foo', menuSelectionMode: 'single', closesOnSelect: false});

      if (Component === MenuTrigger) {
        expect(onSelectionChange).toBeCalledTimes(1);
      } else {
        expect(onSelect).toBeCalledTimes(1);
      }

      expect(menuTester.menu).toBeInTheDocument();

      if (Component === MenuTrigger) {
        expect(menuTester.trigger).toHaveAttribute('aria-expanded', 'true');
        expect(onOpenChange).toBeCalledTimes(1);
      } else {
        expect(menuTester.trigger).toHaveAttribute('aria-expanded');
        expect(onOpen).toBeCalledTimes(1);
        expect(onClose).toBeCalledTimes(0);
      }
    });

    it.each`
      Name             | Component      | props
      ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, closeOnSelect: false}}
    `('$Name doesn\'t closes menu on item selection via ENTER press if closeOnSelect=false', async function ({Component, props}) {
      tree = renderComponent(Component, props, {selectionMode: 'single', onSelectionChange});
      let menuTester = testUtilUser.createTester('Menu', {root: tree.container});
      expect(onOpenChange).toBeCalledTimes(0);
      await menuTester.open();

      expect(onOpenChange).toBeCalledTimes(1);
      expect(onSelectionChange).toBeCalledTimes(0);
      menuTester.setInteractionType('keyboard');
      await menuTester.selectOption({option: 'Foo', menuSelectionMode: 'single', closesOnSelect: false});

      expect(menuTester.menu).toBeInTheDocument();
      expect(menuTester.trigger).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange).toBeCalledTimes(1);
    });

    it.each`
      Name                      | Component      | props | menuProps
      ${'MenuTrigger multiple'} | ${MenuTrigger} | ${{closeOnSelect: true}} | ${{selectionMode: 'multiple', onClose}}
    `('$Name closes on menu item selection if toggled by mouse click', async function ({Component, props, menuProps}) {
      tree = renderComponent(Component, props, menuProps);
      await openAndTriggerMenuItem(tree, props.role, menuProps.selectionMode, async (item) => await user.click(item));

      let menu = tree.queryByRole('menu');
      expect(menu).toBeNull();
      expect(document.activeElement).toBe(tree.getByRole('button'));
      expect(onClose).toHaveBeenCalledTimes(1);
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

  describe('MenuTrigger trigger="longPress" open behavior', function () {
    installPointerEvent();

    const ERROR_MENU_NOT_FOUND = new Error('Menu not found');
    const getMenuOrThrow = (tree, button) => {
      try {
        let menu = tree.getByRole('menu');
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute('aria-labelledby', button.id);
      } catch {
        throw ERROR_MENU_NOT_FOUND;
      }
    };

    it('should open the menu on longPress', async function () {
      const props = {onOpenChange, trigger: 'longPress'};
      await verifyMenuToggle(MenuTrigger, props, {}, async (button, menu) => {
        expect(button).toHaveAttribute('aria-describedby');
        expect(document.getElementById(button.getAttribute('aria-describedby'))).toHaveTextContent('Long press or press Alt + ArrowDown to open menu');

        if (!menu) {
          await triggerLongPress({element: button, advanceTimer: jest.advanceTimersByTime});
        } else {
          await user.pointer({target: button, keys: '[TouchA]'});
        }
      });
    });

    it('should not open menu on click', async function () {
      const props = {onOpenChange, trigger: 'longPress'};
      let tree = renderComponent(MenuTrigger, props, {});
      let button = tree.getByRole('button');

      await user.pointer({target: button, keys: '[TouchA]'});
      expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
    });

    it(`should not open menu on short press (default threshold set to ${DEFAULT_LONG_PRESS_TIME}ms)`, async function () {
      const props = {onOpenChange, trigger: 'longPress'};
      let tree = renderComponent(MenuTrigger, props, {});
      let button = tree.getByRole('button');

      await user.pointer({target: button, keys: '[TouchA]'});
      expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
    });

    it('should not open the menu on Enter', async function () {
      const props = {onOpenChange, trigger: 'longPress'};
      let tree = renderComponent(MenuTrigger, props, {});
      let button = tree.getByRole('button');

      await user.pointer({target: button, keys: '[TouchA]'});
      expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
    });

    it('should not open the menu on Space', async function () {
      const props = {onOpenChange, trigger: 'longPress'};
      let tree = renderComponent(MenuTrigger, props, {});
      let button = tree.getByRole('button');
      await user.pointer({target: button, keys: '[TouchA]'});
      expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
    });

    it('should open the menu on Alt+ArrowUp', async function () {
      const props = {onOpenChange, trigger: 'longPress'};
      await verifyMenuToggle(MenuTrigger, props, {}, async (button, menu) => {
        if (!menu) {
          fireEvent.keyDown(button, {key: 'ArrowUp', altKey: true});
        } else {
          await user.pointer({target: button, keys: '[TouchA]'});
        }
      });
    });

    it('should open the menu on Alt+ArrowDown', async function () {
      const props = {onOpenChange, trigger: 'longPress'};
      await verifyMenuToggle(MenuTrigger, props, {}, async (button, menu) => {
        if (!menu) {
          fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
        } else {
          await user.pointer({target: button, keys: '[TouchA]'});
        }
      });
    });
  });

  describe('MenuTrigger trigger="longPress" focus behavior', function () {
    installPointerEvent();

    function expectMenuItemToBeActive(tree, idx, selectionMode) {
      let menuItemRole = 'menuitem';
      if (selectionMode === 'multiple') {
        menuItemRole = 'menuitemcheckbox';
      } else if (selectionMode === 'single') {
        menuItemRole = 'menuitemradio';
      }
      let menu = tree.getByRole('menu');
      expect(menu).toBeInTheDocument();
      let menuItems = within(menu).getAllByRole(menuItemRole);
      let selectedItem = menuItems[idx < 0 ? menuItems.length + idx : idx];
      expect(selectedItem).toBe(document.activeElement);
      return menu;
    }

    it('should focus the selected item on menu open', async function () {
      let tree = renderComponent(MenuTrigger, {trigger: 'longPress'}, {selectedKeys: ['Bar'], selectionMode: 'single'});
      let button = tree.getByRole('button');
      await triggerLongPress({element: button, advanceTimer: jest.advanceTimersByTime});
      let menu = expectMenuItemToBeActive(tree, 1, 'single');
      await user.pointer({target: button, keys: '[TouchA]'});
      act(() => {
        jest.runAllTimers();
      });
      expect(menu).not.toBeInTheDocument();

      // Opening menu via Alt+ArrowUp still autofocuses the selected item
      fireEvent.keyDown(button, {key: 'ArrowUp', altKey: true});
      menu = expectMenuItemToBeActive(tree, 1, 'single');
      await user.pointer({target: button, keys: '[TouchA]'});
      act(() => {
        jest.runAllTimers();
      });
      expect(menu).not.toBeInTheDocument();

      // Opening menu via Alt+ArrowDown still autofocuses the selected item
      fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
      menu = expectMenuItemToBeActive(tree, 1, 'single');
      await user.pointer({target: button, keys: '[TouchA]'});
      act(() => {
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
      act(() => {jest.runAllTimers();});
      if (tree) {
        tree.unmount();
      }
      tree = null;
      act(() => {jest.runAllTimers();});
    });

    describe('unavailable item', function () {
      let renderTree = (options = {}) => {
        let {providerProps = {}, isItem2Unavailable = true} = options;
        let {locale = 'en-US'} = providerProps;
        tree = render(
          <Provider theme={theme} locale={locale}>
            <input data-testid="previous" />
            <MenuTrigger>
              <ActionButton>Menu</ActionButton>
              <Menu onAction={action('onAction')}>
                <Item key="1">One</Item>
                <ContextualHelpTrigger isUnavailable={isItem2Unavailable}>
                  <Item key="foo" textValue="Hello">
                    <Text>Hello</Text>
                    <Text slot="description">Is it me you're looking for?</Text>
                  </Item>
                  <Dialog>
                    <Heading>Lionel Richie says:</Heading>
                    <Content>I can see it in your eyes</Content>
                  </Dialog>
                </ContextualHelpTrigger>
                <Item key="3">Three</Item>
                <Item key="5">Five</Item>
                <ContextualHelpTrigger isUnavailable>
                  <Item key="bar" textValue="Choose a college major">Choose a College Major</Item>
                  <Dialog>
                    <Heading>Choosing a College Major</Heading>
                    <Content>What factors should I consider when choosing a college major?</Content>
                    <Footer>Visit this link before choosing this action. <Link>Learn more</Link></Footer>
                  </Dialog>
                </ContextualHelpTrigger>
              </Menu>
            </MenuTrigger>
            <input data-testid="next" />
          </Provider>
        );
      };
      let openMenu = async () => {
        let triggerButton = tree.getByRole('button');
        await user.click(triggerButton);
        act(() => {jest.runAllTimers();});

        return tree.getByRole('menu');
      };

      it('adds the expected spectrum icon', async function () {
        renderTree();
        let menu = await openMenu();
        let unavailableItem = within(menu).getAllByRole('menuitem')[1];
        expect(unavailableItem).toBeVisible();

        let icon = within(unavailableItem).getByRole('img', {hidden: true});
        expect(icon).not.toHaveAttribute('aria-hidden');
      });

      it('can open a sub dialog with hover', async function () {
        renderTree();
        let menu = await openMenu();
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

      it('can not open a sub dialog with hover if isUnavailable is false', async function () {
        renderTree({isItem2Unavailable: false});
        let menu = await openMenu();
        let menuItems = within(menu).getAllByRole('menuitem');
        let availableItem = menuItems[1];
        expect(availableItem).toBeVisible();
        expect(within(availableItem).queryByRole('img', {hidden: true})).toBeNull();
        expect(availableItem).not.toHaveAttribute('aria-haspopup', 'dialog');

        fireEvent.mouseEnter(availableItem);
        act(() => {jest.runAllTimers();});
        expect(tree.queryByRole('dialog')).toBeNull();

        expect(document.activeElement).toBe(availableItem);
        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
        expect(tree.queryByRole('dialog')).toBeNull();
      });

      it('can open a sub dialog with keyboard', async function () {
        renderTree();
        let menu = await openMenu();
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

      it('will close sub dialogs as you hover other items even if you click open it', async function () {
        renderTree();
        let menu = await openMenu();
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

        await user.tab();
        act(() => {jest.runAllTimers();});
        let link = screen.getByRole('link');
        expect(document.activeElement).toBe(link);

        await user.tab();
        act(() => {jest.runAllTimers();});
        expect(dialog).toBeInTheDocument();
        expect(document.activeElement).toBe(link);
      });

      it('will contain focus when shift tabbing in the subdialog', async function () {
        renderTree();
        let menu = await openMenu();
        let menuItems = within(menu).getAllByRole('menuitem');
        let unavailableItem = menuItems[4];
        expect(unavailableItem).toBeVisible();
        expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

        fireEvent.mouseEnter(unavailableItem);
        act(() => {jest.runAllTimers();});
        let dialog = tree.getByRole('dialog');
        expect(dialog).toBeVisible();

        expect(document.activeElement).toBe(dialog);

        await user.tab({shift: true});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});
        expect(dialog).toBeInTheDocument();
        expect(document.activeElement).toBe(within(dialog).getByRole('link'));
      });

      it('will close everything if the user shift tabs out of the subdialog', async function () {
        renderTree({providerProps: {locale: 'ar-AE'}});
        let menu = await openMenu();
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

      it('should close everything if the user clicks on the underlay of the root menu', async function () {
        renderTree();
        let menu = await openMenu();
        let menuItems = within(menu).getAllByRole('menuitem');
        let unavailableItem = menuItems[4];
        expect(unavailableItem).toBeVisible();
        expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

        fireEvent.mouseEnter(unavailableItem);
        act(() => {jest.runAllTimers();});
        let dialog = tree.getByRole('dialog');
        expect(dialog).toBeVisible();

        expect(document.activeElement).toBe(dialog);

        let underlay = tree.getByTestId('underlay', {hidden: true});
        fireEvent.mouseDown(underlay);
        fireEvent.mouseUp(underlay);
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});
        expect(dialog).not.toBeInTheDocument();
        expect(menu).not.toBeInTheDocument();

        let triggerButton = tree.getByRole('button');
        expect(document.activeElement).toBe(triggerButton);
      });
    });
  });

  describe('portalContainer', () => {
    let tree;
    afterEach(() => {
      act(() => {jest.runAllTimers();});
      if (tree) {
        tree.unmount();
      }
      tree = null;
      act(() => {jest.runAllTimers();});
    });

    function InfoMenu(props) {
      return (
        <Provider theme={theme}>
          <UNSTABLE_PortalProvider getContainer={() => props.container.current}>
            <MenuTrigger>
              <ActionButton aria-label="trigger" />
              <Menu>
                <Item key="1">One</Item>
                <Item key="">Two</Item>
                <Item key="3">Three</Item>
              </Menu>
            </MenuTrigger>
          </UNSTABLE_PortalProvider>
        </Provider>
      );
    }

    function App() {
      let container = React.useRef(null);
      return (
        <>
          <InfoMenu container={container} />
          <div ref={container} data-testid="custom-container" />
        </>
      );
    }

    it('should render the menu in the portal container', async () => {
      tree = render(
        <App />
      );

      let button = tree.getByRole('button');
      await user.click(button);

      expect(tree.getByRole('menu').closest('[data-testid="custom-container"]')).toBe(tree.getByTestId('custom-container'));
      await user.keyboard('{Escape}');
      act(() => {jest.runAllTimers();});
    });

    it('should render the menu tray in the portal container', async () => {
      windowSpy.mockImplementation(() => 700);
      tree = render(
        <App />
      );

      let button = tree.getByRole('button');
      await user.click(button);

      expect(tree.getByRole('menu').closest('[data-testid="custom-container"]')).toBe(tree.getByTestId('custom-container'));
    });
  });
});

function SelectionStatic(props) {
  let {selectionMode = 'single'} = props;
  let [selected, setSelected] = React.useState(new Set());
  return (
    <Provider theme={theme}>
      <MenuTrigger>
        <Button>Menu Button</Button>
        <Menu
          aria-label="Test"
          selectionMode={selectionMode}
          selectedKeys={selected}
          onSelectionChange={setSelected}>
          <Item id="foo">Foo</Item>
          <Item id="bar">Bar</Item>
          <Item id="baz">Baz</Item>
          <Item id="fizz">Fizz</Item>
        </Menu>
      </MenuTrigger>
    </Provider>
  );
}

let setup = () => {
  let offsetWidth, offsetHeight;
  // eslint-disable-next-line no-unused-vars
  let windowSpy;
  let originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 1000);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    simulateDesktop();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    windowSpy = jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    offsetWidth.mockRestore();
    offsetHeight.mockRestore();
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    jest.useRealTimers();
  });
};

AriaMenuTests({
  prefix: 'rspv3-static',
  setup,
  renderers: {
    standard: () => render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button variant="primary">
            {triggerText}
          </Button>
          <Menu>
            <Item id="1">One</Item>
            <Item id="2">Two</Item>
            <Item id="3">Three</Item>
          </Menu>
        </MenuTrigger>
      </Provider>
    ),
    disabledTrigger: () => render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button isDisabled variant="primary">
            {triggerText}
          </Button>
          <Menu>
            <Item id="1">One</Item>
            <Item id="2">Two</Item>
            <Item id="3">Three</Item>
          </Menu>
        </MenuTrigger>
      </Provider>
    ),
    singleSelection: () => render(
      <SelectionStatic />
    ),
    multipleSelection: () => render(
      <SelectionStatic selectionMode="multiple" />
    ),
    siblingFocusableElement: () => render(
      <Provider theme={theme}>
        <input aria-label="before" />
        <MenuTrigger>
          <Button variant="primary">
            {triggerText}
          </Button>
          <Menu>
            <Item id="1">One</Item>
            <Item id="2">Two</Item>
            <Item id="3">Three</Item>
          </Menu>
        </MenuTrigger>
        <input aria-label="after" />
      </Provider>
    ),
    multipleMenus: () => render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button variant="primary">
            Menu Button1
          </Button>
          <Menu aria-label="Test1">
            <Item id="1">One</Item>
            <Item id="2">Two</Item>
            <Item id="3">Three</Item>
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <Button variant="primary">
            Menu Button2
          </Button>
          <Menu aria-label="Test2">
            <Item id="1">One</Item>
            <Item id="2">Two</Item>
            <Item id="3">Three</Item>
          </Menu>
        </MenuTrigger>
      </Provider>
    ),
    submenus: () => render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button aria-label="Menu">☰</Button>
          <Menu>
            <Item id="open">Open</Item>
            <Item id="rename">Rename…</Item>
            <Item id="duplicate">Duplicate</Item>
            <SubmenuTrigger>
              <Item id="share">Share…</Item>
              <Menu>
                <SubmenuTrigger>
                  <Item id="email">Email…</Item>
                  <Menu>
                    <Item id="work">Work</Item>
                    <Item id="personal">Personal</Item>
                  </Menu>
                </SubmenuTrigger>
                <Item id="sms">SMS</Item>
                <Item id="x">X</Item>
              </Menu>
            </SubmenuTrigger>
            <Item id="delete">Delete…</Item>
          </Menu>
        </MenuTrigger>
      </Provider>
    )
  }
});


let dynamicSubmenu = [
  {name: 'Lvl 1 Item 1'},
  {name: 'Lvl 1 Item 2', children: [
    {name: 'Lvl 2 Item 1'},
    {name: 'Lvl 2 Item 2'},
    {name: 'Lvl 2 Item 3', children: [
      {name: 'Lvl 3 Item 1'},
      {name: 'Lvl 3 Item 2'},
      {name: 'Lvl 3 Item 3'}
    ]}
  ]},
  {name: 'Lvl 1 Item 3'}
];

let dynamicRenderFunc = (item) => {
  if (item.children) {
    return (
      <SubmenuTrigger>
        <Item key={item.name}>{item.name}</Item>
        <Menu items={item.children} onAction={action(`${item.name} onAction`)}>
          {(item) => dynamicRenderFunc(item)}
        </Menu>
      </SubmenuTrigger>
    );
  } else {
    return <Item key={item.name}>{item.name}</Item>;
  }
};


let ariaWithSection = [
  {name: 'Heading 1', children: [
    {name: 'Foo'},
    {name: 'Bar'},
    {name: 'Baz'},
    {name: 'Fizz'}
  ]}
];

AriaMenuTests({
  prefix: 'rspv3-dynamic',
  setup,
  renderers: {
    standard: () => render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button variant="primary">
            {triggerText}
          </Button>
          <Menu items={ariaWithSection}>
            {item => (
              <Section key={item.name} items={item.children} title={item.name}>
                {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </MenuTrigger>
      </Provider>
    ),
    disabledTrigger: () => render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button isDisabled variant="primary">
            {triggerText}
          </Button>
          <Menu items={ariaWithSection}>
            {item => (
              <Section key={item.name} items={item.children} title={item.name}>
                {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </MenuTrigger>
      </Provider>
    ),
    singleSelection: () => render(
      <SelectionStatic />
    ),
    multipleSelection: () => render(
      <SelectionStatic selectionMode="multiple" />
    ),
    siblingFocusableElement: () => render(
      <Provider theme={theme}>
        <input aria-label="before" />
        <MenuTrigger>
          <Button variant="primary">
            {triggerText}
          </Button>
          <Menu items={ariaWithSection}>
            {item => (
              <Section key={item.name} items={item.children} title={item.name}>
                {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </MenuTrigger>
        <input aria-label="after" />
      </Provider>
    ),
    multipleMenus: () => render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button variant="primary">
            Menu Button1
          </Button>
          <Menu items={ariaWithSection} aria-label="Test1">
            {item => (
              <Section key={item.name} items={item.children} title={item.name}>
                {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <Button variant="primary">
            Menu Button2
          </Button>
          <Menu items={ariaWithSection} aria-label="Test2">
            {item => (
              <Section key={item.name} items={item.children} title={item.name}>
                {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </MenuTrigger>
      </Provider>
    ),
    submenus: () => render(
      <Provider theme={theme}>
        <MenuTrigger>
          <Button aria-label="Menu">☰</Button>
          <Menu items={dynamicSubmenu}>
            {(item) => dynamicRenderFunc(item)}
          </Menu>
        </MenuTrigger>
      </Provider>
    )
  }
});

let ControlledStandard = (props) => {
  let {selectionMode = 'single'} = props;
  let [isOpen, setOpen] = React.useState(false);
  let [selected, setSelected] = React.useState(new Set());
  return (
    <Provider theme={theme}>
      <MenuTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <Button variant="primary">
          {triggerText}
        </Button>
        <Menu selectedKeys={selected} onSelectionChange={setSelected} selectionMode={selectionMode}>
          <Item id="1">One</Item>
          <Item id="2">Two</Item>
          <Item id="3">Three</Item>
          <Item id="4">Four</Item>
        </Menu>
      </MenuTrigger>
    </Provider>
  );
};

AriaMenuTests({
  prefix: 'rspv3-controlled-open',
  setup,
  renderers: {
    standard: () => render(
      <ControlledStandard selectionMode="none" />
    ),
    singleSelection: () => render(
      <ControlledStandard />
    ),
    multipleSelection: () => render(
      <ControlledStandard selectionMode="multiple" />
    )
  }
});
