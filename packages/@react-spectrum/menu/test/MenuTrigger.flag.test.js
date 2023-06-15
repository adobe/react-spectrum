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
import {ActionButton} from '@react-spectrum/button';
import {Content, Footer} from '@react-spectrum/view';
import {Dialog} from '@react-spectrum/dialog';
import {Heading, Text} from '@react-spectrum/text';
import {Item, Menu, MenuDialogTrigger, MenuTrigger} from '../';
import {Link} from '@react-spectrum/link';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';
import {enableUnavailableMenuItems} from '@react-stately/flags';
import {tests} from './MenuTrigger.test';

enableUnavailableMenuItems();

describe('MenuTrigger - flag unavailable menu items', tests);

describe('MenuTrigger - flag unavailable menu items', function () {
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
