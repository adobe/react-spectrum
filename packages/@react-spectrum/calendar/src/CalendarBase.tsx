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
