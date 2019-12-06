import {ActionButton} from '@react-spectrum/button';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps, InputBase, RangeInputBase, TextInputBase, ValueBase} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {HTMLElement} from 'react-dom';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import React, {RefObject} from 'react';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useNumberField} from '@react-aria/numberfield';
import {useNumberFieldState} from '@react-stately/numberfield';
import {useProviderProps} from '@react-spectrum/provider';

interface NumberField extends InputBase, TextInputBase, ValueBase<number>, RangeInputBase<number>, DOMProps, StyleProps {
  isQuiet?: boolean,
  decrementAriaLabel?: string,
  incrementAriaLabel?: string,
  showStepper?: boolean,
  formatOptions?: Intl.NumberFormatOptions
}

export const NumberField = React.forwardRef((props: NumberField, ref: RefObject<HTMLElement>) => {
  props = useProviderProps(props);
  let {
    // formatOptions,
    isQuiet,
    isDisabled,
    showStepper = true,
    autoFocus,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props);
  let {setValue, ...numberFieldState} = useNumberFieldState(otherProps);
  let {numberFieldProps, inputFieldProps, incrementButtonProps, decrementButtonProps} = useNumberField({
    ...props,
    ...numberFieldState as any // TODO
  });

  let className = classNames(
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
      styleProps.className
    )
  );

  return (
    <FocusRing
      within
      focusClass={classNames(inputgroupStyles, 'is-focused', classNames(stepperStyle, 'is-focused'))}
      focusRingClass={classNames(inputgroupStyles, 'focus-ring', classNames(stepperStyle, 'focus-ring'))}
      autoFocus={autoFocus}>
      <div
        {...filterDOMProps(props)}
        {...styleProps}
        {...numberFieldProps}
        ref={ref}
        className={className}>
        <TextFieldBase
          isQuiet={isQuiet}
          autoFocus={autoFocus}
          inputClassName={classNames(stepperStyle, 'spectrum-Stepper-input')}
          {...inputFieldProps as any}
          onChange={setValue} />
        {showStepper &&
        <span
          className={classNames(stepperStyle, 'spectrum-Stepper-buttons')}
          role="presentation">
          <ActionButton
            UNSAFE_className={
              classNames(
                stepperStyle, 
                'spectrum-Stepper-stepUp', 
                'spectrum-ActionButton'
              )
            }
            {...incrementButtonProps as any}
            isQuiet={isQuiet}>
            <ChevronUpSmall className={classNames(stepperStyle, 'spectrum-Stepper-stepUpIcon')} />
          </ActionButton>
          <ActionButton
            UNSAFE_className={
              classNames(
                stepperStyle, 
                'spectrum-Stepper-stepDown',
                'spectrum-ActionButton'
                )
              }
            {...decrementButtonProps as any}
            isQuiet={isQuiet}>
            <ChevronDownSmall className={classNames(stepperStyle, 'spectrum-Stepper-stepDownIcon')} />
          </ActionButton>
        </span>
        }
      </div>
    </FocusRing>
  );
});
