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
import {DOMAttributes, InputBase, RangeInputBase, Validation, ValueBase} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useGlobalListeners} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';


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
  spinButtonProps: DOMAttributes,
  incrementButtonProps: AriaButtonProps,
  decrementButtonProps: AriaButtonProps
}

export function useSpinButton(
  props: SpinButtonProps
): SpinbuttonAria {
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
  const stringFormatter = useLocalizedStringFormatter(intlMessages);

  const _async = useRef<number>();
  const clearAsync = useCallback(() => clearTimeout(_async.current), [_async]);
  // only run on unmount
  useEffect(() => {
    return () => clearAsync();
  }, [clearAsync]);

  let onKeyDown = useCallback((e) => {
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
        if (onDecrementToMin) {
          e.preventDefault();
          onDecrementToMin();
        }
        break;
      case 'End':
        if (onIncrementToMax) {
          e.preventDefault();
          onIncrementToMax();
        }
        break;
    }
  }, [isReadOnly, onIncrementPage, onIncrement, onDecrementPage, onDecrement, onDecrementToMin, onIncrementToMax]);

  let isFocused = useRef(false);
  let onFocus = useCallback(() => {
    isFocused.current = true;
  }, [isFocused]);

  let onBlur = useCallback(() => {
    isFocused.current = false;
  }, [isFocused]);

  // Replace Unicode hyphen-minus (U+002D) with minus sign (U+2212).
  // This ensures that macOS VoiceOver announces it as "minus" even with other characters between the minus sign
  // and the number (e.g. currency symbol). Otherwise it announces nothing because it assumes the character is a hyphen.
  // In addition, replace the empty string with the word "Empty" so that iOS VoiceOver does not read "50%" for an empty field.
  textValue = useMemo(
    () => textValue === '' ? stringFormatter.format('Empty') : (textValue || `${value}`).replace('-', '\u2212')
  , [textValue, stringFormatter, value]);

  useEffect(() => {
    if (isFocused.current) {
      announce(textValue, 'assertive');
    }
  }, [textValue]);

  const onIncrementPressStart = useCallback(
    (initialStepDelay: number) => {
      clearAsync();
      onIncrement();
      // Start spinning after initial delay
      _async.current = window.setTimeout(
        () => {
          if (isNaN(maxValue) || isNaN(value) || value < maxValue) {
            onIncrementPressStart(60);
          }
        },
        initialStepDelay
      );
    },
    [onIncrement, maxValue, value, clearAsync, _async]
  );

  const onDecrementPressStart = useCallback(
    (initialStepDelay: number) => {
      clearAsync();
      onDecrement();
      // Start spinning after initial delay
      _async.current = window.setTimeout(
        () => {
          if (isNaN(minValue) || isNaN(value) || value > minValue) {
            onDecrementPressStart(60);
          }
        },
        initialStepDelay
      );
    },
    [onDecrement, minValue, value, clearAsync, _async]
  );

  let cancelContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  let {addGlobalListener, removeAllGlobalListeners} = useGlobalListeners();

  return {
    spinButtonProps: {
      role: 'spinbutton',
      'aria-valuenow': !isNaN(value) ? value : null,
      'aria-valuetext': textValue,
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
      onPressStart: useCallback(() => {
        onIncrementPressStart(400);
        addGlobalListener(window, 'contextmenu', cancelContextMenu);
      }, [onIncrementPressStart, addGlobalListener, cancelContextMenu]),
      onPressEnd: useCallback(() => {
        clearAsync();
        removeAllGlobalListeners();
      }, [clearAsync, removeAllGlobalListeners]),
      onFocus,
      onBlur
    },
    decrementButtonProps: {
      onPressStart: useCallback(() => {
        onDecrementPressStart(400);
        addGlobalListener(window, 'contextmenu', cancelContextMenu);
      }, [onDecrementPressStart, addGlobalListener, cancelContextMenu]),
      onPressEnd: useCallback(() => {
        clearAsync();
        removeAllGlobalListeners();
      }, [clearAsync, removeAllGlobalListeners]),
      onFocus,
      onBlur
    }
  };
}
