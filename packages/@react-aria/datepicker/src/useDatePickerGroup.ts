import {DatePickerFieldState, DatePickerState, DateRangePickerState} from '@react-stately/datepicker';
import {KeyboardEvent} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {RefObject} from 'react';
import {usePress} from '@react-aria/interactions';

export function useDatePickerGroup(state: DatePickerState | DateRangePickerState | DatePickerFieldState, ref: RefObject<HTMLElement>) {
  // Open the popover on alt + arrow down
  let onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowDown' && 'setOpen' in state) {
      e.preventDefault();
      e.stopPropagation();
      state.setOpen(true);
    }
  };

  // Focus the first placeholder segment from the end on mouse down/touch up in the field.
  let focusLast = () => {
    let elements = ref.current.querySelectorAll('[tabindex="0"]');
    let index = elements.length - 1;
    while (index >= 0 && elements[index].getAttribute('aria-placeholder')) {
      index--;
    }
    index = Math.min(index + 1, elements.length - 1);
    let element = elements[index] as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  let {pressProps} = usePress({
    onPressStart(e) {
      if (e.pointerType === 'mouse') {
        focusLast();
      }
    },
    onPress(e) {
      if (e.pointerType !== 'mouse') {
        focusLast();
      }
    }
  });

  return mergeProps(pressProps, {onKeyDown});
}
