/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {Button, FieldError, Form, Input, Label, TextField} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Form', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('supports server validation errors', async () => {
    function Test() {
      let [serverErrors, setServerErrors] = React.useState({});
      let onSubmit = e => {
        e.preventDefault();
        setServerErrors({
          name: 'Invalid name.'
        });
      };

      return (
        <Form data-testid="form" onSubmit={onSubmit} validationErrors={serverErrors}>
          <TextField name="name">
            <Label>Name</Label>
            <Input />
            <FieldError />
          </TextField>
          <Button type="submit">Submit</Button>
        </Form>
      );
    }

    let {getByTestId, getByRole} = render(<Test />);

    let form = getByTestId('form');
    expect(form).toHaveClass('react-aria-Form');

    let input = getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-describedby');

    await user.click(getByRole('button'));
    act(() => {form.checkValidity();});

    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent('Invalid name.');
    expect(input.validity.valid).toBe(false);
    expect(document.activeElement).toBe(input);

    // Clicking twice doesn't clear server errors.
    await user.click(getByRole('button'));
    act(() => {form.checkValidity();});

    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent('Invalid name.');
    expect(input.validity.valid).toBe(false);
    expect(document.activeElement).toBe(input);

    await user.clear(input);
    await user.keyboard('Devon');
    await user.tab();

    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(true);
  });

  it('should use validationBehavior="native" by default', async () => {
    function Test() {
      return (
        <Form data-testid="form">
          <TextField name="name" isRequired>
            <Label>Name</Label>
            <Input />
            <FieldError />
          </TextField>
          <Button type="submit">Submit</Button>
        </Form>
      );
    }

    let {getByTestId, getByRole} = render(<Test />);

    let form = getByTestId('form');
    expect(form).toHaveClass('react-aria-Form');
    expect(form).not.toHaveAttribute('novalidate');

    let input = getByRole('textbox');
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('aria-required');
  });

  it('supports validationBehavior="aria"', async () => {
    function Test() {
      return (
        <Form data-testid="form" validationBehavior="aria">
          <TextField name="name" isRequired>
            <Label>Name</Label>
            <Input />
            <FieldError />
          </TextField>
          <Button type="submit">Submit</Button>
        </Form>
      );
    }


    let {getByTestId, getByRole} = render(<Test />);

    let form = getByTestId('form');
    expect(form).toHaveClass('react-aria-Form');
    expect(form).toHaveAttribute('novalidate');

    let input = getByRole('textbox');
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required');
  });

  it('Form element\'s validationBehavior="aria" should override Form\'s default validationBehavior="native"', async () => {
    function Test() {
      return (
        <Form data-testid="form">
          <TextField name="name" isRequired validationBehavior="aria">
            <Label>Name</Label>
            <Input />
            <FieldError />
          </TextField>
          <Button type="submit">Submit</Button>
        </Form>
      );
    }


    let {getByTestId, getByRole} = render(<Test />);

    let form = getByTestId('form');
    expect(form).toHaveClass('react-aria-Form');
    expect(form).not.toHaveAttribute('novalidate');

    let input = getByRole('textbox');
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required');
  });

  it('Form element\'s validationBehavior="native" should override Form\'s validationBehavior="aria"', async () => {
    function Test() {
      return (
        <Form data-testid="form" validationBehavior="aria">
          <TextField name="name" isRequired validationBehavior="native">
            <Label>Name</Label>
            <Input />
            <FieldError />
          </TextField>
          <Button type="submit">Submit</Button>
        </Form>
      );
    }


    let {getByTestId, getByRole} = render(<Test />);

    let form = getByTestId('form');
    expect(form).toHaveClass('react-aria-Form');
    expect(form).toHaveAttribute('novalidate');

    let input = getByRole('textbox');
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('aria-required');
  });
});
