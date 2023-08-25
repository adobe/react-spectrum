import {MutableRefObject, RefObject, useEffect, useRef} from 'react';

interface SafeMouseToSubmenuOptions {
  /** Ref for the parent menu. */
  menuRef: RefObject<HTMLElement>,
  /** Ref for the submenu. */
  submenuRef: MutableRefObject<any>,
  /** Ref for the submenu's trigger element. */
  triggerRef: RefObject<HTMLElement>,
  /** Whether the submenu is open. */
  isOpen: boolean
}

/**
 * Allows the user to move their pointer to the submenu without it closing when their mouse leaves the trigger element.
 * Prevents pointer events from going to the underlying menu if the user is moving their pointer towards the sub-menu.
 */
export function useSafelyMouseToSubmenu(options: SafeMouseToSubmenuOptions) {
  let {menuRef, submenuRef, triggerRef, isOpen} = options;
  let prevPointerPos = useRef<{x: number, y: number, time: number}>(null);
  let currentSpeed = useRef<number>(null);
  let menuRect = useRef<DOMRect>(null);
  let submenuRect = useRef<DOMRect>(null);
  let triggerRect = useRef<DOMRect>(null);
  let lastProcessedTime = useRef<number>(0);

  useEffect(() => {
    let menu = menuRef.current;
    let submenu = (submenuRef.current.UNSAFE_getDOMNode() as HTMLElement);

    if (!menu || !submenu || !isOpen) {
      return;
    }

    menuRect.current = menu.getBoundingClientRect();
    submenuRect.current = submenu.getBoundingClientRect();
    triggerRect.current = triggerRef.current.getBoundingClientRect();

    let updateMenuRects = () => {
      menuRect.current = menu.getBoundingClientRect();
      submenuRect.current = submenu.getBoundingClientRect();
    };

    window.addEventListener('resize', updateMenuRects);

    let onPointerMove = (e: PointerEvent) => {
      let currentTime = Date.now();

      // Throttle
      if (currentTime - lastProcessedTime.current < 16) {
        return;
      }

      let {clientX: mouseX, clientY: mouseY} = e;

      // Check if pointer is not over trigger.
      if (mouseX >= triggerRect.current.left && mouseX <= triggerRect.current.right &&
        mouseY >= triggerRect.current.top && mouseY <= triggerRect.current.bottom) {
        return;
      }

      // Check if pointer is over menu.
      if (!menuRect.current ||
        mouseX < menuRect.current.left || mouseX > menuRect.current.right ||
        mouseY < menuRect.current.top || mouseY > menuRect.current.bottom) {
        return;
      }

      // Check if pointer is accelerating.
      lastProcessedTime.current = currentTime;

      if (!prevPointerPos.current) {
        prevPointerPos.current = {x: mouseX, y: mouseY, time: currentTime};
        return;
      }

      let timeDelta = currentTime - prevPointerPos.current.time;
      let dx = mouseX - prevPointerPos.current.x;
      let dy = mouseY - prevPointerPos.current.y;

      let speed = Math.sqrt(dx * dx + dy * dy) / timeDelta;
      let acceleration = currentSpeed.current !== null ? (speed - currentSpeed.current) / timeDelta : 0;

      if (acceleration < 0) {
        return;
      }

      // Check if pointer is moving towards submenu.
      if (!submenuRect.current) {
        return;
      }

      let direction = mouseX > submenuRect.current.right ? 'left' : 'right';
      let toSubmenuX = direction === 'right' ? submenuRect.current.right - mouseX :  mouseX - submenuRect.current.left;
      let toSubmenuTop = submenuRect.current.top;
      let toSubmenuBottom = submenuRect.current.bottom - mouseY;

      let angleTop = Math.atan2(toSubmenuTop, toSubmenuX);
      let angleBottom = Math.atan2(toSubmenuBottom, toSubmenuX);
      let anglePointer = Math.atan2(dy, dx);

      if (anglePointer > angleTop && anglePointer < angleBottom) {
        e.stopPropagation();
      }

      currentSpeed.current = speed;
      prevPointerPos.current = {x: mouseX, y: mouseY, time: currentTime};
    };

    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', updateMenuRects);
    };

  }, [menuRef, submenuRef, isOpen, triggerRef]);
}
