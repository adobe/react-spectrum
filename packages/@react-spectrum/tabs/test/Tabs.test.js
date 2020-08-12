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

import {act, fireEvent, render, within} from '@testing-library/react';
import {Item} from '@adobe/react-spectrum';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {Tabs} from '../src';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

let items = [
  {name: 'Tab 1', children: 'Tab 1 body'},
  {name: 'Tab 2', children: 'Tab 2 body'},
  {name: 'Tab 3', children: 'Tab 3 body'}
];

function renderComponent(props) {
  return render(
    <Provider theme={theme}>
      <Tabs {...props}>
        {items.map(item => (
          <Item key={item.name} title={item.name}>
            {item.children}
          </Item>
        ))}
      </Tabs>
    </Provider>
  );
}

describe('Tabs', function () {
  let onSelectionChange = jest.fn();

  afterEach(() => {
    onSelectionChange.mockClear();
  });

  it('renders properly', function () {
    let container = renderComponent();
    let tablist = container.getByRole('tablist');
    expect(tablist).toBeTruthy();

    let tabs = within(tablist).getAllByRole('tab');
    expect(tabs.length).toBe(3);

    for (let tab of tabs) {
      expect(tab).toHaveAttribute('tabindex');
      expect(tab).toHaveAttribute('aria-selected');
      let isSelected = tab.getAttribute('aria-selected') === 'true';
      if (isSelected) {
        expect(tab).toHaveAttribute('aria-controls');
        let tabpanel = document.getElementById(tab.getAttribute('aria-controls'));
        expect(tabpanel).toBeTruthy();
        expect(tabpanel).toHaveAttribute('aria-labelledby', tab.id);
        expect(tabpanel).toHaveAttribute('role', 'tabpanel');
        expect(tabpanel).toHaveTextContent(items[0].children);
      }
    }
  });

  it('allows user to change tab item select via left/right arrow keys with horizontal tabs', function () {
    let container = renderComponent({orientation: 'horizontal'});
    let tablist = container.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    let selectedItem = tabs[0];

    expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    selectedItem.focus();
    fireEvent.keyDown(selectedItem, {key: 'ArrowRight', code: 39, charCode: 39});
    let nextSelectedItem = tabs[1];
    expect(nextSelectedItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(nextSelectedItem, {key: 'ArrowLeft', code: 37, charCode: 37});
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');

    /** Doesn't change selection because it's horizontal tabs. */
    fireEvent.keyDown(selectedItem, {key: 'ArrowUp', code: 38, charCode: 38});
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(selectedItem, {key: 'ArrowDown', code: 40, charCode: 40});
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');
  });

  it('allows user to change tab item select via up/down arrow keys with vertical tabs', function () {
    let container = renderComponent({orientation: 'vertical'});
    let tablist = container.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    let selectedItem = tabs[0];
    selectedItem.focus();

    /** Doesn't change selection because it's vertical tabs. */
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(selectedItem, {key: 'ArrowRight', code: 39, charCode: 39});
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(selectedItem, {key: 'ArrowLeft', code: 37, charCode: 37});
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');

    let nextSelectedItem = tabs[1];
    fireEvent.keyDown(selectedItem, {key: 'ArrowDown', code: 40, charCode: 40});
    expect(nextSelectedItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(nextSelectedItem, {key: 'ArrowUp', code: 38, charCode: 38});
    expect(selectedItem).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps focus from first to last/last to first item', function () {
    let container = renderComponent({orientation: 'horizontal'});
    let tablist = container.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    let firstItem = tabs[0];
    firstItem.focus();
    expect(firstItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(firstItem, {key: 'ArrowLeft', code: 37, charCode: 37});
    let lastItem = tabs[tabs.length - 1];
    expect(lastItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(lastItem, {key: 'ArrowRight', code: 39, charCode: 39});
    expect(firstItem).toHaveAttribute('aria-selected', 'true');
  });

  it('select last item via end key / select first item via home key', function () {
    let container = renderComponent({orientation: 'vertical'});
    let tablist = container.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    let firstItem = tabs[0];
    firstItem.focus();
    expect(firstItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(firstItem, {key: 'End', code: 35, charCode: 35});
    let lastItem = tabs[tabs.length - 1];
    expect(lastItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(lastItem, {key: 'Home', code: 36, charCode: 36});
    expect(firstItem).toHaveAttribute('aria-selected', 'true');
  });

  it('not select via left / right keys if keyboardActivation is manual, select on enter / spacebar', function () {
    let container = renderComponent({keyboardActivation: 'manual', defaultSelectedKey: items[0].name, onSelectionChange});
    let tablist = container.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    let firstItem = tabs[0];
    let secondItem = tabs[1];
    let thirdItem = tabs[2];
    firstItem.focus();
    expect(firstItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(firstItem, {key: 'ArrowRight', code: 39, charCode: 39});
    expect(secondItem).toHaveAttribute('aria-selected', 'false');
    expect(document.activeElement).toBe(secondItem);
    fireEvent.keyDown(secondItem, {key: 'ArrowRight', code: 39, charCode: 39});
    expect(thirdItem).toHaveAttribute('aria-selected', 'false');
    expect(document.activeElement).toBe(thirdItem);
    fireEvent.keyDown(thirdItem, {key: 'Enter', code: 13, charCode: 13});
    expect(firstItem).toHaveAttribute('aria-selected', 'false');
    expect(secondItem).toHaveAttribute('aria-selected', 'false');
    expect(thirdItem).toHaveAttribute('aria-selected', 'true');

    expect(onSelectionChange).toBeCalledTimes(1);
  });

  it('supports using click to change tab', function () {
    let container = renderComponent({keyboardActivation: 'manual', defaultSelectedKey: items[0].name, onSelectionChange});
    let tablist = container.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    let firstItem = tabs[0];
    expect(firstItem).toHaveAttribute('aria-selected', 'true');

    let secondItem = tabs[1];
    triggerPress(secondItem);
    expect(secondItem).toHaveAttribute('aria-selected', 'true');
    expect(secondItem).toHaveAttribute('aria-controls');
    let tabpanel = document.getElementById(secondItem.getAttribute('aria-controls'));
    expect(tabpanel).toBeTruthy();
    expect(tabpanel).toHaveAttribute('aria-labelledby', secondItem.id);
    expect(tabpanel).toHaveAttribute('role', 'tabpanel');
    expect(tabpanel).toHaveTextContent(items[1].children);
    expect(onSelectionChange).toBeCalledTimes(1);
  });

  it('does not generate conflicting ids between multiple tabs instances', function () {
    let tree = render(
      <Provider theme={theme}>
        <Tabs>
          {items.map(item => (
            <Item key={item.name} title={item.name}>
              {item.children}
            </Item>
          ))}
        </Tabs>
        <Tabs>
          {items.map(item => (
            <Item key={item.name} title={item.name}>
              {item.children}
            </Item>
          ))}
        </Tabs>
      </Provider>
    );

    let tablists = tree.getAllByRole('tablist');
    let tabs1 = within(tablists[0]).getAllByRole('tab');
    let tabs2 = within(tablists[1]).getAllByRole('tab');

    for (let i = 0; i < tabs1.length; i++) {
      expect(tabs1[i].id).not.toBe(tabs2[i].id);
    }
  });

  it('should focus the selected tab when tabbing in for the first time', function () {
    let tree = renderComponent({defaultSelectedKey: items[1].name});
    act(() => userEvent.tab());

    let tablist = tree.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    expect(document.activeElement).toBe(tabs[1]);
  });

  it('should not focus any tabs when isDisabled tabbing in for the first time', function () {
    let tree = renderComponent({defaultSelectedKey: items[1].name, isDisabled: true});
    act(() => userEvent.tab());

    let tabpanel = tree.getByRole('tabpanel');
    expect(document.activeElement).toBe(tabpanel);
  });

  it('disabled tabs cannot be keyboard navigated to', function () {
    let tree = renderComponent({defaultSelectedKey: items[0].name, disabledKeys: [items[1].name], onSelectionChange});
    act(() => userEvent.tab());

    let tablist = tree.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    expect(document.activeElement).toBe(tabs[0]);
    fireEvent.keyDown(tabs[1], {key: 'ArrowRight'});
    fireEvent.keyUp(tabs[1], {key: 'ArrowRight'});
    expect(onSelectionChange).toBeCalledWith(items[2].name);
  });

  it('disabled tabs cannot be pressed', function () {
    let tree = renderComponent({defaultSelectedKey: items[0].name, disabledKeys: [items[1].name], onSelectionChange});
    act(() => userEvent.tab());

    let tablist = tree.getByRole('tablist');
    let tabs = within(tablist).getAllByRole('tab');
    expect(document.activeElement).toBe(tabs[0]);
    act(() => userEvent.click(tabs[1]));
    expect(onSelectionChange).not.toBeCalled();
  });
});
