
import {RefObject} from '@react-types/shared';
import {useEffect, useRef, useState} from 'react';
import {useInteractionModality} from '@react-aria/interactions';
import {useResizeObserver} from '@react-aria/utils';

interface SafelyMouseToSubmenuOptions {
  /** Ref for the parent menu. */
  menuRef: RefObject<Element | null>,
  /** Ref for the submenu. */
  submenuRef: RefObject<Element | null>,
  /** Whether the submenu is open. */
  isOpen: boolean,
  /** Whether this feature is disabled. */
  isDisabled?: boolean
}

const ALLOWED_INVALID_MOVEMENTS = 2;
const THROTTLE_TIME = 50;
const TIMEOUT_TIME = 1000;
const ANGLE_PADDING = Math.PI / 12; // 15°

/**
 * Allows the user to move their pointer to the submenu without it closing when their mouse leaves the trigger element.
 * Prevents pointer events from going to the underlying menu if the user is moving their pointer towards the sub-menu.
 */
export function useSafelyMouseToSubmenu(options: SafelyMouseToSubmenuOptions) {
  let {menuRef, submenuRef, isOpen, isDisabled} = options;
  let prevPointerPos = useRef<{x: number, y: number} | undefined>(undefined);
  let submenuRect = useRef<DOMRect | undefined>(undefined);
  let lastProcessedTime = useRef<number>(0);
  let timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  let autoCloseTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  let submenuSide = useRef<'left' | 'right' | undefined>(undefined);
  let movementsTowardsSubmenuCount = useRef<number>(2);
  let [preventPointerEvents, setPreventPointerEvents] = useState(false);

  let updateSubmenuRect = () => {
    if (submenuRef.current) {
      submenuRect.current = submenuRef.current.getBoundingClientRect();
      submenuSide.current = undefined;
    }
  };
  useResizeObserver({ref: submenuRef, onResize: updateSubmenuRect});

  let reset = () => {
    setPreventPointerEvents(false);
    movementsTowardsSubmenuCount.current = ALLOWED_INVALID_MOVEMENTS;
    prevPointerPos.current = undefined;
  };

  let modality = useInteractionModality();

  useEffect(() => {
    if (preventPointerEvents && menuRef.current) {
      (menuRef.current as HTMLElement).style.pointerEvents = 'none';
    } else {
      (menuRef.current as HTMLElement).style.pointerEvents = '';
    }
  }, [menuRef, preventPointerEvents]);

  useEffect(() => {
    let submenu = submenuRef.current;
    let menu = menuRef.current;

    if (isDisabled || !submenu || !isOpen || modality !== 'pointer') {
      reset();
      return;
    }
    submenuRect.current = submenu.getBoundingClientRect();

    let onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        return;
      }

      let currentTime = Date.now();

      // Throttle
      if (currentTime - lastProcessedTime.current < THROTTLE_TIME) {
        return;
      }
      clearTimeout(timeout.current);
      clearTimeout(autoCloseTimeout.current);

      let {clientX: mouseX, clientY: mouseY} = e;

      if (!prevPointerPos.current) {
        prevPointerPos.current = {x: mouseX, y: mouseY};
        return;
      }

      if (!submenuRect.current) {
        return;
      }

      if (!submenuSide.current) {
        submenuSide.current = mouseX > submenuRect.current.right ? 'left' : 'right';
      }

      // Pointer is outside of parent menu
      if (mouseX < menu.getBoundingClientRect().left || mouseX > menu.getBoundingClientRect().right || mouseY < menu.getBoundingClientRect().top || mouseY > menu.getBoundingClientRect().bottom) {
        reset();
        return;
      }

      /* Check if pointer is moving towards submenu.
        Uses the 2-argument arctangent (https://en.wikipedia.org/wiki/Atan2) to calculate:
          - angle between previous pointer and top of submenu
          - angle between previous pointer and bottom of submenu
          - angle between previous pointer and current pointer (delta)
        If the pointer delta angle value is between the top and bottom angle values, we know the pointer is moving towards the submenu.
      */
      let prevMouseX = prevPointerPos.current.x;
      let prevMouseY = prevPointerPos.current.y;
      let toSubmenuX = submenuSide.current === 'right' ? submenuRect.current.left - prevMouseX : prevMouseX - submenuRect.current.right;
      let angleTop = Math.atan2(prevMouseY - submenuRect.current.top, toSubmenuX) + ANGLE_PADDING;
      let angleBottom = Math.atan2(prevMouseY - submenuRect.current.bottom, toSubmenuX) - ANGLE_PADDING;
      let anglePointer = Math.atan2(prevMouseY - mouseY, (submenuSide.current === 'left' ? -(mouseX - prevMouseX) : mouseX - prevMouseX));
      let isMovingTowardsSubmenu = anglePointer < angleTop && anglePointer > angleBottom;

      movementsTowardsSubmenuCount.current = isMovingTowardsSubmenu ?
        Math.min(movementsTowardsSubmenuCount.current + 1, ALLOWED_INVALID_MOVEMENTS) :
        Math.max(movementsTowardsSubmenuCount.current - 1, 0);

      if (movementsTowardsSubmenuCount.current >= ALLOWED_INVALID_MOVEMENTS) {
        setPreventPointerEvents(true);
      } else {
        setPreventPointerEvents(false);
      }

      lastProcessedTime.current = currentTime;
      prevPointerPos.current = {x: mouseX, y: mouseY};

      // If the pointer is moving towards the submenu, start a timeout to close if no other movements are made after 500ms.
      if (isMovingTowardsSubmenu) {
        timeout.current = setTimeout(() => {
          reset();
          autoCloseTimeout.current = setTimeout(() => {
            // Fire a pointerover event to trigger the menu to close.
            // Wait until pointer-events:none is no longer applied
            let target = document.elementFromPoint(mouseX, mouseY);
            if (target && menu.contains(target)) {
              target.dispatchEvent(new PointerEvent('pointerover', {bubbles: true, cancelable: true}));
            }
          }, 100);
        }, TIMEOUT_TIME);
      }
    };

    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      clearTimeout(timeout.current);
      clearTimeout(autoCloseTimeout.current);
      movementsTowardsSubmenuCount.current = ALLOWED_INVALID_MOVEMENTS;
    };

  }, [isDisabled, isOpen, menuRef, modality, setPreventPointerEvents, submenuRef]);
}
