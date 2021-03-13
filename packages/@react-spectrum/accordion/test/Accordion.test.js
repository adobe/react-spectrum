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

import {Accordion, Item} from '../src';
import {act, fireEvent, render, within} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

let items = [
  {key: 'one', title: 'one title', children: 'one children'},
  {key: 'two', title: 'two title', children: 'two children'},
  {key: 'three', title: 'three title', children: 'three children'}
];

function renderComponent(props) {
  return render(
    <Provider theme={theme}>
      <Accordion {...props} defaultExpandedKeys={['one']} items={items}>
        {item => (
          <Item key={item.key} title={item.title}>
            {item.children}
          </Item>
        )}
      </Accordion>
    </Provider>
  );
}

describe('Accordion', function () {
  it('renders properly', function () {
    let tree = renderComponent();
    let accordionItems = tree.getAllByRole('heading');
    expect(items.length).toBe(3);

    for (let item of accordionItems) {
      let button = within(item).getByRole('button');
      expect(button).toHaveAttribute('aria-expanded');
      let isExpanded = button.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        expect(button).toHaveAttribute('aria-controls');
        let region = document.getElementById(button.getAttribute('aria-controls'));
        expect(region).toBeTruthy();
        expect(region).toHaveAttribute('aria-labelledby', button.id);
        expect(region).toHaveAttribute('role', 'region');
        expect(region).toHaveTextContent(items[0].children);
      }
    }
  });

  it('toggle accordion on mouse click', function () {
    let tree = renderComponent();
    let buttons = tree.getAllByRole('button');
    let selectedItem = buttons[0];
    expect(selectedItem).toHaveAttribute('aria-expanded', 'true');
    userEvent.click(selectedItem);
    expect(selectedItem).toHaveAttribute('aria-expanded', 'false');
    userEvent.click(selectedItem);
    expect(selectedItem).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows users to open and close accordion item with enter / space key', function () {
    let tree = renderComponent();
    let buttons = tree.getAllByRole('button');
    let selectedItem = buttons[0];
    expect(selectedItem).toHaveAttribute('aria-expanded', 'true');
    act(() => {selectedItem.focus();});
    expect(document.activeElement).toBe(selectedItem);

    fireEvent.keyDown(selectedItem, {key: 'Enter'});
    fireEvent.keyUp(selectedItem, {key: 'Enter'});
    expect(selectedItem).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(selectedItem, {key: 'Enter'});
    fireEvent.keyUp(selectedItem, {key: 'Enter'});
    expect(selectedItem).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows users to naviagte accordion headers through arrow keys', function () {
    let tree = renderComponent();
    let buttons = tree.getAllByRole('button');
    let [firstItem, secondItem, thirdItem] = buttons;
    act(() => {firstItem.focus();});

    expect(document.activeElement).toBe(firstItem);
    fireEvent.keyDown(firstItem, {key: 'ArrowUp'});
    expect(document.activeElement).toBe(firstItem);
    fireEvent.keyDown(firstItem, {key: 'ArrowDown'});
    expect(document.activeElement).toBe(secondItem);
    fireEvent.keyDown(secondItem, {key: 'ArrowDown'});
    expect(document.activeElement).toBe(thirdItem);
    fireEvent.keyDown(thirdItem, {key: 'ArrowDown'});
    expect(document.activeElement).toBe(thirdItem);
    fireEvent.keyDown(thirdItem, {key: 'ArrowUp'});
    expect(document.activeElement).toBe(secondItem);
  });

  it('allows users to navigate accordion headers through the tab key', function () {
    let tree = renderComponent();
    let buttons = tree.getAllByRole('button');
    let [firstItem, secondItem, thirdItem] = buttons;
    act(() => {firstItem.focus();});
    expect(document.activeElement).toBe(firstItem);
    userEvent.tab();
    expect(document.activeElement).toBe(secondItem);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(firstItem);
    userEvent.tab();
    expect(document.activeElement).toBe(secondItem);
    userEvent.tab();
    expect(document.activeElement).toBe(thirdItem);
    userEvent.tab();
    expect(document.activeElement).not.toBe(firstItem);
    expect(document.activeElement).not.toBe(secondItem);
    expect(document.activeElement).not.toBe(thirdItem);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(thirdItem);
  });
});
