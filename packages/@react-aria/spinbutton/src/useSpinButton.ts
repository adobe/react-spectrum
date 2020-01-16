import {announce} from '@react-aria/live-announcer';
import {HTMLAttributes, useEffect, useRef} from 'react';
import {InputBase, RangeInputBase, ValueBase} from '@react-types/shared';

export interface SpinButtonProps extends InputBase, ValueBase<number>, RangeInputBase<number> {
  textValue?: string,
  increment?: () => void,
  onIncrement?: () => void,
  onIncrementPage?: () => void,
  decrement?: () => void,
  onDecrement?: () => void,
  onDecrementPage?: () => void,
  decrementToMin?: () => void,
  onDecrementToMin?: () => void,
  incrementToMax?: () => void,
  onIncrementToMax?: () => void
}

export interface SpinbuttonAria {
  spinButtonProps: HTMLAttributes<HTMLDivElement>
}

export function useSpinButton(props: SpinButtonProps): SpinbuttonAria {
  let {
    value,
    textValue,
    minValue,
    maxValue,
    isDisabled,
    isReadOnly,
    isRequired,
    increment,
    onIncrement,
    onIncrementPage,
    decrement,
    onDecrement,
    onDecrementPage,
    decrementToMin,
    onDecrementToMin,
    incrementToMax,
    onIncrementToMax
  } = props;

  let onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || isReadOnly) {
      return;
    }

    switch (e.key) {
      case 'PageUp':
        if (onIncrementPage) {
          e.preventDefault();
          onIncrementPage();
          break;
        }
        // fallthrough!
      case 'ArrowUp':
      case 'Up':
        if (onIncrement) {
          e.preventDefault();
          onIncrement();
        }
        if (increment) {
          e.preventDefault();
          increment();
        }
        break;
      case 'PageDown':
        if (onDecrementPage) {
          e.preventDefault();
          onDecrementPage();
          break;
        }
        // fallthrough
      case 'ArrowDown':
      case 'Down':
        if (onDecrement) {
          e.preventDefault();
          onDecrement();
        }
        if (decrement) {
          e.preventDefault();
          decrement();
        }
        break;
      case 'Home':
        if (minValue != null && onDecrementToMin) {
          e.preventDefault();
          onDecrementToMin();
        }
        if (minValue != null && decrementToMin) {
          e.preventDefault();
          decrementToMin();
        }
        break;
      case 'End':
        if (maxValue != null && onIncrementToMax) {
          e.preventDefault();
          onIncrementToMax();
        }
        if (maxValue != null && incrementToMax) {
          e.preventDefault();
          incrementToMax();
        }
        break;
    }
  };

  let isFocused = useRef(false);
  let onFocus = () => {
    isFocused.current = true;
  };

  let onBlur = () => {
    isFocused.current = false;
  };

  useEffect(() => {
    if (isFocused.current) {
      announce(textValue || `${value}`);
    }
  }, [textValue, value]);

  return {
    spinButtonProps: {
      role: 'spinbutton',
      'aria-valuenow': typeof value === 'number' ? value : null,
      'aria-valuetext': textValue || null,
      'aria-valuemin': minValue,
      'aria-valuemax': maxValue,
      'aria-disabled': isDisabled || null,
      'aria-readonly': isReadOnly || null,
      'aria-required': isRequired || null,
      onKeyDown,
      onFocus,
      onBlur
    }
  };
}
