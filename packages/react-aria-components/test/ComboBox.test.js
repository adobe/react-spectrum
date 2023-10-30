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

import {act} from '@testing-library/react';
import {Button, ComboBox, ComboBoxContext, Header, Input, Label, ListBox, ListBoxItem, Popover, Section, Text} from '../';
import {pointerMap, render, within} from '@react-spectrum/test-utils';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestComboBox = (props) => (
  <ComboBox defaultInputValue="C" data-foo="bar" {...props}>
    <Label>Favorite Animal</Label>
    <Input />
    <Button />
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
    <Popover>
      <ListBox>
        <ListBoxItem id="1">Cat</ListBoxItem>
        <ListBoxItem id="2">Dog</ListBoxItem>
        <ListBoxItem id="3">Kangaroo</ListBoxItem>
      </ListBox>
    </Popover>
  </ComboBox>
);

describe('ComboBox', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  it('provides slots', async () => {
    let {getByRole} = render(<TestComboBox />);

    let input = getByRole('combobox');
    expect(input).toHaveValue('C');

    let combobox = input.closest('.react-aria-ComboBox');
    expect(combobox).toHaveAttribute('data-foo', 'bar');

    expect(input).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(input.getAttribute('aria-labelledby').split(' ')[0]);
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Favorite Animal');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    let button = getByRole('button');
    await user.click(button);

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'react-aria-ListBox');
    expect(listbox.closest('.react-aria-Popover')).toBeInTheDocument();

    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);

    await user.click(options[1]);
    expect(input).toHaveValue('Dog');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ComboBoxContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestComboBox slot="test" />
      </ComboBoxContext.Provider>
    );

    let combobox = getByRole('combobox');
    expect(combobox.closest('.react-aria-ComboBox')).toHaveAttribute('slot', 'test');
    expect(combobox).toHaveAttribute('aria-label', 'test');
  });

  it('should apply isPressed state to button when expanded', async () => {
    let {getByRole} = render(<TestComboBox />);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    await user.click(button);
    expect(button).toHaveAttribute('data-pressed');
  });

  it('should support filtering sections', async () => {
    let {getByRole} = render(
      <ComboBox>
        <Label>Preferred fruit or vegetable</Label>
        <Input />
        <Button />
        <Popover>
          <ListBox>
            <Section>
              <Header>Fruit</Header>
              <ListBoxItem id="Apple">Apple</ListBoxItem>
              <ListBoxItem id="Banana">Banana</ListBoxItem>
            </Section>
            <Section>
              <Header>Vegetable</Header>
              <ListBoxItem id="Cabbage">Cabbage</ListBoxItem>
              <ListBoxItem id="Broccoli">Broccoli</ListBoxItem>
            </Section>
          </ListBox>
        </Popover>
      </ComboBox>
    );

    let input = getByRole('combobox');
    act(() => {
      input.focus();
    });
    await user.keyboard('p');

    let listbox = getByRole('listbox');
    let groups = within(listbox).getAllByRole('group');
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(groups[0].getAttribute('aria-labelledby'))).toHaveTextContent('Fruit');

    let options = within(groups[0]).getAllByRole('option');
    expect(options).toHaveLength(1);
  });

  it('should support dynamic collections', async () => {
    let defaultItems = [
      {id: 1, name: 'Cat'},
      {id: 2, name: 'Dog'},
      {id: 3, name: 'Kangaroo'}
    ];
    let {getByRole} = render(
      <ComboBox defaultItems={defaultItems}>
        <Label>Favorite Animal</Label>
        <Input />
        <Button />
        <Text slot="description">Description</Text>
        <Text slot="errorMessage">Error</Text>
        <Popover>
          <ListBox>
            {item => <ListBoxItem>{item.name}</ListBoxItem>}
          </ListBox>
        </Popover>
      </ComboBox>
    );

    let input = getByRole('combobox');
    act(() => {
      input.focus();
    });
    await user.keyboard('c');

    let listbox = getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(1);
  });

  it('should support render props', async () => {
    let {getByRole} = render(
      <ComboBox>
        {({isOpen}) => (
          <>
            <Label>Favorite Animal</Label>
            <Input />
            <Button>{isOpen ? 'close' : 'open'}</Button>
            <Popover>
              <ListBox>
                <ListBoxItem>Cat</ListBoxItem>
                <ListBoxItem>Dog</ListBoxItem>
                <ListBoxItem>Kangaroo</ListBoxItem>
              </ListBox>
            </Popover>
          </>
        )}
      </ComboBox>
    );

    let button = getByRole('button');
    expect(button).toHaveTextContent('open');

    await user.click(button);
    expect(button).toHaveTextContent('close');
  });

  it('should support formValue', () => {
    let {getByRole, rerender} = render(<TestComboBox name="test" selectedKey="2" />);
    let input = getByRole('combobox');
    expect(input).not.toHaveAttribute('name');
    expect(input).toHaveValue('Dog');
    let hiddenInput = document.querySelector('input[type=hidden]');
    expect(hiddenInput).toHaveAttribute('name', 'test');
    expect(hiddenInput).toHaveValue('2');

    rerender(<TestComboBox name="test" formValue="text" selectedKey="2" />);
    expect(input).toHaveAttribute('name', 'test');
    expect(document.querySelector('input[type=hidden]')).toBeNull();
  });

  it('should render data- attributes on outer element', () => {
    let {getAllByTestId} = render(
      <TestComboBox data-testid="combo-box" />
    );
    let outerEl = getAllByTestId('combo-box');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-ComboBox');
  });
});
