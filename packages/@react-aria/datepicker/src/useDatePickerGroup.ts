import {DatePickerFieldState, DatePickerState, DateRangePickerState} from '@react-stately/datepicker';
import {getFocusableTreeWalker} from '@react-aria/focus';
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
    // Try to find the segment prior to the element that was clicked on.
    let target = window.event?.target as HTMLElement;
    let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
    if (target) {
      walker.currentNode = target;
      target = walker.previousNode() as HTMLElement;
    }

    // If no target found, find the last element from the end.
    if (!target) {
      let last: HTMLElement;
      do {
        last = walker.lastChild() as HTMLElement;
        if (last) {
          target = last;
        }
      } while (last);
    }

    // Now go backwards until we find an element that is not a placeholder.
    while (target?.getAttribute('aria-placeholder')) {
      let prev = walker.previousNode() as HTMLElement;
      if (prev && prev.getAttribute('aria-placeholder')) {
        target = prev;
      } else {
        break;
      }
    }

    if (target) {
      target.focus();
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
