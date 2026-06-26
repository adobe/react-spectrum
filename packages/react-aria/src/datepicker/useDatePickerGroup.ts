import {createFocusManager, getFocusableTreeWalker} from '../focus/FocusScope';
import {DateFieldState} from 'react-stately/useDateFieldState';
import {DatePickerState} from 'react-stately/useDatePickerState';
import {DateRangePickerState} from 'react-stately/useDateRangePickerState';
import {DOMAttributes, FocusableElement, RefObject} from '@react-types/shared';
import {getEventTarget} from '../utils/shadowdom/DOMFunctions';
import {mergeProps} from '../utils/mergeProps';
import {useKeyboard} from '../interactions/useKeyboard';
import {useLocale} from '../i18n/I18nProvider';
import {useMemo} from 'react';
import {usePress} from '../interactions/usePress';

export function useDatePickerGroup(
  state: DatePickerState | DateRangePickerState | DateFieldState,
  ref: RefObject<Element | null>,
  disableArrowNavigation?: boolean
): DOMAttributes<FocusableElement> {
  let {direction} = useLocale();
  // oxlint-disable-next-line react/react-compiler
  let focusManager = useMemo(() => createFocusManager(ref), [ref]);

  let {keyboardProps} = useKeyboard({
    shortcuts: {
      'Alt+ArrowDown': () => {
        if ('setOpen' in state) {
          state.setOpen(true);
          return;
        }
        return false;
      },
      'Alt+ArrowUp': () => {
        if ('setOpen' in state) {
          state.setOpen(true);
          return;
        }
        return false;
      },
      ArrowLeft: e => {
        if (disableArrowNavigation) {
          return false;
        }
        if (direction === 'rtl') {
          if (ref.current) {
            let target = getEventTarget(e) as FocusableElement;
            let prev = findNextSegment(ref.current, target.getBoundingClientRect().left, -1);

            if (prev) {
              prev.focus();
              return;
            }
          }
        } else {
          focusManager.focusPrevious();
          return;
        }
        return false;
      },
      ArrowRight: e => {
        if (disableArrowNavigation) {
          return false;
        }
        if (direction === 'rtl') {
          if (ref.current) {
            let target = getEventTarget(e) as FocusableElement;
            let next = findNextSegment(ref.current, target.getBoundingClientRect().left, 1);

            if (next) {
              next.focus();
              return;
            }
          }
        } else {
          focusManager.focusNext();
          return;
        }
        return false;
      }
    }
  });

  // Focus the first placeholder segment from the end on mouse down/touch up in the field.
  let focusLast = () => {
    if (!ref.current) {
      return;
    }
    // Try to find the segment prior to the element that was clicked on.
    let target = window.event ? (getEventTarget(window.event) as FocusableElement) : null;
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
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        focusLast();
      }
    }
  });

  // oxlint-disable-next-line react/react-compiler
  return mergeProps(pressProps, keyboardProps);
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
