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

import {act, cleanup, fireEvent, render, within} from '@testing-library/react';
import {Item, Picker} from '../src';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('Picker', function () {
  let offsetWidth, offsetHeight;
  let onSelectionChange = jest.fn();

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 1000);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  it('can be opened', function () {
    let {getAllByText, getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <Picker label="Test" onSelectionChange={onSelectionChange}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
      </Provider>
    );

    let picker = getByRole('button');
    act(() => triggerPress(picker));
    act(() => jest.runAllTimers());

    let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
    let label = getAllByText('Test')[0];
    expect(listbox).toBeVisible();
    expect(listbox).toHaveAttribute('aria-labelledby', label.id);

    let item1 = within(listbox).getByText('One');
    let item2 = within(listbox).getByText('Two');
    let item3 = within(listbox).getByText('Three');
    expect(item1).toBeTruthy();
    expect(item2).toBeTruthy();
    expect(item3).toBeTruthy();

    act(() => triggerPress(item3));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    act(() => jest.runAllTimers());
    expect(getAllByRole('listbox').length).toBe(1);
  });

  it('does not clear selection on escape closing the listbox', function () {
    let onOpenChangeSpy = jest.fn();
    let {getAllByText, getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <Picker label="Test" onSelectionChange={onSelectionChange} onOpenChange={onOpenChangeSpy}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
      </Provider>
    );

    let picker = getByRole('button');
    expect(onOpenChangeSpy).toHaveBeenCalledTimes(0);
    act(() => triggerPress(picker));
    act(() => jest.runAllTimers());
    expect(onOpenChangeSpy).toHaveBeenCalledTimes(1);

    let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
    let label = getAllByText('Test')[0];
    expect(listbox).toBeVisible();
    expect(listbox).toHaveAttribute('aria-labelledby', label.id);

    let item1 = within(listbox).getByText('One');
    let item2 = within(listbox).getByText('Two');
    let item3 = within(listbox).getByText('Three');
    expect(item1).toBeTruthy();
    expect(item2).toBeTruthy();
    expect(item3).toBeTruthy();

    act(() => triggerPress(item3));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    act(() => jest.runAllTimers());
    expect(onOpenChangeSpy).toHaveBeenCalledTimes(2);
    expect(getAllByRole('listbox').length).toBe(1);


    act(() => triggerPress(picker));
    act(() => jest.runAllTimers());
    expect(onOpenChangeSpy).toHaveBeenCalledTimes(3);

    listbox = getAllByRole('listbox')[1];
    item1 = within(listbox).getByText('One');

    // act callback must return a Promise or undefined, so we return undefined here
    act(() => {
      fireEvent.keyDown(item1, {key: 'Escape'});
    });
    expect(onSelectionChange).toHaveBeenCalledTimes(1); // still expecting it to have only been called once
    act(() => jest.runAllTimers());
    expect(onOpenChangeSpy).toHaveBeenCalledTimes(4);
    expect(getAllByRole('listbox').length).toBe(1);
  });

  it('should have a hidden dismiss button for screen readers', function () {
    let onOpenChange = jest.fn();
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme}>
        <Picker label="Test" onSelectionChange={onSelectionChange} onOpenChange={onOpenChange}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
      </Provider>
    );

    let picker = getByRole('button');
    act(() => triggerPress(picker));
    act(() => jest.runAllTimers());

    let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
    expect(listbox).toBeTruthy();
    expect(onOpenChange).toBeCalledTimes(1);
    expect(picker).toHaveAttribute('aria-expanded', 'true');
    
    let buttons = getAllByRole('button');
    expect(buttons.length).toBe(3);
    expect(buttons[1]).toHaveAttribute('aria-label', 'Dismiss');
    expect(buttons[2]).toHaveAttribute('aria-label', 'Dismiss');

    fireEvent.click(buttons[1]);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    act(() => jest.runAllTimers());

    expect(listbox).not.toBeInTheDocument();
    expect(picker).not.toHaveAttribute('aria-expanded');
    expect(onOpenChange).toBeCalledTimes(2);
    expect(document.activeElement).toBe(picker);
  });
});
