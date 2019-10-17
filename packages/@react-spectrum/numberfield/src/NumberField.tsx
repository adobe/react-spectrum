import {ActionButton} from '@react-spectrum/button';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing, FocusScope} from '@react-aria/focus';
import {HTMLElement} from 'react-dom';
import {InputBase, RangeInputBase, TextInputBase, ValidationState, ValueBase} from '@react-types/shared';
import React, {RefObject} from 'react';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css'; // HACK: must be included BEFORE inputgroup
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {TextField} from '@react-spectrum/textfield';
import {useNumberField} from '@react-aria/numberfield';
import {useProviderProps} from '@react-spectrum/provider';
import {useNumberFieldState} from '../../../@react-stately/numberfield/src';

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
  let {validationState, ...numberFieldState} = useNumberFieldState(otherProps);
  let {numberFieldProps, incrementButtonProps, decrementButtonProps} = useNumberField({
    ...completeProps,
    ...numberFieldState
  });

  className = classNames(
    styles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': validationState === 'invalid',
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
        {...filterDOMProps(completeProps)}
        ref={ref}
        className={classNames(stepperStyle, 'spectrum-Stepper', 'react-spectrum-Stepper', {'spectrum-Stepper--quiet': isQuiet}, className)}>
        <TextField
          // autoComplete="off""
          validationState={validationState as ValidationState}
          className={classNames(stepperStyle, 'spectrum-Stepper-input')}
          {...numberFieldProps} />
        {showStepper &&
        <FocusRing focusRingClass={classNames(stepperStyle, 'focus-ring')}>
          <span
            className={classNames(stepperStyle, 'spectrum-Stepper-buttons')}
            role="presentation">
            <ActionButton
              className={classNames(stepperStyle, 'spectrum-Stepper-stepUp')}
              {...incrementButtonProps}
              isQuiet={isQuiet}
              tabIndex={-1}>
              <ChevronUpSmall className={classNames(stepperStyle, 'spectrum-Stepper-stepUpIcon')} />
            </ActionButton>
            <ActionButton
              className={classNames(stepperStyle, 'spectrum-Stepper-stepDown')}
              {...decrementButtonProps}
              isQuiet={isQuiet}
              tabIndex={-1}>
              <ChevronDownSmall className={classNames(stepperStyle, 'spectrum-Stepper-stepDownIcon')} />
            </ActionButton>
          </span>
        </FocusRing>
        }
      </div>
    </FocusRing>
  );
});
