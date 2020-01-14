import {AllHTMLAttributes, useEffect} from 'react';
import intlMessages from '../intl/*.json';
import {mergeProps, useId} from '@react-aria/utils';
import {NumberFieldState} from '@react-stately/numberfield';
import {SpinButtonProps, useSpinButton} from '@react-aria/spinbutton';
import {useMessageFormatter} from '@react-aria/i18n';

interface NumberFieldProps extends SpinButtonProps {
  decrementAriaLabel?: string,
  incrementAriaLabel?: string
}

interface NumberFieldAria {
  inputFieldProps: AllHTMLAttributes<HTMLInputElement>,
  numberFieldProps: AllHTMLAttributes<HTMLDivElement>,
  incrementButtonProps: AllHTMLAttributes<HTMLButtonElement>,
  decrementButtonProps: AllHTMLAttributes<HTMLButtonElement>
}

export function useNumberField(props: NumberFieldProps, state: NumberFieldState): NumberFieldAria {
  let {
    decrementAriaLabel,
    incrementAriaLabel,
    isDisabled,
    isReadOnly,
    isRequired,
    minValue,
    maxValue,
    onIncrement,
    onIncrementToMax,
    onDecrement,
    onDecrementToMin,
    step,
    value
  } = props;
  const formatMessage = useMessageFormatter(intlMessages);
  const inputId = useId();

  const {spinButtonProps} = useSpinButton({
    isDisabled,
    isReadOnly,
    isRequired,
    maxValue,
    minValue,
    onIncrement,
    onIncrementToMax,
    onDecrement,
    onDecrementToMin,
    value
  });

  incrementAriaLabel = incrementAriaLabel || formatMessage('Increment');
  decrementAriaLabel = decrementAriaLabel || formatMessage('Decrement');

  const incrementButtonProps = {
    'aria-label': incrementAriaLabel,
    'aria-controls': inputId,
    tabIndex: -1,
    title: incrementAriaLabel,
    isDisabled: isDisabled || (state.value >= maxValue) || isReadOnly,
    onPress: state.onIncrement,
    onMouseDown: e => e.preventDefault(),
    onMouseUp: e => e.preventDefault()
  };
  const decrementButtonProps = {
    'aria-label': decrementAriaLabel,
    'aria-controls': inputId,
    tabIndex: -1,
    title: decrementAriaLabel,
    isDisabled: isDisabled || (state.value <= minValue || isReadOnly),
    onPress: state.onDecrement,
    onMouseDown: e => e.preventDefault(),
    onMouseUp: e => e.preventDefault()
  };

  useEffect(() => {
    const handleInputScrollWheel = e => {
      // If the input isn't supposed to receive input, do nothing.
      // TODO: add focus
      if (isDisabled || isReadOnly) {
        return;
      }

      e.preventDefault();
      if (e.deltaY < 0) {
        state.onIncrement();
      } else {
        state.onDecrement();
      }
    };

    document.getElementById(inputId).addEventListener(
      'wheel',
      handleInputScrollWheel,
      {passive: false}
    );
    return () => {
      document.getElementById(inputId).removeEventListener(
        'wheel',
        handleInputScrollWheel
      );
    };
  }, [inputId, isReadOnly, isDisabled, state.onDecrement, state.onIncrement]);

  return {
    numberFieldProps: {
      role: 'group',
      'aria-label': props['aria-label'] || null,
      'aria-labelledby': props['aria-labelledby'] || null,
      'aria-disabled': isDisabled,
      'aria-invalid': state.validationState === 'invalid'
    },
    inputFieldProps: mergeProps(spinButtonProps, {
      autoComplete: 'off',
      'aria-label': props['aria-label'] || null,
      'aria-labelledby': props['aria-labelledby'] || null,
      id: inputId,
      isDisabled,
      isReadOnly,
      isRequired,
      min: minValue,
      max: maxValue,
      placeholder: formatMessage('Enter a number'),
      type: 'number',
      step
    }),
    incrementButtonProps,
    decrementButtonProps
  };
}
