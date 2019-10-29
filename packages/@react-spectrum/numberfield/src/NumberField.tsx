import {ActionButton} from '@react-spectrum/button';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {HTMLElement} from 'react-dom';
import {InputBase, RangeInputBase, TextInputBase, ValidationState, ValueBase} from '@react-types/shared';
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
  let {validationState, ...numberFieldState} = useNumberFieldState(otherProps);
  let {numberFieldProps, incrementButtonProps, decrementButtonProps} = useNumberField({
    ...completeProps,
    ...numberFieldState
  });

  className = classNames(
    inputgroupStyles,
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
      focusClass={classNames(inputgroupStyles, 'is-focused')}
      focusRingClass={classNames(inputgroupStyles, 'focus-ring')}>
      <div
        {...filterDOMProps(completeProps)}
        ref={ref}
        className={classNames(
          stepperStyle,
          'spectrum-Stepper',
          'react-spectrum-Stepper',
          {'spectrum-Stepper--quiet': isQuiet},
          className
        )}>
        <TextField
          // autoComplete="off""
          validationState={validationState as ValidationState}
          isQuiet={isQuiet}
          className={`${classNames(stepperStyle, 'spectrum-Stepper-input')} ${classNames(inputgroupStyles, 'spectrum-FieldButton')}`}
          {...numberFieldProps} />
        {showStepper &&
        <span
          className={classNames(stepperStyle, 'spectrum-Stepper-buttons')}
          role="presentation">
          <ActionButton
            className={`${classNames(inputgroupStyles, 'spectrum-FieldButton')} ${classNames(stepperStyle, 'spectrum-Stepper-stepUp')}`}
            {...incrementButtonProps}
            isQuiet={isQuiet}
            tabIndex={-1}>
            <ChevronUpSmall className={classNames(stepperStyle, 'spectrum-Stepper-stepUpIcon')} />
          </ActionButton>
          <ActionButton
            className={`${classNames(inputgroupStyles, 'spectrum-FieldButton')} ${classNames(stepperStyle, 'spectrum-Stepper-stepDown')}`}
            {...decrementButtonProps}
            isQuiet={isQuiet}
            tabIndex={-1}>
            <ChevronDownSmall className={classNames(stepperStyle, 'spectrum-Stepper-stepDownIcon')} />
          </ActionButton>
        </span>
        }
      </div>
    </FocusRing>
  );
});
