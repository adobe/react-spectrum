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
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {DatePickerField} from './DatePickerField';
import datepickerStyles from './index.css';
import {DateValue, SpectrumDateRangePickerProps} from '@react-types/datepicker';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Field} from '@react-spectrum/label';
import {FieldButton} from '@react-spectrum/button';
import {Flex} from '@react-spectrum/layout';
import {Input} from './Input';
import {mergeProps} from '@react-aria/utils';
import {RangeCalendar} from '@react-spectrum/calendar';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TimeField} from './TimeField';
import {useDateRangePicker} from '@react-aria/datepicker';
import {useDateRangePickerState} from '@react-stately/datepicker';
import {useFocusRing} from '@react-aria/focus';
import {useFormatHelpText, useVisibleMonths} from './utils';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

export function DateRangePicker<T extends DateValue>(props: SpectrumDateRangePickerProps<T>) {
  props = useProviderProps(props);
  let {
    isQuiet,
    isDisabled,
    isReadOnly,
    isRequired,
    autoFocus,
    placeholderValue,
    maxVisibleMonths = 1,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let targetRef = useRef<HTMLDivElement>();
  let state = useDateRangePickerState(props);
  let {labelProps, groupProps, buttonProps, dialogProps, startFieldProps, endFieldProps, descriptionProps, errorMessageProps} = useDateRangePicker(props, state, targetRef);
  let {value, isOpen, setOpen} = state;
  let {direction} = useLocale();

  let {isFocused, isFocusVisible, focusProps} = useFocusRing({
    within: true,
    isTextInput: true,
    autoFocus
  });

  let className = classNames(
    styles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'spectrum-InputGroup--invalid': state.validationState === 'invalid',
      'is-disabled': isDisabled,
      'is-hovered': isHovered,
      'is-focused': isFocused,
      'focus-ring': isFocusVisible
    },
    styleProps.className
  );

  let fieldClassName = classNames(
    styles,
    'spectrum-InputGroup-input',
    {
      'is-disabled': isDisabled,
      'is-invalid': state.validationState === 'invalid'
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
  let timeGranularity = state.granularity === 'hour' || state.granularity === 'minute' || state.granularity === 'second' || state.granularity === 'millisecond' ? state.granularity : null;
  let showTimeField = !!timeGranularity;

  let visibleMonths = useVisibleMonths(maxVisibleMonths);

  return (
    <Field
      {...props}
      ref={targetRef}
      description={description}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      validationState={state.validationState}
      UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-fieldWrapper')}>
      <div
        {...styleProps}
        {...mergeProps(groupProps, hoverProps, focusProps)}
        className={className}>
        <Input
          isDisabled={isDisabled}
          isQuiet={isQuiet}
          validationState={state.validationState}
          autoFocus={autoFocus}
          className={classNames(styles, 'spectrum-InputGroup-field')}
          inputClassName={fieldClassName}>
          <DatePickerField
            {...startFieldProps}
            isQuiet={props.isQuiet}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired}
            validationState={state.validationState}
            placeholderValue={placeholderValue}
            value={value?.start || null}
            defaultValue={null}
            onChange={start => state.setDateTime('start', start)}
            granularity={props.granularity}
            hourCycle={props.hourCycle}
            inputClassName={classNames(datepickerStyles, 'react-spectrum-Datepicker-startField')} />
          <DateRangeDash />
          <DatePickerField
            {...endFieldProps}
            isQuiet={props.isQuiet}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired}
            validationState={state.validationState}
            placeholderValue={placeholderValue}
            value={value?.end || null}
            defaultValue={null}
            onChange={end => state.setDateTime('end', end)}
            granularity={props.granularity}
            hourCycle={props.hourCycle}
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
          onOpenChange={setOpen}>
          <FieldButton
            {...buttonProps}
            UNSAFE_className={classNames(styles, 'spectrum-FieldButton')}
            isQuiet={isQuiet}
            validationState={state.validationState}
            isDisabled={isDisabled || isReadOnly}>
            <CalendarIcon />
          </FieldButton>
          <Dialog UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-dialog')} {...dialogProps}>
            <Content UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-dialogContent')}>
              <RangeCalendar
                autoFocus
                value={state.dateRange}
                onChange={state.setDateRange}
                visibleMonths={visibleMonths}
                minValue={props.minValue}
                maxValue={props.maxValue} />
              {showTimeField &&
                <Flex gap="size-100" marginTop="size-100" UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-timeFields')}>
                  <TimeField
                    label="Start time"
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
                    label="End time"
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
