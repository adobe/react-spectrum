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
import {ComboBox, Item} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import userEvent from '@testing-library/user-event';
import {Button} from '@react-spectrum/button';

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
    let {getAllByText, getByText, getByRole} = render(
      <Provider theme={theme}>
        <ComboBox label="Test" placeholder="Select a topic…" onSelectionChange={onSelectionChange}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </ComboBox>
      </Provider>
    );

    let combobox = getByRole('button');
    //expect(combobox).toHaveAttribute('aria-haspopup', 'listbox'); // i think this is what we expect, not just true

    let label = getAllByText('Test')[0];
    //let value = getByText('Select a topic…');
    expect(label).toBeVisible();
    //expect(value).toBeVisible();
  });

  describe('opening', function () {
    describe('button click', function () {
      it.skip('fires onFilter if there are no items loaded yet', function () {
        let onFilter = jest.fn();
        let onOpenChange = jest.fn();
        // blows up if there are no items, so we'll need to fix this
        let {getByRole} = render(
          <Provider theme={theme}>
            <ComboBox label="Test" onOpenChange={onOpenChange} onFilter={onFilter} items={[]}>
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

        expect(getByRole('listbox')).toThrow();
      });

      it('focuses first item if there are items loaded', function () {
        let onFilter = jest.fn();
        let onOpenChange = jest.fn();
        let {getByRole} = render(
          <Provider theme={theme}>
            <ComboBox label="Test" onFilter={onFilter} onOpenChange={onOpenChange}>
              <Item>One</Item>
              <Item>Two</Item>
              <Item>Three</Item>
            </ComboBox>
          </Provider>
        );

        let button = getByRole('button');
        //let combobox = getByRole('combobox');
        act(() => {
          fireEvent.mouseDown(button);
        });
        act(() => jest.runAllTimers());
        expect(onFilter).not.toHaveBeenCalled();
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

        /*
        expect(document.activeElement).toBe(combobox);
        expect(combobox).toHaveAttribute('aria-activedescendent', 0);
        */
      });
    });
  });
  describe('showing menu', function () {
    it('moves to selected key', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" selectedKey="1">
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </ComboBox>
        </Provider>
      );

      let button = getByRole('button');
      //let combobox = getByRole('combobox');
      act(() => {
        fireEvent.mouseDown(button);
      });
      act(() => jest.runAllTimers());

      let listbox = getByRole('listbox');

      let items = within(listbox).getAllByRole('option');

      /*
      expect(document.activeElement).toBe(combobox);
      expect(combobox).toHaveAttribute('aria-activedescendent', 1);
      */
    });

    it('moves to first item for no selected key', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test">
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </ComboBox>
        </Provider>
      );

      let button = getByRole('button');
      //let combobox = getByRole('combobox');
      act(() => {
        fireEvent.mouseDown(button);
      });
      act(() => jest.runAllTimers());

      let listbox = getByRole('listbox');

      let items = within(listbox).getAllByRole('option');

      /*
      expect(document.activeElement).toBe(combobox);
      expect(combobox).toHaveAttribute('aria-activedescendent', 0);
      */
    });

    it('does not auto focus for no selected key and allows custom value', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" allowsCustomValue>
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </ComboBox>
        </Provider>
      );

      let button = getByRole('button');
      //let combobox = getByRole('combobox');
      act(() => {
        fireEvent.mouseDown(button);
      });
      act(() => jest.runAllTimers());

      let listbox = getByRole('listbox');

      let items = within(listbox).getAllByRole('option');

      /*
      expect(document.activeElement).toBe(combobox);
      expect(combobox).not.toHaveAttribute('aria-activedescendent');
      */
    });
  });
  describe('typing in the textfield', function () {
    it('can be uncontrolled', function () {
      let onOpenChange = jest.fn();
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" onOpenChange={onOpenChange}>
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
      // expect(onFilter).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalled();
    });
  });

  describe('blur', function () {
    it('closes', function () {
      let onFilter = jest.fn();
      let onOpenChange = jest.fn();
      let onSelectionChange = jest.fn();
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" defaultOpen onFilter={onFilter} onOpenChange={onOpenChange} onSelectionChange={onSelectionChange}>
            <Item>Bulbasaur</Item>
            <Item>Squirtle</Item>
            <Item>Charmander</Item>
          </ComboBox>
          <Button variant="secondary">Focus move</Button>
        </Provider>
      );

      let combobox = getByRole('combobox');
      let secondaryButton = getAllByRole('button')[1];
      act(() => {
        fireEvent.keyDown(document.activeElement, {key: 'Tab'});
      });
      expect(document.activeElement).toBe(secondaryButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onFilter).not.toHaveBeenCalled(); // it may be called during defaultOpen?

      expect(getByRole('listbox')).toThrow();
    });

    it('closes and commits custom value', function () {
      let onFilter = jest.fn();
      let onOpenChange = jest.fn();
      let onSelectionChange = jest.fn();
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" allowsCustomValue onFilter={onFilter} onOpenChange={onOpenChange} onSelectionChange={onSelectionChange}>
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
