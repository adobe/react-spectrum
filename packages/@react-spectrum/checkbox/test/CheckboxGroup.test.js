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

import {act, render, within} from '@testing-library/react';
import {Checkbox, CheckboxGroup} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

describe('CheckboxGroup', () => {
  it('handles defaults', () => {
    let onChangeSpy = jest.fn();
    let {getByRole, getAllByRole, getByLabelText} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" onChange={onChangeSpy}>
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxGroup = getByRole('group', {exact: true});
    let checkboxes = getAllByRole('checkbox');
    expect(checkboxGroup).toBeInTheDocument();
    expect(checkboxes.length).toBe(3);

    expect(checkboxes[0]).not.toHaveAttribute('name');
    expect(checkboxes[1]).not.toHaveAttribute('name');
    expect(checkboxes[2]).not.toHaveAttribute('name');

    expect(checkboxes[0].value).toBe('dogs');
    expect(checkboxes[1].value).toBe('cats');
    expect(checkboxes[2].value).toBe('dragons');

    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(false);
    expect(checkboxes[2].checked).toBe(false);

    let dragons = getByLabelText('Dragons');
    act(() => {userEvent.click(dragons);});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(['dragons']);

    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(false);
    expect(checkboxes[2].checked).toBe(true);
  });

  it('can have a default value', () => {
    let {getByLabelText} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" value={['cats']}>
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    expect(getByLabelText('Cats').checked).toBe(true);
  });

  it('name can be controlled', () => {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" name="awesome-react-aria">
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxes = getAllByRole('checkbox');

    expect(checkboxes[0]).toHaveAttribute('name', 'awesome-react-aria');
    expect(checkboxes[1]).toHaveAttribute('name', 'awesome-react-aria');
    expect(checkboxes[2]).toHaveAttribute('name', 'awesome-react-aria');
  });

  it('supports labeling', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet">
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );
    let checkboxGroup = getByRole('group', {exact: true});

    let labelId = checkboxGroup.getAttribute('aria-labelledby');
    expect(labelId).toBeDefined();
    let label = document.getElementById(labelId);
    expect(label).toHaveTextContent('Favorite Pet');
  });

  it('supports aria-label', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup aria-label="My Favorite Pet">
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );
    let checkboxGroup = getByRole('group', {exact: true});

    expect(checkboxGroup).toHaveAttribute('aria-label', 'My Favorite Pet');
  });

  it('supports custom props', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" data-testid="favorite-pet">
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );
    let checkboxGroup = getByRole('group', {exact: true});

    expect(checkboxGroup).toHaveAttribute('data-testid', 'favorite-pet');
  });

  it('sets aria-disabled when isDisabled is true', () => {
    let {getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" isDisabled>
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxGroup = getByRole('group', {exact: true});
    expect(checkboxGroup).toHaveAttribute('aria-disabled', 'true');

    let checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('disabled');
    expect(checkboxes[1]).toHaveAttribute('disabled');
    expect(checkboxes[2]).toHaveAttribute('disabled');
  });

  it('doesn\'t set aria-disabled by default', () => {
    let {getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet">
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxGroup = getByRole('group', {exact: true});
    expect(checkboxGroup).not.toHaveAttribute('aria-disabled');

    let checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).not.toHaveAttribute('disabled');
    expect(checkboxes[1]).not.toHaveAttribute('disabled');
    expect(checkboxes[2]).not.toHaveAttribute('disabled');
  });

  it('doesn\'t set aria-disabled when isDisabled is false', () => {
    let {getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" isDisabled={false}>
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxGroup = getByRole('group', {exact: true});
    expect(checkboxGroup).not.toHaveAttribute('aria-disabled');

    let checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).not.toHaveAttribute('disabled');
    expect(checkboxes[1]).not.toHaveAttribute('disabled');
    expect(checkboxes[2]).not.toHaveAttribute('disabled');
  });

  it('sets readOnly on each checkbox', () => {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" isReadOnly>
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('readonly');
    expect(checkboxes[1]).toHaveAttribute('readonly');
    expect(checkboxes[2]).toHaveAttribute('readonly');
  });

  it('should not update state for readonly checkbox', () => {
    let groupOnChangeSpy = jest.fn();
    let checkboxOnChangeSpy = jest.fn();
    let {getAllByRole, getByLabelText} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" onChange={groupOnChangeSpy}>
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons" isReadOnly onChange={checkboxOnChangeSpy}>Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxes = getAllByRole('checkbox');
    let dragons = getByLabelText('Dragons');

    act(() => {userEvent.click(dragons);});

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxes[2].checked).toBe(false);
  });

  it('adds required to group label', () => {
    let {getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" isRequired>
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxGroup = getByRole('group', {exact: true});
    let labelId = checkboxGroup.getAttribute('aria-labelledby');
    let label = document.getElementById(labelId);
    expect(label).toHaveTextContent('Favorite Pet');

    let necessityIndicator = within(label).getByRole('img');
    expect(necessityIndicator).toHaveAttribute('aria-label', '(required)');

    let checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).not.toHaveAttribute('required');
    expect(checkboxes[1]).not.toHaveAttribute('required');
    expect(checkboxes[2]).not.toHaveAttribute('required');
  });

  it('supports isRequired on individual checkboxes', () => {
    let {getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Agree to the following" isRequired>
          <Checkbox value="terms" isRequired>Terms and conditions</Checkbox>
          <Checkbox value="cookies" isRequired>Cookies</Checkbox>
          <Checkbox value="privacy" isRequired>Privacy policy</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxGroup = getByRole('group', {exact: true});
    let labelId = checkboxGroup.getAttribute('aria-labelledby');
    let label = document.getElementById(labelId);
    expect(label).toHaveTextContent('Agree to the following');

    let necessityIndicator = within(label).getByRole('img');
    expect(necessityIndicator).toHaveAttribute('aria-label', '(required)');

    let checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('required');
    expect(checkboxes[1]).toHaveAttribute('required');
    expect(checkboxes[2]).toHaveAttribute('required');
  });

  it('does not add aria-invalid to every checkbox by default', () => {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet" validationState="invalid">
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).not.toHaveAttribute('aria-invalid');
    expect(checkboxes[1]).not.toHaveAttribute('aria-invalid');
    expect(checkboxes[2]).not.toHaveAttribute('aria-invalid');
  });

  it('supports validationState on individual checkboxes', () => {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <CheckboxGroup label="Agree to the following">
          <Checkbox value="terms" validationState="invalid">Terms and conditions</Checkbox>
          <Checkbox value="cookies" validationState="invalid">Cookies</Checkbox>
          <Checkbox value="privacy">Privacy policy</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxes = getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('aria-invalid', 'true');
    expect(checkboxes[1]).toHaveAttribute('aria-invalid', 'true');
    expect(checkboxes[2]).not.toHaveAttribute('aria-invalid');
  });

  it.each(['isSelected', 'defaultSelected', 'isEmphasized'])('warns if %s is passed to an individual checkbox', (prop) => {
    let props = {[prop]: true};
    let spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Provider theme={theme}>
        <CheckboxGroup label="Favorite Pet">
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats" {...props}>Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    expect(spy).toHaveBeenCalledWith(`${prop} is unsupported on individual <Checkbox> elements within a <CheckboxGroup>. Please apply these props to the group instead.`);
  });
});
