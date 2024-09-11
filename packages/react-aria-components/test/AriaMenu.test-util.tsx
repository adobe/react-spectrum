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

import {act, fireEvent, render, within} from '@testing-library/react';
import {
  pointerMap
} from '@react-spectrum/test-utils-internal';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';


let triggerText = 'Menu Button';

let ariaRender = render;
interface AriaBaseTestProps {
  setup?: () => void,
  prefix?: string
}
interface AriaMenuTestProps extends AriaBaseTestProps {
  renderers: {
    // needs at least three child items, all enabled
    standard: (props?: {name: string}) => ReturnType<typeof ariaRender>,
    // trigger must be disabled
    disabledTrigger?: (props?: {name: string}) => ReturnType<typeof ariaRender>,
    // needs at least three child items, all enabled, with single selection
    singleSelection?: (props?: {name: string}) => ReturnType<typeof ariaRender>,
    // needs at least four child items, all enabled, with single selection
    multipleSelection?: (props?: {name: string}) => ReturnType<typeof ariaRender>,
    // needs a focusable sibling after the trigger with the label 'after'
    // TODO: better to have tests return JSX and I call `render`? could allow me to inject elements in the DOM more easily
    siblingFocusableElement?: (props?: {name: string}) => ReturnType<typeof ariaRender>,
    // needs two menus that are siblings
    multipleMenus?: (props?: {name: string}) => ReturnType<typeof ariaRender>,
    // Menu should only open on long press
    longPress?: (props?: {name: string}) => ReturnType<typeof ariaRender>,
    // Menu must have two levels of submenus
    submenus?: (props?: {name: string}) => ReturnType<typeof ariaRender>
  }
}
export const AriaMenuTests = ({renderers, setup, prefix}: AriaMenuTestProps) => {
  describe(prefix ? prefix + 'AriaMenuTrigger' : 'AriaMenuTrigger', function () {
    let onOpenChange = jest.fn();
    let onOpen = jest.fn();
    let onClose = jest.fn();
    let onSelect = jest.fn();
    let onSelectionChange = jest.fn();
    let user;
    let testUtilUser = new User();
    setup?.();

    beforeAll(function () {
      user = userEvent.setup({delay: null, pointerMap});
      window.HTMLElement.prototype.scrollIntoView = jest.fn();
      jest.useFakeTimers();
    });

    afterEach(() => {
      onOpenChange.mockClear();
      onOpen.mockClear();
      onClose.mockClear();
      onSelect.mockClear();
      onSelectionChange.mockClear();
      act(() => jest.runAllTimers());
    });


  // it('should support aria-label on the menu items', () => {
  //   let {getAllByRole} = renderMenu({}, {'aria-label': 'test'});

  //   for (let menuitem of getAllByRole('menuitem')) {
  //     expect(menuitem).toHaveAttribute('aria-label', 'test');
  //   }
  // });

    it('has default behavior (button renders, menu is closed)', function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      let triggerButton = menuTester.getTrigger();

      expect(triggerButton).toBeTruthy();
      expect(triggerButton).toHaveAttribute('aria-haspopup', 'true');

      let buttonText = within(triggerButton).getByText(triggerText);
      expect(buttonText).toBeTruthy();

      expect(menuTester.getMenu()).toBeFalsy();

      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(triggerButton).toHaveAttribute('type', 'button');
    });

    it('toggles the menu display on button click', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      let triggerButton = menuTester.getTrigger();

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu()!;
      expect(menu).toBeTruthy();
      expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);
      expect(menu).toHaveFocus();

      expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
      expect(triggerButton).toHaveAttribute('aria-controls', menu.id);

      await user.click(triggerButton);
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('will not close the menu when mousing over the trigger again without lifting press', function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      let triggerButton = menuTester.getTrigger();

      fireEvent.mouseEnter(triggerButton);
      fireEvent.mouseDown(triggerButton, {detail: 1});
      fireEvent.mouseLeave(triggerButton);
      fireEvent.mouseEnter(triggerButton);
      fireEvent.mouseUp(triggerButton, {detail: 1});

      expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes the menu on click outside', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      let triggerButton = menuTester.getTrigger();

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu()!;
      expect(menu).toBeTruthy();
      expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);
      expect(menu).toHaveFocus();

      expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
      expect(triggerButton).toHaveAttribute('aria-controls', menu.id);

      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);

      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    });

    // Enter and Space keypress tests are ommitted since useMenuTrigger doesn't have space and enter cases in its key down
    // since usePress handles those cases

    it('can open the menu display via Enter key', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      menuTester.setInteractionType('keyboard');
      let triggerButton = menuTester.getTrigger();

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();
      expect(menu).toBeTruthy();
      let options = menuTester.getOptions();
      expect(options[0]).toHaveFocus();

      await menuTester.close();
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();

      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('can open the menu display via ArrowDown key', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      menuTester.setInteractionType('keyboard');
      let triggerButton = menuTester.getTrigger();

      await menuTester.open({direction: 'down'});
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();
      expect(menu).toBeTruthy();
      let options = menuTester.getOptions();
      expect(options[0]).toHaveFocus();

      await menuTester.close();
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();

      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('can open the menu display via ArrowUp key', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      menuTester.setInteractionType('keyboard');
      let triggerButton = menuTester.getTrigger();

      await menuTester.open({direction: 'up'});
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();
      expect(menu).toBeTruthy();
      let options = menuTester.getOptions();
      expect(options[options.length - 1]).toHaveFocus();

      await menuTester.close();
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();

      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('moves focus up and down with the arrow keys', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      menuTester.setInteractionType('keyboard');
      let triggerButton = menuTester.getTrigger();

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();
      expect(menu).toBeTruthy();
      expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);

      let options = menuTester.getOptions();
      expect(options[0]).toHaveFocus();

      await user.keyboard('[ArrowUp]');
      expect(options[options.length - 1]).toHaveFocus();

      await user.keyboard('[ArrowDown]');
      expect(options[0]).toHaveFocus();

      await user.keyboard('[ArrowDown]');
      expect(options[1]).toHaveFocus();
    });

    it('closes regardless of Space or Enter to activate an option', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      menuTester.setInteractionType('keyboard');

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();

      await user.keyboard('[Space]');
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();

      await menuTester.open();
      act(() => {jest.runAllTimers();});
      menu = menuTester.getMenu();

      await user.keyboard('[Enter]');
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();
    });

    it('closes if menu is tabbed away from', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      menuTester.setInteractionType('keyboard');

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();

      await user.tab();
      act(() => {jest.runAllTimers();});
      expect(menu).not.toBeInTheDocument();
      expect(document.activeElement).toBe(menuTester.getTrigger());
    });

    it('has hidden dismiss buttons for screen readers', async function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
      menuTester.setInteractionType('keyboard');

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();
      let buttons = tree.getAllByLabelText('Dismiss');
      expect(buttons.length).toBe(2);

      act(() => {
        fireEvent.click(buttons[0]);
      });

      expect(menu).not.toBeInTheDocument();
    });

    // TODO: holding down 'Enter' when no selection results in a loop of opening and closing the menu

    if (renderers.singleSelection) {
      describe('single selection', function () {
        it('selects an option via mouse', async function () {
          let tree = (renderers.singleSelection!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          let triggerButton = menuTester.getTrigger();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let menu = menuTester.getMenu();
          expect(menu).toBeTruthy();
          expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);

          let options = menuTester.getOptions();

          await menuTester.selectOption({option: options[1], menuSelectionMode: 'single'});

          act(() => {jest.runAllTimers();});
          expect(menu).not.toBeInTheDocument();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          menu = menuTester.getMenu();
          options = menuTester.getOptions();
          expect(options[0]).toHaveAttribute('aria-checked', 'false');
          expect(options[1]).toHaveAttribute('aria-checked', 'true');
        });

        it('selects an option via keyboard and autoFocuses it next time the menu is opened via keyboard, does not clear if menu is closed with Esc', async function () {
          let tree = (renderers.singleSelection!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          menuTester.setInteractionType('keyboard');
          let triggerButton = menuTester.getTrigger();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let menu = menuTester.getMenu();
          expect(menu).toBeTruthy();
          expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);

          let options = menuTester.getOptions();
          expect(options[0]).toHaveFocus();

          await menuTester.selectOption({option: options[1], menuSelectionMode: 'single'});

          act(() => {jest.runAllTimers();});
          expect(menu).not.toBeInTheDocument();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          menu = menuTester.getMenu();
          options = menuTester.getOptions();
          expect(options[0]).toHaveAttribute('aria-checked', 'false');
          expect(options[1]).toHaveAttribute('aria-checked', 'true');
          expect(options[1]).toHaveFocus();

          await menuTester.close();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          menu = menuTester.getMenu();
          options = menuTester.getOptions();
          expect(options[0]).toHaveAttribute('aria-checked', 'false');
          expect(options[1]).toHaveAttribute('aria-checked', 'true');
          expect(options[1]).toHaveFocus();
        });

        it('selects an option via keyboard and does not close if it was selected with Space', async function () {
          let tree = (renderers.singleSelection!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          menuTester.setInteractionType('keyboard');
          let triggerButton = menuTester.getTrigger();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let menu = menuTester.getMenu();
          expect(menu).toBeTruthy();
          expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);

          let options = menuTester.getOptions();
          expect(options[0]).toHaveFocus();

          await user.keyboard('[ArrowDown]');
          await user.keyboard('[Space]');

          act(() => {jest.runAllTimers();});
          expect(menu).toBeInTheDocument();
          expect(options[0]).toHaveAttribute('aria-checked', 'false');
          expect(options[1]).toHaveAttribute('aria-checked', 'true');
          expect(options[1]).toHaveFocus();
        });

        it('ignores keyboard repeat events', async function () {
          let tree = (renderers.singleSelection!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          menuTester.setInteractionType('keyboard');

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let options = menuTester.getOptions();

          fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
          fireEvent.keyDown(document.activeElement!, {key: 'Enter', repeat: true});
          act(() => {jest.runAllTimers();});
          expect(options[0]).toHaveAttribute('aria-checked', 'true');
          fireEvent.keyUp(document.activeElement!, {key: 'Enter'});
        });
      });
    }

    if (renderers.multipleSelection) {
      describe('multiple selection', function () {
        it('selects options via mouse, autofocuses the last selected option when menu is reopened', async function () {
          let tree = (renderers.multipleSelection!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let menu = menuTester.getMenu();
          let options = menuTester.getOptions();

          await menuTester.selectOption({option: options[2], menuSelectionMode: 'multiple'});
          await menuTester.selectOption({option: options[1], menuSelectionMode: 'multiple'});

          expect(options[1]).toHaveAttribute('aria-checked', 'true');
          expect(options[2]).toHaveAttribute('aria-checked', 'true');

          act(() => {jest.runAllTimers();});
          expect(menu).toBeInTheDocument();

          await menuTester.close();
          act(() => {jest.runAllTimers();});
          expect(menu).not.toBeInTheDocument();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          menu = menuTester.getMenu();
          options = menuTester.getOptions();
          expect(options[1]).toHaveAttribute('aria-checked', 'true');
          expect(options[2]).toHaveAttribute('aria-checked', 'true');
          expect(options[2]).toHaveFocus();
        });

        it('selects options via keyboard and autoFocuses next time the menu is opened via keyboard, does not clear if menu is closed with Esc', async function () {
          let tree = (renderers.multipleSelection!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          menuTester.setInteractionType('keyboard');

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let menu = menuTester.getMenu();
          let options = menuTester.getOptions();
          expect(options[0]).toHaveFocus();

          await user.keyboard('[ArrowDown]');
          await user.keyboard('[Space]');
          await user.keyboard('[ArrowDown]');
          await user.keyboard('[Space]');

          expect(options[1]).toHaveAttribute('aria-checked', 'true');
          expect(options[2]).toHaveAttribute('aria-checked', 'true');

          act(() => {jest.runAllTimers();});
          expect(menu).toBeInTheDocument();

          await menuTester.close();
          act(() => {jest.runAllTimers();});
          expect(menu).not.toBeInTheDocument();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          menu = menuTester.getMenu();
          options = menuTester.getOptions();
          expect(options[1]).toHaveAttribute('aria-checked', 'true');
          expect(options[2]).toHaveAttribute('aria-checked', 'true');
          expect(options[1]).toHaveFocus();
        });

        it('selects options via keyboard and immediately closes on selection if Enter was used', async function () {
          let tree = (renderers.multipleSelection!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          menuTester.setInteractionType('keyboard');

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let menu = menuTester.getMenu();
          let options = menuTester.getOptions();
          expect(options[0]).toHaveFocus();

          await user.keyboard('[ArrowDown]');
          await user.keyboard('[Enter]');

          act(() => {jest.runAllTimers();});
          expect(menu).not.toBeInTheDocument();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          menu = menuTester.getMenu();
          options = menuTester.getOptions();
          expect(options[0]).toHaveAttribute('aria-checked', 'false');
          expect(options[1]).toHaveAttribute('aria-checked', 'true');
          expect(options[2]).toHaveAttribute('aria-checked', 'false');
          expect(options[1]).toHaveFocus();
        });

        it('ignores keyboard repeat events', async function () {
          let tree = (renderers.multipleSelection!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          menuTester.setInteractionType('keyboard');

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let options = menuTester.getOptions();

          fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
          fireEvent.keyDown(document.activeElement!, {key: 'Enter', repeat: true});
          act(() => {jest.runAllTimers();});
          expect(options[0]).toHaveAttribute('aria-checked', 'true');
          fireEvent.keyUp(document.activeElement!, {key: 'Enter'});
        });
      });
    }

    if (renderers.disabledTrigger) {
      describe('disabled trigger', function () {
        it('does not trigger', async function () {
          let tree = (renderers.disabledTrigger!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          let triggerButton = menuTester.getTrigger();

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
        });
      });
    }

    if (renderers.siblingFocusableElement) {
      describe('sibling focusable element', function () {
        it('focuses the next tabbable thing after the trigger if tab is hit inside the menu', async function () {
          let tree = (renderers.siblingFocusableElement!)();
          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});

          await menuTester.open();
          act(() => {jest.runAllTimers();});

          let menu = menuTester.getMenu();

          await user.tab();
          act(() => {jest.runAllTimers();});
          expect(menu).not.toBeInTheDocument();
          expect(document.activeElement).toBe(tree.getByLabelText('after'));
        });
      });
    }

    if (renderers.multipleMenus) {
      describe('multiple menus', function () {
        it('two menus can not be open at the same time', async function () {
          let tree = (renderers.multipleMenus!)();
          let [button1, button2] = tree.getAllByRole('button');
          // TODO: should i try to open with the tester?
          // let menu1Tester = testUtilUser.createTester('MenuTester', {root: button1});
          // let menu2Tester = testUtilUser.createTester('MenuTester', {root: button2});

          await user.click(button1);
          act(() => jest.runAllTimers());
          let menu = tree.getByRole('menu');
          expect(tree.getByLabelText('Test1')).toBe(menu);

          // pressing once on button 2 should close menu1, but not open menu2 yet
          await user.click(button2);
          act(() => jest.runAllTimers());
          expect(menu).not.toBeInTheDocument();

          // second press of button2 should open menu2
          await user.click(button2);
          act(() => jest.runAllTimers());
          let menu2 = tree.getByRole('menu');
          expect(tree.getByLabelText('Test2')).toBe(menu2);
        });
      });
    }

    if (renderers.submenus) {
      describe('Submenus', function () {
        it('should support a submenu trigger', async () => {
          let tree = (renderers.submenus!)();

          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          await menuTester.open();
          let menu = menuTester.getMenu();

          let submenuTrigger = menuTester.getSubmenuTriggers()[0];
          expect(submenuTrigger).toHaveAttribute('aria-expanded', 'false');

          let submenuUtil = await menuTester.openSubmenu({submenuTrigger});
          act(() => {jest.runAllTimers();});
          expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
          let submenu = submenuUtil.getMenu();
          expect(submenu).toBeInTheDocument();

          // Click a submenu item
          // not sure why i can't use submenuUtil.selectOption
          await user.click(submenuUtil.getOptions().filter(item => item.getAttribute('aria-haspopup') == null)[0]);
          expect(menu).not.toBeInTheDocument();
          expect(submenu).not.toBeInTheDocument();
        });

        it('should support nested submenu triggers', async () => {
          let tree = (renderers.submenus!)();

          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          await menuTester.open();
          let menu = menuTester.getMenu();

          let submenuTrigger = menuTester.getSubmenuTriggers()[0];
          expect(submenuTrigger).toHaveAttribute('aria-expanded', 'false');

          let submenuUtil = await menuTester.openSubmenu({submenuTrigger});
          act(() => {jest.runAllTimers();});
          expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
          let submenu = submenuUtil.getMenu();
          expect(submenu).toBeInTheDocument();

          let nestedSubmenuTrigger = submenuUtil.getSubmenuTriggers()[0];
          expect(nestedSubmenuTrigger).toHaveAttribute('aria-expanded', 'false');

          let nestedSubmenuUtil = await menuTester.openSubmenu({submenuTrigger: nestedSubmenuTrigger});
          act(() => {jest.runAllTimers();});
          expect(nestedSubmenuTrigger).toHaveAttribute('aria-expanded', 'true');
          let nestedSubmenu = nestedSubmenuUtil.getMenu();
          expect(submenu).toBeInTheDocument();

          // Click a nested submenu item
          // not sure why i can't use submenuUtil.selectOption
          await user.click(nestedSubmenuUtil.getOptions().filter(item => item.getAttribute('aria-haspopup') == null)[0]);
          expect(menu).not.toBeInTheDocument();
          expect(submenu).not.toBeInTheDocument();
        });

        it('should close all submenus if interacting outside root submenu', async () => {
          let tree = (renderers.submenus!)();

          let menuTester = testUtilUser.createTester('MenuTester', {user, root: tree.container});
          await menuTester.open();
          let menu = menuTester.getMenu();

          let submenuTrigger = menuTester.getSubmenuTriggers()[0];
          expect(submenuTrigger).toHaveAttribute('aria-expanded', 'false');

          let submenuUtil = await menuTester.openSubmenu({submenuTrigger});
          act(() => {jest.runAllTimers();});
          expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
          let submenu = submenuUtil.getMenu();
          expect(submenu).toBeInTheDocument();

          let nestedSubmenuTrigger = submenuUtil.getSubmenuTriggers()[0];
          expect(nestedSubmenuTrigger).toHaveAttribute('aria-expanded', 'false');

          let nestedSubmenuUtil = await menuTester.openSubmenu({submenuTrigger: nestedSubmenuTrigger});
          act(() => {jest.runAllTimers();});
          expect(nestedSubmenuTrigger).toHaveAttribute('aria-expanded', 'true');
          let nestedSubmenu = nestedSubmenuUtil.getMenu();
          expect(submenu).toBeInTheDocument();

          await user.click(document.body);
          expect(nestedSubmenu).not.toBeInTheDocument();
          expect(submenu).not.toBeInTheDocument();
          expect(menu).not.toBeInTheDocument();
        });

        // it('should restore focus to menu trigger if submenu is closed with Escape key', async () => {
        //   let {getByRole, getAllByRole} = render(
        //     <MenuTrigger>
        //       <Button aria-label="Menu">☰</Button>
        //       <Popover>
        //         <Menu>
        //           <MenuItem id="open">Open</MenuItem>
        //           <MenuItem id="rename">Rename…</MenuItem>
        //           <MenuItem id="duplicate">Duplicate</MenuItem>
        //           <SubmenuTrigger>
        //             <MenuItem id="share">Share…</MenuItem>
        //             <Popover>
        //               <Menu>
        //                 <MenuItem id="email">Email</MenuItem>
        //                 <MenuItem id="sms">SMS</MenuItem>
        //                 <MenuItem id="twitter">Twitter</MenuItem>
        //               </Menu>
        //             </Popover>
        //           </SubmenuTrigger>
        //           <MenuItem id="delete">Delete…</MenuItem>
        //         </Menu>
        //       </Popover>
        //     </MenuTrigger>
        //   );

        //   let button = getByRole('button');
        //   expect(button).not.toHaveAttribute('data-pressed');

        //   await user.click(button);
        //   expect(button).toHaveAttribute('data-pressed');

        //   let menu = getAllByRole('menu')[0];
        //   expect(getAllByRole('menuitem')).toHaveLength(5);

        //   let popover = menu.closest('.react-aria-Popover');
        //   expect(popover).toBeInTheDocument();
        //   expect(popover).toHaveAttribute('data-trigger', 'MenuTrigger');

        //   let triggerItem = getAllByRole('menuitem')[3];
        //   expect(triggerItem).toHaveTextContent('Share…');
        //   expect(triggerItem).toHaveAttribute('aria-haspopup', 'menu');
        //   expect(triggerItem).toHaveAttribute('aria-expanded', 'false');
        //   expect(triggerItem).toHaveAttribute('data-has-submenu', 'true');
        //   expect(triggerItem).not.toHaveAttribute('data-open');

        //   // Open the submenu
        //   await user.pointer({target: triggerItem});
        //   act(() => {jest.runAllTimers();});
        //   expect(triggerItem).toHaveAttribute('data-hovered', 'true');
        //   expect(triggerItem).toHaveAttribute('aria-expanded', 'true');
        //   expect(triggerItem).toHaveAttribute('data-open', 'true');
        //   let submenu = getAllByRole('menu')[1];
        //   expect(submenu).toBeInTheDocument();

        //   let submenuItems = within(submenu).getAllByRole('menuitem');
        //   expect(submenuItems).toHaveLength(3);

        //   await user.pointer({target: submenuItems[0]});
        //   act(() => {jest.runAllTimers();});
        //   expect(document.activeElement).toBe(submenuItems[0]);

        //   await user.keyboard('{Escape}');
        //   act(() => {jest.runAllTimers();});

        //   expect(submenu).not.toBeInTheDocument();
        //   expect(menu).not.toBeInTheDocument();
        //   expect(document.activeElement).toBe(button);
        // });
        // it('should restore focus to menu trigger if nested submenu is closed with Escape key', async () => {
        //   document.elementFromPoint = jest.fn().mockImplementation(query => query);
        //   let {getByRole, getAllByRole} = render(
        //     <MenuTrigger>
        //       <Button aria-label="Menu">☰</Button>
        //       <Popover>
        //         <Menu>
        //           <MenuItem id="open">Open</MenuItem>
        //           <MenuItem id="rename">Rename…</MenuItem>
        //           <MenuItem id="duplicate">Duplicate</MenuItem>
        //           <SubmenuTrigger>
        //             <MenuItem id="share">Share…</MenuItem>
        //             <Popover>
        //               <Menu>
        //                 <SubmenuTrigger>
        //                   <MenuItem id="email">Email…</MenuItem>
        //                   <Popover>
        //                     <Menu>
        //                       <MenuItem id="work">Work</MenuItem>
        //                       <MenuItem id="personal">Personal</MenuItem>
        //                     </Menu>
        //                   </Popover>
        //                 </SubmenuTrigger>
        //                 <MenuItem id="sms">SMS</MenuItem>
        //                 <MenuItem id="twitter">Twitter</MenuItem>
        //               </Menu>
        //             </Popover>
        //           </SubmenuTrigger>
        //           <MenuItem id="delete">Delete…</MenuItem>
        //         </Menu>
        //       </Popover>
        //     </MenuTrigger>
        //   );

        //   let button = getByRole('button');
        //   expect(button).not.toHaveAttribute('data-pressed');

        //   await user.click(button);
        //   expect(button).toHaveAttribute('data-pressed');

        //   let menu = getAllByRole('menu')[0];
        //   expect(getAllByRole('menuitem')).toHaveLength(5);

        //   let popover = menu.closest('.react-aria-Popover');
        //   expect(popover).toBeInTheDocument();
        //   expect(popover).toHaveAttribute('data-trigger', 'MenuTrigger');

        //   let triggerItem = getAllByRole('menuitem')[3];
        //   expect(triggerItem).toHaveTextContent('Share…');
        //   expect(triggerItem).toHaveAttribute('aria-haspopup', 'menu');
        //   expect(triggerItem).toHaveAttribute('aria-expanded', 'false');
        //   expect(triggerItem).toHaveAttribute('data-has-submenu', 'true');
        //   expect(triggerItem).not.toHaveAttribute('data-open');

        //   // Open the submenu
        //   await user.pointer({target: triggerItem});
        //   act(() => {jest.runAllTimers();});
        //   expect(triggerItem).toHaveAttribute('data-hovered', 'true');
        //   expect(triggerItem).toHaveAttribute('aria-expanded', 'true');
        //   expect(triggerItem).toHaveAttribute('data-open', 'true');
        //   let submenu = getAllByRole('menu')[1];
        //   expect(submenu).toBeInTheDocument();

        //   let submenuItems = within(submenu).getAllByRole('menuitem');
        //   expect(submenuItems).toHaveLength(3);

        //   // Open the nested submenu
        //   await user.pointer({target: submenuItems[0]});
        //   act(() => {jest.runAllTimers();});
        //   expect(document.activeElement).toBe(submenuItems[0]);

        //   let nestedSubmenu = getAllByRole('menu')[1];
        //   expect(nestedSubmenu).toBeInTheDocument();

        //   let nestedSubmenuItems = within(nestedSubmenu).getAllByRole('menuitem');
        //   await user.pointer({target: nestedSubmenuItems[0]});
        //   act(() => {jest.runAllTimers();});
        //   expect(document.activeElement).toBe(nestedSubmenuItems[0]);

        //   await user.keyboard('{Escape}');
        //   act(() => {jest.runAllTimers();});

        //   expect(nestedSubmenu).not.toBeInTheDocument();
        //   expect(submenu).not.toBeInTheDocument();
        //   expect(menu).not.toBeInTheDocument();
        //   expect(document.activeElement).toBe(button);
        // });
        // it('should not close the menu when clicking on a element within the submenu tree', async () => {
        //   let onAction = jest.fn();
        //   let {getByRole, getAllByRole, queryAllByRole} = render(
        //     <MenuTrigger>
        //       <Button aria-label="Menu">☰</Button>
        //       <Popover>
        //         <Menu onAction={onAction}>
        //           <MenuItem id="open">Open</MenuItem>
        //           <MenuItem id="rename">Rename…</MenuItem>
        //           <MenuItem id="duplicate">Duplicate</MenuItem>
        //           <SubmenuTrigger>
        //             <MenuItem id="share">Share…</MenuItem>
        //             <Popover>
        //               <Menu onAction={onAction}>
        //                 <SubmenuTrigger>
        //                   <MenuItem id="email">Email…</MenuItem>
        //                   <Popover>
        //                     <Menu onAction={onAction}>
        //                       <MenuItem id="work">Work</MenuItem>
        //                       <MenuItem id="personal">Personal</MenuItem>
        //                     </Menu>
        //                   </Popover>
        //                 </SubmenuTrigger>
        //                 <MenuItem id="sms">SMS</MenuItem>
        //                 <MenuItem id="twitter">Twitter</MenuItem>
        //               </Menu>
        //             </Popover>
        //           </SubmenuTrigger>
        //           <MenuItem id="delete">Delete…</MenuItem>
        //         </Menu>
        //       </Popover>
        //     </MenuTrigger>
        //   );

        //   let button = getByRole('button');
        //   expect(button).not.toHaveAttribute('data-pressed');

        //   await user.click(button);
        //   expect(button).toHaveAttribute('data-pressed');

        //   let menu = getAllByRole('menu')[0];
        //   expect(getAllByRole('menuitem')).toHaveLength(5);

        //   let popover = menu.closest('.react-aria-Popover');
        //   expect(popover).toBeInTheDocument();

        //   let triggerItem = getAllByRole('menuitem')[3];

        //   // Open the submenu
        //   await user.pointer({target: triggerItem});
        //   act(() => {jest.runAllTimers();});
        //   let submenu = getAllByRole('menu')[1];
        //   expect(submenu).toBeInTheDocument();

        //   let nestedTriggerItem = getAllByRole('menuitem')[5];

        //   // Click a nested submenu item trigger
        //   await user.click(nestedTriggerItem);
        //   act(() => {jest.runAllTimers();});
        //   let menus = getAllByRole('menu', {hidden: true});
        //   expect(menus).toHaveLength(3);

        //   await user.click(getAllByRole('menuitem')[6]);
        //   menus = queryAllByRole('menu', {hidden: true});
        //   expect(menus).toHaveLength(0);
        //   expect(menu).not.toBeInTheDocument();
        // });

        // it('should support sections', async () => {
        //   let onAction = jest.fn();
        //   let {getByRole, getAllByRole} = render(
        //     <MenuTrigger>
        //       <Button aria-label="Menu">☰</Button>
        //       <Popover>
        //         <Menu onAction={onAction}>
        //           <Section>
        //             <Header>Actions</Header>
        //             <MenuItem id="open">Open</MenuItem>
        //             <MenuItem id="rename">Rename…</MenuItem>
        //             <MenuItem id="duplicate">Duplicate</MenuItem>
        //             <SubmenuTrigger>
        //               <MenuItem id="share">Share…</MenuItem>
        //               <Popover>
        //                 <Menu onAction={onAction}>
        //                   <Section>
        //                     <Header>Work</Header>
        //                     <MenuItem id="email-work">Email</MenuItem>
        //                     <MenuItem id="sms-work">SMS</MenuItem>
        //                     <MenuItem id="twitter-work">Twitter</MenuItem>
        //                   </Section>
        //                   <Separator />
        //                   <Section>
        //                     <Header>Personal</Header>
        //                     <MenuItem id="email-personal">Email</MenuItem>
        //                     <MenuItem id="sms-personal">SMS</MenuItem>
        //                     <MenuItem id="twitter-personal">Twitter</MenuItem>
        //                   </Section>
        //                 </Menu>
        //               </Popover>
        //             </SubmenuTrigger>
        //             <MenuItem id="delete">Delete…</MenuItem>
        //           </Section>
        //           <Separator />
        //           <Section>
        //             <Header>Settings</Header>
        //             <MenuItem id="user">User Settings</MenuItem>
        //             <MenuItem id="system">System Settings</MenuItem>
        //           </Section>
        //         </Menu>
        //       </Popover>
        //     </MenuTrigger>
        //   );

        //   let button = getByRole('button');
        //   expect(button).not.toHaveAttribute('data-pressed');
        //   let menuTester = testUtilUser.createTester('MenuTester', {user, root: button});
        //   await menuTester.open();
        //   expect(button).toHaveAttribute('data-pressed');

        //   let groups = menuTester.getSections();
        //   expect(groups).toHaveLength(2);

        //   expect(groups[0]).toHaveClass('react-aria-Section');
        //   expect(groups[1]).toHaveClass('react-aria-Section');

        //   expect(groups[0]).toHaveAttribute('aria-labelledby');
        //   expect(document.getElementById(groups[0].getAttribute('aria-labelledby')!)).toHaveTextContent('Actions');

        //   expect(groups[1]).toHaveAttribute('aria-labelledby');
        //   expect(document.getElementById(groups[1].getAttribute('aria-labelledby')!)).toHaveTextContent('Settings');

        //   let menu = menuTester.getMenu()!;
        //   expect(getAllByRole('menuitem')).toHaveLength(7);

        //   let popover = menu.closest('.react-aria-Popover');
        //   expect(popover).toBeInTheDocument();
        //   expect(popover).toHaveAttribute('data-trigger', 'MenuTrigger');
        //   let submenuTriggers = menuTester.getSubmenuTriggers();
        //   expect(submenuTriggers).toHaveLength(1);

        //   // Open the submenu
        //   let submenuUtil = (await menuTester.openSubmenu({submenuTriggerText: 'Share…'}))!;
        //   let submenu = submenuUtil.getMenu()!;
        //   expect(submenu).toBeInTheDocument();

        //   let submenuItems = submenuUtil.getOptions();
        //   expect(submenuItems).toHaveLength(6);

        //   let groupsInSubmenu = submenuUtil.getSections();
        //   expect(groupsInSubmenu).toHaveLength(2);

        //   expect(groupsInSubmenu[0]).toHaveClass('react-aria-Section');
        //   expect(groupsInSubmenu[1]).toHaveClass('react-aria-Section');

        //   expect(groupsInSubmenu[0]).toHaveAttribute('aria-labelledby');
        //   expect(document.getElementById(groupsInSubmenu[0].getAttribute('aria-labelledby')!)).toHaveTextContent('Work');

        //   expect(groupsInSubmenu[1]).toHaveAttribute('aria-labelledby');
        //   expect(document.getElementById(groupsInSubmenu[1].getAttribute('aria-labelledby')!)).toHaveTextContent('Personal');

        //   await user.click(submenuItems[0]);
        //   act(() => {jest.runAllTimers();});

        //   expect(onAction).toHaveBeenCalledTimes(1);
        //   expect(onAction).toHaveBeenLastCalledWith('email-work');

        //   expect(submenu).not.toBeInTheDocument();
        //   expect(menu).not.toBeInTheDocument();
        // });
      });
    }


    // TODO: closeOnSelect is not implemented in RAC and therefor not in S2
    // TODO: long press might be implementation specific, better to test in S2 and RAC separately, also hard because i don't have a way to know if a button was "pressed"
    // TODO: sub dialogs not implemented yet in RAC
    // TODO: where to test portalContainer? it's implementation specific, so RAC only?
  });
};
