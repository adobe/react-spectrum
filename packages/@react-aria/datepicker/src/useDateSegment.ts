import {DatePickerFieldState, DateSegment} from '@react-stately/datepicker';
import {DatePickerProps} from '@react-types/datepicker';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, MouseEvent, useState} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useId} from '@react-aria/utils';
import {useDateFormatter, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useFocusManager} from '@react-aria/focus';
import {useMediaQuery} from '@react-spectrum/utils';
import {useSpinButton} from '@react-aria/spinbutton';

interface DateSegmentAria {
  segmentProps: HTMLAttributes<HTMLDivElement>
}

export function useDateSegment(props: DatePickerProps & DOMProps, segment: DateSegment, state: DatePickerFieldState): DateSegmentAria {
  let [enteredKeys, setEnteredKeys] = useState('');
  let {direction} = useLocale();
  let messageFormatter = useMessageFormatter(intlMessages);
  let focusManager = useFocusManager();

  let textValue = segment.text;
  let monthDateFormatter = useDateFormatter({month: 'long'});
  let hourDateFormatter = useDateFormatter({
    hour: 'numeric',
    hour12: state.dateFormatter.resolvedOptions().hour12
  });

  if (segment.type === 'month') {
    let monthTextValue = monthDateFormatter.format(state.value);
    textValue = monthTextValue !== textValue ? `${textValue} - ${monthTextValue}` : monthTextValue;
  } else if (segment.type === 'hour' || segment.type === 'dayPeriod') {
    textValue = hourDateFormatter.format(state.value);
  }

  let {spinButtonProps} = useSpinButton({
    value: segment.value,
    textValue,
    minValue: segment.minValue,
    maxValue: segment.maxValue,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    onIncrement: () => state.increment(segment.type),
    onDecrement: () => state.decrement(segment.type),
    onIncrementPage: () => state.incrementPage(segment.type),
    onDecrementPage: () => state.decrementPage(segment.type),
    onIncrementToMax: () => state.setSegment(segment.type, segment.maxValue),
    onDecrementToMin: () => state.setSegment(segment.type, segment.minValue)
  });

  let onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (direction === 'rtl') {
          focusManager.focusNext();
        } else {
          focusManager.focusPrevious();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (direction === 'rtl') {
          focusManager.focusPrevious();
        } else {
          focusManager.focusNext();
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (segment.isPlaceholder && !props.isReadOnly) {
          state.confirmPlaceholder(segment.type);
        }
        focusManager.focusNext();
        break;
      case 'Tab':
        break;
      case 'Backspace': {
        e.preventDefault();
        if (isNumeric(segment.text) && !props.isReadOnly) {
          let newValue = segment.text.slice(0, -1);
          state.setSegment(segment.type, newValue.length === 0 ? segment.minValue : parseNumber(newValue));
          setEnteredKeys(newValue);
        }
        break;
      }
      default:
        e.preventDefault();
        e.stopPropagation();
        if ((isNumeric(e.key) || /^[ap]$/.test(e.key)) && !props.isReadOnly) {
          onInput(e.key);
        }
    }
  };

  let onInput = (key: string) => {
    let newValue = enteredKeys + key;

    switch (segment.type) {
      case 'dayPeriod':
        // TODO: internationalize
        if (key === 'a') {
          state.setSegment('dayPeriod', 0);
        } else if (key === 'p') {
          state.setSegment('dayPeriod', 12);
        }
        focusManager.focusNext();
        break;
      case 'day':
      case 'hour':
      case 'minute':
      case 'second':
      case 'month':
      case 'year': {
        if (!isNumeric(newValue)) {
          return;
        }

        let numberValue = parseNumber(newValue);
        let segmentValue = numberValue;
        if (segment.type === 'hour' && state.dateFormatter.resolvedOptions().hour12 && numberValue === 12) {
          segmentValue = 0;
        } else if (numberValue > segment.maxValue) {
          segmentValue = parseNumber(key);
        }

        state.setSegment(segment.type, segmentValue);

        if (Number(numberValue + '0') > segment.maxValue) {
          setEnteredKeys('');
          focusManager.focusNext();
        } else {
          setEnteredKeys(newValue);
        }
        break;
      }
    }
  };

  let onFocus = () => {
    setEnteredKeys('');
  };

  let touchPropOverrides = useMediaQuery('(hover: none) and (pointer: coarse)') ? {
    role: 'textbox',
    'aria-valuemax': null,
    'aria-valuemin': null,
    'aria-valuetext': null,
    'aria-valuenow': null
  } : {};

  let id = useId(props.id);
  return {
    segmentProps: mergeProps(spinButtonProps, {
      id,
      ...touchPropOverrides,
      'aria-controls': props['aria-controls'],
      'aria-haspopup': props['aria-haspopup'],
      'aria-invalid': props['aria-invalid'],
      'aria-label': messageFormatter(segment.type),
      'aria-labelledby': `${props['aria-labelledby']} ${id}`,
      tabIndex: props.isDisabled ? undefined : 0,
      onKeyDown,
      onFocus,
      onMouseDown: (e: MouseEvent) => e.stopPropagation()
    })
  };
}

// Converts unicode number strings to real JS numbers.
// Numbers can be displayed and typed in many number systems, but JS
// only understands latin numbers.
// See https://www.fileformat.info/info/unicode/category/Nd/list.htm
// for a list of unicode numeric characters.
// Currently only Arabic and Latin numbers are supported, but more
// could be added here in the future.
// Keep this in sync with `isNumeric` below.
function parseNumber(str: string): number {
  str = str
    // Arabic Indic
    .replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x0660))
    // Extended Arabic Indic
    .replace(/[\u06f0-\u06f9]/g, c => String(c.charCodeAt(0) - 0x06f0));

  return Number(str);
}

// Checks whether a unicode string could be converted to a number.
// Keep this in sync with `parseNumber` above.
function isNumeric(str: string) {
  return /^[0-9\u0660-\u0669\u06f0-\u06f9]+$/.test(str);
}
