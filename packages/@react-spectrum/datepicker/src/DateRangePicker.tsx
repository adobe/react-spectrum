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

import CalendarIcon from '@spectrum-icons/workflow/Calendar';
import {classNames} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {DatePickerField} from './DatePickerField';
import datepickerStyles from './styles.css';
import {DateValue, SpectrumDateRangePickerProps} from '@react-types/datepicker';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Field} from '@react-spectrum/label';
import {FieldButton} from '@react-spectrum/button';
import {Flex} from '@react-spectrum/layout';
import {FocusableRef} from '@react-types/shared';
import {Input} from './Input';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import {RangeCalendar} from '@react-spectrum/calendar';
import React, {ReactElement, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TimeField} from './TimeField';
import {useDateRangePicker} from '@react-aria/datepicker';
import {useDateRangePickerState} from '@react-stately/datepicker';
import {useFocusManagerRef, useFormatHelpText, useVisibleMonths} from './utils';
import {useFocusRing} from '@react-aria/focus';
import {useHover} from '@react-aria/interactions';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function DateRangePicker<T extends DateValue>(props: SpectrumDateRangePickerProps<T>, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  let {
    isQuiet,
    isDisabled,
    isReadOnly,
    autoFocus,
    placeholderValue,
    maxVisibleMonths = 1
  } = props;
  let {hoverProps, isHovered} = useHover({isDisabled});
  let targetRef = useRef<HTMLDivElement>();
  let state = useDateRangePickerState({
    ...props,
    shouldCloseOnSelect: () => !state.hasTime
  });
  let {labelProps, groupProps, buttonProps, dialogProps, startFieldProps, endFieldProps, descriptionProps, errorMessageProps, calendarProps} = useDateRangePicker(props, state, targetRef);
  let {isOpen, setOpen} = state;
  let {direction} = useLocale();
  let domRef = useFocusManagerRef(ref);
  let stringFormatter = useLocalizedStringFormatter(intlMessages);

  let {isFocused, isFocusVisible, focusProps} = useFocusRing({
    within: true,
    isTextInput: true,
    autoFocus
  });

  let {isFocused: isFocusedButton, focusProps: focusPropsButton} = useFocusRing({
    within: false,
    isTextInput: false,
    autoFocus
  });

  let className = classNames(
    styles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'spectrum-InputGroup--invalid': state.validationState === 'invalid' && !isDisabled,
      'is-disabled': isDisabled,
      'is-hovered': isHovered,
      'is-focused': isFocused,
      'focus-ring': isFocusVisible && !isFocusedButton
    }
  );

  let fieldClassName = classNames(
    styles,
    'spectrum-InputGroup-input',
    {
      'is-disabled': isDisabled,
      'is-invalid': state.validationState === 'invalid' && !isDisabled
    }
  );

  // Note: this description is intentionally not passed to useDatePicker.
  // The format help text is unnecessary for screen reader users because each segment already has a label.
  let description = useFormatHelpText(props);
  if (description && !props.description) {
    descriptionProps.id = null;
  }

  let placeholder: DateValue = placeholderValue;
  let timePlaceholder = placeholder && 'hour' in placeholder ? placeholder : null;
  let timeMinValue = props.minValue && 'hour' in props.minValue ? props.minValue : null;
  let timeMaxValue = props.maxValue && 'hour' in props.maxValue ? props.maxValue : null;
  let timeGranularity = state.granularity === 'hour' || state.granularity === 'minute' || state.granularity === 'second' ? state.granularity : null;
  let showTimeField = !!timeGranularity;

  let visibleMonths = useVisibleMonths(maxVisibleMonths);

  return (
    <Field
      {...props}
      ref={domRef}
      elementType="span"
      description={description}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      validationState={state.validationState}
      wrapperClassName={classNames(datepickerStyles, 'react-spectrum-Datepicker-fieldWrapper')}>
      <div
        {...mergeProps(groupProps, hoverProps, focusProps)}
        className={className}
        ref={targetRef}>
        <Input
          isDisabled={isDisabled}
          isQuiet={isQuiet}
          validationState={state.validationState}
          className={classNames(styles, 'spectrum-InputGroup-field')}
          inputClassName={fieldClassName}
          disableFocusRing>
          <DatePickerField
            {...startFieldProps}
            data-testid="start-date"
            isQuiet={props.isQuiet}
            inputClassName={classNames(datepickerStyles, 'react-spectrum-Datepicker-startField')} />
          <DateRangeDash />
          <DatePickerField
            {...endFieldProps}
            data-testid="end-date"
            isQuiet={props.isQuiet}
            inputClassName={classNames(
              styles,
              'spectrum-Datepicker-endField',
              classNames(
                datepickerStyles,
                'react-spectrum-Datepicker-endField'
              )
            )} />
        </Input>
        <DialogTrigger
          type="popover"
          mobileType="tray"
          placement={direction === 'rtl' ? 'bottom right' : 'bottom left'}
          targetRef={targetRef}
          hideArrow
          isOpen={isOpen}
          onOpenChange={setOpen}
          shouldFlip={props.shouldFlip}>
          <FieldButton
            {...mergeProps(buttonProps, focusPropsButton)}
            UNSAFE_className={classNames(styles, 'spectrum-FieldButton')}
            isQuiet={isQuiet}
            validationState={state.validationState}
            isDisabled={isDisabled || isReadOnly}>
            <CalendarIcon />
          </FieldButton>
          <Dialog UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-dialog')} {...dialogProps}>
            <Content>
              <div className={classNames(datepickerStyles, 'react-spectrum-Datepicker-dialogContent')}>
                <RangeCalendar
                  {...calendarProps}
                  visibleMonths={visibleMonths}
                  UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-calendar', {'is-invalid': state.validationState === 'invalid'})} />
                {showTimeField &&
                  <Flex gap="size-100" marginTop="size-100" UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-timeFields')}>
                    <TimeField
                      label={stringFormatter.format('startTime')}
                      value={state.timeRange?.start || null}
                      onChange={v => state.setTime('start', v)}
                      placeholderValue={timePlaceholder}
                      granularity={timeGranularity}
                      minValue={timeMinValue}
                      maxValue={timeMaxValue}
                      hourCycle={props.hourCycle}
                      hideTimeZone={props.hideTimeZone}
                      flex />
                    <TimeField
                      label={stringFormatter.format('endTime')}
                      value={state.timeRange?.end || null}
                      onChange={v => state.setTime('end', v)}
                      placeholderValue={timePlaceholder}
                      granularity={timeGranularity}
                      minValue={timeMinValue}
                      maxValue={timeMaxValue}
                      hourCycle={props.hourCycle}
                      hideTimeZone={props.hideTimeZone}
                      flex />
                  </Flex>
                }
              </div>
            </Content>
          </Dialog>
        </DialogTrigger>
      </div>
    </Field>
  );
}

function DateRangeDash() {
  return (
    <div
      aria-hidden="true"
      data-testid="date-range-dash"
      className={classNames(datepickerStyles, 'react-spectrum-Datepicker-rangeDash')} />
  );
}

/**
 * DateRangePickers combine two DateFields and a RangeCalendar popover to allow users
 * to enter or select a date and time range.
 */
const _DateRangePicker = React.forwardRef(DateRangePicker) as <T extends DateValue>(props: SpectrumDateRangePickerProps<T> & {ref?: FocusableRef<HTMLElement>}) => ReactElement;
export {_DateRangePicker as DateRangePicker};
