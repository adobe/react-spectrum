import {ActionButton} from '@react-spectrum/button';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {HTMLElement} from 'react-dom';
import {InputBase, RangeInputBase, TextInputBase, ValueBase} from '@react-types/shared';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import React, {RefObject} from 'react';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css'; // HACK: must be included BEFORE inputgroup
import {TextField} from '@react-spectrum/textfield';
import {useNumberField} from '@react-aria/numberfield';
import {useNumberFieldState} from '@react-stately/numberfield';
import {useProviderProps} from '@react-spectrum/provider';

interface NumberField extends InputBase, TextInputBase, ValueBase<number>, RangeInputBase<number> {
  isQuiet?: boolean,
  decrementAriaLabel?: string,
  incrementAriaLabel?: string,
  showStepper?: boolean,
  formatOptions?: Intl.NumberFormatOptions
}

export const NumberField = React.forwardRef((props: NumberField, ref: RefObject<HTMLElement>) => {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, useProviderProps(props));
  let {
    // formatOptions,
    isQuiet,
    isDisabled,
    // isReadOnly,
    // isRequired,
    className,
    showStepper = true,
    ...otherProps
  } = completeProps;
  let {onChange, ...numberFieldState} = useNumberFieldState(otherProps);
  let {numberFieldProps, inputFieldProps, incrementButtonProps, decrementButtonProps} = useNumberField({
    ...completeProps,
    ...numberFieldState
  });

  className = classNames(
    inputgroupStyles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': numberFieldState.validationState === 'invalid',
      'is-disabled': isDisabled
    },
    classNames(
      stepperStyle,
      'spectrum-Stepper',
      {'spectrum-Stepper--quiet': isQuiet},
      className
    )
  );

  return (
    <FocusRing
      within
      focusClass={classNames(inputgroupStyles, 'is-focused', classNames(stepperStyle, 'is-focused'))}
      focusRingClass={classNames(inputgroupStyles, 'focus-ring', classNames(stepperStyle, 'focus-ring'))}>
      <div
        {...filterDOMProps(completeProps, {
          value: false,
          defaultValue: false,
          onChange: false
        })}
        {...numberFieldProps}
        ref={ref}
        className={className}>
        <TextField
          isQuiet={isQuiet}
          className={classNames(stepperStyle, 'spectrum-Stepper-input')}
          {...inputFieldProps}
          onChange={onChange} />
        {showStepper &&
        <span
          className={classNames(stepperStyle, 'spectrum-Stepper-buttons')}
          role="presentation">
          <ActionButton
            className={classNames(stepperStyle, 'spectrum-Stepper-stepUp')}
            {...incrementButtonProps}
            isQuiet={isQuiet}>
            <ChevronUpSmall className={classNames(stepperStyle, 'spectrum-Stepper-stepUpIcon')} />
          </ActionButton>
          <ActionButton
            className={classNames(stepperStyle, 'spectrum-Stepper-stepDown')}
            {...decrementButtonProps}
            isQuiet={isQuiet}>
            <ChevronDownSmall className={classNames(stepperStyle, 'spectrum-Stepper-stepDownIcon')} />
          </ActionButton>
        </span>
        }
      </div>
    </FocusRing>
  );
});
