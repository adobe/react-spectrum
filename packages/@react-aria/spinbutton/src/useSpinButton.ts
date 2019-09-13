import {announce} from '@react-aria/live-announcer';
import {HTMLAttributes, useEffect, useRef} from 'react';
import {InputBase, RangeInputBase, ValueBase} from '@react-types/shared';

export interface SpinButtonProps extends InputBase, ValueBase<number>, RangeInputBase<number> {
  textValue?: string,
  onIncrement?: () => void,
  onIncrementPage?: () => void,
  onDecrement?: () => void,
  onDecrementPage?: () => void,
  onDecrementToMin?: () => void,
  onIncrementToMax?: () => void
}

export interface SpinbuttonAria {
  spinButtonProps: HTMLAttributes<HTMLDivElement>
}

export function useSpinButton({
  value,
  textValue,
  minValue,
  maxValue,
  isDisabled,
  isReadOnly,
  isRequired,
  onIncrement,
  onIncrementPage,
  onDecrement,
  onDecrementPage,
  onDecrementToMin,
  onIncrementToMax
}: SpinButtonProps): SpinbuttonAria {  
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
        break;
      case 'Home':
        if (minValue != null && onDecrementToMin) {
          e.preventDefault();
          onDecrementToMin();
        }
        break;
      case 'End':
        if (maxValue != null && onIncrementToMax) {
          e.preventDefault();
          onIncrementToMax();
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
      'aria-valuenow': value,
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
