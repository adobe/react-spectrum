import {ActionButton} from '@react-spectrum/button';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {HTMLElement} from 'react-dom';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import React, {RefObject} from 'react';
import {SpectrumNumberFieldProps} from '@react-types/numberfield';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useNumberField} from '@react-aria/numberfield';
import {useNumberFieldState} from '@react-stately/numberfield';
import {useProviderProps} from '@react-spectrum/provider';

export const NumberField = React.forwardRef((props: SpectrumNumberFieldProps, ref: RefObject<HTMLElement>) => {
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
  let state = useNumberFieldState(otherProps);
  let {numberFieldProps, inputFieldProps, incrementButtonProps, decrementButtonProps} = useNumberField({
    ...props,
    ...state
  });

  let className = classNames(
    inputgroupStyles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': state.validationState === 'invalid',
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
          onChange={state.setValue} />
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
            {...incrementButtonProps}
            isQuiet={isQuiet}>
            <ChevronUpSmall UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-stepUpIcon')} />
          </ActionButton>
          <ActionButton
            UNSAFE_className={
              classNames(
                stepperStyle,
                'spectrum-Stepper-stepDown',
                'spectrum-ActionButton'
              )
            }
            {...decrementButtonProps}
            isQuiet={isQuiet}>
            <ChevronDownSmall UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-stepDownIcon')} />
          </ActionButton>
        </span>
        }
      </div>
    </FocusRing>
  );
});
