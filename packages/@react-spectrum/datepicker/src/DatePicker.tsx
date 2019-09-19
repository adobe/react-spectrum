import {Calendar} from '@react-spectrum/calendar';
import CalendarIcon from '@spectrum-icons/workflow/Calendar';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DatePickerField} from './DatePickerField';
import datepickerStyles from './index.css';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {FieldButton} from '@react-spectrum/button';
import {FocusRing, FocusScope} from '@react-aria/focus';
import React, {useRef} from 'react';
import {SpectrumDatePickerProps} from './types';
import '@spectrum-css/textfield/dist/index-vars.css'; // HACK: must be included BEFORE inputgroup
import styles from '@spectrum-css/inputgroup/dist/index-vars.css';
import {useDatePicker} from '@react-aria/datepicker';
import {useDatePickerState} from '@react-stately/datepicker';
import {useLocale} from '@react-aria/i18n';

export function DatePicker(props: SpectrumDatePickerProps) {
  let {
    autoFocus,
    formatOptions,
    isQuiet,
    isDisabled,
    isReadOnly,
    isRequired,
    placeholderDate,
    className,
    ...otherProps
  } = props;
  let state = useDatePickerState(props);
  let {comboboxProps, fieldProps, buttonProps, dialogProps} = useDatePicker(props, state);
  let {value, setValue, selectDate, isOpen, setOpen} = state;
  let targetRef = useRef<HTMLDivElement>();
  let {direction} = useLocale();

  className = classNames(
    styles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': state.validationState === 'invalid',
      'is-disabled': isDisabled
    },
    className
  );

  return (
    <FocusRing
      within
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...filterDOMProps(otherProps)}
        {...comboboxProps}
        className={className}
        ref={targetRef}>
        <FocusScope autoFocus={autoFocus}>
          <DatePickerField
            {...fieldProps}
            data-testid="date-field"
            isQuiet={isQuiet}
            validationState={state.validationState}
            value={value}
            onChange={setValue}
            placeholderDate={placeholderDate}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired}
            formatOptions={formatOptions}
            className={classNames(datepickerStyles, 'react-spectrum-Datepicker-endField')} />
        </FocusScope>
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
            className={classNames(styles, 'spectrum-FieldButton')}
            isQuiet={isQuiet}
            validationState={state.validationState}
            icon={<CalendarIcon />}
            isDisabled={isDisabled || isReadOnly} />
          <Dialog className={classNames(datepickerStyles, 'react-spectrum-Datepicker-dialog')} {...dialogProps}>
            <Calendar
              autoFocus
              value={value}
              onChange={selectDate} />
          </Dialog>
        </DialogTrigger>
      </div>
    </FocusRing>
  );
}
