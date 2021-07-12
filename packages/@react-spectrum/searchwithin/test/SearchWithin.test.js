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
import {act, render} from '@testing-library/react';
import {Item, Picker} from '@react-spectrum/picker';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SearchWithin} from '../src';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import {typeText} from '@react-spectrum/test-utils';

let defaultProps = {
  label: 'Test'
};

function renderSearchWithin(props = {}, searchFieldProps = {}, pickerProps = {}) {
  return render(
    <Provider theme={theme}>
      <SearchWithin {...defaultProps} {...props}>
        <SearchField placeholder="Search" {...searchFieldProps} />
        <Picker defaultSelectedKey="all" {...pickerProps}>
          <Item key="all">All</Item>
          <Item key="campaigns">Campaigns</Item>
          <Item key="audiences">Audiences</Item>
          <Item key="tags">Tags</Item>
        </Picker>
      </SearchWithin>
    </Provider>  
  );
}

describe('SearchWithin', function () {
  beforeAll(function () {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  it('renders correctly', function () {
    let {getAllByText, getByRole, getByPlaceholderText} = renderSearchWithin();

    let searchfield = getByPlaceholderText('Search');
    expect(searchfield).toBeVisible();
    expect(searchfield).toHaveAttribute('type', 'search');

    let button = getByRole('button');
    expect(button).toBeVisible();
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');

    let label = getAllByText('Test')[0];
    expect(label).toBeVisible();
  });

  it('can type in search and get onChange', function () {
    let onChange = jest.fn();
    let {getByPlaceholderText} = renderSearchWithin({}, {onChange});
    let searchField = getByPlaceholderText('Search');
    expect(searchField).toHaveAttribute('value', '');

    act(() => {searchField.focus();});
    typeText(searchField, 'test search');
    act(() => {searchField.blur();});
    expect(searchField).toHaveAttribute('value', 'test search');
    expect(onChange).toBeCalledTimes(11);
  });

  it('can open menu and get onChange', function () {
    let onOpenChange = jest.fn();
    let {getByRole} = renderSearchWithin({}, {}, {onOpenChange});

    let picker = getByRole('button');
    triggerPress(picker);

    let listbox = getByRole('listbox');
    expect(listbox).toBeVisible();
    expect(onOpenChange).toBeCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('searchfield and picker are labelled correctly', function () {
    let {getByRole, getAllByText, getByPlaceholderText} = renderSearchWithin();

    let searchfield = getByPlaceholderText('Search');
    let picker = getByRole('button');
    triggerPress(picker);

    let listbox = getByRole('listbox');
    let label = getAllByText('Test')[0];
    expect(listbox).toHaveAttribute('aria-labelledby', label.id);
    expect(searchfield).toHaveAttribute('aria-labelledby', label.id);
  });
});
