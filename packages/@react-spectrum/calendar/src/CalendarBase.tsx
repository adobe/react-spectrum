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

import {ActionButton} from '@react-spectrum/button';
import {CalendarAria} from '@react-aria/calendar';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {CalendarTableBody} from './CalendarTableBody';
import {CalendarTableHeader} from './CalendarTableHeader';
import ChevronLeft from '@spectrum-icons/ui/ChevronLeftLarge';
import ChevronRight from '@spectrum-icons/ui/ChevronRightLarge';
import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useDateFormatter, useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface CalendarBaseProps extends CalendarPropsBase, DOMProps, StyleProps {
  state: CalendarState | RangeCalendarState,
  aria: CalendarAria
}

export function CalendarBase(props: CalendarBaseProps) {
  props = useProviderProps(props);
  let {
    state,
    aria,
    ...otherProps
  } = props;
  let monthDateFormatter = useDateFormatter({month: 'long', year: 'numeric'});
  let {
    calendarProps,
    calendarTitleProps,
    nextButtonProps,
    prevButtonProps,
    calendarBodyProps,
    captionProps
  } = aria;
  let {direction} = useLocale();
  let {styleProps} = useStyleProps(otherProps);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...calendarProps}
      className={
        classNames(styles,
          'spectrum-Calendar',
          styleProps.className
        )
      }>
      <div className={classNames(styles, 'spectrum-Calendar-header')}>
        <h2
          {...calendarTitleProps}
          className={classNames(styles, 'spectrum-Calendar-title')}>
          {monthDateFormatter.format(state.currentMonth)}
        </h2>
        <ActionButton
          {...prevButtonProps}
          UNSAFE_className={classNames(styles, 'spectrum-Calendar-prevMonth')}
          isQuiet
          isDisabled={props.isDisabled}
          icon={direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />} />
        <ActionButton
          {...nextButtonProps}
          UNSAFE_className={classNames(styles, 'spectrum-Calendar-nextMonth')}
          isQuiet
          isDisabled={props.isDisabled}
          icon={direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />} />
      </div>
      <div
        {...calendarBodyProps}
        className={classNames(styles, 'spectrum-Calendar-body')}>
        <table
          className={classNames(styles, 'spectrum-Calendar-table')}>
          <VisuallyHidden elementType="caption" {...captionProps} />
          <CalendarTableHeader weekStart={state.weekStart} />
          <CalendarTableBody state={state} />
        </table>
      </div>
    </div>
  );
}
