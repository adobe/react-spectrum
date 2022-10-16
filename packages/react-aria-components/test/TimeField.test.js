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

import {DateInput, DateSegment, Label, Text, TimeField} from '../';
import React from 'react';
import {render} from '@react-spectrum/test-utils';

describe('TimeField', () => {
  it('provides slots', () => {
    let {getByRole, getAllByRole} = render(
      <TimeField>
        <Label>Birth date</Label>
        <DateInput>
          {segment => <DateSegment segment={segment} />}
        </DateInput>
        <Text slot="description">Description</Text>
        <Text slot="errorMessage">Error</Text>
      </TimeField>
    );

    let input = getByRole('group');
    expect(input).toHaveTextContent('––:–– AM');
    expect(input).toHaveAttribute('class', 'react-aria-DateInput');

    expect(input.closest('.react-aria-TimeField')).toBeInTheDocument();

    expect(input).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(input.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Birth date');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    for (let segment of getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('class', 'react-aria-DateSegment');
      expect(segment).toHaveAttribute('data-placeholder', 'true');
      expect(segment).toHaveAttribute('data-type');
    }
  });

  it('supports custom class names', () => {
    let {getByRole, getAllByRole} = render(
      <TimeField className="date-field">
        <Label>Birth date</Label>
        <DateInput className="date-input">
          {segment => <DateSegment segment={segment} className={({isPlaceholder}) => `segment ${isPlaceholder ? 'placeholder' : ''}`} />}
        </DateInput>
      </TimeField>
    );

    let input = getByRole('group');
    expect(input).toHaveAttribute('class', 'date-input');
    expect(input.closest('.date-field')).toBeInTheDocument();

    for (let segment of getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('class', 'segment placeholder');
    }
  });
});
