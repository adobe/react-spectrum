/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {ActionMenu, Item} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

let CLOSE_TIME = 350;

describe('ActionMenu', function () {
  let onActionSpy = jest.fn();

  beforeAll(function () {
    jest.useFakeTimers();
  });

  afterEach(() => {
    onActionSpy.mockClear();
    act(() => {
      jest.runAllTimers();
    });
  });

  it('basic test', function () {
    let tree = render(<Provider theme={theme}>
      <ActionMenu onAction={onActionSpy}>
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Baz</Item>
      </ActionMenu>
    </Provider>);

    let button = tree.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'More actions');
    triggerPress(button);

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(menu).toHaveAttribute('aria-labelledby', button.id);


    let menuItem1 = within(menu).getByText('Foo');
    let menuItem2 = within(menu).getByText('Bar');
    let menuItem3 = within(menu).getByText('Baz');
    expect(menuItem1).toBeTruthy();
    expect(menuItem2).toBeTruthy();
    expect(menuItem3).toBeTruthy();

    triggerPress(menuItem1);
    expect(onActionSpy).toHaveBeenCalledTimes(1);
  });

  it('custom aria label', function () {
    let tree = render(<Provider theme={theme}>
      <ActionMenu aria-label="Custom Aria Label">
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Baz</Item>
      </ActionMenu>
    </Provider>);

    let button = tree.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom Aria Label');
  });

  it('is disabled', function () {
    let tree = render(<Provider theme={theme}>
      <ActionMenu isDisabled>
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Baz</Item>
      </ActionMenu>
    </Provider>);

    let button = tree.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'More actions');
    triggerPress(button);

    let menu = tree.queryByRole('menu');
    expect(menu).toBeNull();
  });

  it('supports autofocus', function () {
    let tree = render(<Provider theme={theme}>
      <ActionMenu autoFocus>
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Baz</Item>
      </ActionMenu>
    </Provider>);

    let button = tree.getByRole('button');
    expect(document.activeElement).toBe(button);
  });

  describe('with tooltips', function () {
    it('using mouse', function () {
      let tree = render(
        <Provider theme={theme}>
          <TooltipTrigger delay={0}>
            <ActionMenu>
              <Item>Foo</Item>
              <Item>Bar</Item>
              <Item>Baz</Item>
            </ActionMenu>
            <Tooltip>A whale of a tale.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = tree.getByRole('button');
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);

      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);

      let tooltip = tree.getByRole('tooltip');
      expect(tooltip).toBeVisible();

      fireEvent.mouseDown(button);
      fireEvent.mouseUp(button);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      expect(menu).toHaveAttribute('aria-labelledby', button.id);
    });

    it('using keyboard', function () {
      let tree = render(
        <Provider theme={theme}>
          <TooltipTrigger delay={0}>
            <ActionMenu>
              <Item>Foo</Item>
              <Item>Bar</Item>
              <Item>Baz</Item>
            </ActionMenu>
            <Tooltip>A whale of a tale.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = tree.getByRole('button');
      userEvent.tab();
      expect(button).toBe(document.activeElement);

      let tooltip = tree.getByRole('tooltip');
      expect(tooltip).toBeVisible();

      fireEvent.keyDown(button, {key: 'Enter'});
      fireEvent.keyUp(button, {key: 'Enter'});
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();

      let menu = tree.getByRole('menu');
      expect(menu).toBeTruthy();
      expect(menu).toHaveAttribute('aria-labelledby', button.id);
    });
  });
});
