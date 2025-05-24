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

import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Button, CalendarCell, CalendarGrid, DateInput, DateRangePicker, DateRangePickerContext, DateSegment, Dialog, FieldError, Group, Heading, Label, Popover, RangeCalendar, Text} from 'react-aria-components';
import {CalendarDate} from '@internationalized/date';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestDateRangePicker = (props) => (
  <DateRangePicker data-foo="bar" {...props}>
    <Label>Trip dates</Label>
    <Group>
      <DateInput slot="start">
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      <span aria-hidden="true">–</span>
      <DateInput slot="end">
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      <Button>▼</Button>
    </Group>
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
    <Popover>
      <Dialog>
        <RangeCalendar>
          <header>
            <Button slot="previous">◀</Button>
            <Heading />
            <Button slot="next">▶</Button>
          </header>
          <CalendarGrid>
            {(date) => <CalendarCell date={date} />}
          </CalendarGrid>
        </RangeCalendar>
      </Dialog>
    </Popover>
  </DateRangePicker>
);

describe('DateRangePicker', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('provides slots', async () => {
    let {getByRole, getAllByRole} = render(<TestDateRangePicker />);

    let group = getByRole('group');
    let inputs = group.querySelectorAll('.react-aria-DateInput');
    let button = getByRole('button');
    expect(inputs[0]).toHaveTextContent('mm/dd/yyyy');
    expect(inputs[0]).toHaveTextContent('mm/dd/yyyy');
    expect(button).toHaveAttribute('aria-label', 'Calendar');

    expect(group.closest('.react-aria-DateRangePicker')).toHaveAttribute('data-foo', 'bar');

    expect(group).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(group.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Trip dates');

    expect(group).toHaveAttribute('aria-describedby');
    expect(group.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    for (let segment of getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('class', 'react-aria-DateSegment');
      expect(segment).toHaveAttribute('data-placeholder', 'true');
      expect(segment).toHaveAttribute('data-type');
    }

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('class', 'react-aria-Dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog.getAttribute('aria-labelledby')).toContain(label.id);
    expect(dialog.closest('.react-aria-Popover')).toBeInTheDocument();
    expect(dialog.closest('.react-aria-Popover')).toHaveAttribute('data-trigger', 'DateRangePicker');

    expect(getByRole('grid')).toHaveClass('react-aria-CalendarGrid');
  });

  it('should support the slot prop', () => {
    let {getByRole} = render(
      <DateRangePickerContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestDateRangePicker slot="test" />
      </DateRangePickerContext.Provider>
    );

    let group = getByRole('group');
    expect(group.closest('.react-aria-DateRangePicker')).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should apply isPressed state to button when expanded', async () => {
    let {getByRole} = render(<TestDateRangePicker />);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    await user.click(button);
    expect(button).toHaveAttribute('data-pressed');
  });

  it('should support data-open state', async () => {
    let {getByRole} = render(<TestDateRangePicker />);
    let datePicker = document.querySelector('.react-aria-DateRangePicker');
    let button = getByRole('button');

    expect(datePicker).not.toHaveAttribute('data-open');
    await user.click(button);
    expect(datePicker).toHaveAttribute('data-open');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <DateRangePicker defaultValue={{start: new CalendarDate(2023, 1, 10), end: new CalendarDate(2023, 1, 1)}} validationBehavior="aria">
        {({isInvalid}) => (
          <>
            <Label>Trip dates</Label>
            <Group data-validation-state={isInvalid ? 'invalid' : null}>
              <DateInput slot="start">
                {(segment) => <DateSegment segment={segment} />}
              </DateInput>
              <span aria-hidden="true">–</span>
              <DateInput slot="end">
                {(segment) => <DateSegment segment={segment} />}
              </DateInput>
              <Button>▼</Button>
            </Group>
            <Popover>
              <Dialog>
                <RangeCalendar>
                  <header>
                    <Button slot="previous">◀</Button>
                    <Heading />
                    <Button slot="next">▶</Button>
                  </header>
                  <CalendarGrid>
                    {(date) => <CalendarCell date={date} />}
                  </CalendarGrid>
                </RangeCalendar>
              </Dialog>
            </Popover>
          </>
        )}
      </DateRangePicker>
    );

    let group = getByRole('group');
    expect(group).toHaveAttribute('data-validation-state', 'invalid');
  });

  it('should support form value', () => {
    render(<TestDateRangePicker startName="start" endName="end" value={{start: new CalendarDate(2023, 1, 10), end: new CalendarDate(2023, 1, 20)}} />);
    let start = document.querySelector('input[name=start]');
    expect(start).toHaveValue('2023-01-10');
    let end = document.querySelector('input[name=end]');
    expect(end).toHaveValue('2023-01-20');
  });

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(
      <TestDateRangePicker data-testid="date-picker" />
    );
    let outerEl = getAllByTestId('date-picker');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-DateRangePicker');
  });

  it('supports validation errors', async () => {
    let {getByRole, getByTestId} = render(
      <form data-testid="form">
        <DateRangePicker startName="start" endName="end" isRequired>
          <Label>Trip dates</Label>
          <Group>
            <DateInput slot="start">
              {(segment) => <DateSegment segment={segment} />}
            </DateInput>
            <span aria-hidden="true">–</span>
            <DateInput slot="end">
              {(segment) => <DateSegment segment={segment} />}
            </DateInput>
            <Button>▼</Button>
          </Group>
          <FieldError />
          <Popover>
            <Dialog>
              <RangeCalendar>
                <header>
                  <Button slot="previous">◀</Button>
                  <Heading />
                  <Button slot="next">▶</Button>
                </header>
                <CalendarGrid>
                  {(date) => <CalendarCell date={date} />}
                </CalendarGrid>
              </RangeCalendar>
            </Dialog>
          </Popover>
        </DateRangePicker>
      </form>
    );

    let group = getByRole('group');
    let datepicker = group.closest('.react-aria-DateRangePicker');
    let startInput = document.querySelector('input[name=start]');
    let endInput = document.querySelector('input[name=end]');
    expect(startInput).toHaveAttribute('required');
    expect(startInput.validity.valid).toBe(false);
    expect(endInput).toHaveAttribute('required');
    expect(endInput.validity.valid).toBe(false);
    expect(group).not.toHaveAttribute('aria-describedby');
    expect(datepicker).not.toHaveAttribute('data-invalid');

    act(() => {getByTestId('form').checkValidity();});

    expect(group).toHaveAttribute('aria-describedby');
    let getDescription = () => group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
    expect(getDescription()).toContain('Constraints not satisfied');
    expect(datepicker).toHaveAttribute('data-invalid');
    expect(document.activeElement).toBe(within(group).getAllByRole('spinbutton')[0]);

    await user.keyboard('[ArrowUp][Tab][ArrowUp][Tab][ArrowUp]');
    await user.keyboard('[Tab][ArrowUp][Tab][ArrowUp][Tab][ArrowUp]');

    expect(getDescription()).toContain('Constraints not satisfied');
    expect(startInput.validity.valid).toBe(true);
    expect(endInput.validity.valid).toBe(true);

    await user.tab();
    expect(getDescription()).not.toContain('Constraints not satisfied');
    expect(datepicker).not.toHaveAttribute('data-invalid');
  });

  it('should support close on select = true', async () => {
    let {getByRole, getAllByRole} = render(<TestDateRangePicker value={{start: new CalendarDate(2023, 1, 10), end: new CalendarDate(2023, 1, 20)}} />);

    let button = getByRole('button');

    await user.click(button);

    let dialog = getByRole('dialog');

    let cells = getAllByRole('gridcell');
    let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
    expect(selected.children[0]).toHaveAttribute('aria-label', 'Selected Range: Tuesday, January 10 to Friday, January 20, 2023, Tuesday, January 10, 2023 selected');

    await user.click(selected.nextSibling.children[0]);
    await user.click(selected.nextSibling.children[1]);
    expect(dialog).not.toBeInTheDocument();
  });

  it('should support close on select = false', async () => {
    let {getByRole, getAllByRole} = render(<TestDateRangePicker value={{start: new CalendarDate(2023, 1, 10), end: new CalendarDate(2023, 1, 20)}} shouldCloseOnSelect={false} />);

    let button = getByRole('button');

    await user.click(button);

    let dialog = getByRole('dialog');

    let cells = getAllByRole('gridcell');
    let selected = cells.find(cell => cell.getAttribute('aria-selected') === 'true');
    expect(selected.children[0]).toHaveAttribute('aria-label', 'Selected Range: Tuesday, January 10 to Friday, January 20, 2023, Tuesday, January 10, 2023 selected');

    await user.click(selected.nextSibling.children[0]);
    await user.click(selected.nextSibling.children[1]);
    expect(dialog).toBeInTheDocument();
  });

  it('should disable button and date input when DatePicker is disabled', () => {
    let {getByRole} = render(<TestDateRangePicker isDisabled />);

    let button = getByRole('button');
    expect(button).toBeDisabled();

    let group = getByRole('group');
    expect(group).toHaveAttribute('aria-disabled', 'true');

    let spinbuttons = within(group).getAllByRole('spinbutton');
    for (let spinbutton of spinbuttons) {
      expect(spinbutton).toHaveAttribute('aria-disabled', 'true');
    }
  });
});
