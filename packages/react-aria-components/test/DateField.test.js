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

import {CalendarDate} from '@internationalized/date';
import {DateField, DateFieldContext, DateInput, DateSegment, Label, Text} from '../';
import React from 'react';
import {render, within} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

describe('DateField', () => {
  it('provides slots', () => {
    let {getByRole, getAllByRole} = render(
      <DateField data-foo="bar">
        <Label>Birth date</Label>
        <DateInput data-bar="foo">
          {segment => <DateSegment segment={segment} data-test="test" />}
        </DateInput>
        <Text slot="description">Description</Text>
        <Text slot="errorMessage">Error</Text>
      </DateField>
    );

    let input = getByRole('group');
    expect(input).toHaveTextContent('mm/dd/yyyy');
    expect(input).toHaveAttribute('class', 'react-aria-DateInput');
    expect(input).toHaveAttribute('data-bar', 'foo');

    expect(input.closest('.react-aria-DateField')).toHaveAttribute('data-foo', 'bar');

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
      expect(segment).toHaveAttribute('data-test', 'test');
    }
  });

  it('supports custom class names', () => {
    let {getByRole, getAllByRole} = render(
      <DateField className="date-field">
        <Label>Birth date</Label>
        <DateInput className="date-input">
          {segment => <DateSegment segment={segment} className={({isPlaceholder}) => `segment ${isPlaceholder ? 'placeholder' : ''}`} />}
        </DateInput>
      </DateField>
    );

    let input = getByRole('group');
    expect(input).toHaveAttribute('class', 'date-input');
    expect(input.closest('.date-field')).toBeInTheDocument();

    for (let segment of getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('class', 'segment placeholder');
    }
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <DateFieldContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <DateField slot="test">
          <DateInput>
            {segment => <DateSegment segment={segment} />}
          </DateInput>
        </DateField>
      </DateFieldContext.Provider>
    );

    let group = getByRole('group');
    expect(group.closest('.react-aria-DateField')).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should support hover state', () => {
    let {getByRole} = render(
      <DateField>
        <Label>Birth date</Label>
        <DateInput className={({isHovered}) => isHovered ? 'hover' : ''}>
          {segment => <DateSegment segment={segment} />}
        </DateInput>
      </DateField>
    );
    let group = getByRole('group');

    expect(group).not.toHaveAttribute('data-hovered');
    expect(group).not.toHaveClass('hover');

    userEvent.hover(group);
    expect(group).toHaveAttribute('data-hovered', 'true');
    expect(group).toHaveClass('hover');

    userEvent.unhover(group);
    expect(group).not.toHaveAttribute('data-hovered');
    expect(group).not.toHaveClass('hover');
  });

  it('should support focus visible state', () => {
    let {getByRole} = render(
      <DateField>
        <Label>Birth date</Label>
        <DateInput className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>
          {segment => <DateSegment segment={segment} />}
        </DateInput>
      </DateField>
    );
    let group = getByRole('group');

    expect(group).not.toHaveAttribute('data-focus-visible');
    expect(group).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(within(group).getAllByRole('spinbutton')[0]);
    expect(group).toHaveAttribute('data-focus-visible', 'true');
    expect(group).toHaveClass('focus');

    userEvent.tab({shift: true});
    expect(group).not.toHaveAttribute('data-focus-visible');
    expect(group).not.toHaveClass('focus');
  });

  it('should support disabled state', () => {
    let {getByRole} = render(
      <DateField isDisabled>
        <Label>Birth date</Label>
        <DateInput className={({isDisabled}) => isDisabled ? 'disabled' : ''}>
          {segment => <DateSegment segment={segment} />}
        </DateInput>
      </DateField>
    );
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-disabled');
    expect(group).toHaveClass('disabled');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <DateField minValue={new CalendarDate(2023, 1, 1)} defaultValue={new CalendarDate(2020, 2, 3)}>
        {({validationState}) => (
          <>
            <Label>Birth date</Label>
            <DateInput data-validation-state={validationState}>
              {segment => <DateSegment segment={segment} />}
            </DateInput>
          </>
        )}
      </DateField>
    );
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-validation-state', 'invalid');
  });
});
