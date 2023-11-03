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

import {act, pointerMap, render} from '@react-spectrum/test-utils';
import {FieldError, Input, Label, Text, TextArea, TextField, TextFieldContext} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestTextField = (props) => (
  <TextField defaultValue="test" data-testid="text-field-test" data-foo="bar" {...props}>
    <Label>Test</Label>
    <props.input {...props.inputProps} />
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
  </TextField>
);

describe('TextField', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  describe.each([
    {name: 'Input', component: Input},
    {name: 'TextArea', component: TextArea}]
  )('$name', ({name, component}) => {
    it('provides slots', () => {
      let {getByRole} = render(<TestTextField input={component} />);


      let input = getByRole('textbox');
      expect(input).toHaveValue('test');
      expect(input).toHaveAttribute('class', `react-aria-${name}`);
      if (name === 'Input') {
        expect(input).toHaveAttribute('type', 'text');
      } else {
        expect(input).not.toHaveAttribute('type');
      }

      expect(input.closest('.react-aria-TextField')).toHaveAttribute('data-foo', 'bar');

      expect(input).toHaveAttribute('aria-labelledby');
      let label = document.getElementById(input.getAttribute('aria-labelledby'));
      expect(label).toHaveAttribute('class', 'react-aria-Label');
      expect(label).toHaveTextContent('Test');

      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');
    });

    it('should support slot', () => {
      let {getByRole} = render(
        <TextFieldContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
          <TestTextField slot="test" input={component} />
        </TextFieldContext.Provider>
      );

      let textbox = getByRole('textbox');
      expect(textbox.closest('.react-aria-TextField')).toHaveAttribute('slot', 'test');
      expect(textbox).toHaveAttribute('aria-label', 'test');
    });

    it('should support hover state', async () => {
      let {getByRole} = render(<TestTextField input={component} inputProps={{className: ({isHovered}) => isHovered ? 'hover' : ''}} />);
      let input = getByRole('textbox');

      expect(input).not.toHaveAttribute('data-hovered');
      expect(input).not.toHaveClass('hover');

      await user.hover(input);
      expect(input).toHaveAttribute('data-hovered', 'true');
      expect(input).toHaveClass('hover');

      await user.unhover(input);
      expect(input).not.toHaveAttribute('data-hovered');
      expect(input).not.toHaveClass('hover');
    });

    it('should support focus visible state', async () => {
      let {getByRole} = render(<TestTextField input={component} inputProps={{className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''}} />);
      let input = getByRole('textbox');

      expect(input).not.toHaveAttribute('data-focus-visible');
      expect(input).not.toHaveClass('focus');

      await user.tab();
      expect(document.activeElement).toBe(input);
      expect(input).toHaveAttribute('data-focus-visible', 'true');
      expect(input).toHaveClass('focus');

      await user.tab();
      expect(input).not.toHaveAttribute('data-focus-visible');
      expect(input).not.toHaveClass('focus');
    });

    it('should render data- attributes only on the outer element', () => {
      let {getAllByTestId} = render(<TestTextField input={component} />);
      let outerEl = getAllByTestId('text-field-test');
      expect(outerEl).toHaveLength(1);
      expect(outerEl[0]).toHaveClass('react-aria-TextField');
    });

    it('supports validation errors', async () => {
      let Component = component;
      let {getByRole, getByTestId} = render(
        <form data-testid="form">
          <TextField isRequired>
            <Label>Test</Label>
            <Component />
            <FieldError />
          </TextField>
        </form>
      );

      let input = getByRole('textbox');
      expect(input).toHaveAttribute('required');
      expect(input).not.toHaveAttribute('aria-required');
      expect(input).not.toHaveAttribute('aria-describedby');
      expect(input.validity.valid).toBe(false);

      act(() => {getByTestId('form').checkValidity();});

      expect(input).toHaveAttribute('aria-describedby');
      expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent('Constraints not satisfied');
      expect(input.closest('.react-aria-TextField')).toHaveAttribute('data-invalid');
      expect(document.activeElement).toBe(input);

      await user.keyboard('Devon');

      expect(input).toHaveAttribute('aria-describedby');
      expect(input.validity.valid).toBe(true);

      await user.tab();
      expect(input).not.toHaveAttribute('aria-describedby');
      expect(input.closest('.react-aria-TextField')).not.toHaveAttribute('data-invalid');
    });

    it('supports customizing validation errors', async () => {
      let Component = component;
      let {getByRole, getByTestId} = render(
        <form data-testid="form">
          <TextField isRequired>
            <Label>Test</Label>
            <Component />
            <FieldError>{e => e.validationDetails.valueMissing ? 'Please enter a name' : null}</FieldError>
          </TextField>
        </form>
      );

      let input = getByRole('textbox');
      expect(input).toHaveAttribute('required');
      expect(input).not.toHaveAttribute('aria-required');
      expect(input).not.toHaveAttribute('aria-describedby');
      expect(input.validity.valid).toBe(false);

      act(() => {getByTestId('form').checkValidity();});

      expect(input).toHaveAttribute('aria-describedby');
      expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent('Please enter a name');
      expect(document.activeElement).toBe(input);

      await user.keyboard('Devon');

      expect(input).toHaveAttribute('aria-describedby');
      expect(input.validity.valid).toBe(true);

      await user.tab();
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });
});
