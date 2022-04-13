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
import {AriaButtonProps} from '@react-types/button';
import {CalendarMonth} from './CalendarMonth';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import ChevronLeft from '@spectrum-icons/ui/ChevronLeftLarge';
import ChevronRight from '@spectrum-icons/ui/ChevronRightLarge';
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import {HelpText} from '@react-spectrum/label';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {HTMLAttributes, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useDateFormatter, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface CalendarBaseProps<T extends CalendarState | RangeCalendarState> extends CalendarPropsBase, DOMProps, StyleProps {
  state: T,
  visibleMonths?: number,
  calendarProps: HTMLAttributes<HTMLElement>,
  nextButtonProps: AriaButtonProps,
  prevButtonProps: AriaButtonProps,
  errorMessageProps: HTMLAttributes<HTMLElement>,
  calendarRef: RefObject<HTMLDivElement>
}

export function CalendarBase<T extends CalendarState | RangeCalendarState>(props: CalendarBaseProps<T>) {
  props = useProviderProps(props);
  let {
    state,
    calendarProps,
    nextButtonProps,
    prevButtonProps,
    errorMessageProps,
    calendarRef: ref,
    visibleMonths = 1
  } = props;
  let {styleProps} = useStyleProps(props);
  let formatMessage = useMessageFormatter(intlMessages);
  let {direction} = useLocale();
  let currentMonth = state.visibleRange.start;
  let monthDateFormatter = useDateFormatter({
    month: 'long',
    year: 'numeric',
    era: currentMonth.calendar.identifier !== 'gregory' ? 'long' : undefined,
    calendar: currentMonth.calendar.identifier,
    timeZone: state.timeZone
  });

  let calendars = [];
  for (let i = 0; i < visibleMonths; i++) {
    let d = currentMonth.add({months: i});
    calendars.push(
      <div key={i} className={classNames(styles, 'spectrum-Calendar-month')}>
        {/* Put the heading first so it is the first thing touch screen reader users encounter. */}
        <h2
          // If displaying more than one month, we have a visually hidden heading describing
          // the entire visible range, and the calendar itself describes the individual month
          // so we don't need to repeat that here for screen reader users.
          aria-hidden={visibleMonths > 1 || undefined}
          className={classNames(styles, 'spectrum-Calendar-title')}>
          {monthDateFormatter.format(d.toDate(state.timeZone))}
        </h2>
        {i === 0 &&
          // Next, put the previous button, so it's easy to adjust the month if not right.
          // With a keyboard, this will be the first tab stop, but desktop screen readers are
          // better about reading the role="group" label as well so there is enough context.
          <ActionButton
            {...prevButtonProps}
            UNSAFE_className={classNames(styles, 'spectrum-Calendar-prevMonth')}
            isQuiet>
            {direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </ActionButton>
        }
        {i === 0 &&
          // And for touch screen readers, add a visually hidden next button as well since it
          // would be tedious to get past the entire grid of days to get to the visual next button.
          <VisuallyHidden>
            <button
              aria-label={nextButtonProps['aria-label']}
              disabled={nextButtonProps.isDisabled}
              onClick={() => state.focusNextPage()}
              tabIndex={-1} />
          </VisuallyHidden>
        }
        <CalendarMonth
          {...props}
          state={state}
          startDate={d} />
        {i === visibleMonths - 1 &&
          // Put the next button after the month grid so touch screen reader users can easily navigate
          // after reaching the end.
          <ActionButton
            {...nextButtonProps}
            UNSAFE_className={classNames(styles, 'spectrum-Calendar-nextMonth')}
            isQuiet>
            {direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
          </ActionButton>
        }
      </div>
    );
  }

  return (
    <div
      {...styleProps}
      {...calendarProps}
      ref={ref}
      className={
        classNames(styles,
          'spectrum-Calendar',
          styleProps.className
        )
      }>
      {visibleMonths > 1 &&
        // If displaying more than one month, add a description of the entire visible range rather than
        // a separate heading above each month grid. This makes things easier to navigate for touch screen
        // reader users.
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
      }
      <div className={classNames(styles, 'spectrum-Calendar-months')}>
        {calendars}
      </div>
      {state.validationState === 'invalid' &&
        <HelpText
          showErrorIcon
          errorMessage={props.errorMessage || formatMessage('invalidSelection', {selectedCount: 'highlightedRange' in state ? 2 : 1})}
          errorMessageProps={errorMessageProps}
          validationState="invalid"
          // Intentionally a global class name so it can be targeted in DatePicker CSS...
          UNSAFE_className="spectrum-Calendar-helpText" />
      }
    </div>
  );
}
