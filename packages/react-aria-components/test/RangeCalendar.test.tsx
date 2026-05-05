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
import {Button} from '../src/Button';

import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  CalendarMonthPicker,
  CalendarYearPicker,
  RangeCalendar,
  RangeCalendarContext
} from '../src/Calendar';

import {CalendarDate, getLocalTimeZone, startOfMonth, startOfWeek, today} from '@internationalized/date';
import {DateValue} from 'react-stately/useRangeCalendarState';
import {RangeValue} from '@react-types/shared';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestCalendar = ({calendarProps = {}, gridProps = {}, cellProps = {}}) => (
  <RangeCalendar aria-label="Trip dates" {...calendarProps}>
    <header>
      <Button slot="previous">◀</Button>
      <CalendarHeading />
      <Button slot="next">▶</Button>
    </header>
    <CalendarGrid {...gridProps}>
      {(date) => <CalendarCell date={date} {...cellProps} />}
    </CalendarGrid>
  </RangeCalendar>
);

let renderCalendar = (calendarProps = {}, gridProps = {}, cellProps = {}) => render(<TestCalendar {...{calendarProps, gridProps, cellProps}} />);

describe('RangeCalendar', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  it('should render with default classes', () => {
    let {getByRole} = renderCalendar();
    let group = getByRole('application');
    expect(group).toHaveAttribute('class', 'react-aria-RangeCalendar');

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('class', 'react-aria-CalendarGrid');

    let rowgroups = within(grid).getAllByRole('rowgroup', {hidden: true});
    expect(rowgroups[0]).toHaveAttribute('class', 'react-aria-CalendarGridHeader');
    expect(rowgroups[1]).toHaveAttribute('class', 'react-aria-CalendarGridBody');

    for (let cell of within(rowgroups[0]).getAllByRole('columnheader', {hidden: true})) {
      expect(cell).toHaveAttribute('class', 'react-aria-CalendarHeaderCell');
    }

    for (let cell of within(grid).getAllByRole('button')) {
      expect(cell).toHaveAttribute('class', 'react-aria-CalendarCell');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole} = renderCalendar({className: 'calendar'}, {className: 'grid'}, {className: 'cell'});
    let group = getByRole('application');
    expect(group).toHaveAttribute('class', 'calendar');

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('class', 'grid');

    for (let cell of within(grid).getAllByRole('button')) {
      expect(cell).toHaveAttribute('class', 'cell');
    }
  });

  it('should support DOM props', () => {
    let {getByRole} = renderCalendar({'data-foo': 'bar'}, {'data-bar': 'baz'}, {'data-baz': 'foo'});
    let group = getByRole('application');
    expect(group).toHaveAttribute('data-foo', 'bar');

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('data-bar', 'baz');

    for (let cell of within(grid).getAllByRole('button')) {
      expect(cell).toHaveAttribute('data-baz', 'foo');
    }
  });

  it('should support custom CalendarGridHeader', () => {
    let {getByRole} = render(
      <RangeCalendar aria-label="Trip dates">
        <header>
          <Button slot="previous">◀</Button>
          <CalendarHeading />
          <Button slot="next">▶</Button>
        </header>
        <CalendarGrid>
          <CalendarGridHeader className="grid-header">
            {(day) => (
              <CalendarHeaderCell className="header-cell">
                {day}
              </CalendarHeaderCell>
            )}
          </CalendarGridHeader>
          <CalendarGridBody className="grid-body">
            {(date) => <CalendarCell date={date} />}
          </CalendarGridBody>
        </CalendarGrid>
      </RangeCalendar>
    );

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('class', 'react-aria-CalendarGrid');

    let rowgroups = within(grid).getAllByRole('rowgroup', {hidden: true});
    expect(rowgroups[0]).toHaveAttribute('class', 'grid-header');
    expect(rowgroups[1]).toHaveAttribute('class', 'grid-body');

    for (let cell of within(rowgroups[0]).getAllByRole('columnheader', {hidden: true})) {
      expect(cell).toHaveAttribute('class', 'header-cell');
    }
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <RangeCalendarContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestCalendar calendarProps={{slot: 'test', 'aria-label': undefined}} />
      </RangeCalendarContext.Provider>
    );

    let group = getByRole('application');
    expect(group).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', expect.stringContaining('test'));
  });

  it('should support custom render function', () => {
    let {getByRole} = renderCalendar(
      {render: props => <div {...props} data-custom="true" />},
      {render: props => <table {...props} data-custom="true" />},
      {render: props => <div {...props} data-custom="true" />}
    );
    let group = getByRole('application');
    expect(group).toHaveAttribute('data-custom', 'true');

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('data-custom', 'true');

    for (let cell of within(grid).getAllByRole('button')) {
      expect(cell).toHaveAttribute('data-custom', 'true');
    }
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <RangeCalendar
        aria-label="Trip dates"
        minValue={new CalendarDate(2023, 1, 1)}
        defaultValue={{start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 2, 10)}}>
        {({isInvalid}) => (
          <>
            <header>
              <Button slot="previous">◀</Button>
              <CalendarHeading />
              <Button slot="next">▶</Button>
            </header>
            <CalendarGrid data-validation-state={isInvalid ? 'invalid' : null}>
              {(date) => <CalendarCell date={date} />}
            </CalendarGrid>
          </>
        )}
      </RangeCalendar>
    );

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('data-validation-state', 'invalid');
  });

  it('should support multi-month calendars', () => {
    let {getAllByRole, container} = render(
      <RangeCalendar aria-label="Trip dates" defaultFocusedValue={new CalendarDate(2026, 4, 1)} visibleDuration={{months: 2}}>
        <header>
          <Button slot="previous">◀</Button>
          <Button slot="next">▶</Button>
        </header>
        <div style={{display: 'flex', gap: 30}}>
          <CalendarHeading />
          <CalendarGrid>
            {date => <CalendarCell date={date} />}
          </CalendarGrid>
          <CalendarHeading offset={{months: 1}} />
          <CalendarGrid offset={{months: 1}}>
            {date => <CalendarCell date={date} />}
          </CalendarGrid>
        </div>
      </RangeCalendar>
    );

    let grids = getAllByRole('grid');
    expect(grids).toHaveLength(2);

    let formatter = new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric'});
    let firstMonth = new CalendarDate(2026, 4, 1);
    let tz = getLocalTimeZone();
    expect(grids[0]).toHaveAttribute('aria-label', 'Trip dates, ' + formatter.format(firstMonth.toDate(tz)));
    expect(grids[1]).toHaveAttribute('aria-label', 'Trip dates, ' + formatter.format(firstMonth.add({months: 1}).toDate(tz)));

    let headings = container.querySelectorAll('.react-aria-CalendarHeading');
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent('April 2026');
    expect(headings[1]).toHaveTextContent('May 2026');
  });

  it.each([
    {name: 'at the start', alignment: 'start', expected: ['February 2020', 'March 2020', 'April 2020']},
    {name: 'in the center', alignment: 'center', expected: ['January 2020', 'February 2020', 'March 2020']},
    {name: 'at the end', alignment: 'end', expected: ['December 2019', 'January 2020', 'February 2020']}
  ])('should align the initial value $name', async ({alignment, expected}) => {
    const {getAllByRole} = render(
      <RangeCalendar visibleDuration={{months: 3}} defaultValue={{start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 2, 10)}} selectionAlignment={alignment as 'start' | 'center' | 'end'}>
        <header>
          <Button slot="previous">◀</Button>
          <CalendarHeading />
          <Button slot="next">▶</Button>
        </header>
        <div style={{display: 'flex', gap: 30}}>
          <CalendarGrid>
            {date => <CalendarCell date={date} />}
          </CalendarGrid>
          <CalendarGrid offset={{months: 1}}>
            {date => <CalendarCell date={date} />}
          </CalendarGrid>
          <CalendarGrid offset={{months: 2}}>
            {date => <CalendarCell date={date} />}
          </CalendarGrid>
        </div>
      </RangeCalendar>
    );

    let grids = getAllByRole('grid');
    expect(grids).toHaveLength(3);

    expect(grids[0]).toHaveAttribute('aria-label', expected[0]);
    expect(grids[1]).toHaveAttribute('aria-label', expected[1]);
    expect(grids[2]).toHaveAttribute('aria-label', expected[2]);
  });


  it('should support hover', async () => {
    let {getByRole} = renderCalendar({}, {}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let grid = getByRole('grid');
    let cell = within(grid).getAllByRole('button')[7];

    expect(cell).not.toHaveAttribute('data-hovered');
    expect(cell).not.toHaveClass('hover');

    await user.hover(cell);
    expect(cell).toHaveAttribute('data-hovered', 'true');
    expect(cell).toHaveClass('hover');

    await user.unhover(cell);
    expect(cell).not.toHaveAttribute('data-hovered');
    expect(cell).not.toHaveClass('hover');
  });

  it('should support focus ring', async () => {
    let {getByRole} = renderCalendar({}, {}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let grid = getByRole('grid');
    let cell = within(grid).getAllByRole('button')[7];

    expect(cell).not.toHaveAttribute('data-focus-visible');
    expect(cell).not.toHaveClass('focus');

    await user.tab();
    act(() => cell.focus());
    expect(document.activeElement).toBe(cell);
    expect(cell).toHaveAttribute('data-focus-visible', 'true');
    expect(cell).toHaveClass('focus');

    await user.tab();
    expect(cell).not.toHaveAttribute('data-focus-visible');
    expect(cell).not.toHaveClass('focus');
  });

  it('should support press state', async () => {
    let {getByRole} = renderCalendar({}, {}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let grid = getByRole('grid');
    let cell = within(grid).getAllByRole('button')[7];

    expect(cell).not.toHaveAttribute('data-pressed');
    expect(cell).not.toHaveClass('pressed');

    await user.pointer({target: cell, keys: '[MouseLeft>]'});
    expect(cell).toHaveAttribute('data-pressed', 'true');
    expect(cell).toHaveClass('pressed');

    await user.pointer({target: cell, keys: '[/MouseLeft]'});
    expect(cell).not.toHaveAttribute('data-pressed');
    expect(cell).not.toHaveClass('pressed');
  });

  it('should support selected state', async () => {
    let {getByRole} = renderCalendar({}, {}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let grid = getByRole('grid');
    let cell = within(grid).getAllByRole('button')[7];

    expect(cell).not.toHaveAttribute('data-selected');
    expect(cell).not.toHaveClass('selected');

    await user.click(cell);
    expect(cell).toHaveAttribute('data-selected', 'true');
    expect(cell).toHaveClass('selected');
  });

  it('should support selected range states', async () => {
    let {getByRole} = renderCalendar({}, {}, {className: ({isSelectionStart, isSelectionEnd}) => `${isSelectionStart ? 'start' : ''} ${isSelectionEnd ? 'end' : ''}`});
    let grid = getByRole('grid');
    let cells = within(grid).getAllByRole('button');

    expect(cells[7]).not.toHaveAttribute('data-selection-start');
    expect(cells[7]).not.toHaveClass('start');
    expect(cells[7]).not.toHaveClass('end');

    await user.click(cells[7]);
    expect(cells[7]).toHaveAttribute('data-selection-start', 'true');
    expect(cells[7]).toHaveClass('start');
    expect(cells[7]).toHaveAttribute('data-selection-end', 'true');
    expect(cells[7]).toHaveClass('end');

    expect(cells[8]).not.toHaveAttribute('data-selection-start', 'true');
    expect(cells[8]).not.toHaveClass('start');
    expect(cells[8]).not.toHaveAttribute('data-selection-end', 'true');
    expect(cells[8]).not.toHaveClass('end');

    await user.click(cells[10]);
    expect(cells[7]).toHaveAttribute('data-selection-start', 'true');
    expect(cells[7]).toHaveClass('start');
    expect(cells[7]).not.toHaveAttribute('data-selection-end', 'true');
    expect(cells[7]).not.toHaveClass('end');
    expect(cells[10]).toHaveAttribute('data-selection-end', 'true');
    expect(cells[10]).toHaveClass('end');

    expect(cells[8]).not.toHaveAttribute('data-selection-start', 'true');
    expect(cells[8]).not.toHaveClass('start');
    expect(cells[8]).not.toHaveAttribute('data-selection-end', 'true');
    expect(cells[8]).not.toHaveClass('end');
  });

  it('should support controlled selected range states', async () => {
    function ControlledCalendar() {
      let [value, setValue] = React.useState<RangeValue<DateValue> | null>(null);

      return (
        <>
          <RangeCalendar aria-label="Trip dates" value={value} onChange={setValue}>
            <header>
              <Button slot="previous">◀</Button>
              <CalendarHeading />
              <Button slot="next">▶</Button>
            </header>
            <CalendarGrid>
              {(date) => <CalendarCell date={date} className={({isSelectionStart, isSelectionEnd}) => `${isSelectionStart ? 'start' : ''} ${isSelectionEnd ? 'end' : ''}`} />}
            </CalendarGrid>
          </RangeCalendar>
          <Button onPress={() => setValue(null)}>Reset</Button>
        </>
      );
    }
    let {getByRole} = render(
      <ControlledCalendar />
    );

    let resetBtn = getByRole('button', {name: 'Reset'});
    let grid = getByRole('grid');
    let cells = within(grid).getAllByRole('button');

    expect(cells[7]).not.toHaveAttribute('data-selection-start');
    expect(cells[7]).not.toHaveClass('start');
    expect(cells[7]).not.toHaveClass('end');

    await user.click(cells[7]);
    expect(cells[7]).toHaveAttribute('data-selection-start', 'true');
    expect(cells[7]).toHaveClass('start');
    expect(cells[7]).toHaveAttribute('data-selection-end', 'true');
    expect(cells[7]).toHaveClass('end');

    expect(cells[8]).not.toHaveAttribute('data-selection-start', 'true');
    expect(cells[8]).not.toHaveClass('start');
    expect(cells[8]).not.toHaveAttribute('data-selection-end', 'true');
    expect(cells[8]).not.toHaveClass('end');

    await user.click(cells[10]);
    expect(cells[7]).toHaveAttribute('data-selection-start', 'true');
    expect(cells[7]).toHaveClass('start');
    expect(cells[7]).not.toHaveAttribute('data-selection-end', 'true');
    expect(cells[7]).not.toHaveClass('end');
    expect(cells[10]).toHaveAttribute('data-selection-end', 'true');
    expect(cells[10]).toHaveClass('end');

    expect(cells[8]).not.toHaveAttribute('data-selection-start', 'true');
    expect(cells[8]).not.toHaveClass('start');
    expect(cells[8]).not.toHaveAttribute('data-selection-end', 'true');
    expect(cells[8]).not.toHaveClass('end');

    await user.click(resetBtn);

    expect(cells[7]).not.toHaveAttribute('data-selection-start');
    expect(cells[7]).not.toHaveClass('start');
    expect(cells[7]).not.toHaveClass('end');
    expect(cells[10]).not.toHaveAttribute('data-selection-end');
    expect(cells[10]).not.toHaveClass('end');

  });

  it('should support unavailable state', () => {
    let {getByRole} = renderCalendar({isDateUnavailable: () => true}, {}, {className: ({isUnavailable}) => isUnavailable ? 'unavailable' : ''});
    let grid = getByRole('grid');
    let cell = within(grid).getAllByRole('button')[7];

    expect(cell).toHaveAttribute('data-unavailable', 'true');
    expect(cell).toHaveClass('unavailable');
  });

  it('should allow changing the unavailable dates based on the anchor date', async () => {
    let tree = render(
      <TestCalendar
        calendarProps={{
          isDateUnavailable: (date, anchorDate) => (
            anchorDate ? Math.abs(date.compare(anchorDate)) > 7 : false
          )
        }} />
    );

    let grid = tree.getByRole('grid');
    let cells = within(grid).getAllByRole('button');

    for (let cell of cells) {
      if (!cell.hasAttribute('data-outside-month')) {
        expect(cell).not.toHaveAttribute('data-disabled');
      }
    }

    await user.click(cells[14]);

    for (let i = 0; i < 7; i++) {
      expect(cells[i]).toHaveAttribute('data-disabled');
    }

    for (let i = 7; i < 22; i++) {
      expect(cells[i]).not.toHaveAttribute('data-disabled');
    }

    for (let i = 22; i < cells.length; i++) {
      expect(cells[i]).toHaveAttribute('data-disabled');
    }

    await user.click(cells[19]);

    for (let cell of cells) {
      if (!cell.hasAttribute('data-outside-month')) {
        expect(cell).not.toHaveAttribute('data-disabled');
      }
    }
  });

  it('should support disabled state', () => {
    let {getByRole} = renderCalendar({isDisabled: true}, {}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let grid = getByRole('grid');
    let cell = within(grid).getAllByRole('button')[7];

    expect(cell).toHaveAttribute('data-disabled', 'true');
    expect(cell).toHaveClass('disabled');
  });

  it('should support invalid state', () => {
    let {getByRole} = renderCalendar({
      isInvalid: true,
      value: {
        start: startOfWeek(startOfMonth(today(getLocalTimeZone())), 'en-US').add({days: 7}),
        end: startOfWeek(startOfMonth(today(getLocalTimeZone())), 'en-US').add({days: 10})
      }
    }, {}, {className: ({isInvalid}) => isInvalid ? 'invalid' : ''});
    let grid = getByRole('grid');
    let cell = within(grid).getAllByRole('button')[7];

    expect(cell).toHaveAttribute('aria-invalid', 'true');
    expect(cell).toHaveClass('invalid');
  });

  it('should support month and year dropdowns', async () => {
    let tree = render(
      <RangeCalendar aria-label="Appointment date" defaultFocusedValue={new CalendarDate(2026, 4, 1)}>
        <header>
          <Button slot="previous">◀</Button>
          <CalendarMonthPicker>
            {({items, value, onChange, 'aria-label': ariaLabel}) => (
              <select aria-label={ariaLabel} value={value} onChange={e => onChange(e.target.value)}>
                {items.map(item => <option key={item.id} value={item.id}>{item.formatted}</option>)}
              </select>
            )}
          </CalendarMonthPicker>
          <CalendarYearPicker>
            {({items, value, onChange, 'aria-label': ariaLabel}) => (
              <select aria-label={ariaLabel} value={value} onChange={e => onChange(e.target.value)}>
                {items.map(item => <option key={item.id} value={item.id}>{item.formatted}</option>)}
              </select>
            )}
          </CalendarYearPicker>
          <Button slot="next">▶</Button>
        </header>
        <CalendarGrid>
          {(date) => <CalendarCell date={date} />}
        </CalendarGrid>
      </RangeCalendar>
    );

    let monthPicker = tree.getByLabelText('month');
    let yearPicker = tree.getByLabelText('year');
    let grid = tree.getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', 'Appointment date, April 2026');

    expect(monthPicker).toHaveValue('4');
    expect(within(monthPicker).getAllByRole('option').map(o => o.textContent)).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

    await user.selectOptions(monthPicker, 'Jun');
    expect(monthPicker).toHaveValue('6');
    expect(grid).toHaveAttribute('aria-label', 'Appointment date, June 2026');

    expect(yearPicker).toHaveValue('10');
    expect(within(yearPicker).getAllByRole('option').map(o => o.textContent)).toEqual(Array.from({length: 20}, (_, i) => String(i + 2016)));

    await user.selectOptions(yearPicker, '2030');
    expect(yearPicker).toHaveValue('10');
    expect(within(yearPicker).getAllByRole('option').map(o => o.textContent)).toEqual(Array.from({length: 20}, (_, i) => String(i + 2020)));
    expect(grid).toHaveAttribute('aria-label', 'Appointment date, June 2030');
  });

  it('should support weeksInMonth prop', async () => {
    let tree = render(<TestCalendar calendarProps={{weeksInMonth: 6, defaultFocusedValue: new CalendarDate(2026, 4, 1)}} />);
    let rows = tree.getAllByRole('row');
    expect(rows).toHaveLength(6);
  });

  it('should support week view', async () => {
    let tree = render(<TestCalendar calendarProps={{visibleDuration: {weeks: 1}, defaultFocusedValue: new CalendarDate(2026, 4, 1)}} />);
    let rows = tree.getAllByRole('row');
    expect(rows).toHaveLength(1);
    let heading = tree.container.querySelector('.react-aria-CalendarHeading');
    expect(heading).toHaveTextContent('March 29 – April 4, 2026');
  });

  it('should support day view', async () => {
    let tree = render(<TestCalendar calendarProps={{visibleDuration: {days: 2}, defaultFocusedValue: new CalendarDate(2026, 4, 1)}} />);
    let rows = tree.getAllByRole('row');
    expect(rows).toHaveLength(1);
    expect(tree.getAllByRole('gridcell')).toHaveLength(2);
    let heading = tree.container.querySelector('.react-aria-CalendarHeading');
    expect(heading).toHaveTextContent('April 1 – 2, 2026');
  });
});
