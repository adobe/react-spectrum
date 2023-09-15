import {CSSProperties, RefObject, useEffect, useRef, useState} from 'react';
import {useResizeObserver} from '@react-aria/utils';

interface SafelyMouseToSubmenuOptions {
  /** Ref for the parent menu. */
  menuRef: RefObject<Element>,
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
  let {menuRef, submenuRef, isOpen} = options;
  let prevPointerPos = useRef<{x: number, y: number}>(null);
  let submenuRect = useRef<DOMRect>(null);
  let lastProcessedTime = useRef<number>(0);
  let [isPointerMovingTowardsSubmenu, setIsPointerMovingTowardsSubmenu] = useState(false);

  let updateSubmenuRect = () => {
    if (submenuRef.current) {
      submenuRect.current = submenuRef.current.getBoundingClientRect();
    }
  };

  useResizeObserver({ref: submenuRef, onResize: updateSubmenuRect});

  useEffect(() => {
    let menu = menuRef.current;
    let submenu = submenuRef.current;

    if (!menu || !submenu || !isOpen) {
      return;
    }

    submenuRect.current = submenu.getBoundingClientRect();

    let onPointerMove = (e: PointerEvent) => {
      let currentTime = Date.now();

      // Throttle
      if (currentTime - lastProcessedTime.current < 16) {
        return;
      }

      let prevIsPointerMovingTowardsSubmenu = isPointerMovingTowardsSubmenu;

      let {clientX: mouseX, clientY: mouseY} = e;

      if (!prevPointerPos.current) {
        prevPointerPos.current = {x: mouseX, y: mouseY};
        return;
      }

      if (!submenuRect.current) {
        return;
      }

      // Check if pointer is moving towards submenu.
      let direction = mouseX > submenuRect.current.right ? 'left' : 'right';
      let toSubmenuX = direction === 'right' ? submenuRect.current.left - mouseX : mouseX - submenuRect.current.right;
      let angleTop = Math.atan2(mouseY - submenuRect.current.top, toSubmenuX);
      let angleBottom = Math.atan2(mouseY - submenuRect.current.bottom, toSubmenuX);
      let anglePointer = Math.atan2(prevPointerPos.current.y - mouseY, (direction === 'left' ? -1 : 1) * (mouseX - prevPointerPos.current.x));
      setIsPointerMovingTowardsSubmenu(anglePointer < angleTop && anglePointer > angleBottom);

      // If pointer was previously moving towards submenu but no longer is, fire a pointerenter on menu item the mouse is currently over.
      if (prevIsPointerMovingTowardsSubmenu && !isPointerMovingTowardsSubmenu) {
        let target = document.elementFromPoint(mouseX, mouseY);
        if (target && menu.contains(target)) {
          target.dispatchEvent(new PointerEvent('pointerenter', {bubbles: true, cancelable: true}));
        }
      }

      prevPointerPos.current = {x: mouseX, y: mouseY};
    };

    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, menuRef, submenuRef]);
  
  return {
    pointerEvents: isPointerMovingTowardsSubmenu ? 'none' : undefined
  };
}
