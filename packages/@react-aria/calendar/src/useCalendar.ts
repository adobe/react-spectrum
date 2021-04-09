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

import {CalendarAria} from './types';
import {CalendarProps} from '@react-types/calendar';
import {CalendarState} from '@react-stately/calendar';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useCalendarBase} from './useCalendarBase';
import {useMemo} from 'react';
import {useMessageFormatter} from '@react-aria/i18n';

export function useCalendar(props: CalendarProps, state: CalendarState): CalendarAria {
  // Compute localized message for the selected date
  let formatMessage = useMessageFormatter(intlMessages);
  let selectedDateDescription = useMemo(
    () => state.value ? formatMessage('selectedDateDescription', {date: state.value}) : '',
    [formatMessage, state.value]
  );

  return useCalendarBase(props, state, selectedDateDescription);
}
