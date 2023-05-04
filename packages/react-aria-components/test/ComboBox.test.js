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

import {Button, ComboBox, ComboBoxContext, Header, Input, Item, Label, ListBox, Popover, Section, Text} from '../';
import React from 'react';
import {render, within} from '@react-spectrum/test-utils';
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
        <Item>Cat</Item>
        <Item>Dog</Item>
        <Item>Kangaroo</Item>
      </ListBox>
    </Popover>
  </ComboBox>
);

describe('ComboBox', () => {
  it('provides slots', () => {
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
    userEvent.click(button);

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'react-aria-ListBox');
    expect(listbox.closest('.react-aria-Popover')).toBeInTheDocument();

    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);

    userEvent.click(options[1]);
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

  it('should apply isPressed state to button when expanded', () => {
    let {getByRole} = render(<TestComboBox />);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    userEvent.click(button);
    expect(button).toHaveAttribute('data-pressed');
  });

  it('should support filtering sections', () => {
    let {getByRole} = render(
      <ComboBox>
        <Label>Preferred fruit or vegetable</Label>
        <Input />
        <Button />
        <Popover>
          <ListBox>
            <Section>
              <Header>Fruit</Header>
              <Item id="Apple">Apple</Item>
              <Item id="Banana">Banana</Item>
            </Section>
            <Section>
              <Header>Vegetable</Header>
              <Item id="Cabbage">Cabbage</Item>
              <Item id="Broccoli">Broccoli</Item>
            </Section>
          </ListBox>
        </Popover>
      </ComboBox>
    );

    let input = getByRole('combobox');
    userEvent.type(input, 'p');

    let listbox = getByRole('listbox');
    let groups = within(listbox).getAllByRole('group');
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(groups[0].getAttribute('aria-labelledby'))).toHaveTextContent('Fruit');

    let options = within(groups[0]).getAllByRole('option');
    expect(options).toHaveLength(1);
  });

  // FIXME: not sure why this test hangs
  it.skip('should support render props', () => {
    let {getByRole} = render(
      <ComboBox>
        {({isOpen}) => (
          <>
            <Label>Favorite Animal</Label>
            <Input />
            <Button>{isOpen ? 'close' : 'open'}</Button>
            <Popover>
              <ListBox>
                <Item>Cat</Item>
                <Item>Dog</Item>
                <Item>Kangaroo</Item>
              </ListBox>
            </Popover>
          </>
        )}
      </ComboBox>
    );

    let button = getByRole('button');
    expect(button).toHaveTextContent('open');

    userEvent.click(button);
    expect(button).toHaveTextContent('close');
  });
});
