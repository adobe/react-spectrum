/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Item, Label, ListBox, Popover, Select, SelectContext, SelectValue, Text} from '../';
import React from 'react';
import {render, within} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

let TestSelect = (props) => (
  <Select data-foo="bar" {...props}>
    <Label>Favorite Animal</Label>
    <Button>
      <SelectValue />
    </Button>
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
    <Popover>
      <ListBox>
        <Item>Cat</Item>
        <Item>Dog</Item>
        <Item>Kangaroo</Item>
      </ListBox>
    </Popover>
  </Select>
);

describe('Select', () => {
  it('provides slots', () => {
    let {getByRole} = render(<TestSelect />);

    let button = getByRole('button');
    expect(button).toHaveTextContent('Select an item');
    expect(button).not.toHaveAttribute('data-pressed');

    let select = button.closest('.react-aria-Select');
    expect(select).toHaveAttribute('data-foo', 'bar');

    expect(button).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(button.getAttribute('aria-labelledby').split(' ')[0]);
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Favorite Animal');

    expect(button).toHaveAttribute('aria-describedby');
    expect(button.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    userEvent.click(button);

    expect(button).toHaveAttribute('data-pressed', 'true');

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'react-aria-ListBox');
    expect(listbox.closest('.react-aria-Popover')).toBeInTheDocument();

    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);

    userEvent.click(options[1]);
    expect(button).toHaveTextContent('Dog');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <SelectContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestSelect slot="test" />
      </SelectContext.Provider>
    );

    let button = getByRole('button');
    expect(button.closest('.react-aria-Select')).toHaveAttribute('slot', 'test');
    expect(button).toHaveAttribute('aria-label', 'test');
  });

  it('supports items with render props', () => {
    let MyItem = (props) => (
      <Item {...props}>
        {({isSelected}) => (
          <>
            {props.children}
            {isSelected ? ' (selected)' : ''}
          </>
        )}
      </Item>
    );

    let {getByRole} = render(
      <Select defaultSelectedKey="cat">
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <ListBox>
            <MyItem id="cat">Cat</MyItem>
            <MyItem id="dog">Dog</MyItem>
            <MyItem id="kangaroo">Kangaroo</MyItem>
          </ListBox>
        </Popover>
      </Select>
    );

    let button = getByRole('button');
    expect(button).toHaveTextContent('Cat');
  });

  it('supports custom select value', () => {
    let items = [
      {id: 1, name: 'Cat'},
      {id: 2, name: 'Dog'}
    ];

    let {getByRole} = render(
      <Select defaultSelectedKey={1}>
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue>
            {({selectedItem, selectedText}) => (
              <span>{selectedItem ? `${selectedItem.id} - ${selectedText}` : ''}</span>
            )}
          </SelectValue>
        </Button>
        <Popover>
          <ListBox items={items}>
            {item => <Item>{item.name}</Item>}
          </ListBox>
        </Popover>
      </Select>
    );

    let button = getByRole('button');
    expect(button).toHaveTextContent('1 - Cat');
  });

  it('supports placeholder', () => {
    let {getByRole} = render(<TestSelect placeholder="Select an animal" />);
    let button = getByRole('button');
    expect(button).toHaveTextContent('Select an animal');
  });

  // FIXME: not sure why this test hangs
  it.skip('should support render props', () => {
    let {getByRole} = render(
      <Select>
        {({isOpen}) => (
          <>
            <Label>Favorite Animal</Label>
            <Button>
              <SelectValue />
              <span aria-hidden>{isOpen ? 'close' : 'open'}</span>
            </Button>
            <Popover>
              <ListBox>
                <Item>Cat</Item>
                <Item>Dog</Item>
                <Item>Kangaroo</Item>
              </ListBox>
            </Popover>
          </>
        )}
      </Select>
    );

    let button = getByRole('button');
    expect(button.closest('.react-aria-Select')).toHaveAttribute('slot', 'test');
    expect(button).toHaveAttribute('aria-label', 'test');
  });
});
