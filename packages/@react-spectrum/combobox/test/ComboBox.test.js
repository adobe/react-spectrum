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

/**
 * Questions:
 * Is isOpen or defaultIsOpen similar to setting autoFocus on the combobox? it should be focused on mount?
 */

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
        <ComboBox label="Test" placeholder="Select a topic…" onSelectionChange={onSelectionChange}>
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
    describe('via isOpen and defaultOpen', function () {
      // TODO by Dan, write case testing each of these props
    });

    describe('button click', function () {
      it('keeps focus within the textfield after opening the menu', function () {
        // TODO by Dan
      });
      
      it('fires onFilter if there are no items loaded yet', function () {
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

        expect(() => getByRole('listbox')).toThrow();
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

    describe('keyboard input', function () {
      it('opens the menu on down arrow press', function () {
        // TODO by Dan
      });

      it('opens the menu on up arrow press', function () {
        // TODO by Dan
      });

      it('opens the menu on user typing', function () {
        // TODO by Dan
      });
    });
  });
  describe('showing menu', function () {
    it('moves to selected key', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" selectedKey="1">
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

    // it('moves to selected key (isOpen=true)', function () {
    //   let {getByRole} = render(
    //     <Provider theme={theme}>
    //       <ComboBox isOpen label="Test" selectedKey="2">
    //         <Item uniqueKey="1">One</Item>
    //         <Item uniqueKey="2">Two</Item>
    //         <Item uniqueKey="3">Three</Item>
    //       </ComboBox>
    //     </Provider>
    //   );

    //   let combobox = getByRole('combobox');
    //   let listbox = getByRole('listbox');

    //   let items = within(listbox).getAllByRole('option');

    //   expect(document.activeElement).toBe(combobox);
    //   expect(combobox).toHaveAttribute('aria-activedescendant', items[1].id);
    // });

    it('moves to first item for no selected key',  function () {
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
      let combobox = getByRole('combobox');
      act(() => {
        fireEvent.mouseDown(button);
      });
      act(() => jest.runAllTimers());

      let listbox = getByRole('listbox');

      let items = within(listbox).getAllByRole('option');

      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
    });

    // it('moves to first item for no selected key (isOpen=true)', function () {
    //   let {getByRole} = render(
    //     <Provider theme={theme}>
    //       <ComboBox isOpen label="Test">
    //         <Item uniqueKey="1">One</Item>
    //         <Item uniqueKey="2">Two</Item>
    //         <Item uniqueKey="3">Three</Item>
    //       </ComboBox>
    //     </Provider>
    //   );

    //   let combobox = getByRole('combobox');
    //   let listbox = getByRole('listbox');

    //   let items = within(listbox).getAllByRole('option');

    //   expect(document.activeElement).toBe(combobox);
    //   expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
    // });

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
      let combobox = getByRole('combobox');
      act(() => {
        fireEvent.mouseDown(button);
      });
      act(() => jest.runAllTimers());

      // expect(document.activeElement).toBe(combobox);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
    });

    it('keeps the menu open if the user clears the input field', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test">
            <Item uniqueKey="1">One</Item>
            <Item uniqueKey="2">Two</Item>
            <Item uniqueKey="3">Three</Item>
          </ComboBox>
        </Provider>
      );
      
      let combobox = getByRole('combobox');
      act(() => {
        userEvent.type(combobox, 'One');
      });
      act(() => jest.runAllTimers());

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(1);

      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
      });
      act(() => jest.runAllTimers());

      listbox = getByRole('listbox');
      items = within(listbox).getAllByRole('option');
      expect(items.length).toBe(3);
    });
  });
  describe('typing in the textfield', function () {
    it('can be uncontrolled', function () {
      let onOpenChange = jest.fn();
      let onFilter = jest.fn();
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" onFilter={onFilter} onOpenChange={onOpenChange}>
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
          <ComboBox label="Test" onFilter={onFilter} onOpenChange={onOpenChange} onInputChange={onInputChange} onSelectionChange={onSelectionChange}>
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
        userEvent.click(button);
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
          <ComboBox label="Test" allowsCustomValue onFilter={onFilter} onOpenChange={onOpenChange} onSelectionChange={onSelectionChange}>
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
        userEvent.click(combobox);
      });
      act(() => jest.runAllTimers());
      act(() => {
        userEvent.type(combobox, 'Gengar');
      });
      act(() => jest.runAllTimers());

      act(() => {
        userEvent.tab();
      });
      act(() => jest.runAllTimers());
      expect(document.activeElement).toBe(secondaryButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      // expect(onSelectionChange).toHaveBeenCalledWith('Gengar'); // turn on when custom value allowed

      expect(() => getByRole('listbox')).toThrow();
    });

    it('propagates blur event outside of the component', function () {
      let outerBlur = jest.fn();
      let onBlur = jest.fn();

      let {getByRole} = render(
        <Provider theme={theme}>
          <div onBlur={outerBlur}>
            <ComboBox label="Test" autoFocus onBlur={onBlur}>
              <Item uniqueKey="1">Bulbasaur</Item>
              <Item uniqueKey="2">Squirtle</Item>
              <Item uniqueKey="3">Charmander</Item>
            </ComboBox>
          </div>
        </Provider>
      );

      let combobox = getByRole('combobox');
      expect(document.activeElement).toBe(combobox);

      expect(onBlur).toHaveBeenCalledTimes(0);
      expect(outerBlur).toHaveBeenCalledTimes(0);

      act(() => {
        userEvent.tab();
      });

      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(outerBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('clears selection', function () {
    it('if user deletes all text in input (uncontrolled)', function () {
      // TODO by Dan
    });

    it('doesn\'t happen if user deletes all text in input (controlled)', function () {
      // TODO by Dan
    });
  });

  describe('controlled', function () {
    it('test behavior for selectedKey and inputValue (matching)', function () {
      // TODO by Dan
    });

    it('test behavior for selectedKey and inputValue (not matching should error)', function () {
      // TODO by Dan
    });

    it('test behavior for selectedKey and defaultInputValue', function () {
      // TODO by Dan
    });

    it('test behavior for defaultSelectedKey and inputValue', function () {
      // TODO by Dan
    });
  });

  describe('uncontrolled', function () {
    it('test behavior for defaultSelectedKey and defaultValue (matching)', function () {
      // TODO by Dan
    });

    it('test behavior for defaultSelectedKey and defaultValue (not matching should error?)', function () {
      // TODO by Dan
    });

    it('test behavior for only defaultInputValue', function () {
      // TODO by Dan
    });

    it('test behavior for only defaultSelectedKey', function () {
      // TODO by Dan
    });
  });
});
