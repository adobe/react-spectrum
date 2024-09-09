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
import {ActionButton, MenuItem, Menu, MenuTrigger, Section, Button} from 'react-aria-components';
import {
  DEFAULT_LONG_PRESS_TIME,
  installPointerEvent,
  pointerMap,
  simulateDesktop,
  triggerLongPress
} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';
import { setup } from 'axe-core';

let triggerText = 'Menu Button';

interface Items {
  name: string,
  children?: Items[]
}
let withSection = [
  {name: 'Heading 1', children: [
    {name: 'Foo'},
    {name: 'Bar'},
    {name: 'Baz'}
  ]}
];

// function renderComponent(Component, triggerProps = {}, menuProps = {}, buttonProps = {}) {
//   return render(
//     <Provider theme={theme}>
//       <div data-testid="scrollable">
//         <Component {...triggerProps}>
//           <Button {...buttonProps}>
//             {triggerText}
//           </Button>
//           <Menu items={withSection} {...menuProps}>
//             {item => (
//               <Section key={item.name} items={item.children} title={item.name}>
//                 {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
//               </Section>
//             )}
//           </Menu>
//         </Component>
//       </div>
//     </Provider>
//   );
// }
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
    multipleMenus?: (props?: {name: string}) => ReturnType<typeof ariaRender>
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
    let windowSpy;
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

    it('has default behavior (button renders, menu is closed)', function () {
      let tree = renderers.standard();
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
      let triggerButton = menuTester.getTrigger();

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
      let triggerButton = menuTester.getTrigger();

      await menuTester.open();
      act(() => {jest.runAllTimers();});

      let menu = menuTester.getMenu();
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
      let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});

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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
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
          let menuTester = testUtilUser.createTester('MenuTester', {root: tree.container});
          let triggerButton = menuTester.getTrigger();

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
          let menu1Tester = testUtilUser.createTester('MenuTester', {root: button1});
          let menu2Tester = testUtilUser.createTester('MenuTester', {root: button2});

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

    // TODO: closeOnSelect is not implemented in RAC and therefor not in S2

    // describe('MenuTrigger trigger="longPress" open behavior', function () {
    //   installPointerEvent();

    //   const ERROR_MENU_NOT_FOUND = new Error('Menu not found');
    //   const getMenuOrThrow = (tree, button) => {
    //     try {
    //       let menu = tree.getByRole('menu');
    //       expect(menu).toBeTruthy();
    //       expect(menu).toHaveAttribute('aria-labelledby', button.id);
    //     } catch (e) {
    //       throw ERROR_MENU_NOT_FOUND;
    //     }
    //   };

    //   it('should open the menu on longPress', async function () {
    //     const props = {onOpenChange, trigger: 'longPress'};
    //     await verifyMenuToggle(MenuTrigger, props, {}, async (button, menu) => {
    //       expect(button).toHaveAttribute('aria-describedby');
    //       expect(document.getElementById(button.getAttribute('aria-describedby'))).toHaveTextContent('Long press or press Alt + ArrowDown to open menu');

    //       if (!menu) {
    //         await triggerLongPress({element: button, advanceTimer: jest.advanceTimersByTime});
    //       } else {
    //         await user.pointer({target: button, keys: '[TouchA]'});
    //       }
    //     });
    //   });

    //   it('should not open menu on click', async function () {
    //     const props = {onOpenChange, trigger: 'longPress'};
    //     let tree = renderComponent(MenuTrigger, props, {});
    //     let button = tree.getByRole('button');

    //     await user.pointer({target: button, keys: '[TouchA]'});
    //     expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
    //   });

    //   it(`should not open menu on short press (default threshold set to ${DEFAULT_LONG_PRESS_TIME}ms)`, async function () {
    //     const props = {onOpenChange, trigger: 'longPress'};
    //     let tree = renderComponent(MenuTrigger, props, {});
    //     let button = tree.getByRole('button');

    //     await user.pointer({target: button, keys: '[TouchA]'});
    //     expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
    //   });

    //   it('should not open the menu on Enter', async function () {
    //     const props = {onOpenChange, trigger: 'longPress'};
    //     let tree = renderComponent(MenuTrigger, props, {});
    //     let button = tree.getByRole('button');

    //     await user.pointer({target: button, keys: '[TouchA]'});
    //     expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
    //   });

    //   it('should not open the menu on Space', async function () {
    //     const props = {onOpenChange, trigger: 'longPress'};
    //     let tree = renderComponent(MenuTrigger, props, {});
    //     let button = tree.getByRole('button');
    //     await user.pointer({target: button, keys: '[TouchA]'});
    //     expect(getMenuOrThrow).toThrowError(ERROR_MENU_NOT_FOUND);
    //   });

    //   it('should open the menu on Alt+ArrowUp', async function () {
    //     const props = {onOpenChange, trigger: 'longPress'};
    //     await verifyMenuToggle(MenuTrigger, props, {}, async (button, menu) => {
    //       if (!menu) {
    //         fireEvent.keyDown(button, {key: 'ArrowUp', altKey: true});
    //       } else {
    //         await user.pointer({target: button, keys: '[TouchA]'});
    //       }
    //     });
    //   });

    //   it('should open the menu on Alt+ArrowDown', async function () {
    //     const props = {onOpenChange, trigger: 'longPress'};
    //     await verifyMenuToggle(MenuTrigger, props, {}, async (button, menu) => {
    //       if (!menu) {
    //         fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
    //       } else {
    //         await user.pointer({target: button, keys: '[TouchA]'});
    //       }
    //     });
    //   });
    // });

    // describe('MenuTrigger trigger="longPress" focus behavior', function () {
    //   installPointerEvent();

    //   function expectMenuItemToBeActive(tree, idx, selectionMode) {
    //     let menuItemRole = 'menuitem';
    //     if (selectionMode === 'multiple') {
    //       menuItemRole = 'menuitemcheckbox';
    //     } else if (selectionMode === 'single') {
    //       menuItemRole = 'menuitemradio';
    //     }
    //     let menu = tree.getByRole('menu');
    //     expect(menu).toBeTruthy();
    //     let menuItems = within(menu).getAllByRole(menuItemRole);
    //     let selectedItem = menuItems[idx < 0 ? menuItems.length + idx : idx];
    //     expect(selectedItem).toBe(document.activeElement);
    //     return menu;
    //   }

    //   it('should focus the selected item on menu open', async function () {
    //     let tree = renderComponent(MenuTrigger, {trigger: 'longPress'}, {selectedKeys: ['Bar'], selectionMode: 'single'});
    //     let button = tree.getByRole('button');
    //     await triggerLongPress({element: button, advanceTimer: jest.advanceTimersByTime});
    //     let menu = expectMenuItemToBeActive(tree, 1, 'single');
    //     await user.pointer({target: button, keys: '[TouchA]'});
    //     act(() => {
    //       jest.runAllTimers();
    //     });
    //     expect(menu).not.toBeInTheDocument();

    //     // Opening menu via Alt+ArrowUp still autofocuses the selected item
    //     fireEvent.keyDown(button, {key: 'ArrowUp', altKey: true});
    //     menu = expectMenuItemToBeActive(tree, 1, 'single');
    //     await user.pointer({target: button, keys: '[TouchA]'});
    //     act(() => {
    //       jest.runAllTimers();
    //     });
    //     expect(menu).not.toBeInTheDocument();

    //     // Opening menu via Alt+ArrowDown still autofocuses the selected item
    //     fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
    //     menu = expectMenuItemToBeActive(tree, 1, 'single');
    //     await user.pointer({target: button, keys: '[TouchA]'});
    //     act(() => {
    //       jest.runAllTimers();
    //     });
    //     expect(menu).not.toBeInTheDocument();
    //   });

    //   it('should focus the last item on Alt+ArrowUp if no selectedKeys specified', function () {
    //     let tree = renderComponent(MenuTrigger, {trigger: 'longPress'}, {});
    //     let button = tree.getByRole('button');
    //     fireEvent.keyDown(button, {key: 'ArrowUp', altKey: true});
    //     expectMenuItemToBeActive(tree, -1);
    //   });

    //   it('should focus the first item on Alt+ArrowDown if no selectedKeys specified', function () {
    //     let tree = renderComponent(MenuTrigger, {trigger: 'longPress'}, {});
    //     let button = tree.getByRole('button');
    //     fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
    //     expectMenuItemToBeActive(tree, 0);
    //   });
    // });

    // describe('sub dialogs', function () {
    //   let tree;
    //   afterEach(() => {
    //     act(() => {jest.runAllTimers();});
    //     if (tree) {
    //       tree.unmount();
    //     }
    //     tree = null;
    //     act(() => {jest.runAllTimers();});
    //   });

    //   describe('unavailable item', function () {
    //     let renderTree = (options = {}) => {
    //       let {providerProps = {}, isItem2Unavailable = true} = options;
    //       let {locale = 'en-US'} = providerProps;
    //       tree = render(
    //         <Provider theme={theme} locale={locale}>
    //           <input data-testid="previous" />
    //           <MenuTrigger>
    //             <ActionButton>Menu</ActionButton>
    //             <Menu onAction={action('onAction')}>
    //               <Item key="1">One</Item>
    //               <ContextualHelpTrigger isUnavailable={isItem2Unavailable}>
    //                 <Item key="foo" textValue="Hello">
    //                   <Text>Hello</Text>
    //                   <Text slot="description">Is it me you're looking for?</Text>
    //                 </Item>
    //                 <Dialog>
    //                   <Heading>Lionel Richie says:</Heading>
    //                   <Content>I can see it in your eyes</Content>
    //                 </Dialog>
    //               </ContextualHelpTrigger>
    //               <Item key="3">Three</Item>
    //               <Item key="5">Five</Item>
    //               <ContextualHelpTrigger isUnavailable>
    //                 <Item key="bar" textValue="Choose a college major">Choose a College Major</Item>
    //                 <Dialog>
    //                   <Heading>Choosing a College Major</Heading>
    //                   <Content>What factors should I consider when choosing a college major?</Content>
    //                   <Footer>Visit this link before choosing this action. <Link>Learn more</Link></Footer>
    //                 </Dialog>
    //               </ContextualHelpTrigger>
    //             </Menu>
    //           </MenuTrigger>
    //           <input data-testid="next" />
    //         </Provider>
    //       );
    //     };
    //     let openMenu = async () => {
    //       let triggerButton = tree.getByRole('button');
    //       await user.click(triggerButton);
    //       act(() => {jest.runAllTimers();});

    //       return tree.getByRole('menu');
    //     };

    //     it('adds the expected spectrum icon', async function () {
    //       renderTree();
    //       let menu = await openMenu();
    //       let unavailableItem = within(menu).getAllByRole('menuitem')[1];
    //       expect(unavailableItem).toBeVisible();

    //       let icon = within(unavailableItem).getByRole('img', {hidden: true});
    //       expect(icon).not.toHaveAttribute('aria-hidden');
    //     });

    //     it('can open a sub dialog with hover', async function () {
    //       renderTree();
    //       let menu = await openMenu();
    //       let menuItems = within(menu).getAllByRole('menuitem');
    //       let unavailableItem = menuItems[1];
    //       expect(unavailableItem).toBeVisible();
    //       expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

    //       fireEvent.mouseEnter(unavailableItem);
    //       act(() => {jest.runAllTimers();});
    //       let dialog = tree.getByRole('dialog');
    //       expect(dialog).toBeVisible();

    //       fireEvent.mouseLeave(unavailableItem);
    //       fireEvent.mouseEnter(menuItems[2]);
    //       act(() => {jest.runAllTimers();});
    //       expect(menu).toBeVisible();
    //       expect(dialog).not.toBeInTheDocument();
    //       expect(document.activeElement).toBe(menuItems[2]);
    //     });

    //     it('can not open a sub dialog with hover if isUnavailable is false', async function () {
    //       renderTree({isItem2Unavailable: false});
    //       let menu = await openMenu();
    //       let menuItems = within(menu).getAllByRole('menuitem');
    //       let availableItem = menuItems[1];
    //       expect(availableItem).toBeVisible();
    //       expect(within(availableItem).queryByRole('img', {hidden: true})).toBeNull();
    //       expect(availableItem).not.toHaveAttribute('aria-haspopup', 'dialog');

    //       fireEvent.mouseEnter(availableItem);
    //       act(() => {jest.runAllTimers();});
    //       expect(tree.queryByRole('dialog')).toBeNull();

    //       expect(document.activeElement).toBe(availableItem);
    //       fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    //       fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    //       expect(tree.queryByRole('dialog')).toBeNull();
    //     });

    //     it('can open a sub dialog with keyboard', async function () {
    //       renderTree();
    //       let menu = await openMenu();
    //       fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    //       fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    //       fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    //       fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    //       let unavailableItem = within(menu).getAllByRole('menuitem')[1];
    //       expect(document.activeElement).toBe(unavailableItem);

    //       fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    //       fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});

    //       let dialog = tree.getByRole('dialog');
    //       expect(dialog).toBeVisible();
    //     });

    //     it('will close sub dialogs as you hover other items even if you click open it', async function () {
    //       renderTree();
    //       let menu = await openMenu();
    //       let menuItems = within(menu).getAllByRole('menuitem');
    //       let unavailableItem = menuItems[1];
    //       expect(unavailableItem).toBeVisible();
    //       expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

    //       fireEvent.mouseEnter(unavailableItem);
    //       fireEvent.mouseDown(unavailableItem);
    //       fireEvent.mouseUp(unavailableItem);
    //       act(() => {jest.runAllTimers();});
    //       let dialog = tree.getByRole('dialog');
    //       expect(dialog).toBeVisible();

    //       fireEvent.mouseLeave(unavailableItem);
    //       fireEvent.mouseEnter(menuItems[2]);
    //       act(() => {jest.runAllTimers();});
    //       expect(dialog).not.toBeVisible();

    //       fireEvent.mouseLeave(menuItems[2]);
    //       fireEvent.mouseEnter(menuItems[3]);
    //       act(() => {jest.runAllTimers();});
    //       fireEvent.mouseLeave(menuItems[3]);
    //       fireEvent.mouseEnter(menuItems[4]);
    //       act(() => {jest.runAllTimers();});

    //       expect(menu).toBeVisible();
    //       dialog = tree.getByRole('dialog');
    //       expect(dialog).toBeInTheDocument();
    //       expect(document.activeElement).toBe(dialog);

    //       await user.tab();
    //       act(() => {jest.runAllTimers();});
    //       let link = screen.getByRole('link');
    //       expect(document.activeElement).toBe(link);

    //       await user.tab();
    //       act(() => {jest.runAllTimers();});
    //       expect(dialog).not.toBeInTheDocument();
    //       expect(menu).not.toBeInTheDocument();
    //       let input = tree.getByTestId('next');
    //       expect(document.activeElement).toBe(input);
    //     });

    //     it('will close everything if the user shift tabs out of the subdialog', async function () {
    //       renderTree();
    //       let menu = await openMenu();
    //       let menuItems = within(menu).getAllByRole('menuitem');
    //       let unavailableItem = menuItems[4];
    //       expect(unavailableItem).toBeVisible();
    //       expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

    //       fireEvent.mouseEnter(unavailableItem);
    //       act(() => {jest.runAllTimers();});
    //       let dialog = tree.getByRole('dialog');
    //       expect(dialog).toBeVisible();

    //       expect(document.activeElement).toBe(dialog);

    //       await user.tab({shift: true});
    //       act(() => {jest.runAllTimers();});
    //       act(() => {jest.runAllTimers();});
    //       expect(dialog).not.toBeInTheDocument();
    //       let input = tree.getByTestId('previous');
    //       expect(document.activeElement).toBe(input);
    //     });

    //     it('will close everything if the user shift tabs out of the subdialog', async function () {
    //       renderTree({providerProps: {locale: 'ar-AE'}});
    //       let menu = await openMenu();
    //       fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    //       fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    //       fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    //       fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    //       let unavailableItem = within(menu).getAllByRole('menuitem')[1];
    //       expect(document.activeElement).toBe(unavailableItem);

    //       fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    //       fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft'});

    //       let dialog = tree.getByRole('dialog');
    //       expect(dialog).toBeVisible();
    //     });

    //     it('should close everything if the user clicks on the underlay of the root menu', async function () {
    //       renderTree();
    //       let menu = await openMenu();
    //       let menuItems = within(menu).getAllByRole('menuitem');
    //       let unavailableItem = menuItems[4];
    //       expect(unavailableItem).toBeVisible();
    //       expect(unavailableItem).toHaveAttribute('aria-haspopup', 'dialog');

    //       fireEvent.mouseEnter(unavailableItem);
    //       act(() => {jest.runAllTimers();});
    //       let dialog = tree.getByRole('dialog');
    //       expect(dialog).toBeVisible();

    //       expect(document.activeElement).toBe(dialog);

    //       let underlay = tree.getByTestId('underlay', {hidden: true});
    //       fireEvent.mouseDown(underlay);
    //       fireEvent.mouseUp(underlay);
    //       act(() => {jest.runAllTimers();});
    //       act(() => {jest.runAllTimers();});
    //       expect(dialog).not.toBeInTheDocument();
    //       expect(menu).not.toBeInTheDocument();

    //       let triggerButton = tree.getByRole('button');
    //       expect(document.activeElement).toBe(triggerButton);
    //     });
    //   });
    // });

    // describe('portalContainer', () => {
    //   function InfoMenu(props) {
    //     return (
    //       <Provider theme={theme}>
    //         <UNSTABLE_PortalProvider getContainer={() => props.container.current}>
    //           <MenuTrigger>
    //             <ActionButton aria-label="trigger" />
    //             <Menu>
    //               <Item key="1">One</Item>
    //               <Item key="">Two</Item>
    //               <Item key="3">Three</Item>
    //             </Menu>
    //           </MenuTrigger>
    //         </UNSTABLE_PortalProvider>
    //       </Provider>
    //     );
    //   }

    //   function App() {
    //     let container = React.useRef(null);
    //     return (
    //       <>
    //         <InfoMenu container={container} />
    //         <div ref={container} data-testid="custom-container" />
    //       </>
    //     );
    //   }

    //   it('should render the menu in the portal container', async () => {
    //     let {getByRole, getByTestId} = render(
    //       <App />
    //     );

    //     let button = getByRole('button');
    //     await user.click(button);

    //     expect(getByRole('menu').closest('[data-testid="custom-container"]')).toBe(getByTestId('custom-container'));
    //   });

    //   it('should render the menu tray in the portal container', async () => {
    //     windowSpy.mockImplementation(() => 700);
    //     let {getByRole, getByTestId} = render(
    //       <App />
    //     );

    //     let button = getByRole('button');
    //     await user.click(button);

    //     expect(getByRole('menu').closest('[data-testid="custom-container"]')).toBe(getByTestId('custom-container'));
    //   });
    // });
  });
};