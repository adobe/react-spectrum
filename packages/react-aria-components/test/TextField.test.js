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

import {Input, Label, Text, TextField} from '../';
import React from 'react';
import {render} from '@react-spectrum/test-utils';

describe('TextField', () => {
  it('provides slots', () => {
    let {getByRole} = render(
      <TextField defaultValue="test">
        <Label>Test</Label>
        <Input />
        <Text slot="description">Description</Text>
        <Text slot="errorMessage">Error</Text>
      </TextField>
    );

    let input = getByRole('textbox');
    expect(input).toHaveValue('test');

    expect(input.closest('.react-aria-TextField')).toBeInTheDocument();

    expect(input).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(input.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Test');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');
  });
});
