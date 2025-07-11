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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button, FieldError, Input, Label, SearchField, SearchFieldContext, Text} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestSearchField = (props) => (
  <SearchField defaultValue="test" data-foo="bar" {...props}>
    <Label>Test</Label>
    <Input />
    <Button>x</Button>
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
  </SearchField>
);

describe('SearchField', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('provides slots', () => {
    let {getByRole} = render(<TestSearchField />);

    let input = getByRole('searchbox');
    expect(input).toHaveValue('test');

    expect(input.closest('.react-aria-SearchField')).toHaveAttribute('data-foo', 'bar');

    expect(input).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(input.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Test');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Clear search');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <SearchFieldContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestSearchField slot="test" />
      </SearchFieldContext.Provider>
    );

    let searchbox = getByRole('searchbox');
    expect(searchbox.closest('.react-aria-SearchField')).toHaveAttribute('slot', 'test');
    expect(searchbox).toHaveAttribute('aria-label', 'test');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <SearchField defaultValue="test">
        {({state}) => (
          <>
            <Label>Test</Label>
            <Input />
            <Button>x</Button>
            <Text slot="description">You are looking for "{state.value}"</Text>
          </>
        )}
      </SearchField>
    );

    let searchbox = getByRole('searchbox');
    let description = document.getElementById(searchbox.getAttribute('aria-describedby'));
    expect(description).toHaveTextContent('You are looking for "test"');
  });

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(
      <SearchField data-testid="search-field">
        <Label>Search</Label>
        <Input />
        <Button>✕</Button>
      </SearchField>
    );
    let outerEl = getAllByTestId('search-field');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-SearchField');
  });

  it('supports validation errors', async () => {
    let {getByRole, getByTestId} = render(
      <form data-testid="form">
        <SearchField isRequired>
          <Label>Test</Label>
          <Input />
          <FieldError />
        </SearchField>
      </form>
    );

    let input = getByRole('searchbox');
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('aria-required');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(false);

    act(() => {getByTestId('form').checkValidity();});

    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent('Constraints not satisfied');
    expect(document.activeElement).toBe(input);

    await user.keyboard('Devon');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(true);

    await user.tab();
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('should support form prop', () => {
    let {getByRole} = render(
      <TestSearchField form="test" />
    );

    let input = getByRole('searchbox');
    expect(input).toHaveAttribute('form', 'test');
  });
});
