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

import {DateFieldState, DateSegment} from '@react-stately/datepicker';
import {getScrollParent, isIOS, isMac, mergeProps, scrollIntoView, useEvent, useId, useLabels} from '@react-aria/utils';
import {hookData} from './useDateField';
import {NumberParser} from '@internationalized/number';
import React, {HTMLAttributes, RefObject, useMemo, useRef} from 'react';
import {useDateFormatter, useFilter, useLocale} from '@react-aria/i18n';
import {useDisplayNames} from './useDisplayNames';
import {usePress} from '@react-aria/interactions';
import {useSpinButton} from '@react-aria/spinbutton';

interface DateSegmentAria {
  /** Props for the segment element. */
  segmentProps: HTMLAttributes<HTMLDivElement>
}

/**
 * Provides the behavior and accessibility implementation for a segment in a date field.
 * A date segment displays an individual unit of a date and time, and allows users to edit
 * the value by typing or using the arrow keys to increment and decrement.
 */
export function useDateSegment(segment: DateSegment, state: DateFieldState, ref: RefObject<HTMLElement>): DateSegmentAria {
  let enteredKeys = useRef('');
  let {locale, direction} = useLocale();
  let displayNames = useDisplayNames();
  let {ariaLabel, ariaLabelledBy, ariaDescribedBy, focusManager} = hookData.get(state);

  let textValue = segment.text;
  let options = useMemo(() => state.dateFormatter.resolvedOptions(), [state.dateFormatter]);
  let monthDateFormatter = useDateFormatter({month: 'long', timeZone: options.timeZone});
  let hourDateFormatter = useDateFormatter({
    hour: 'numeric',
    hour12: options.hour12,
    timeZone: options.timeZone
  });

  if (segment.type === 'month') {
    let monthTextValue = monthDateFormatter.format(state.dateValue);
    textValue = monthTextValue !== textValue ? `${textValue} – ${monthTextValue}` : monthTextValue;
  } else if (segment.type === 'hour') {
    textValue = hourDateFormatter.format(state.dateValue);
  }

  let {spinButtonProps} = useSpinButton({
    value: segment.value,
    textValue,
    minValue: segment.minValue,
    maxValue: segment.maxValue,
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly || !segment.isEditable,
    isRequired: state.isRequired,
    onIncrement: () => {
      enteredKeys.current = '';
      state.increment(segment.type);
    },
    onDecrement: () => {
      enteredKeys.current = '';
      state.decrement(segment.type);
    },
    onIncrementPage: () => {
      enteredKeys.current = '';
      state.incrementPage(segment.type);
    },
    onDecrementPage: () => {
      enteredKeys.current = '';
      state.decrementPage(segment.type);
    },
    onIncrementToMax: () => {
      enteredKeys.current = '';
      state.setSegment(segment.type, segment.maxValue);
    },
    onDecrementToMin: () => {
      enteredKeys.current = '';
      state.setSegment(segment.type, segment.minValue);
    }
  });

  let parser = useMemo(() => new NumberParser(locale, {maximumFractionDigits: 0}), [locale]);

  let backspace = () => {
    if (parser.isValidPartialNumber(segment.text) && !state.isReadOnly && !segment.isPlaceholder) {
      let newValue = segment.text.slice(0, -1);
      let parsed = parser.parse(newValue);
      if (newValue.length === 0 || parsed === 0) {
        state.clearSegment(segment.type);
      } else {
        state.setSegment(segment.type, parsed);
      }
      enteredKeys.current = newValue;
    } else if (segment.type === 'dayPeriod') {
      state.clearSegment(segment.type);
    }
  };

  let onKeyDown = (e) => {
    // Firefox does not fire selectstart for Ctrl/Cmd + A
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1742153
    if (e.key === 'a' && (isMac() ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
    }

    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        if (direction === 'rtl') {
          focusManager.focusNext({tabbable: true});
        } else {
          focusManager.focusPrevious({tabbable: true});
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        if (direction === 'rtl') {
          focusManager.focusPrevious({tabbable: true});
        } else {
          focusManager.focusNext({tabbable: true});
        }
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (segment.isPlaceholder && !state.isReadOnly) {
          state.confirmPlaceholder(segment.type);
        }
        focusManager.focusNext({tabbable: true});
        break;
      case 'Tab':
        break;
      case 'Backspace':
      case 'Delete': {
        // Safari on iOS does not fire beforeinput for the backspace key because the cursor is at the start.
        e.preventDefault();
        e.stopPropagation();
        backspace();
        break;
      }
    }
  };

  // Safari dayPeriod option doesn't work...
  let {startsWith} = useFilter({sensitivity: 'base'});
  let amPmFormatter = useDateFormatter({hour: 'numeric', hour12: true});
  let am = useMemo(() => {
    let date = new Date();
    date.setHours(0);
    return amPmFormatter.formatToParts(date).find(part => part.type === 'dayPeriod').value;
  }, [amPmFormatter]);

  let pm = useMemo(() => {
    let date = new Date();
    date.setHours(12);
    return amPmFormatter.formatToParts(date).find(part => part.type === 'dayPeriod').value;
  }, [amPmFormatter]);

  let onInput = (key: string) => {
    if (state.isDisabled || state.isReadOnly) {
      return;
    }

    let newValue = enteredKeys.current + key;

    switch (segment.type) {
      case 'dayPeriod':
        if (startsWith(am, key)) {
          state.setSegment('dayPeriod', 0);
        } else if (startsWith(pm, key)) {
          state.setSegment('dayPeriod', 12);
        } else {
          break;
        }
        focusManager.focusNext({tabbable: true});
        break;
      case 'day':
      case 'hour':
      case 'minute':
      case 'second':
      case 'month':
      case 'year': {
        if (!parser.isValidPartialNumber(newValue)) {
          return;
        }

        let numberValue = parser.parse(newValue);
        let segmentValue = numberValue;
        let allowsZero = segment.minValue === 0;
        if (segment.type === 'hour' && state.dateFormatter.resolvedOptions().hour12) {
          switch (state.dateFormatter.resolvedOptions().hourCycle) {
            case 'h11':
              if (numberValue > 11) {
                segmentValue = parser.parse(key);
              }
              break;
            case 'h12':
              allowsZero = false;
              if (numberValue > 12) {
                segmentValue = parser.parse(key);
              }
              break;
          }

          if (segment.value >= 12 && numberValue > 1) {
            numberValue += 12;
          }
        } else if (numberValue > segment.maxValue) {
          segmentValue = parser.parse(key);
        }

        if (isNaN(numberValue)) {
          return;
        }

        let shouldSetValue = segmentValue !== 0 || allowsZero;
        if (shouldSetValue) {
          state.setSegment(segment.type, segmentValue);
        }

        if (Number(numberValue + '0') > segment.maxValue || newValue.length >= String(segment.maxValue).length) {
          enteredKeys.current = '';
          if (shouldSetValue) {
            focusManager.focusNext({tabbable: true});
          }
        } else {
          enteredKeys.current = newValue;
        }
        break;
      }
    }
  };

  let onFocus = () => {
    enteredKeys.current = '';
    scrollIntoView(getScrollParent(ref.current) as HTMLElement, ref.current);

    // Safari requires that a selection is set or it won't fire input events.
    // Since usePress disables text selection, this won't happen by default.
    ref.current.style.webkitUserSelect = 'text';
    let selection = window.getSelection();
    selection.collapse(ref.current);
    ref.current.style.webkitUserSelect = '';
  };

  let compositionRef = useRef('');
  // @ts-ignore - TODO: possibly old TS version? doesn't fail in my editor...
  useEvent(ref, 'beforeinput', e => {
    e.preventDefault();

    switch (e.inputType) {
      case 'deleteContentBackward':
      case 'deleteContentForward':
        if (parser.isValidPartialNumber(segment.text) && !state.isReadOnly) {
          backspace();
        }
        break;
      case 'insertCompositionText':
        // insertCompositionText cannot be canceled.
        // Record the current state of the element so we can restore it in the `input` event below.
        compositionRef.current = ref.current.textContent;

        // Safari gets stuck in a composition state unless we also assign to the value here.
        // eslint-disable-next-line no-self-assign
        ref.current.textContent = ref.current.textContent;
        break;
      default:
        if (e.data != null) {
          onInput(e.data);
        }
        break;
    }
  });

  useEvent(ref, 'input', (e: InputEvent) => {
    let {inputType, data} = e;
    switch (inputType) {
      case 'insertCompositionText':
        // Reset the DOM to how it was in the beforeinput event.
        ref.current.textContent = compositionRef.current;

        // Android sometimes fires key presses of letters as composition events. Need to handle am/pm keys here too.
        // Can also happen e.g. with Pinyin keyboard on iOS.
        if (startsWith(am, data) || startsWith(pm, data)) {
          onInput(data);
        }
        break;
    }
  });

  // Focus on mouse down/touch up to match native textfield behavior.
  // usePress handles canceling text selection.
  let {pressProps} = usePress({
    preventFocusOnPress: true,
    onPressStart: (e) => {
      if (e.pointerType === 'mouse') {
        e.target.focus();
      }
    },
    onPress(e) {
      if (e.pointerType !== 'mouse') {
        e.target.focus();
      }
    }
  });

  // For Android: prevent selection on long press.
  useEvent(ref, 'selectstart', e => {
    e.preventDefault();
  });

  // spinbuttons cannot be focused with VoiceOver on iOS.
  let touchPropOverrides = isIOS() || segment.type === 'timeZoneName' ? {
    role: 'textbox',
    'aria-valuemax': null,
    'aria-valuemin': null,
    'aria-valuetext': null,
    'aria-valuenow': null
  } : {};

  // Only apply aria-describedby to the first segment, unless the field is invalid. This avoids it being
  // read every time the user navigates to a new segment.
  let firstSegment = useMemo(() => state.segments.find(s => s.isEditable), [state.segments]);
  if (segment !== firstSegment && state.validationState !== 'invalid') {
    ariaDescribedBy = undefined;
  }

  let id = useId();
  let isEditable = !state.isDisabled && !state.isReadOnly && segment.isEditable;

  // Prepend the label passed from the field to each segment name.
  // This is needed because VoiceOver on iOS does not announce groups.
  let name = segment.type === 'literal' ? '' : displayNames.of(segment.type);
  let labelProps = useLabels({
    'aria-label': (ariaLabel ? ariaLabel + ' ' : '') + name,
    'aria-labelledby': ariaLabelledBy
  });

  // Literal segments should not be visible to screen readers. We don't really need any of the above,
  // but the rules of hooks mean hooks cannot be conditional so we have to put this condition here.
  if (segment.type === 'literal') {
    return {
      segmentProps: {
        'aria-hidden': true
      }
    };
  }

  return {
    segmentProps: mergeProps(spinButtonProps, pressProps, labelProps, {
      id,
      ...touchPropOverrides,
      'aria-invalid': state.validationState === 'invalid' ? 'true' : undefined,
      'aria-describedby': ariaDescribedBy,
      'aria-placeholder': segment.isPlaceholder ? segment.text : undefined,
      'aria-readonly': state.isReadOnly || !segment.isEditable ? 'true' : undefined,
      contentEditable: isEditable,
      suppressContentEditableWarning: isEditable,
      spellCheck: isEditable ? 'false' : undefined,
      autoCapitalize: isEditable ? 'off' : undefined,
      autoCorrect: isEditable ? 'off' : undefined,
      // Capitalization was changed in React 17...
      [parseInt(React.version, 10) >= 17 ? 'enterKeyHint' : 'enterkeyhint']: isEditable ? 'next' : undefined,
      inputMode: state.isDisabled || segment.type === 'dayPeriod' || !isEditable ? undefined : 'numeric',
      tabIndex: state.isDisabled ? undefined : 0,
      onKeyDown,
      onFocus,
      style: {
        caretColor: 'transparent'
      }
    })
  };
}
