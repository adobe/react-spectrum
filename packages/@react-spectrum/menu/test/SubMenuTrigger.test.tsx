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
import {ActionButton} from '@react-spectrum/button';
import {composeStories} from '@storybook/testing-react';
import {Item, Menu, MenuTrigger, SubMenuTrigger} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import type {Scale} from '@react-types/provider';
import * as stories from '../stories/SubMenu.stories';
import {theme} from '@react-spectrum/theme-default';

let {
  SubMenuStatic,
  SubMenuDynamic,
  Complex,
  ActionOverride
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
  fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', code: 38, charCode: 38});
  fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft', code: 38, charCode: 38});
}

function pressEnter() {
  fireEvent.keyDown(document.activeElement, {key: 'Enter'});
  fireEvent.keyUp(document.activeElement, {key: 'Enter'});
}

function pressEsc() {
  fireEvent.keyDown(document.activeElement, {key: 'Escape'});
  fireEvent.keyUp(document.activeElement, {key: 'Escape'});
}

describe('SubMenu', function () {
  let onAction = jest.fn();
  let subMenuOnAction = jest.fn();
  // TODO add tests for onSelectionChange and onClose
  // let onSelectionChange = jest.fn();
  // let onClose = jest.fn();

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
    let submenu1 = menus[1];
    expect(document.activeElement).toBe(submenu1);
    expect(submenu1).toHaveAttribute('aria-labelledby', subMenuTrigger1.id);
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'true');

    let subMenu1Items = within(submenu1).getAllByRole('menuitem');
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
    let submenu2 = menus[2];
    expect(document.activeElement).toBe(submenu2);
    expect(submenu2).toHaveAttribute('aria-labelledby', subMenuTrigger2.id);
    expect(subMenuTrigger2).toHaveAttribute('aria-expanded', 'true');

    let subMenu2Items = within(submenu2).getAllByRole('menuitem');
    expect(subMenu2Items).toHaveLength(3);
    expect(subMenu2Items[2]).toHaveTextContent('Lvl 3 Item 3');
  });

  it('submenu closes when hover leaves the submenu trigger', function () {
    let tree = render(<SubMenuStatic />);
    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    act(() => {jest.runAllTimers();});

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(document.activeElement).toBe(menu);
    let menuItems = within(menu).getAllByRole('menuitem');
    let subMenuTrigger1 = menuItems[1];
    expect(subMenuTrigger1).toHaveAttribute('aria-haspopup', 'menu');
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');

    fireEvent.mouseEnter(subMenuTrigger1);
    act(() => {jest.runAllTimers();});
    let menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(2);
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'true');

    fireEvent.mouseLeave(subMenuTrigger1);
    fireEvent.mouseEnter(menuItems[0]);
    act(() => {jest.runAllTimers();});
    menus = tree.getAllByRole('menu', {hidden: true});
    expect(menus).toHaveLength(1);
    expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');
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

  describe('keyboard interactions', function () {
    it.each`
      Name                | locale      | actions
      ${'ltr, ArrowKeys'} | ${'en-US'}  | ${[() => pressArrowRight(), () => pressArrowLeft()]}
      ${'rtl, ArrowKeys'} | ${'ar-AE'}  | ${[() => pressArrowLeft(), () => pressArrowRight()]}
      ${'ltr, Enter/Esc'} | ${'en-US'}  | ${[() => pressEnter(), () => pressEsc()]}
    `('opens/closes the submenu via keyboard (${Name})', function ({locale, actions}) {
      let tree = render(<SubMenuStatic />, 'medium', locale);
      let triggerButton = tree.getByRole('button');
      fireEvent.keyDown(triggerButton, {key: 'ArrowDown', code: 40, charCode: 40});
      fireEvent.keyUp(triggerButton, {key: 'ArrowDown', code: 40, charCode: 40});
      act(() => {jest.runAllTimers();});

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      expect(document.activeElement).toBe(menuItems[0]);
      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
      let subMenuTrigger1 = menuItems[1];
      expect(document.activeElement).toBe(subMenuTrigger1);
      actions[0]();
      act(() => {jest.runAllTimers();});

      let menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'true');
      let subMenu1Items = within(menus[1]).getAllByRole('menuitem');
      expect(document.activeElement).toBe(subMenu1Items[0]);
      actions[1]();
      act(() => {jest.runAllTimers();});

      // Only closes the current submenu via Arrow keys/Esc
      menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(1);
      expect(subMenuTrigger1).toHaveAttribute('aria-expanded', 'false');
      expect(document.activeElement).toBe(subMenuTrigger1);
    });
  });

  describe('user provided callbacks', function () {
    // TODO: should it also inherit onClose from parent menu? what about selectionChange and selection mode?
    it('inherits onAction from top level menu if not specified on submenu', function () {
      let tree = render(
        <MenuTrigger>
          <ActionButton>Menu Button</ActionButton>
          <Menu onAction={onAction}>
            <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
            <SubMenuTrigger>
              <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
              <Menu onAction={subMenuOnAction}>
                <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
                <Item key="Lvl 2 Item 2">Lvl 2 Item 2</Item>
                <SubMenuTrigger>
                  <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
                  <Menu>
                    <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
                    <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
                    <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
                  </Menu>
                </SubMenuTrigger>
              </Menu>
            </SubMenuTrigger>
            <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
          </Menu>
        </MenuTrigger>
      );
      let triggerButton = tree.getByRole('button');
      triggerPress(triggerButton);
      act(() => {jest.runAllTimers();});

      // Click on the 3rd level SubMenu item
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let subMenuTrigger1 = menuItems[1];
      fireEvent.mouseEnter(subMenuTrigger1);
      act(() => {jest.runAllTimers();});
      let menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(2);
      let submenu1 = menus[1];
      expect(document.activeElement).toBe(submenu1);
      let subMenu1Items = within(submenu1).getAllByRole('menuitem');
      let subMenuTrigger2 = subMenu1Items[2];
      fireEvent.mouseLeave(subMenuTrigger1);
      fireEvent.mouseEnter(subMenuTrigger2);
      act(() => {jest.runAllTimers();});
      menus = tree.getAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(3);
      let submenu2 = menus[2];
      expect(document.activeElement).toBe(submenu2);
      let subMenu2Items = within(submenu2).getAllByRole('menuitem');
      triggerPress(subMenu2Items[2]);
      act(() => {jest.runAllTimers();});
      menus = tree.queryAllByRole('menu', {hidden: true});
      // Closes all menus when a submenu action is triggered
      expect(menus).toHaveLength(0);
      expect(subMenuOnAction).not.toHaveBeenCalled();
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenLastCalledWith('Lvl 3 Item 3');

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
      submenu1 = menus[1];
      expect(document.activeElement).toBe(submenu1);
      subMenu1Items = within(submenu1).getAllByRole('menuitem');
      triggerPress(subMenu1Items[1]);
      act(() => {jest.runAllTimers();});
      menus = tree.queryAllByRole('menu', {hidden: true});
      expect(menus).toHaveLength(0);
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(subMenuOnAction).toHaveBeenCalledTimes(1);
      expect(subMenuOnAction).toHaveBeenLastCalledWith('Lvl 2 Item 2');
    });

    it('should not trigger onAction when pressing on a submenu trigger menu item', function () {
      let tree = render(<ActionOverride onAction={onAction} />);
      let triggerButton = tree.getByRole('button');
      triggerPress(triggerButton);
      act(() => {jest.runAllTimers();});
      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      let menuItems = within(menu).getAllByRole('menuitem');
      let subMenuTrigger1 = menuItems[1];
      triggerPress(subMenuTrigger1);
      act(() => {jest.runAllTimers();});
      expect(onAction).not.toHaveBeenCalled();
      pressEnter();
      act(() => {jest.runAllTimers();});
      expect(onAction).not.toHaveBeenCalled();
      menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
    });
  });
});
