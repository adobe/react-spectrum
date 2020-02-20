import Alert from '@spectrum-icons/ui/AlertMedium';
import Checkmark from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames} from '@react-spectrum/utils';
import {DatePickerSegment} from './DatePickerSegment';
import datepickerStyles from './index.css';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {SpectrumDatePickerProps} from '@react-types/datepicker';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useDateField} from '@react-aria/datepicker';
import {useDatePickerFieldState} from '@react-stately/datepicker';

interface DateFieldDescProps extends DOMProps {
  children?: string,
  hidden?: boolean
}

export function DatePickerField(props: SpectrumDatePickerProps & {descProps?: DateFieldDescProps}) {
  let state = useDatePickerFieldState(props);
  let {
    isDisabled,
    isReadOnly,
    isRequired,
    isQuiet,
    validationState,
    descProps,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {fieldProps, segmentProps} = useDateField(props);
  let domProps = mergeProps(
    filterDOMProps(otherProps),
    fieldProps
  );

  let isInvalid = validationState === 'invalid';
  let textfieldClass = classNames(
    textfieldStyles,
    'spectrum-Textfield',
    {
      'is-invalid': isInvalid,
      'is-valid': validationState === 'valid',
      'spectrum-Textfield--quiet': isQuiet
    },
    classNames(datepickerStyles, 'react-spectrum-Datepicker-field'),
    styleProps.className
  );

  let inputClass = classNames(
    textfieldStyles,
    'spectrum-Textfield-input',
    {
      'is-disabled': isDisabled,
      'is-invalid': isInvalid
    },
    classNames(
      inputgroupStyles,
      'spectrum-InputGroup-field',
      {
        'is-disabled': isDisabled,
        'is-invalid': isInvalid
      }
    ),
    classNames(datepickerStyles, 'react-spectrum-Datepicker-input')
  );

  let iconClass = classNames(
    textfieldStyles,
    'spectrum-Textfield-validationIcon',
    {
      'is-invalid': isInvalid,
      'is-valid': validationState === 'valid'
    }
  );

  let validationIcon = null;
  if (validationState === 'invalid') {
    validationIcon = <Alert data-testid="invalid-icon" UNSAFE_className={iconClass} />;
  } else if (validationState === 'valid') {
    validationIcon = <Checkmark data-testid="valid-icon" UNSAFE_className={iconClass} />;
  }

  return (
    <div {...domProps} {...styleProps} className={textfieldClass}>
      {descProps && descProps.children && <span {...descProps} />}
      <div role="presentation" className={inputClass}>
        {state.segments.map((segment, i) =>
          (<DatePickerSegment
            {...segmentProps}
            key={i}
            segment={segment}
            state={state}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired} />)
        )}
      </div>
      {validationIcon}
    </div>
  );
}
