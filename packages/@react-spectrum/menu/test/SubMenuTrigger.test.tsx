/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render as renderComponent, triggerPress, within} from '@react-spectrum/test-utils';
import {composeStories} from '@storybook/testing-react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import type {Scale} from '@react-types/provider';
import * as stories from '../stories/SubMenu.stories';
import {theme} from '@react-spectrum/theme-default';

let {
  SubMenuStatic,
  SubMenuDynamic,
  Complex
} = composeStories(stories);

let render = (children, scale = 'medium' as Scale, locale = 'en-US') => {
  let tree = renderComponent(
    <Provider theme={theme} scale={scale} locale={locale}>
      {children}
    </Provider>
  );

  act(() => {jest.runAllTimers();});
  return tree;
};

function pressArrowRight() {
  fireEvent.keyDown(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
  fireEvent.keyUp(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
}

function pressArrowLeft() {
  fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
  fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
}

function pressArrowDown(el?: Element) {
  fireEvent.keyDown(el ?? document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
  fireEvent.keyUp(el ?? document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
}

function pressArrowUp(el?: Element) {
  fireEvent.keyDown(el ?? document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
  fireEvent.keyUp(el ?? document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
}

function pressEnter() {
  fireEvent.keyDown(document.activeElement, {key: 'Enter'});
  fireEvent.keyUp(document.activeElement, {key: 'Enter'});
}

function pressEsc() {
  fireEvent.keyDown(document.activeElement, {key: 'Escape'});
  fireEvent.keyUp(document.activeElement, {key: 'Escape'});
}

function pressSpace() {
  fireEvent.keyDown(document.activeElement, {key: ' '});
  fireEvent.keyUp(document.activeElement, {key: ' '});
}

describe('SubMenu', function () {
  let onAction = jest.fn();
  let subMenuOnAction = jest.fn();
  let onOpenChange = jest.fn();
  let onSelectionChange = jest.fn();
  let subMenuOnSelectionChange = jest.fn();
  let onClose = jest.fn();
  let subMenuOnClose = jest.fn();

  beforeAll(function () {
    jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 1000);
    jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 1000);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
    jest.clearAllMocks();
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  it.each`
    Name                 | Component
    ${'static'}          | ${SubMenuStatic}
    ${'dynamic'}         | ${SubMenuDynamic}
  `('renders $Name submenu', ({Component}) => {
    let tree = render(<Component />);
    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(document.activeElement).toBe(menu);
    let menuItems = within(menu).getAllByRole('menuitem');
    expect(within(menuItems[0]).queryByRole('img', {hidden: true})).not.toBeTruthy();
    expect(within(menuItems[1]).getByRole('img', {hidden: true})).toBeTruthy();
    expect(within(menuItems[2]).queryByRole('img', {hidden: true})).not.toBeTruthy();

    let subMenuTrigger1 = menuItems[1];
    expect(subMenuTrigger1).toHaveAttribute('aria-haspopup', 'menu');
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');

    fireEvent.mouseEnter(subMenuTrigger1);
    act(() => {jest.runAllTimers();});
    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    let subMenu1 = menus[1];
    expect(document.activeElement).toBe(subMenuTrigger1);
    expect(subMenu1).toHaveAttribute('aria-labelledby', subMenuTrigger1.id);
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'true');
    expect(subMenuTrigger1).toHaveAttribute('aria-controls', subMenu1.id);

    let subMenu1Items = within(subMenu1).getAllByRole('menuitem');
    expect(subMenu1Items).toHaveLength(3);
    expect(subMenu1Items[2]).toHaveTextContent('Lvl 2 Item 3');

    let subMenuTrigger2 = subMenu1Items[2];
    expect(within(subMenuTrigger2).getByRole('img', {hidden: true})).toBeTruthy();
    expect(subMenuTrigger2).toHaveAttribute('aria-haspopup', 'menu');
    expect(subMenuTrigger2).toHaveAttribute('aria-expanded', 'false');
    fireEvent.mouseLeave(subMenuTrigger1);
    fireEvent.mouseEnter(subMenuTrigger2);
    act(() => {jest.runAllTimers();});

    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(3);
    let subMenu2 = menus[2];
    expect(document.activeElement).toBe(subMenuTrigger2);
    expect(subMenu2).toHaveAttribute('aria-labelledby', subMenuTrigger2.id);
    expect(subMenuTrigger2).toHaveAttribute('aria-expanded', 'true');
    expect(subMenuTrigger2).toHaveAttribute('aria-controls', subMenu2.id);

    let subMenu2Items = within(subMenu2).getAllByRole('menuitem');
    expect(subMenu2Items).toHaveLength(3);
    expect(subMenu2Items[2]).toHaveTextContent('Lvl 3 Item 3');
  });

  it('submenu closes when hover leaves the submenu trigger', function () {
    let tree = render(<SubMenuStatic menuTriggerProps={{onOpenChange}} />);
    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(document.activeElement).toBe(menu);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    let menuItems = within(menu).getAllByRole('menuitem');
    let subMenuTrigger1 = menuItems[1];
    expect(subMenuTrigger1).toHaveAttribute('aria-haspopup', 'menu');
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');

    fireEvent.mouseEnter(subMenuTrigger1);
    act(() => {jest.runAllTimers();});
    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(subMenuTrigger1);
    fireEvent.mouseEnter(menuItems[0]);
    act(() => {jest.runAllTimers();});
    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(1);
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('only allows one submenu open at a time', function () {
    let tree = render(<Complex />);
    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(document.activeElement).toBe(menu);
    let menuItems = within(menu).getAllByRole('menuitem');
    let subMenuTrigger1 = menuItems[0];
    expect(subMenuTrigger1).toHaveAttribute('aria-haspopup', 'menu');
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');
    let subMenuTrigger2 = menuItems[1];
    expect(subMenuTrigger2).toHaveAttribute('aria-haspopup', 'menu');
    expect(subMenuTrigger2).toHaveAttribute('aria-expanded', 'false');

    fireEvent.mouseEnter(subMenuTrigger1);
    act(() => {jest.runAllTimers();});
    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'true');
    expect(subMenuTrigger2).toHaveAttribute('aria-expanded', 'false');
    expect(within(menus[1]).getAllByRole('menuitem')).toHaveLength(8);

    fireEvent.mouseLeave(subMenuTrigger1);
    fireEvent.mouseEnter(subMenuTrigger2);
    act(() => {jest.runAllTimers();});
    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');
    expect(subMenuTrigger2).toHaveAttribute('aria-expanded', 'true');
    expect(within(menus[1]).getAllByRole('menuitem')).toHaveLength(4);
  });

  it('should not close the sub menu if user hovers onto the sub menu trigger from the sub menu', function () {
    let tree = render(<SubMenuStatic />);
    let triggerButton = tree.getByRole('button');
    pressArrowDown(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    let menuItems = within(menu).getAllByRole('menuitem');
    expect(document.activeElement).toBe(menuItems[0]);
    pressArrowDown();
    let subMenuTrigger1 = menuItems[1];
    expect(document.activeElement).toBe(subMenuTrigger1);
    pressArrowRight();
    act(() => {jest.runAllTimers();});

    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    let subMenu1Items = within(menus[1]).getAllByRole('menuitem');
    expect(document.activeElement).toBe(subMenu1Items[0]);
    fireEvent.mouseMove(subMenu1Items[0]);
    fireEvent.mouseEnter(subMenu1Items[0]);
    fireEvent.mouseLeave(subMenu1Items[0]);
    fireEvent.mouseEnter(subMenuTrigger1);

    act(() => {jest.runAllTimers();});
    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    expect(document.activeElement).toBe(subMenuTrigger1);
  });

  it('should close the sub menu if the user hovers a neighboring menu item from the submenu trigger', function () {
    let tree = render(<SubMenuStatic />);
    let triggerButton = tree.getByRole('button');
    pressArrowDown(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    let menuItems = within(menu).getAllByRole('menuitem');
    expect(document.activeElement).toBe(menuItems[0]);
    pressArrowDown();
    let subMenuTrigger1 = menuItems[1];
    expect(document.activeElement).toBe(subMenuTrigger1);
    pressArrowRight();
    act(() => {jest.runAllTimers();});

    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    let subMenu1Items = within(menus[1]).getAllByRole('menuitem');
    expect(document.activeElement).toBe(subMenu1Items[0]);
    // Hover neighboring menu item adjacent to submenu trigger when focus is in the submenu
    fireEvent.mouseMove(subMenu1Items[0]);
    fireEvent.mouseEnter(subMenu1Items[0]);
    fireEvent.mouseLeave(subMenu1Items[0]);
    fireEvent.mouseEnter(menuItems[0]);

    act(() => {jest.runAllTimers();});
    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(1);
    expect(document.activeElement).toBe(menuItems[0]);
    fireEvent.mouseLeave(menuItems[0]);
    fireEvent.mouseEnter(subMenuTrigger1);

    act(() => {jest.runAllTimers();});
    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    expect(document.activeElement).toBe(subMenuTrigger1);
    // Hover neighboring menu item adjacent to submenu trigger when focus is in the submenu trigger's menu
    fireEvent.mouseLeave(subMenuTrigger1);
    fireEvent.mouseEnter(menuItems[0]);

    act(() => {jest.runAllTimers();});
    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(1);
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it('should close the sub menu if the user hovers a menu item from a earlier sub menu', function () {
    let tree = render(<SubMenuStatic />);
    let triggerButton = tree.getByRole('button');
    pressArrowDown(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    let menuItems = within(menu).getAllByRole('menuitem');
    expect(document.activeElement).toBe(menuItems[0]);
    pressArrowDown();
    let subMenuTrigger1 = menuItems[1];
    expect(document.activeElement).toBe(subMenuTrigger1);
    pressArrowRight();
    act(() => {jest.runAllTimers();});

    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    let subMenu1Items = within(menus[1]).getAllByRole('menuitem');
    expect(document.activeElement).toBe(subMenu1Items[0]);
    pressArrowDown();
    pressArrowDown();
    pressArrowRight();
    act(() => {jest.runAllTimers();});

    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(3);
    let subMenu2Items = within(menus[2]).getAllByRole('menuitem');
    expect(document.activeElement).toBe(subMenu2Items[0]);
    // Hover menu item in original menu
    fireEvent.mouseMove(subMenu2Items[0]);
    fireEvent.mouseEnter(subMenu2Items[0]);
    fireEvent.mouseLeave(subMenu2Items[0]);
    fireEvent.mouseEnter(menuItems[0]);
    act(() => {jest.runAllTimers();});

    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(1);
    // TODO: will need to fix the below, right now the focusing of menu item #1 in the orignal menu due to hover happens before the restoreFocus
    // on focusscope unmount which causes the focus to move to the very first submenu trigger. Perhaps only restore focus if not in pointer modality?
    // Otherwise would need to do a delayed refocus but that feels really iffy since it would trail behind the user's mouse movements...
    expect(document.activeElement).toBe(subMenuTrigger1);
  });

  it('should close everything if the user clicks outside of the submenus', function () {
    let tree = render(<SubMenuStatic />);
    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    let subMenuTrigger1 = within(menu).getAllByRole('menuitem')[1];
    fireEvent.mouseEnter(subMenuTrigger1);
    act(() => {jest.runAllTimers();});
    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);

    let subMenuTrigger2 = within(menus[1]).getAllByRole('menuitem')[2];
    fireEvent.mouseLeave(subMenuTrigger1);
    fireEvent.mouseEnter(subMenuTrigger2);
    act(() => {jest.runAllTimers();});
    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(3);

    // @ts-ignore
    let underlay = tree.getByTestId('underlay', {hidden: true});
    fireEvent.pointerDown(underlay);
    fireEvent.pointerUp(underlay);
    act(() => {jest.runAllTimers();});
    act(() => {jest.runAllTimers();});
    menus = tree.queryAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(0);
    expect(document.activeElement).toBe(triggerButton);
  });

  it('disables a submenu trigger if the wrapped item is in the disabledKeys array', function () {
    let tree = render(<SubMenuStatic disabledKeys={['Lvl 1 Item 2']} />);
    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    let menuItems = within(menu).getAllByRole('menuitem');
    let subMenuTrigger = menuItems[1];
    expect(subMenuTrigger).toHaveAttribute('aria-haspopup', 'menu');

    fireEvent.mouseEnter(subMenuTrigger);
    act(() => {jest.runAllTimers();});
    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(1);
    expect(subMenuTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(subMenuTrigger).toHaveAttribute('aria-disabled', 'true');

    pressArrowDown();
    expect(document.activeElement).toBe(menuItems[0]);
    expect(document.activeElement).toHaveTextContent('Lvl 1 Item 1');
    pressArrowDown();
    expect(document.activeElement).toBe(menuItems[2]);
    expect(document.activeElement).toHaveTextContent('Lvl 1 Item 3');
  });

  describe('keyboard interactions', function () {
    it.each`
      Name                | locale      | actions
      ${'ltr, ArrowKeys'} | ${'en-US'}  | ${[() => pressArrowRight(), () => pressArrowLeft()]}
      ${'rtl, ArrowKeys'} | ${'ar-AE'}  | ${[() => pressArrowLeft(), () => pressArrowRight()]}
      ${'ltr, Enter/Esc'} | ${'en-US'}  | ${[() => pressEnter(), () => pressEsc()]}
    `('opens/closes the submenu via keyboard ($Name)', function ({Name, locale, actions}) {
      let tree = render(<SubMenuStatic menuTriggerProps={{onOpenChange}} />, 'medium', locale);
      let triggerButton = tree.getByRole('button');
      pressArrowDown(triggerButton);
      act(() => {jest.runAllTimers();});
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      expect(document.activeElement).toBe(menuItems[0]);
      pressArrowDown();
      let subMenuTrigger1 = menuItems[1];
      expect(document.activeElement).toBe(subMenuTrigger1);
      actions[0]();
      act(() => {jest.runAllTimers();});

      let menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange).toHaveBeenCalledTimes(1);

      let subMenu1Items = within(menus[1]).getAllByRole('menuitem');
      expect(document.activeElement).toBe(subMenu1Items[0]);
      actions[1]();
      act(() => {jest.runAllTimers();});

      if (Name === 'ltr, Enter/Esc') {
        // Closes all submenus + menu via Esc
        menus = tree.queryAllByRole('menu', {hidden: true});
        expect(menus).toHaveLength(0);
        expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
        expect(onOpenChange).toHaveBeenCalledTimes(2);
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
      } else {
        // Only closes the current submenu via Arrow keys
        menus = tree.getAllByRole('menu', {hidden: true});
        expect(menus).toHaveLength(1);
        expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');
        expect(document.activeElement).toBe(subMenuTrigger1);
        expect(onOpenChange).toHaveBeenCalledTimes(1);
      }
    });

    it('should close the submenu if focus moves from the submenu trigger to a neighboring element via keyboard', function () {
      let tree = render(<SubMenuStatic />);
      let triggerButton = tree.getByRole('button');
      pressArrowDown(triggerButton);
      act(() => {jest.runAllTimers();});

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let subMenuTrigger1 = menuItems[1];
      fireEvent.mouseMove(subMenuTrigger1);
      fireEvent.mouseEnter(subMenuTrigger1);
      act(() => {jest.runAllTimers();});

      let menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      expect(document.activeElement).toBe(subMenuTrigger1);
      pressArrowUp();

      act(() => {jest.runAllTimers();});
      menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(1);
    });

    it.each`
    Name                | locale      | actions
      ${'ltr, ArrowKeys'} | ${'en-US'}  | ${[() => pressArrowLeft()]}
      ${'rtl, ArrowKeys'} | ${'ar-AE'}  | ${[() => pressArrowRight()]}
    `('only closes the last submenu via keyboard if focus is on the trigger ($Name)', function ({locale, actions}) {
      let tree = render(<SubMenuStatic />, 'medium', locale);
      let triggerButton = tree.getByRole('button');
      pressArrowDown(triggerButton);
      act(() => {jest.runAllTimers();});

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let subMenuTrigger1 = menuItems[1];
      fireEvent.mouseMove(subMenuTrigger1);
      fireEvent.mouseEnter(subMenuTrigger1);
      act(() => {jest.runAllTimers();});

      let menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      let subMenu1Items = within(menus[1]).getAllByRole('menuitem');
      let subMenuTrigger2 = subMenu1Items[2];
      fireEvent.mouseEnter(subMenuTrigger2);
      act(() => {jest.runAllTimers();});

      menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(3);
      expect(document.activeElement).toBe(subMenuTrigger2);
      actions[0]();
      act(() => {jest.runAllTimers();});

      menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      expect(document.activeElement).toBe(subMenuTrigger2);
    });
  });

  describe('user provided callbacks', function () {
    it('calls user provided submenu onAction and onClose when submenu option is pressed', function () {
      let tree = render(
        <SubMenuStatic
          onAction={onAction}
          onClose={onClose}
          menuTriggerProps={{onOpenChange}}
          subMenu1Props={{onAction: subMenuOnAction, onClose: subMenuOnClose}} />
        );
      let triggerButton = tree.getByRole('button');
      triggerPress(triggerButton);
      act(() => {jest.runAllTimers();});
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      // Click on the 3rd level SubMenu item
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let subMenuTrigger1 = menuItems[1];
      fireEvent.mouseEnter(subMenuTrigger1);
      act(() => {jest.runAllTimers();});
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      let menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      let subMenu1 = menus[1];
      expect(document.activeElement).toBe(subMenuTrigger1);
      let subMenu1Items = within(subMenu1).getAllByRole('menuitem');
      let subMenuTrigger2 = subMenu1Items[2];
      fireEvent.mouseLeave(subMenuTrigger1);
      fireEvent.mouseEnter(subMenuTrigger2);
      act(() => {jest.runAllTimers();});
      menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(3);
      let subMenu2 = menus[2];
      expect(document.activeElement).toBe(subMenuTrigger2);
      let subMenu2Items = within(subMenu2).getAllByRole('menuitem');
      triggerPress(subMenu2Items[2]);
      act(() => {jest.runAllTimers();});
      menus = tree.queryAllByRole('menu', {hidden: true});
      // Closes all menus when a submenu action is triggered. No action/close handlers are called since
      // 3rd menu doesn't have one provided
      expect(menus).toHaveLength(0);
      expect(onAction).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(subMenuOnAction).not.toHaveBeenCalled();
      expect(subMenuOnClose).not.toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);

      // Click on the 2rd level SubMenu item which has its own onAction defined
      triggerPress(triggerButton);
      act(() => {jest.runAllTimers();});
      menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      menuItems = within(menu).getAllByRole('menuitem');
      subMenuTrigger1 = menuItems[1];
      fireEvent.mouseEnter(subMenuTrigger1);
      act(() => {jest.runAllTimers();});
      menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      subMenu1 = menus[1];
      expect(document.activeElement).toBe(subMenuTrigger1);
      subMenu1Items = within(subMenu1).getAllByRole('menuitem');
      triggerPress(subMenu1Items[1]);
      act(() => {jest.runAllTimers();});
      menus = tree.queryAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(0);
      expect(onAction).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(subMenuOnAction).toHaveBeenCalledTimes(1);
      expect(subMenuOnAction).toHaveBeenLastCalledWith('Lvl 2 Item 2');
      expect(subMenuOnClose).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledTimes(4);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('should not trigger onClose when closing the submenu with Esc', function () {
      let tree = render(
        <SubMenuStatic
          onClose={onClose}
          subMenu1Props={{onClose: subMenuOnClose}} />
        );
      let triggerButton = tree.getByRole('button');
      triggerPress(triggerButton);
      act(() => {jest.runAllTimers();});
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let subMenuTrigger1 = menuItems[1];
      fireEvent.mouseEnter(subMenuTrigger1);
      act(() => {jest.runAllTimers();});
      let menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      expect(document.activeElement).toBe(subMenuTrigger1);
      pressArrowRight();
      pressEsc();
      act(() => {jest.runAllTimers();});
      menus = tree.queryAllByRole('menu');
      expect(menus).toHaveLength(0);
      expect(onClose).not.toHaveBeenCalled();
      expect(subMenuOnClose).not.toHaveBeenCalled();
    });

    it('should not trigger root menu\' onAction when pressing on a submenu trigger item', function () {
      let tree = render(<SubMenuStatic onAction={onAction} />);
      let triggerButton = tree.getByRole('button');
      triggerPress(triggerButton);
      act(() => {jest.runAllTimers();});
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let subMenuTrigger1 = menuItems[1];
      triggerPress(subMenuTrigger1);
      act(() => {jest.runAllTimers();});
      menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      expect(onAction).not.toHaveBeenCalled();
      pressEnter();
      act(() => {jest.runAllTimers();});
      expect(onAction).not.toHaveBeenCalled();
      let menus = tree.getAllByRole('menu');
      expect(menus).toHaveLength(2);

      triggerPress(menuItems[0]);
      act(() => {jest.runAllTimers();});
      menus = tree.queryAllByRole('menu');
      expect(menus).toHaveLength(0);
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenLastCalledWith('Lvl 1 Item 1');
    });

    it('supports selectionMode and onSelectionChange on submenus', function () {
      let tree = render(
        <SubMenuStatic
          onSelectionChange={onSelectionChange}
          onClose={onClose}
          selectionMode="multiple"
          subMenu1Props={{onSelectionChange: subMenuOnSelectionChange, onClose: subMenuOnClose, selectionMode: 'single'}} />
        );
      let triggerButton = tree.getByRole('button');
      pressArrowDown(triggerButton);
      act(() => {jest.runAllTimers();});
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitemcheckbox');
      expect(document.activeElement).toBe(menuItems[0]);
      pressSpace();
      expect(onSelectionChange).toBeCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['Lvl 1 Item 1']));
      pressArrowDown();
      pressArrowDown();
      pressSpace();
      expect(onSelectionChange).toBeCalledTimes(2);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['Lvl 1 Item 1', 'Lvl 1 Item 3']));
      pressArrowUp();

      let subMenuTrigger = within(menu).getAllByRole('menuitem')[0];
      expect(subMenuTrigger).toHaveAttribute('aria-expanded', 'false');
      expect(document.activeElement).toBe(subMenuTrigger);
      pressEnter();
      act(() => {jest.runAllTimers();});

      expect(onSelectionChange).toBeCalledTimes(2);
      let menus = tree.getAllByRole('menu', {hidden: true});
      let subMenu1Items = within(menus[1]).getAllByRole('menuitemradio');
      expect(document.activeElement).toBe(subMenu1Items[0]);
      pressSpace();
      expect(onSelectionChange).toBeCalledTimes(2);
      expect(subMenuOnSelectionChange).toBeCalledTimes(1);
      expect(new Set(subMenuOnSelectionChange.mock.calls[0][0])).toEqual(new Set(['Lvl 2 Item 1']));
      pressArrowDown();
      pressSpace();
      expect(subMenuOnSelectionChange).toBeCalledTimes(2);
      expect(new Set(subMenuOnSelectionChange.mock.calls[1][0])).toEqual(new Set(['Lvl 2 Item 2']));
    });

    it('does not trigger selection when clicking/pressing on a submenu trigger', function () {
      let tree = render(
        <SubMenuStatic
          onSelectionChange={onSelectionChange}
          selectionMode="multiple"
          subMenu1Props={{onSelectionChange: subMenuOnSelectionChange, onClose: subMenuOnClose, selectionMode: 'single'}} />
        );
      let triggerButton = tree.getByRole('button');
      pressArrowDown(triggerButton);
      act(() => {jest.runAllTimers();});
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitemcheckbox');
      expect(document.activeElement).toBe(menuItems[0]);
      pressArrowDown();
      let subMenuTrigger = within(menu).getAllByRole('menuitem')[0];
      expect(subMenuTrigger).toHaveAttribute('aria-expanded', 'false');
      expect(document.activeElement).toBe(subMenuTrigger);

      // Click on the menu's submenu trigger
      triggerPress(document.activeElement);
      expect(onSelectionChange).not.toHaveBeenCalled();
      pressEnter();
      act(() => {jest.runAllTimers();});
      expect(onSelectionChange).not.toHaveBeenCalled();
      let menus = tree.getAllByRole('menu', {hidden: true});
      let subMenu1Items = within(menus[1]).getAllByRole('menuitemradio');
      expect(document.activeElement).toBe(subMenu1Items[0]);
      pressArrowDown();
      pressArrowDown();

      // Click on the submenu's submenu trigger
      let subMenuTrigger2 = within(menus[1]).getAllByRole('menuitem')[0];
      expect(subMenuTrigger2).toHaveAttribute('aria-expanded', 'false');
      expect(document.activeElement).toBe(subMenuTrigger2);
      triggerPress(document.activeElement);
      expect(subMenuOnSelectionChange).not.toHaveBeenCalled();
      pressEnter();
      act(() => {jest.runAllTimers();});
      expect(subMenuOnSelectionChange).not.toHaveBeenCalled();
      expect(onSelectionChange).not.toHaveBeenCalled();
      menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(3);
    });

    it('doesnt select a submenu trigger even if its key is specified in selectedKeys', function () {
      let tree = render(
        <SubMenuStatic
          onSelectionChange={onSelectionChange}
          selectionMode="multiple"
          selectedKeys={['Lvl 1 Item 1', 'Lvl 1 Item 2']} />
        );
      let triggerButton = tree.getByRole('button');
      pressArrowDown(triggerButton);
      act(() => {jest.runAllTimers();});
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuCheckboxItems = within(menu).getAllByRole('menuitemcheckbox');
      expect(menuCheckboxItems).toHaveLength(2);
      expect(menuCheckboxItems[0]).toHaveAttribute('aria-checked', 'true');

      // The submenu trigger isn't selectable so it shouldn't have the menuitemcheckbox role
      let menuItems = within(menu).getAllByRole('menuitem');
      expect(menuItems).toHaveLength(1);
      let subMenuTrigger = menuItems[0];
      expect(subMenuTrigger).toHaveAttribute('aria-expanded', 'false');
      expect(subMenuTrigger).not.toHaveAttribute('aria-checked');
    });
  });
});
