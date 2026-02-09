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
import {useCallback, useEffect, useRef, useState} from 'react';
import {useEffectEvent, useGlobalListeners} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';


const noop = () => {};

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

  let isSpinning = useRef(false);
  const clearAsync = useCallback(() => {
    clearTimeout(_async.current);
    isSpinning.current = false;
  }, []);
  const clearAsyncEvent = useEffectEvent(() => {
    clearAsync();
  });

  useEffect(() => {
    return () => clearAsyncEvent();
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
  let onPointerCancel = useCallback(() => {
    clearAsync();
  }, [clearAsync]);

  const onIncrementEvent = useEffectEvent(onIncrement ?? noop);
  const onDecrementEvent = useEffectEvent(onDecrement ?? noop);

  const stepUpEvent = useEffectEvent(() => {
    if (maxValue === undefined || isNaN(maxValue) || value === undefined || isNaN(value) || value < maxValue) {
      onIncrementEvent();
      onIncrementPressStartEvent(60);
    }
  });

  const onIncrementPressStartEvent = useEffectEvent((initialStepDelay: number) => {
    clearAsyncEvent();
    isSpinning.current = true;
    // Start spinning after initial delay
    _async.current = window.setTimeout(stepUpEvent, initialStepDelay);
  });

  const stepDownEvent = useEffectEvent(() => {
    if (minValue === undefined || isNaN(minValue) || value === undefined || isNaN(value) || value > minValue) {
      onDecrementEvent();
      onDecrementPressStartEvent(60);
    }
  });

  const onDecrementPressStartEvent = useEffectEvent((initialStepDelay: number) => {
    clearAsyncEvent();
    isSpinning.current = true;
    // Start spinning after initial delay
    _async.current = window.setTimeout(stepDownEvent, initialStepDelay);
  });

  let cancelContextMenu = (e) => {
    e.preventDefault();
  };

  let {addGlobalListener, removeAllGlobalListeners} = useGlobalListeners();

  // Tracks in touch if the press end event was preceded by a press up.
  // If it wasn't, then we know the finger left the button while still in contact with the screen.
  // This means that the user is trying to scroll or interact in some way that shouldn't trigger
  // an increment or decrement.
  let isUp = useRef(false);

  let [isIncrementPressed, setIsIncrementPressed] = useState<'touch' | 'mouse' | null>(null);
  useEffect(() => {
    if (isIncrementPressed === 'touch') {
      onIncrementPressStartEvent(600);
    } else if (isIncrementPressed) {
      onIncrementPressStartEvent(400);
    }
  }, [isIncrementPressed]);

  let [isDecrementPressed, setIsDecrementPressed] = useState<'touch' | 'mouse' | null>(null);
  useEffect(() => {
    if (isDecrementPressed === 'touch') {
      onDecrementPressStartEvent(600);
    } else if (isDecrementPressed) {
      onDecrementPressStartEvent(400);
    }
  }, [isDecrementPressed]);

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
        clearAsync();
        if (e.pointerType !== 'touch') {
          onIncrement?.();
          setIsIncrementPressed('mouse');
        } else {
          addGlobalListener(window, 'pointercancel', onPointerCancel, {capture: true});
          isUp.current = false;
          // For touch users, don't trigger a decrement on press start, we'll wait for the press end to trigger it if
          // the control isn't spinning.
          setIsIncrementPressed('touch');
        }
        addGlobalListener(window, 'contextmenu', cancelContextMenu);
      },
      onPressUp: (e) => {
        clearAsync();
        if (e.pointerType === 'touch') {
          isUp.current = true;
        }
        removeAllGlobalListeners();
        setIsIncrementPressed(null);
      },
      onPressEnd: (e) => {
        clearAsync();
        if (e.pointerType === 'touch') {
          if (!isSpinning.current && isUp.current) {
            onIncrement?.();
          }
        }
        isUp.current = false;
        setIsIncrementPressed(null);
      },
      onFocus,
      onBlur
    },
    decrementButtonProps: {
      onPressStart: (e) => {
        clearAsync();
        if (e.pointerType !== 'touch') {
          onDecrement?.();
          setIsDecrementPressed('mouse');
        } else {
          addGlobalListener(window, 'pointercancel', onPointerCancel, {capture: true});
          isUp.current = false;
          // For touch users, don't trigger a decrement on press start, we'll wait for the press end to trigger it if
          // the control isn't spinning.
          setIsDecrementPressed('touch');
        }
      },
      onPressUp: (e) => {
        clearAsync();
        if (e.pointerType === 'touch') {
          isUp.current = true;
        }
        removeAllGlobalListeners();
        setIsDecrementPressed(null);
      },
      onPressEnd: (e) => {
        clearAsync();
        if (e.pointerType === 'touch') {
          if (!isSpinning.current && isUp.current) {
            onDecrement?.();
          }
        }
        isUp.current = false;
        setIsDecrementPressed(null);
      },
      onFocus,
      onBlur
    }
  };
}
