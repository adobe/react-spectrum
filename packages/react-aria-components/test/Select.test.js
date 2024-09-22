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

import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Button, FieldError, Label, ListBox, ListBoxItem, Popover, Select, SelectContext, SelectValue, Text} from '../';
import React from 'react';
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
        <ListBoxItem>Cat</ListBoxItem>
        <ListBoxItem>Dog</ListBoxItem>
        <ListBoxItem>Kangaroo</ListBoxItem>
      </ListBox>
    </Popover>
  </Select>
);

describe('Select', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('provides slots', async () => {
    let {getByRole} = render(<TestSelect />);

    let button = getByRole('button');
    expect(button).toHaveTextContent('Select an item');
    expect(button).not.toHaveAttribute('data-pressed');

    let select = button.closest('.react-aria-Select');
    expect(select).toHaveAttribute('data-foo', 'bar');

    expect(button).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(button.getAttribute('aria-labelledby').split(' ')[1]);
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Favorite Animal');

    let valueOrPlaceholder = document.getElementById(button.getAttribute('aria-labelledby').split(' ')[0]);
    expect(valueOrPlaceholder).toHaveAttribute('class', 'react-aria-SelectValue');
    expect(valueOrPlaceholder).toHaveTextContent('Select an item');

    expect(button).toHaveAttribute('aria-describedby');
    expect(button.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    await user.click(button);

    expect(button).toHaveAttribute('data-pressed', 'true');

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'react-aria-ListBox');
    expect(listbox.closest('.react-aria-Popover')).toBeInTheDocument();
    expect(listbox.closest('.react-aria-Popover')).toHaveAttribute('data-trigger', 'Select');

    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);

    await user.click(options[1]);
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
      <ListBoxItem {...props}>
        {({isSelected}) => (
          <>
            {props.children}
            {isSelected ? ' (selected)' : ''}
          </>
        )}
      </ListBoxItem>
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
            {item => <ListBoxItem>{item.name}</ListBoxItem>}
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

  it('should support render props', async () => {
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
                <ListBoxItem>Cat</ListBoxItem>
                <ListBoxItem>Dog</ListBoxItem>
                <ListBoxItem>Kangaroo</ListBoxItem>
              </ListBox>
            </Popover>
          </>
        )}
      </Select>
    );

    let button = getByRole('button');
    expect(button).toHaveTextContent('open');

    await user.click(button);
    expect(button).toHaveTextContent('close');
  });

  it('should send disabled prop to the hidden field', () => {
    render(
      <TestSelect name="select" isDisabled />
    );

    let input = document.querySelector('[name=select]');
    expect(input).toBeDisabled();
  });

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(<TestSelect data-testid="select-test" />);
    let outerEl = getAllByTestId('select-test');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-Select');
  });

  it('supports validation errors', async () => {
    let {getByRole, getByTestId} = render(
      <form data-testid="form">
        <Select name="select" isRequired>
          <Label>Favorite Animal</Label>
          <Button>
            <SelectValue />
          </Button>
          <FieldError />
          <Popover>
            <ListBox>
              <ListBoxItem>Cat</ListBoxItem>
              <ListBoxItem>Dog</ListBoxItem>
              <ListBoxItem>Kangaroo</ListBoxItem>
            </ListBox>
          </Popover>
        </Select>
      </form>
    );

    let button = getByRole('button');
    let select = button.closest('.react-aria-Select');
    let input = document.querySelector('[name=select]');
    expect(input).toHaveAttribute('required');
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(false);
    expect(select).not.toHaveAttribute('data-invalid');

    act(() => {getByTestId('form').checkValidity();});

    expect(button).toHaveAttribute('aria-describedby');
    expect(document.getElementById(button.getAttribute('aria-describedby'))).toHaveTextContent('Constraints not satisfied');
    expect(select).toHaveAttribute('data-invalid');
    expect(document.activeElement).toBe(button);

    await user.click(button);

    let listbox = getByRole('listbox');
    let items = within(listbox).getAllByRole('option');
    await user.click(items[0]);
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(select).not.toHaveAttribute('data-invalid');
  });

  it('should support falsy (0) as a valid default value', async () => {
    let {getByRole} = render(
      <Select placeholder="pick a number">
        <Label>Pick a number</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <ListBox
            items={Array.from({length: 5}).map((_, i) => ({
              id: i,
              label: i
            }))}>
            {(item) => <ListBoxItem id={item.id} textValue={`${item.label}`}>{item.label}</ListBoxItem>}
          </ListBox>
        </Popover>
      </Select>
    );

    let button = getByRole('button');
    await user.click(button);

    let listbox = getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    await user.click(options[0]);

    expect(button).toHaveTextContent('0');
  });
});
