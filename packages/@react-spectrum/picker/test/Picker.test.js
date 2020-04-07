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
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Item, Picker, Section} from '../src';
import Paste from '@spectrum-icons/workflow/Paste';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import {Text} from '@react-spectrum/typography';
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
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
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

  it('renders correctly', function () {
    let {getAllByText, getByText, getByRole} = render(
      <Provider theme={theme}>
        <Picker label="Test" onSelectionChange={onSelectionChange}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
      </Provider>
    );

    let picker = getByRole('button');
    expect(picker).toHaveAttribute('aria-haspopup', 'listbox');

    let label = getAllByText('Test')[0];
    let value = getByText('Select an option…');
    expect(label).toBeVisible();
    expect(value).toBeVisible();
  });

  describe('opening', function () {
    it('can be opened on mouse down', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => {fireEvent.mouseDown(picker);});
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(listbox);
    });

    it('can be opened on touch up', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => {fireEvent.touchStart(picker, {targetTouches: [{identifier: 1}]});});
      act(() => jest.runAllTimers());

      expect(getAllByRole('listbox')).toHaveLength(1);

      act(() => {fireEvent.touchEnd(picker, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});});
      act(() => jest.runAllTimers());

      expect(getAllByRole('listbox')).toHaveLength(2);

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(listbox);
    });

    it('can be opened on Space key down', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => {fireEvent.keyDown(picker, {key: ' '});});
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(items[0]);
    });

    it('can be opened on Enter key down', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => {fireEvent.keyDown(picker, {key: 'Enter'});});
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(items[0]);
    });

    it('can be opened on ArrowDown key down and auto focuses the first item', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => {fireEvent.keyDown(picker, {key: 'ArrowDown'});});
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(items[0]);
    });

    it('can be opened on ArrowUp key down and auto focuses the last item', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => {fireEvent.keyDown(picker, {key: 'ArrowUp'});});
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(items[2]);
    });

    it('supports controlled open state', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" isOpen onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      act(() => jest.runAllTimers());

      expect(getAllByRole('listbox')).toHaveLength(2);
      expect(onOpenChange).not.toBeCalled();

      let picker = getAllByRole('button')[0];
      expect(picker).toHaveAttribute('aria-expanded', 'true');

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(listbox);
    });

    it('supports default open state', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" defaultOpen onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      act(() => jest.runAllTimers());

      expect(getAllByRole('listbox')).toHaveLength(2);
      expect(onOpenChange).not.toBeCalled();

      let picker = getAllByRole('button')[0];
      expect(picker).toHaveAttribute('aria-expanded', 'true');

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(listbox);
    });
  });

  describe('closing', function () {
    it('can be closed by clicking on the button', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);

      expect(document.activeElement).toBe(picker);
    });

    it('can be closed by clicking outside', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      act(() => triggerPress(document.body));
      act(() => jest.runAllTimers());

      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('can be closed by pressing the Escape key', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      act(() => {fireEvent.keyDown(listbox, {key: 'Escape'});});
      act(() => jest.runAllTimers());

      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);

      expect(document.activeElement).toBe(picker);
    });

    it('closes on blur', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      act(() => {document.activeElement.blur();});
      act(() => jest.runAllTimers());

      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);

      expect(document.activeElement).not.toBe(picker);
    });

    it('closes on scroll on a parent element', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <div data-testid="scrollable">
            <Picker label="Test" onOpenChange={onOpenChange}>
              <Item>One</Item>
              <Item>Two</Item>
              <Item>Three</Item>
            </Picker>
          </div>
        </Provider>
      );

      expect(getAllByRole('listbox')).toHaveLength(1);

      let picker = getByRole('button');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      let scrollable = getByTestId('scrollable');
      act(() => {fireEvent.scroll(scrollable);});
      act(() => jest.runAllTimers());

      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);

      expect(document.activeElement).toBe(picker);
    });

    it('tabs to the next element after the trigger and closes the menu', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <input data-testid="before-input" />
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
          <input data-testid="after-input" />
        </Provider>
      );

      let picker = getByRole('button');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Tab'});});
      act(() => jest.runAllTimers());

      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);

      expect(document.activeElement).toBe(getByTestId('after-input'));
    });

    it('shift tabs to the previous element before the trigger and closes the menu', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <input data-testid="before-input" />
          <Picker label="Test" onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
          <input data-testid="after-input" />
        </Provider>
      );

      let picker = getByRole('button');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(picker).toHaveAttribute('aria-expanded', 'true');
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Tab', shiftKey: true});});
      act(() => jest.runAllTimers());

      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);

      expect(document.activeElement).toBe(getByTestId('before-input'));
    });

    it('should have a hidden dismiss button for screen readers', async function () {
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
      expect(picker).toHaveAttribute('aria-controls', listbox.id);
      
      let buttons = getAllByRole('button');
      expect(buttons.length).toBe(3);
      expect(buttons[1]).toHaveAttribute('aria-label', 'Dismiss');
      expect(buttons[2]).toHaveAttribute('aria-label', 'Dismiss');
  
      fireEvent.click(buttons[1]);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      act(() => jest.runAllTimers());
  
      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);

      expect(document.activeElement).toBe(picker);
    });

    it('does not close in controlled open state', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" isOpen onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      act(() => jest.runAllTimers());

      expect(getAllByRole('listbox')).toHaveLength(2);
      expect(onOpenChange).not.toBeCalled();

      let picker = getAllByRole('button')[0];
      expect(picker).toHaveAttribute('aria-expanded', 'true');

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      act(() => {fireEvent.keyDown(listbox, {key: 'Escape'});});
      act(() => jest.runAllTimers());

      expect(listbox).toBeVisible();
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes in default open state', function () {
      let onOpenChange = jest.fn();
      let {getAllByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" defaultOpen onOpenChange={onOpenChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      act(() => jest.runAllTimers());

      expect(getAllByRole('listbox')).toHaveLength(2);
      expect(onOpenChange).not.toBeCalled();

      let picker = getAllByRole('button')[0];
      expect(picker).toHaveAttribute('aria-expanded', 'true');

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(picker).toHaveAttribute('aria-controls', listbox.id);

      act(() => {fireEvent.keyDown(listbox, {key: 'Escape'});});
      act(() => jest.runAllTimers());

      expect(listbox).not.toBeInTheDocument();
      expect(picker).not.toHaveAttribute('aria-expanded');
      expect(picker).not.toHaveAttribute('aria-controls');
      expect(onOpenChange).toBeCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('labeling', function () {
    it('supports labeling with a visible label', function () {
      let {getAllByText, getByText, getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );
  
      let picker = getByRole('button');
      expect(picker).toHaveAttribute('aria-haspopup', 'listbox');
  
      let label = getAllByText('Test')[0];
      let value = getByText('Select an option…');
      expect(label).toHaveAttribute('id');
      expect(value).toHaveAttribute('id');
      expect(picker).toHaveAttribute('aria-labelledby', `${label.id} ${value.id}`);

      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(listbox).toHaveAttribute('aria-labelledby', label.id);
    });

    it('supports labeling via aria-label', function () {
      let {getByText, getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <Picker aria-label="Test" onSelectionChange={onSelectionChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      let value = getByText('Select an option…');
      expect(picker).toHaveAttribute('id');
      expect(value).toHaveAttribute('id');
      expect(picker).toHaveAttribute('aria-label', 'Test');
      expect(picker).toHaveAttribute('aria-labelledby', `${picker.id} ${value.id}`);

      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(listbox).toHaveAttribute('aria-labelledby', picker.id);
    });

    it('supports labeling via aria-labelledby', function () {
      let {getByText, getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <Picker aria-labelledby="foo" onSelectionChange={onSelectionChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      let value = getByText('Select an option…');
      expect(picker).toHaveAttribute('id');
      expect(value).toHaveAttribute('id');
      expect(picker).toHaveAttribute('aria-labelledby', `foo ${value.id}`);

      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(listbox).toHaveAttribute('aria-labelledby', 'foo');
    });

    it('supports labeling via aria-label and aria-labelledby', function () {
      let {getByText, getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <Picker aria-label="Test" aria-labelledby="foo" onSelectionChange={onSelectionChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      let value = getByText('Select an option…');
      expect(picker).toHaveAttribute('id');
      expect(value).toHaveAttribute('id');
      expect(picker).toHaveAttribute('aria-label', 'Test');
      expect(picker).toHaveAttribute('aria-labelledby', `foo ${picker.id} ${value.id}`);

      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      expect(listbox).toBeVisible();
      expect(listbox).toHaveAttribute('aria-labelledby', `foo ${picker.id}`);
    });
  });

  describe('selection', function () {
    it('can select items on press', function () {
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Select an option…');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(listbox);

      act(() => triggerPress(items[2]));
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('three');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Three');
    });

    it('can select items with the Space key', function () {
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Select an option…');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(listbox);

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[0]);

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[1]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: ' '});});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('two');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Two');
    });

    it('can select items with the Enter key', function () {
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Select an option…');
      picker.focus();

      act(() => {fireEvent.keyDown(picker, {key: 'ArrowUp'});});
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(items[2]);

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowUp'});});
      expect(document.activeElement).toBe(items[1]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Enter'});});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('two');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Two');
    });

    it('focuses items on hover', function () {
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Select an option…');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(listbox);

      act(() => {fireEvent.mouseEnter(items[1]);});
      expect(document.activeElement).toBe(items[1]);

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[2]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Enter'});});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('three');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Three');
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
      expect(picker).toHaveTextContent('Select an option…');
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

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Three');
    });

    it('supports controlled selection', function () {
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" selectedKey="two" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Two');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(items[1]);
      expect(items[1]).toHaveAttribute('aria-selected', 'true');
      expect(within(items[1]).getByRole('img')).toBeVisible(); // checkmark

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowUp'});});
      expect(document.activeElement).toBe(items[0]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Enter'});});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('one');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Two');
    });

    it('supports default selection', function () {
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" defaultSelectedKey="two" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Two');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(items[1]);
      expect(items[1]).toHaveAttribute('aria-selected', 'true');
      expect(within(items[1]).getByRole('img')).toBeVisible(); // checkmark

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowUp'});});
      expect(document.activeElement).toBe(items[0]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Enter'});});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('one');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('One');
    });

    it('skips disabled items', function () {
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange} disabledKeys={['two']}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Select an option…');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(listbox);

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[0]);
      expect(items[1]).toHaveAttribute('aria-disabled', 'true');

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[2]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Enter'});});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('three');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Three');
    });

    it('supports sections and complex items', function () {
      let {getAllByRole, getByRole, getByText} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Section title="Section 1">
              <Item textValue="Copy" uniqueKey="copy">
                <Copy size="S" />
                <Text>Copy</Text>
              </Item>
              <Item textValue="Cut" uniqueKey="cut">
                <Cut size="S" />
                <Text>Cut</Text>
              </Item>
              <Item textValue="Paste" uniqueKey="paste">
                <Paste size="S" />
                <Text>Paste</Text>
              </Item>
            </Section>
            <Section title="Section 2">
              <Item textValue="Puppy" uniqueKey="puppy">
                <AlignLeft size="S" />
                <Text>Puppy</Text>
                <Text slot="description">Puppy description super long as well geez</Text>
              </Item>
              <Item textValue="Doggo with really really really long long long text" uniqueKey="doggo">
                <AlignCenter size="S" />
                <Text>Doggo with really really really long long long text</Text>
              </Item>
              <Item textValue="Floof" uniqueKey="floof">
                <AlignRight size="S" />
                <Text>Floof</Text>
              </Item>
            </Section>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Select an option…');
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(6);

      let groups = within(listbox).getAllByRole('group');
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveAttribute('aria-labelledby', getByText('Section 1').id);

      expect(items[0]).toHaveAttribute('aria-labelledby', within(items[0]).getByText('Copy').id);
      expect(groups[0]).toContainElement(items[0]);
      expect(items[1]).toHaveAttribute('aria-labelledby', within(items[1]).getByText('Cut').id);
      expect(groups[0]).toContainElement(items[1]);
      expect(items[2]).toHaveAttribute('aria-labelledby', within(items[2]).getByText('Paste').id);
      expect(groups[0]).toContainElement(items[2]);
      expect(items[3]).toHaveAttribute('aria-labelledby', within(items[3]).getByText('Puppy').id);
      expect(items[3]).toHaveAttribute('aria-describedby', within(items[3]).getByText('Puppy description super long as well geez').id);
      expect(groups[1]).toContainElement(items[3]);
      expect(items[4]).toHaveAttribute('aria-labelledby', within(items[4]).getByText('Doggo with really really really long long long text').id);
      expect(groups[1]).toContainElement(items[4]);
      expect(items[5]).toHaveAttribute('aria-labelledby', within(items[5]).getByText('Floof').id);
      expect(groups[1]).toContainElement(items[5]);

      expect(getByText('Section 1')).toHaveAttribute('aria-hidden', 'true');
      expect(groups[1]).toHaveAttribute('aria-labelledby', getByText('Section 2').id);
      expect(getByText('Section 2')).toHaveAttribute('aria-hidden', 'true');

      expect(document.activeElement).toBe(listbox);

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[0]);

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[1]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Enter'});});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('cut');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Cut');
      expect(getAllByRole('img')).toHaveLength(2);

      // Open again
      act(() => triggerPress(picker));
      act(() => jest.runAllTimers());

      listbox = getAllByRole('listbox')[1];
      items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(6);

      expect(document.activeElement).toBe(items[1]);
      expect(items[1]).toHaveAttribute('aria-selected', 'true');
      expect(within(items[1]).getAllByRole('img')).toHaveLength(2); // checkmark

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[2]);

      act(() => {fireEvent.keyDown(listbox, {key: 'ArrowDown'});});
      expect(document.activeElement).toBe(items[3]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Enter'});});
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(onSelectionChange).toHaveBeenLastCalledWith('puppy');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Puppy');
      expect(getAllByRole('img')).toHaveLength(2);
      expect(getByText('Puppy description super long as well geez')).not.toBeVisible();
    });

    it('supports type to select', function () {
      let {getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      picker.focus();
      expect(picker).toHaveTextContent('Select an option…');
      act(() => {fireEvent.keyDown(picker, {key: 'ArrowDown'});});
      act(() => jest.runAllTimers());

      let listbox = getAllByRole('listbox')[1]; // ignore the one in the background for now
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(items[0]);

      act(() => {fireEvent.keyDown(listbox, {key: 't'});});
      expect(document.activeElement).toBe(items[1]);

      act(() => {fireEvent.keyDown(listbox, {key: 'h'});});
      expect(document.activeElement).toBe(items[2]);

      act(() => {fireEvent.keyDown(document.activeElement, {key: 'Enter'});});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('three');
      act(() => jest.runAllTimers());
      expect(listbox).not.toBeInTheDocument();

      expect(document.activeElement).toBe(picker);
      expect(picker).toHaveTextContent('Three');
    });
  });

  describe('type to select', function () {
    it('supports focusing items by typing letters in rapid succession without opening the menu', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      picker.focus();
      expect(picker).toHaveTextContent('Select an option…');

      fireEvent.keyDown(picker, {key: 't'});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('two');
      expect(picker).toHaveTextContent('Two');

      fireEvent.keyDown(picker, {key: 'h'});
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(onSelectionChange).toHaveBeenLastCalledWith('three');
      expect(picker).toHaveTextContent('Three');
    });

    it('resets the search text after a timeout', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      picker.focus();
      expect(picker).toHaveTextContent('Select an option…');

      fireEvent.keyDown(picker, {key: 't'});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('two');
      expect(picker).toHaveTextContent('Two');

      jest.runAllTimers();

      fireEvent.keyDown(picker, {key: 'h'});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(picker).toHaveTextContent('Two');
    });

    it('wraps around when no items past the current one match', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      picker.focus();
      expect(picker).toHaveTextContent('Select an option…');

      fireEvent.keyDown(picker, {key: 't'});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('two');
      expect(picker).toHaveTextContent('Two');

      jest.runAllTimers();
      
      fireEvent.keyDown(picker, {key: 'o'});
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(picker).toHaveTextContent('One');
    });
  });

  describe('autofill', function () {
    it('should have a hidden select element for form autocomplete', function () {
      let {getAllByText, getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item uniqueKey="one">One</Item>
            <Item uniqueKey="two">Two</Item>
            <Item uniqueKey="three">Three</Item>
          </Picker>
        </Provider>
      );

      let picker = getByRole('button');
      expect(picker).toHaveTextContent('Select an option…');
  
      let hiddenLabel = getAllByText('Test')[1];
      expect(hiddenLabel.tagName).toBe('LABEL');
      expect(hiddenLabel.parentElement).toHaveAttribute('aria-hidden', 'true');
      
      let hiddenSelect = getByRole('listbox');
      expect(hiddenSelect.parentElement).toBe(hiddenLabel);
      expect(hiddenSelect).toHaveAttribute('tabIndex', '-1');
  
      let options = within(hiddenSelect).getAllByRole('option');
      expect(options.length).toBe(3);
      expect(options[0]).toHaveTextContent('One');
      expect(options[1]).toHaveTextContent('Two');
      expect(options[2]).toHaveTextContent('Three');

      fireEvent.change(hiddenSelect, {target: {value: 'two'}});
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenLastCalledWith('two');
      expect(picker).toHaveTextContent('Two');
    });
  
    it('should have a hidden input to marshall focus to the button', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Picker label="Test" onSelectionChange={onSelectionChange}>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Picker>
        </Provider>
      );
  
      let hiddenInput = getByRole('textbox');
      expect(hiddenInput).toHaveAttribute('tabIndex', '0');
      expect(hiddenInput).toHaveAttribute('style', 'font-size: 16px;');
      expect(hiddenInput.parentElement).toHaveAttribute('aria-hidden', 'true');
  
      act(() => hiddenInput.focus());
  
      let button = getByRole('button');
      expect(document.activeElement).toBe(button);
      expect(hiddenInput).toHaveAttribute('tabIndex', '-1');
  
      act(() => button.blur());
      
      expect(hiddenInput).toHaveAttribute('tabIndex', '0');
    });
  });
});
