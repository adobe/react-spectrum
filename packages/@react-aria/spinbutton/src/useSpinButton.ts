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

import {announce, clearAnnouncer} from '@react-aria/live-announcer';
import {AriaButtonProps} from '@react-types/button';
import {DOMAttributes, InputBase, RangeInputBase, Validation, ValueBase} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useCallback, useEffect, useRef} from 'react';
import {useEffectEvent, useGlobalListeners} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';


export interface SpinButtonProps extends InputBase, Validation<number>, ValueBase<number>, RangeInputBase<number> {
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
  const _async = useRef<number>(undefined);
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
  const stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/spinbutton');

  let prevTouchPosition = useRef<{x: number, y: number} | null>(null);
  let isSpinning = useRef(false);
  const clearAsync = () => {
    clearTimeout(_async.current);
    isSpinning.current = false;
  };


  useEffect(() => {
    return () => clearAsync();
  }, []);

  let onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || isReadOnly || e.nativeEvent.isComposing) {
      return;
    }

    switch (e.key) {
      case 'PageUp':
        if (onIncrementPage) {
          e.preventDefault();
          onIncrementPage?.();
          break;
        }
      // fallthrough!
      case 'ArrowUp':
      case 'Up':
        if (onIncrement) {
          e.preventDefault();
          onIncrement?.();
        }
        break;
      case 'PageDown':
        if (onDecrementPage) {
          e.preventDefault();
          onDecrementPage?.();
          break;
        }
      // fallthrough
      case 'ArrowDown':
      case 'Down':
        if (onDecrement) {
          e.preventDefault();
          onDecrement?.();
        }
        break;
      case 'Home':
        if (onDecrementToMin) {
          e.preventDefault();
          onDecrementToMin?.();
        }
        break;
      case 'End':
        if (onIncrementToMax) {
          e.preventDefault();
          onIncrementToMax?.();
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

  // Replace Unicode hyphen-minus (U+002D) with minus sign (U+2212).
  // This ensures that macOS VoiceOver announces it as "minus" even with other characters between the minus sign
  // and the number (e.g. currency symbol). Otherwise it announces nothing because it assumes the character is a hyphen.
  // In addition, replace the empty string with the word "Empty" so that iOS VoiceOver does not read "50%" for an empty field.
  let ariaTextValue = textValue === '' ? stringFormatter.format('Empty') : (textValue || `${value}`).replace('-', '\u2212');

  useEffect(() => {
    if (isFocused.current) {
      clearAnnouncer('assertive');
      announce(ariaTextValue, 'assertive');
    }
  }, [ariaTextValue]);

  // For touch users, if they move their finger like they're scrolling, we don't want to trigger a spin.
  let onTouchMove = useCallback((e) => {
    if (!prevTouchPosition.current) {
      prevTouchPosition.current = {x: e.touches[0].clientX, y: e.touches[0].clientY};
    }
    let touchPosition = {x: e.touches[0].clientX, y: e.touches[0].clientY};
    // Arbitrary distance that worked in testing.
    if (Math.abs(touchPosition.x - prevTouchPosition.current.x) > 10 || Math.abs(touchPosition.y - prevTouchPosition.current.y) > 10) {
      clearAsync();
    }
    prevTouchPosition.current = touchPosition;
  }, []);

  const onIncrementPressStart = useEffectEvent(
    (initialStepDelay: number) => {
      clearAsync();
      isSpinning.current = true;
      onIncrement?.();
      // Start spinning after initial delay
      _async.current = window.setTimeout(
        () => {
          if ((maxValue === undefined || isNaN(maxValue)) || (value === undefined || isNaN(value)) || value < maxValue) {
            onIncrementPressStart(60);
          }
        },
        initialStepDelay
      );
    }
  );

  const onDecrementPressStart = useEffectEvent(
    (initialStepDelay: number) => {
      clearAsync();
      isSpinning.current = true;
      onDecrement?.();
      // Start spinning after initial delay
      _async.current = window.setTimeout(
        () => {
          if ((minValue === undefined || isNaN(minValue)) || (value === undefined || isNaN(value)) || value > minValue) {
            onDecrementPressStart(60);
          }
        },
        initialStepDelay
      );
    }
  );

  let cancelContextMenu = (e) => {
    e.preventDefault();
  };

  let {addGlobalListener, removeAllGlobalListeners} = useGlobalListeners();

  // Tracks in touch if the press end event was preceded by a press up.
  // If it wasn't, then we know the finger left the button while still in contact with the screen.
  // This means that the user is trying to scroll or interact in some way that shouldn't trigger
  // an increment or decrement.
  let isUp = useRef(false);

  return {
    spinButtonProps: {
      role: 'spinbutton',
      'aria-valuenow': value !== undefined && !isNaN(value) ? value : undefined,
      'aria-valuetext': ariaTextValue,
      'aria-valuemin': minValue,
      'aria-valuemax': maxValue,
      'aria-disabled': isDisabled || undefined,
      'aria-readonly': isReadOnly || undefined,
      'aria-required': isRequired || undefined,
      onKeyDown,
      onFocus,
      onBlur
    },
    incrementButtonProps: {
      onPressStart: (e) => {
        if (e.pointerType !== 'touch') {
          onIncrementPressStart(400);
        } else {
          if (_async.current) {
            clearAsync();
          }
          // For touch users, don't trigger an increment on press start, we'll wait for the press end to trigger it if
          // the control isn't spinning.
          _async.current = window.setTimeout(() => {
            onIncrementPressStart(60);
          }, 400);

          addGlobalListener(window, 'touchmove', onTouchMove, {capture: true});
          isUp.current = false;
        }
        addGlobalListener(window, 'contextmenu', cancelContextMenu);
      },
      onPressUp: (e) => {
        if (e.pointerType === 'touch') {
          isUp.current = true;
        }
        prevTouchPosition.current = null;
        clearAsync();
        removeAllGlobalListeners();
      },
      onPressEnd: (e) => {
        if (e.pointerType === 'touch') {
          if (!isSpinning.current && isUp.current) {
            onIncrement?.();
          }
        }
        isUp.current = false;
      },
      onFocus,
      onBlur
    },
    decrementButtonProps: {
      onPressStart: (e) => {
        if (e.pointerType !== 'touch') {
          onDecrementPressStart(400);
        } else {
          if (_async.current) {
            clearAsync();
          }
          // For touch users, don't trigger an increment on press start, we'll wait for the press end to trigger it if
          // the control isn't spinning.
          _async.current = window.setTimeout(() => {
            onDecrementPressStart(60);
          }, 400);

          addGlobalListener(window, 'touchmove', onTouchMove, {capture: true});
          isUp.current = false;
        }
      },
      onPressUp: (e) => {
        if (e.pointerType === 'touch') {
          isUp.current = true;
        }
        prevTouchPosition.current = null;
        clearAsync();
        removeAllGlobalListeners();
      },
      onPressEnd: (e) => {
        if (e.pointerType === 'touch') {
          if (!isSpinning.current && isUp.current) {
            onDecrement?.();
          }
        }
        isUp.current = false;
      },
      onFocus,
      onBlur
    }
  };
}
