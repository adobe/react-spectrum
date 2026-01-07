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

import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarProps,
  CalendarStateContext,
  DateValue,
  Heading,
  I18nProvider,
  RangeCalendar
} from 'react-aria-components';
import {CalendarDate, parseDate} from '@internationalized/date';
import {Meta, StoryObj} from '@storybook/react';
import React, {useContext} from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/Calendar',
  component: Calendar
} as Meta<typeof Calendar>;

export type CalendarStory = StoryObj<typeof Calendar>;
export type RangeCalendarStory = StoryObj<typeof RangeCalendar>;

function Footer() {
  const state = useContext(CalendarStateContext);
  const setValue = state?.setValue;

  return (
    <div>
      <Button
        slot={null}
        className="reset-button"
        onPress={() => {
          // reset value
          setValue?.(null);
        }}>
        Reset value
      </Button>
    </div>
  );
}

export const CalendarExample: CalendarStory = {
  render: () => (
    <Calendar style={{width: 220}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Button slot="previous">&lt;</Button>
        <Heading style={{flex: 1, textAlign: 'center'}} />
        <Button slot="next">&gt;</Button>
      </div>
      <CalendarGrid style={{width: '100%'}}>
        {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({display: isOutsideMonth ? 'none' : '', textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''})} />}
      </CalendarGrid>
    </Calendar>
  )
};

export const CalendarResetValue: CalendarStory = {
  render: () => (
    <Calendar style={{width: 220}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Button slot="previous">&lt;</Button>
        <Heading style={{flex: 1, textAlign: 'center'}} />
        <Button slot="next">&gt;</Button>
      </div>
      <CalendarGrid style={{width: '100%'}}>
        {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({display: isOutsideMonth ? 'none' : '', textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''})} />}
      </CalendarGrid>
      <Footer />
    </Calendar>
  )
};

function CalendarMultiMonthExample(args) {
  let defaultDate = new CalendarDate(2021, 7, 1);
  let [focusedDate, setFocusedDate] = React.useState(defaultDate);

  return (
    <>
      <button
        style={{marginBottom: 20}}
        onClick={() => setFocusedDate(defaultDate)}>
        Reset focused date
      </button>
      <Calendar style={{width: 500}} visibleDuration={{months: 3}} focusedValue={focusedDate} onFocusChange={setFocusedDate} defaultValue={defaultDate} {...args}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Button slot="previous">&lt;</Button>
          <Heading style={{flex: 1, textAlign: 'center'}} />
          <Button slot="next">&gt;</Button>
        </div>
        <div style={{display: 'flex', gap: 20}}>
          <CalendarGrid style={{flex: 1}}>
            {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({opacity: isOutsideMonth ? '0.5' : '', textAlign: 'center', cursor: 'default', background: isSelected && !isOutsideMonth ? 'blue' : ''})} />}
          </CalendarGrid>
          <CalendarGrid style={{flex: 1}} offset={{months: 1}}>
            {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({opacity: isOutsideMonth ? '0.5' : '', textAlign: 'center', cursor: 'default', background: isSelected && !isOutsideMonth ? 'blue' : ''})} />}
          </CalendarGrid>
          <CalendarGrid style={{flex: 1}} offset={{months: 2}}>
            {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({opacity: isOutsideMonth ? '0.5' : '', textAlign: 'center', cursor: 'default', background: isSelected && !isOutsideMonth ? 'blue' : ''})} />}
          </CalendarGrid>
        </div>
      </Calendar>
    </>
  );
};

export const CalendarMultiMonth: CalendarStory = {
  render: (args) => <CalendarMultiMonthExample {...args} />,
  args: {
    selectionAlignment: 'center'
  },
  argTypes: {
    selectionAlignment: {
      control: 'select',
      options: ['start', 'center', 'end']
    }
  }
};


interface CalendarFirstDayOfWeekExampleProps extends CalendarProps<DateValue> {
  locale: string
}

export const CalendarFirstDayOfWeekExample: StoryObj<CalendarFirstDayOfWeekExampleProps> = {
  render: function Example(args) {
    return (
      <div>
        <I18nProvider locale={args.locale}>
          <Calendar style={{width: 220}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <Button slot="previous">&lt;</Button>
              <Heading style={{flex: 1, textAlign: 'center'}} />
              <Button slot="next">&gt;</Button>
            </div>
            <CalendarGrid style={{width: '100%'}}>
              {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({display: isOutsideMonth ? 'none' : '', textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''})} />}
            </CalendarGrid>
          </Calendar>
        </I18nProvider>
      </div>
    );
  },
  args: {
    locale: 'en-US-u-ca-iso8601-fw-tue'
  },
  argTypes: {
    locale: {
      control: 'select',
      options: ['en-US-u-ca-iso8601-fw-tue', 'en-US-u-ca-iso8601', 'en-US', 'fr-FR-u-ca-iso8601-fw-tue', 'fr-FR-u-ca-iso8601', 'fr-FR', 'en-US-u-ca-iso8601-fw-tue-nu-thai']
    }
  }
};

export const RangeCalendarExample: RangeCalendarStory = {
  render: () => (
    <RangeCalendar style={{width: 220}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Button slot="previous">&lt;</Button>
        <Heading style={{flex: 1, textAlign: 'center'}} />
        <Button slot="next">&gt;</Button>
      </div>
      <CalendarGrid style={{width: '100%'}}>
        {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({display: isOutsideMonth ? 'none' : '', textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''})} />}
      </CalendarGrid>
    </RangeCalendar>
  )
};


export const RangeCalendarMultiMonthExample: RangeCalendarStory = {
  render: (args) => (
    <RangeCalendar style={{width: 500}} visibleDuration={{months: 3}} defaultValue={{start: parseDate('2025-08-04'), end: parseDate('2025-08-10')}} {...args} >
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Button slot="previous">&lt;</Button>
        <Heading style={{flex: 1, textAlign: 'center'}} />
        <Button slot="next">&gt;</Button>
      </div>
      <div style={{display: 'flex', gap: 20}}>
        <CalendarGrid style={{flex: 1}}>
          {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({display: isOutsideMonth ? 'none' : '', textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''})} />}
        </CalendarGrid>
        <CalendarGrid style={{flex: 1}} offset={{months: 1}}>
          {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({display: isOutsideMonth ? 'none' : '', textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''})} />}
        </CalendarGrid>
        <CalendarGrid style={{flex: 1}} offset={{months: 2}}>
          {date => <CalendarCell date={date} style={({isSelected, isOutsideMonth}) => ({display: isOutsideMonth ? 'none' : '', textAlign: 'center', cursor: 'default', background: isSelected ? 'blue' : ''})} />}
        </CalendarGrid>
      </div>
    </RangeCalendar>
  ),
  args: {
    selectionAlignment: 'center'
  },
  argTypes: {
    selectionAlignment: {
      control: 'select',
      options: ['start', 'center', 'end']
    }
  }
};
