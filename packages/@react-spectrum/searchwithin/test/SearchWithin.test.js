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
import {triggerPress, typeText} from '@react-spectrum/test-utils';

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
    let {getAllByText, getByRole, getByLabelText} = renderSearchWithin();

    let searchfield = getByLabelText('Test', {selector: 'input'});
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
    let {getByLabelText} = renderSearchWithin({}, {onChange});
    let searchfield = getByLabelText('Test', {selector: 'input'});
    expect(searchfield).toHaveAttribute('value', '');

    act(() => {searchfield.focus();});
    typeText(searchfield, 'test search');
    act(() => {searchfield.blur();});
    expect(searchfield).toHaveAttribute('value', 'test search');
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
    let {getByRole, getAllByText, getByLabelText} = renderSearchWithin();

    let searchfield = getByLabelText('Test', {selector: 'input'});
    let picker = getByRole('button');
    let group = getByRole('group');
    triggerPress(picker);

    let listbox = getByRole('listbox');
    let label = getAllByText('Test')[0];
    expect(listbox).toHaveAttribute('aria-labelledby', label.id);
    expect(searchfield).toHaveAttribute('aria-labelledby', label.id);
    expect(group).toHaveAttribute('aria-labelledby', label.id);
  });

  it('isDisabled=true disables both the searchfield and picker', function () {
    let {getByRole, getByLabelText} = renderSearchWithin({isDisabled: true});

    let searchfield = getByLabelText('Test', {selector: 'input'});
    let picker = getByRole('button');

    expect(searchfield).toHaveAttribute('disabled');
    expect(picker).toHaveAttribute('disabled');
  });

  it('autoFocus=true on searchfield will automatically focus the input', function () {
    let {getByLabelText} = renderSearchWithin({}, {autoFocus: true});

    let searchfield = getByLabelText('Test', {selector: 'input'});

    expect(searchfield).toHaveFocus();
  });

  it('autoFocus=true on picker will automatically focus the picker', function () {
    let {getByRole} = renderSearchWithin({}, {}, {autoFocus: true});

    let picker = getByRole('button');

    expect(picker).toHaveFocus();
  });

  it('slot props override props provided to children', function () {
    let {getByRole, getAllByText, getByLabelText} = renderSearchWithin(
      {isDisabled: true, isRequired: false, label: 'Test1'},
      {isDisabled: false, isRequired: true, label: 'Test2', isQuiet: true},
      {isDisabled: false, isRequired: true, label: 'Test3', isQuiet: true}
    );

    let searchfield = getByLabelText('Test1', {selector: 'input'});
    let picker = getByRole('button');
    let group = getByRole('group');
    triggerPress(picker);
    let label = getAllByText('Test1')[0];

    expect(searchfield).toHaveAttribute('disabled');
    expect(picker).toHaveAttribute('disabled');

    expect(searchfield).not.toHaveAttribute('aria-required');

    expect(searchfield).toHaveAttribute('aria-labelledby', label.id);
    expect(group).toHaveAttribute('aria-labelledby', label.id);

    expect(searchfield.classList.contains('is-quiet')).toBeFalsy();
    expect(picker.classList.contains('spectrum-Dropdown--quiet')).toBeFalsy();
  });

  it('searchfield and group are labelled correctly if aria-label used', function () {
    let {getByRole, getByLabelText} = renderSearchWithin({label: undefined, 'aria-label': 'Aria Label'});

    let searchfield = getByLabelText('Aria Label', {selector: 'input'});
    let group = getByRole('group');

    expect(searchfield).toHaveAttribute('aria-label', 'Aria Label');
    expect(group).toHaveAttribute('aria-labelledby', 'Aria Label');
  });
});
