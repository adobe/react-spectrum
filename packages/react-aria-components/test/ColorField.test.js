/*
 * Copyright 2024 Adobe. All rights reserved.
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
import {ColorField, ColorFieldContext, FieldError, Input, Label, parseColor, Text} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestColorField = (props) => (
  <ColorField defaultValue="#f00" minValue={0} data-foo="bar" {...props}>
    <Label>Color</Label>
    <Input />
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
  </ColorField>
);

describe('ColorField', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('provides slots', () => {
    let {getByRole} = render(<TestColorField />);

    let input = getByRole('textbox');
    expect(input.closest('.react-aria-ColorField')).toHaveAttribute('data-foo', 'bar');
    expect(input).toHaveValue('#FF0000');

    expect(input).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(input.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Color');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ColorFieldContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestColorField slot="test" />
      </ColorFieldContext.Provider>
    );

    let textbox = getByRole('textbox');
    expect(textbox.closest('.react-aria-ColorField')).toHaveAttribute('slot', 'test');
    expect(textbox).toHaveAttribute('aria-label', 'test');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <ColorField defaultValue="#f00" isDisabled>
        {({isDisabled}) => (
          <>
            <Label>Color ({isDisabled ? 'disabled' : ''})</Label>
            <Input />
          </>
        )}
      </ColorField>
    );

    let input = getByRole('textbox');
    let label = document.getElementById(input.getAttribute('aria-labelledby'));
    expect(label).toHaveTextContent('Color (disabled)');
  });

  it('should support form value', () => {
    let {rerender} = render(<TestColorField name="test" value="#f00" />);
    let input = document.querySelector('input[name=test]');
    expect(input).toHaveValue('#FF0000');

    rerender(<TestColorField name="test" value={null} />);
    expect(input).toHaveValue('');
  });

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(
      <TestColorField data-testid="number-field" />
    );
    let outerEl = getAllByTestId('number-field');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-ColorField');
  });

  it('supports validation errors', async () => {
    let {getByRole, getByTestId} = render(
      <form data-testid="form">
        <ColorField isRequired>
          <Label>Color</Label>
          <Input />
          <FieldError />
        </ColorField>
      </form>
    );

    let input = getByRole('textbox');
    let numberfield = input.closest('.react-aria-ColorField');
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('aria-required');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(false);
    expect(numberfield).not.toHaveAttribute('data-invalid');

    act(() => {getByTestId('form').checkValidity();});

    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent('Constraints not satisfied');
    expect(numberfield).toHaveAttribute('data-invalid');
    expect(document.activeElement).toBe(input);

    await user.keyboard('ff0');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(true);

    await user.tab();
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(numberfield).not.toHaveAttribute('data-invalid');
  });

  it('should support the channel prop', async function () {
    let onChange = jest.fn();
    let {getByRole} = render(<TestColorField value="#abc" colorSpace="hsl" channel="hue" name="hue" onChange={onChange} />);
    let colorField = getByRole('textbox');
    expect(colorField.value).toBe('210°');
    expect(colorField.closest('.react-aria-ColorField')).toHaveAttribute('data-channel', 'hue');
    expect(colorField).not.toHaveAttribute('name');
    let hiddenInput = document.querySelector('input[name=hue]');
    expect(hiddenInput.value).toBe('210');
    expect(hiddenInput).toHaveAttribute('type', 'hidden');

    await user.tab();
    await user.keyboard('100');
    await user.tab();
    expect(onChange).toHaveBeenCalledWith(parseColor('hsl(100, 25%, 73.33%)'));
  });
});
