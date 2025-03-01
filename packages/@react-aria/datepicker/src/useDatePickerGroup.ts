import {createFocusManager, getFocusableTreeWalker} from '@react-aria/focus';
import {DateFieldState, DatePickerState, DateRangePickerState} from '@react-stately/datepicker';
import {FocusableElement, KeyboardEvent, RefObject} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';
import {useMemo} from 'react';
import {usePress} from '@react-aria/interactions';

export function useDatePickerGroup(state: DatePickerState | DateRangePickerState | DateFieldState, ref: RefObject<Element | null>, disableArrowNavigation?: boolean) {
  let {direction} = useLocale();
  let focusManager = useMemo(() => createFocusManager(ref), [ref]);

  // Open the popover on alt + arrow down
  let onKeyDown = (e: KeyboardEvent) => {
    if (!e.currentTarget.contains(e.target)) {
      return;
    }

    if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && 'setOpen' in state) {
      e.preventDefault();
      e.stopPropagation();
      state.setOpen(true);
    }

    if (disableArrowNavigation) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        if (direction === 'rtl') {
          if (ref.current) {
            let target = e.target as FocusableElement;
            let prev = findNextSegment(ref.current, target.getBoundingClientRect().left, -1);

            if (prev) {
              prev.focus();
            }
          }
        } else {
          focusManager.focusPrevious();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        if (direction === 'rtl') {
          if (ref.current) {
            let target = e.target as FocusableElement;
            let next = findNextSegment(ref.current, target.getBoundingClientRect().left, 1);

            if (next) {
              next.focus();
            }
          }
        } else {
          focusManager.focusNext();
        }
        break;
    }
  };

  // Focus the first placeholder segment from the end on mouse down/touch up in the field.
  let focusLast = () => {
    if (!ref.current) {
      return;
    }
    // Try to find the segment prior to the element that was clicked on.
    let target = window.event?.target as FocusableElement;
    let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
    if (target) {
      walker.currentNode = target;
      target = walker.previousNode() as FocusableElement;
    }

    // If no target found, find the last element from the end.
    if (!target) {
      let last: FocusableElement;
      do {
        last = walker.lastChild() as FocusableElement;
        if (last) {
          target = last;
        }
      } while (last);
    }

    // Now go backwards until we find an element that is not a placeholder.
    while (target?.hasAttribute('data-placeholder')) {
      let prev = walker.previousNode() as FocusableElement;
      if (prev && prev.hasAttribute('data-placeholder')) {
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
    preventFocusOnPress: true,
    allowTextSelectionOnPress: true,
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

function findNextSegment(group: Element, fromX: number, direction: number) {
  let walker = getFocusableTreeWalker(group, {tabbable: true});
  let node = walker.nextNode();
  let closest: FocusableElement | null = null;
  let closestDistance = Infinity;
  while (node) {
    let x = (node as Element).getBoundingClientRect().left;
    let distance = x - fromX;
    let absoluteDistance = Math.abs(distance);
    if (Math.sign(distance) === direction && absoluteDistance < closestDistance) {
      closest = node as FocusableElement;
      closestDistance = absoluteDistance;
    }
    node = walker.nextNode();
  }
  return closest;
}
