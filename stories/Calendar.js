/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import Calendar from '../src/Calendar';
import moment from 'moment';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Calendar', module)
  .add(
    'Default',
    () => render({value: 'today'})
  )
  .add(
    'startDay=1',
    () => render({startDay: 1, value: 'today'})
  )
  .add(
    'uncontrolled',
    () => render({defaultValue: 'today'})
  )
  .add(
    'min=today, max=one week',
    () => render({min: 'today', max: moment().date(moment().date() + 7).format('YYYY-MM-DD')})
  )
  .add(
    'value=2015-01-15',
    () => render({type: 'datetime', value: '2015-01-15'})
  )
  .add(
    'headerFormat=M/YYYY',
    () => render({headerFormat: 'M/YYYY'})
  )
  .add(
    'disabled=true',
    () => render({disabled: true})
  )
  .add(
    'selectionType=range',
    () => render({selectionType: 'range'})
  )
  .add(
    'selectionType=range with value',
    () => render({selectionType: 'range', value: ['2015-01-15', '2015-01-19']})
  )
  .add(
    'disabled selectionType=range',
    () => render({selectionType: 'range', value: ['2015-01-15', '2015-01-19'], disabled: true})
  );

function render(props = {}) {
  return (
    <Calendar
      onChange={action('change')}
      {...props} />
  );
}
