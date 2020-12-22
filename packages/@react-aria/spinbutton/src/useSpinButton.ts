/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {announce} from '@react-aria/live-announcer';
import {AriaButtonProps} from '@react-types/button';
import {HTMLAttributes, useCallback, useEffect, useRef} from 'react';
import {InputBase, RangeInputBase, Validation, ValueBase} from '@react-types/shared';


export interface SpinButtonProps extends InputBase, Validation, ValueBase<number>, RangeInputBase<number> {
  textValue?: string,
  onIncrement?: () => void,
  onIncrementPage?: () => void,
  onDecrement?: () => void,
  onDecrementPage?: () => void,
  onDecrementToMin?: () => void,
  onIncrementToMax?: () => void
}

export interface SpinbuttonAria {
  spinButtonProps: HTMLAttributes<HTMLDivElement>,
  incrementButtonProps: AriaButtonProps,
  decrementButtonProps: AriaButtonProps
}

export function useSpinButton(
  props: SpinButtonProps
): SpinbuttonAria {
  const _async = useRef<number>();
  let {
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
  } = props;

  const clearAsync = () => clearTimeout(_async.current);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => clearAsync();
  }, []);

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

  const onIncrementPressStart = useCallback(
    (initialStepDelay: number) => {
      onIncrement();
      // Start spinning after initial delay
      _async.current = window.setTimeout(
        () => onIncrementPressStart(60),
        initialStepDelay
      );
    },
    [onIncrement]
  );

  const onDecrementPressStart = useCallback(
    (initialStepDelay: number) => {
      onDecrement();
      // Start spinning after initial delay
      _async.current = window.setTimeout(
        () => onDecrementPressStart(60),
        initialStepDelay
      );
    },
    [onDecrement]
  );

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
    },
    incrementButtonProps: {
      onPressStart: () => onIncrementPressStart(400),
      onPressEnd: clearAsync
    },
    decrementButtonProps: {
      onPressStart: () => onDecrementPressStart(400),
      onPressEnd: clearAsync
    }
  };
}
