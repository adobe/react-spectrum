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
import '@adobe/spectrum-css-temp/components/textfield/vars.css'; // HACK: must be included BEFORE inputgroup
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {useDatePicker} from '@react-aria/datepicker';
import {useDatePickerState} from '@react-stately/datepicker';
import {useLocale} from '@react-aria/i18n';
import {useStyleProps} from '@react-spectrum/view';

export function DatePicker(props: SpectrumDatePickerProps) {
  let {
    autoFocus,
    formatOptions,
    isQuiet,
    isDisabled,
    isReadOnly,
    isRequired,
    placeholderDate,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let state = useDatePickerState(props);
  let {comboboxProps, fieldProps, buttonProps, dialogProps} = useDatePicker(props, state);
  let {value, setValue, selectDate, isOpen, setOpen} = state;
  let targetRef = useRef<HTMLDivElement>();
  let {direction} = useLocale();

  let className = classNames(
    styles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': state.validationState === 'invalid',
      'is-disabled': isDisabled
    },
    styleProps.className
  );

  return (
    <FocusRing
      within
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...filterDOMProps(otherProps)}
        {...styleProps}
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
            UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-endField')} />
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
            UNSAFE_className={classNames(styles, 'spectrum-FieldButton')}
            isQuiet={isQuiet}
            validationState={state.validationState}
            icon={<CalendarIcon />}
            isDisabled={isDisabled || isReadOnly} />
          <Dialog UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-dialog')} {...dialogProps}>
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
