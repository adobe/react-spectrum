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

import {Button, Calendar, CalendarCell, CalendarGrid, DateInput, DatePicker, DatePickerContext, DateSegment, Dialog, Group, Heading, Label, Popover, Text} from 'react-aria-components';
import {CalendarDate} from '@internationalized/date';
import React from 'react';
import {render} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

let TestDatePicker = (props) => (
  <DatePicker data-foo="bar" {...props}>
    <Label>Birth date</Label>
    <Group>
      <DateInput>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      <Button>▼</Button>
    </Group>
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
    <Popover>
      <Dialog>
        <Calendar>
          <header>
            <Button slot="previous">◀</Button>
            <Heading />
            <Button slot="next">▶</Button>
          </header>
          <CalendarGrid>
            {(date) => <CalendarCell date={date} />}
          </CalendarGrid>
        </Calendar>
      </Dialog>
    </Popover>
  </DatePicker>
);

describe('DatePicker', () => {
  it('provides slots', () => {
    let {getByRole, getAllByRole} = render(<TestDatePicker />);

    let group = getByRole('group');
    let input = group.querySelector('.react-aria-DateInput');
    let button = getByRole('button');
    expect(input).toHaveTextContent('mm/dd/yyyy');
    expect(button).toHaveAttribute('aria-label', 'Calendar');

    expect(input.closest('.react-aria-DatePicker')).toHaveAttribute('data-foo', 'bar');

    expect(group).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(group.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Birth date');

    expect(group).toHaveAttribute('aria-describedby');
    expect(group.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    for (let segment of getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('class', 'react-aria-DateSegment');
      expect(segment).toHaveAttribute('data-placeholder', 'true');
      expect(segment).toHaveAttribute('data-type');
    }

    userEvent.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('class', 'react-aria-Dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog.getAttribute('aria-labelledby')).toContain(label.id);
    expect(dialog.closest('.react-aria-Popover')).toBeInTheDocument();

    expect(getByRole('grid')).toHaveClass('react-aria-CalendarGrid');
  });

  it('should support the slot prop', () => {
    let {getByRole} = render(
      <DatePickerContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestDatePicker slot="test" />
      </DatePickerContext.Provider>
    );

    let group = getByRole('group');
    expect(group.closest('.react-aria-DatePicker')).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should apply isPressed state to button when expanded', () => {
    let {getByRole} = render(<TestDatePicker />);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    userEvent.click(button);
    expect(button).toHaveAttribute('data-pressed');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <DatePicker minValue={new CalendarDate(2023, 1, 1)} defaultValue={new CalendarDate(2020, 2, 3)}>
        {({validationState}) => (
          <>
            <Label>Birth date</Label>
            <Group data-validation-state={validationState}>
              <DateInput>
                {(segment) => <DateSegment segment={segment} />}
              </DateInput>
              <Button>▼</Button>
            </Group>
            <Popover>
              <Dialog>
                <Calendar>
                  <header>
                    <Button slot="previous">◀</Button>
                    <Heading />
                    <Button slot="next">▶</Button>
                  </header>
                  <CalendarGrid>
                    {(date) => <CalendarCell date={date} />}
                  </CalendarGrid>
                </Calendar>
              </Dialog>
            </Popover>
          </>
        )}
      </DatePicker>
    );
    
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-validation-state', 'invalid');
  });
});
