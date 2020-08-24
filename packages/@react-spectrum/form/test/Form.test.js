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
import {Button} from '@react-spectrum/button';
import {Form} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {TextField} from '@react-spectrum/textfield';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

describe('Form', function () {
  it('should render a form', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form aria-label="Home" />
      </Provider>
    );

    let form = getByRole('form');
    expect(form).toBeTruthy();
  });

  it('should render children inside the form', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form aria-label="Home">
          <button>Test</button>
        </Form>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('should attach a optional user provided ref to the form', () => {
    let ref = React.createRef();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form aria-label="Home" ref={ref} />
      </Provider>
    );

    let form = getByRole('form');
    expect(form).toBe(ref.current.UNSAFE_getDOMNode());
  });

  it('should context props should be overridden by child', () => {
    let testId = 'tfid4';
    let tree = render(
      <Provider theme={theme}>
        <Form necessityIndicator={undefined}>
          <TextField label="A text field" necessityIndicator="label" data-testid={testId} />
        </Form>
      </Provider>
    );

    let input = tree.getByTestId(testId);
    let labelId = input.getAttribute('aria-labelledby');
    expect(labelId).toBeDefined();
    let label = document.getElementById(labelId);
    expect(label).toHaveTextContent('A text field ​(optional)');
  });

  it('supports form attributes', () => {
    let onSubmit = jest.fn().mockImplementation(e => e.preventDefault());
    let {getByLabelText, getByRole} = render(
      <Provider theme={theme}>
        <Form
          aria-label="Test"
          onSubmit={onSubmit}
          action="/action_page.php"
          method="get"
          target="_self"
          encType="text/plain"
          autoComplete="on">
          <Button variant="primary" type="submit" aria-label="Submit" />
        </Form>
      </Provider>
    );

    let form = getByRole('form');
    expect(form).toHaveAttribute('action', '/action_page.php');
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('target', '_self');
    expect(form).toHaveAttribute('encType', 'text/plain');
    expect(form).toHaveAttribute('autoComplete', 'on');
    let submit = getByLabelText('Submit');
    act(() => {userEvent.click(submit);});
    expect(onSubmit).toHaveBeenCalled();
  });

  it('supports aria-label', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form aria-label="Test" />
      </Provider>
    );

    let form = getByRole('form');
    expect(form).toHaveAttribute('aria-label', 'Test');
  });

  it('supports aria-labelledby', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <span id="test">Test</span>
        <Form aria-labelledby="test" />
      </Provider>
    );

    let form = getByRole('form');
    expect(form).toHaveAttribute('aria-labelledby', 'test');
  });

  it('supports aria-describedby', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <span id="test">Test</span>
        <Form aria-label="Test" aria-describedby="test" />
      </Provider>
    );

    let form = getByRole('form');
    expect(form).toHaveAttribute('aria-describedby', 'test');
  });

  it('supports custom data attributes', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form aria-label="Test" data-testid="test" />
      </Provider>
    );

    let form = getByRole('form');
    expect(form).toHaveAttribute('data-testid', 'test');
  });
});
