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

import {Button, Calendar, CalendarCell, CalendarGrid, CalendarStateContext, Heading, RangeCalendar} from 'react-aria-components';
import React, {useContext} from 'react';

export default {
  title: 'React Aria Components'
};

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

export const CalendarExample = () => (
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
);

export const CalendarResetValue = () => (
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
);

export const CalendarMultiMonth = () => (
  <Calendar style={{width: 500}} visibleDuration={{months: 2}}>
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
    </div>
  </Calendar>
);

export const RangeCalendarExample = () => (
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
);
