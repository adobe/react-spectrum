import {CSSProperties, RefObject, useEffect, useRef, useState} from 'react';
import {useResizeObserver} from '@react-aria/utils';

interface SafelyMouseToSubmenuOptions {
  /** Ref for the submenu. */
  submenuRef: RefObject<Element>,
  /** Whether the submenu is open. */
  isOpen: boolean
}

/**
 * Allows the user to move their pointer to the submenu without it closing when their mouse leaves the trigger element.
 * Prevents pointer events from going to the underlying menu if the user is moving their pointer towards the sub-menu.
 */
export function useSafelyMouseToSubmenu(options: SafelyMouseToSubmenuOptions): CSSProperties {
  let {submenuRef, isOpen} = options;
  let prevPointerPos = useRef<{x: number, y: number}>(null);
  let submenuRect = useRef<DOMRect>(null);
  let lastProcessedTime = useRef<number>(0);
  let [isPointerMovingTowardsSubmenu, setIsPointerMovingTowardsSubmenu] = useState(false);
  let timeout = useRef(null);

  let updateSubmenuRect = () => {
    if (submenuRef.current) {
      submenuRect.current = submenuRef.current.getBoundingClientRect();
    }
  };

  useResizeObserver({ref: submenuRef, onResize: updateSubmenuRect});

  useEffect(() => {
    let submenu = submenuRef.current;

    if (!submenu || !isOpen) {
      setIsPointerMovingTowardsSubmenu(false);
      return;
    }

    submenuRect.current = submenu.getBoundingClientRect();

    let onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        return;
      }

      let currentTime = Date.now();

      // Throttle
      if (currentTime - lastProcessedTime.current < 16) {
        return;
      }

      let {clientX: mouseX, clientY: mouseY} = e;

      if (!prevPointerPos.current) {
        prevPointerPos.current = {x: mouseX, y: mouseY};
        return;
      }

      if (!submenuRect.current) {
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
      let direction = mouseX > submenuRect.current.right ? 'left' : 'right';
      let toSubmenuX = direction === 'right' ? submenuRect.current.left - prevMouseX : prevMouseX - submenuRect.current.right;
      let angleTop = Math.atan2(prevMouseY - submenuRect.current.top, toSubmenuX);
      let angleBottom = Math.atan2(prevMouseY - submenuRect.current.bottom, toSubmenuX);
      let anglePointer = Math.atan2(prevMouseY - mouseY, (direction === 'left' ? -(mouseX - prevMouseX) : mouseX - prevMouseX));
      setIsPointerMovingTowardsSubmenu(anglePointer < angleTop && anglePointer > angleBottom);

      lastProcessedTime.current = currentTime;
      prevPointerPos.current = {x: mouseX, y: mouseY};

      // If the pointer is moving towards the submenu, start a timer to close if no movement is detected after 500ms.
      clearTimeout(timeout.current);
      if (anglePointer < angleTop && anglePointer > angleBottom) {
        timeout.current = setTimeout(() => {
          setIsPointerMovingTowardsSubmenu(false);
          setTimeout(() => {
            // Fire a pointermove event to trigger the menu to close.
            // Wait until pointer-events:none is no longer applied
            let target = document.elementFromPoint(mouseX, mouseY);
            target.dispatchEvent(new PointerEvent('pointerenter', {bubbles: true, cancelable: true}));
          }, 100);
        }, 500);
      }
    };

    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      clearTimeout(timeout.current);
    };

  }, [isOpen, submenuRef]);
  
  return {
    pointerEvents: isPointerMovingTowardsSubmenu ? 'none' : undefined
  };
}
