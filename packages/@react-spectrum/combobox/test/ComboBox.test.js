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

import {act, cleanup, fireEvent, render, waitFor, within} from '@testing-library/react';
import {Button} from '@react-spectrum/button';
import {ComboBox, Item} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import userEvent from '@testing-library/user-event';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('ComboBox', function () {
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
    let {getAllByText, getByRole} = render(
      <Provider theme={theme}>
        <ComboBox data-testid="1" label="Test" placeholder="Select a topic…" onSelectionChange={onSelectionChange}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </ComboBox>
      </Provider>
    );

    let combobox = getByRole('combobox');
    expect(combobox).toHaveAttribute('placeholder', 'Select a topic…');

    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'true'); // i think we really want 'listbox'?

    let label = getAllByText('Test')[0];
    expect(label).toBeVisible();
  });

  describe('opening', function () {
    describe('button click', function () {
      it('fires onFilter if there are no items loaded yet', function () {
        let onFilter = jest.fn();
        let onOpenChange = jest.fn();
        // blows up if there are no items, so we'll need to fix this
        let {getByRole} = render(
          <Provider theme={theme}>
            <ComboBox data-testid="2" label="Test" onOpenChange={onOpenChange} onFilter={onFilter} items={[]}>
              {(item) => <Item uniqueKey={item.key}>{item.name}</Item>}
            </ComboBox>
          </Provider>
        );

        // expect(getAllByRole('listbox')).toHaveLength(1); // are comboboxes browser autofillable?

        let combobox = getByRole('button');
        act(() => {
          fireEvent.mouseDown(combobox);
        });
        act(() => jest.runAllTimers());

        expect(onFilter).toHaveBeenCalled();
        expect(onOpenChange).not.toHaveBeenCalled();

        expect(() => getByRole('listbox')).toThrow();
      });

      it('focuses first item if there are items loaded', function () {
        let onFilter = jest.fn();
        let onOpenChange = jest.fn();
        let {getByRole} = render(
          <Provider theme={theme}>
            <ComboBox data-testid="3" label="Test" onFilter={onFilter} onOpenChange={onOpenChange}>
              <Item>One</Item>
              <Item>Two</Item>
              <Item>Three</Item>
            </ComboBox>
          </Provider>
        );

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        act(() => {
          fireEvent.mouseDown(button);
        });
        act(() => jest.runAllTimers());
        expect(onFilter).toHaveBeenCalled(); // unsure of this
        expect(onOpenChange).toHaveBeenCalledWith(true);

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        expect(onOpenChange).toBeCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(button).toHaveAttribute('aria-controls', listbox.id);

        let items = within(listbox).getAllByRole('option');
        expect(items.length).toBe(3);
        expect(items[0]).toHaveTextContent('One');
        expect(items[1]).toHaveTextContent('Two');
        expect(items[2]).toHaveTextContent('Three');

        // expect(document.activeElement).toBe(combobox);
        expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
      });
    });
  });
  describe('showing menu', function () {
    it('moves to selected key', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox data-testid="4" label="Test" selectedKey="1">
            <Item uniqueKey="1">One</Item>
            <Item uniqueKey="2">Two</Item>
            <Item uniqueKey="3">Three</Item>
          </ComboBox>
        </Provider>
      );

      let button = getByRole('button');
      let combobox = getByRole('combobox');
      act(() => {
        fireEvent.mouseDown(button);
      });
      act(() => jest.runAllTimers());

      let listbox = getByRole('listbox');

      let items = within(listbox).getAllByRole('option');

      expect(document.activeElement).toBe(combobox); // I think we should send focus to the input?
      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
    });

    it('moves to first item for no selected key',  function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox data-testid="5" label="Test">
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </ComboBox>
        </Provider>
      );

      let button = getByRole('button');
      let combobox = getByRole('combobox');
      act(() => {
        fireEvent.mouseDown(button);
      });
      act(() => jest.runAllTimers());

      let listbox = getByRole('listbox');

      let items = within(listbox).getAllByRole('option');

      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
    });

    it('does not auto focus for no selected key and allows custom value', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox data-testid="6" label="Test" allowsCustomValue>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </ComboBox>
        </Provider>
      );

      let button = getByRole('button');
      let combobox = getByRole('combobox');
      act(() => {
        fireEvent.mouseDown(button);
      });
      act(() => jest.runAllTimers());

      // expect(document.activeElement).toBe(combobox);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
    });
  });
  describe('typing in the textfield', function () {
    it('can be uncontrolled', function () {
      let onOpenChange = jest.fn();
      let onFilter = jest.fn();
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox data-testid="7" label="Test" onFilter={onFilter} onOpenChange={onOpenChange}>
            <Item>Bulbasaur</Item>
            <Item>Squirtle</Item>
            <Item>Charmander</Item>
          </ComboBox>
        </Provider>
      );

      let combobox = getByRole('combobox');
      act(() => {
        userEvent.type(combobox, 'Bul');
      });
      act(() => jest.runAllTimers());

      expect(onOpenChange).toHaveBeenCalled();
      expect(onFilter).toHaveBeenCalled();
    });
  });

  describe('blur', function () {
    it('closes', function () {
      let onFilter = jest.fn();
      let onOpenChange = jest.fn();
      let onSelectionChange = jest.fn();
      let onInputChange = jest.fn();
      let {queryByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <ComboBox data-testid="8" label="Test" onFilter={onFilter} onOpenChange={onOpenChange} onInputChange={onInputChange} onSelectionChange={onSelectionChange}>
            <Item uniqueKey="1">Bulbasaur</Item>
            <Item uniqueKey="2">Squirtle</Item>
            <Item uniqueKey="3">Charmander</Item>
          </ComboBox>
          <Button variant="secondary">Focus move</Button>
        </Provider>
      );

      let button = getAllByRole('button')[0];
      let secondaryButton = getAllByRole('button')[1];
      act(() => {
        fireEvent.mouseDown(button);
      });
      
      act(() => {
        userEvent.tab();
      });
  
      expect(document.activeElement).toBe(secondaryButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSelectionChange).toHaveBeenCalledWith('1');
      expect(onInputChange).toHaveBeenCalledWith('Bulbasaur');
      expect(onFilter).toHaveBeenCalled(); // it may be called during defaultOpen?

      expect(queryByRole('listbox')).toBeFalsy();
    });

    it('closes and commits custom value', function () {
      let onFilter = jest.fn();
      let onOpenChange = jest.fn();
      let onSelectionChange = jest.fn();
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <ComboBox data-testid="9" label="Test" allowsCustomValue onFilter={onFilter} onOpenChange={onOpenChange} onSelectionChange={onSelectionChange}>
            <Item>Bulbasaur</Item>
            <Item>Squirtle</Item>
            <Item>Charmander</Item>
          </ComboBox>
          <Button variant="secondary">Focus move</Button>
        </Provider>
      );

      let combobox = getByRole('combobox');
      act(() => {
        userEvent.type(combobox, 'Gengar');
      });
      act(() => jest.runAllTimers());

      let secondaryButton = getAllByRole('button')[1];
      act(() => {
        fireEvent.keyDown(document.activeElement, {key: 'Tab'});
      });
      expect(document.activeElement).toBe(secondaryButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSelectionChange).toHaveBeenCalledWith('Gengar');

      expect(getByRole('listbox')).toThrow();
    });
  });
});
