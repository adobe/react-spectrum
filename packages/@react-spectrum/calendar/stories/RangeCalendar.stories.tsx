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

import {action} from '@storybook/addon-actions';
import {CalendarDate, CalendarDateTime, getLocalTimeZone, parseZonedDateTime, today} from '@internationalized/date';
import {classNames} from '@react-spectrum/utils';
import {Flex, Grid, repeat} from '@react-spectrum/layout';
import {generatePowerset} from '@react-spectrum/story-utils';
import {RangeCalendar} from '../';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {TimeField} from '@react-spectrum/datepicker';

storiesOf('Date and Time/RangeCalendar', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultValue',
    () => render({defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}})
  )
  .add(
    'controlled value',
    () => render({value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}})
  )
  .add(
    'with time',
    () => <RangeCalendarWithTime />
  )
  .add(
    'with zoned time',
    () => <RangeCalendarWithZonedTime />
  )
  .add(
    'minValue: today, maxValue: 1 week from now',
    () => render({minValue: today(getLocalTimeZone()), maxValue: today(getLocalTimeZone()).add({weeks: 1})})
  )
  .add(
    'defaultValue + minValue + maxValue',
    () => render({defaultValue: {start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 12)}, minValue: new CalendarDate(2019, 6, 5), maxValue: new CalendarDate(2019, 6, 20)})
  )
  .add(
    'isDisabled',
    () => render({defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}, isDisabled: true})
  )
  .add(
    'isReadOnly',
    () => render({defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}, isReadOnly: true})
  )
  .add(
    'autoFocus',
    () => render({defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}, autoFocus: true})
  )
  .add(
    'visibleMonths: 2',
    () => render({visibleMonths: 2})
  )
  .add(
    'visibleMonths: 3',
    () => render({visibleMonths: 3})
  )
  .add(
    'minValue: today, visibleMonths: 3',
    () => render({minValue: today(getLocalTimeZone()), visibleMonths: 3})
  )
  .add(
    'defaultValue, visibleMonths: 3',
    () => render({visibleMonths: 3, defaultValue: {start: new CalendarDate(2021, 10, 5), end: new CalendarDate(2021, 12, 10)}})
  );

  // Fake cell for testing css
function Cell({isToday, isSelected, isFocused, isHovered, isPressed, isDisabled, isRangeStart, isRangeEnd, isRangeSelection, isSelectionStart, isSelectionEnd}) {
  return (
    <span
      className={classNames(styles, 'spectrum-Calendar-date', {
        'is-today': isToday,
        'is-selected': isSelected,
        'is-focused': isFocused,
        'is-disabled': isDisabled,
        'is-range-start': isRangeStart,
        'is-range-end': isRangeEnd,
        'is-range-selection': isRangeSelection,
        'is-selection-start': isSelectionStart,
        'is-selection-end': isSelectionEnd,
        'is-hovered': isHovered,
        'is-pressed': isPressed
      })}>
      <span className={classNames(styles, 'spectrum-Calendar-dateText')}>12</span>
    </span>
  );
}

let states = [
  {isToday: true},
  {isSelected: true},
  {isFocused: true},
  {isHovered: true},
  {isPressed: true},
  {isDisabled: true},
  {isRangeSelection: true},
  {isRangeStart: true},
  {isRangeEnd: true},
  {isSelectionStart: true},
  {isSelectionEnd: true}
];

storiesOf('Date and Time/RangeCalendar/cell', module)
  .add('default', () => (
    <Grid columns={repeat(10, 100)}>
      {generatePowerset(states, (merged) =>
        (merged.isDisabled && (merged.isFocused || merged.isHovered || merged.isPressed)) ||
        (!merged.isSelected && (merged.isRangeSelection || merged.isSelectionStart || merged.isSelectionEnd || merged.isRangeStart || merged.isRangeEnd)) ||
        ((merged.isRangeStart || merged.isRangeEnd) && !merged.isRangeSelection) ||
        (merged.isRangeStart && merged.isRangeEnd) ||
        (merged.isSelectionStart && !merged.isRangeStart) ||
        (merged.isSelectionEnd && !merged.isRangeEnd)
      ).map(props => <div>{Object.keys(props).join(' ')}<div style={{position: 'relative', width: 40, height: 40, textAlign: 'center'}}><Cell {...props} /></div></div>)}
    </Grid>
  )
);

function render(props = {}) {
  return <RangeCalendar onChange={action('change')} {...props} />;
}

function RangeCalendarWithTime() {
  let [value, setValue] = useState({start: new CalendarDateTime(2019, 6, 5, 8), end: new CalendarDateTime(2019, 6, 10, 12)});

  return (
    <Flex direction="column">
      <RangeCalendar value={value} onChange={setValue} />
      <Flex gap="size-100">
        <TimeField label="Start time" value={value.start} onChange={v => setValue({...value, start: v})} />
        <TimeField label="End time" value={value.end} onChange={v => setValue({...value, end: v})} />
      </Flex>
    </Flex>
  );
}

function RangeCalendarWithZonedTime() {
  let [value, setValue] = useState({start: parseZonedDateTime('2021-03-10T00:45-05:00[America/New_York]'), end: parseZonedDateTime('2021-03-26T18:05-07:00[America/Los_Angeles]')});

  return (
    <Flex direction="column">
      <RangeCalendar value={value} onChange={setValue} />
      <Flex gap="size-100">
        <TimeField label="Start time" value={value.start} onChange={v => setValue({...value, start: v})} />
        <TimeField label="End time" value={value.end} onChange={v => setValue({...value, end: v})} />
      </Flex>
    </Flex>
  );
}
