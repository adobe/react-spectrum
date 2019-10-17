import {AllHTMLAttributes, useEffect} from 'react';
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import {SpinButtonProps, useSpinButton} from '@react-aria/spinbutton';
import {useId} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface NumberFieldProps extends SpinButtonProps {
  decrementAriaLabel?: string,
  incrementAriaLabel?: string
}

interface NumberFieldAria {
  numberFieldProps: AllHTMLAttributes<HTMLInputElement>,
  incrementButtonProps: AllHTMLAttributes<HTMLButtonElement>,
  decrementButtonProps: AllHTMLAttributes<HTMLButtonElement>
}

export function useNumberField(props: NumberFieldProps): NumberFieldAria {
  const {
    decrementAriaLabel,
    incrementAriaLabel,
    isDisabled,
    isReadOnly,
    isRequired,
    minValue,
    maxValue,
    onChange,
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

  const incrementButtonProps = {
    'aria-label': incrementAriaLabel || formatMessage('Increment'),
    'aria-controls': inputId,
    onPress: onIncrement,
    isDisabled: isDisabled || (value >= maxValue)
  };
  const decrementButtonProps = {
    'aria-label': decrementAriaLabel || formatMessage('Decrement'),
    'aria-controls': inputId,
    isDisabled: isDisabled || (value <= minValue),
    onPress: onDecrement
  };

  const handleInputScrollWheel = e => {
    // If the input isn't supposed to receive input, do nothing.
    // TODO: add focus
    if (isDisabled || isReadOnly) {
      return;
    }

    e.preventDefault();
    if (e.deltaY < 0) {
      onIncrement();
    } else {
      onDecrement();
    }
  };

  useEffect(() => {
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
  }, [inputId]);

  return {
    numberFieldProps: mergeProps(spinButtonProps, {
      'aria-label': value, // TODO: change this
      id: inputId,
      min: minValue,
      max: maxValue,
      onChange,
      placeholder: formatMessage('Enter a number'),
      type: 'number',
      step,
      value
    }),
    incrementButtonProps,
    decrementButtonProps
  };
}
