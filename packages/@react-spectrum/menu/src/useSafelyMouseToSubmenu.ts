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
  let menuRect = useRef<DOMRect>(null);
  let submenuRect = useRef<DOMRect>(null);
  let triggerRect = useRef<DOMRect>(null);
  let lastProcessedTime = useRef<number>(0);
  let isPointerMovingTowardsSubmenu = useRef<boolean>(false);

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

      let prevIsPointerMovingTowardsSubmenu = isPointerMovingTowardsSubmenu.current;

      let {clientX: mouseX, clientY: mouseY} = e;

      if (!prevPointerPos.current) {
        prevPointerPos.current = {x: mouseX, y: mouseY, time: currentTime};
        return;
      }

      let dx = mouseX - prevPointerPos.current.x;
      let dy = mouseY - prevPointerPos.current.y;

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

      isPointerMovingTowardsSubmenu.current = anglePointer < angleTop && anglePointer > angleBottom;

      // If pointer was previously moving towards submenu but is no longer moving towards submenu,
      // fire a pointerenter on the underlying item.
      if (prevIsPointerMovingTowardsSubmenu && !isPointerMovingTowardsSubmenu.current) {
        let target = document.elementFromPoint(mouseX, mouseY);
        if (target) {
          target.dispatchEvent(new PointerEvent('pointerenter', {bubbles: true, cancelable: true}));
        }
      }

      prevPointerPos.current = {x: mouseX, y: mouseY, time: currentTime};
    };

    let onPointerEnter = (e: PointerEvent) => {
      if (isPointerMovingTowardsSubmenu.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    menu.addEventListener('pointermove', onPointerMove);
    [...menu.childNodes].forEach((node) => {
      node.addEventListener('pointerenter', onPointerEnter);
    });

    return () => {
      menu.removeEventListener('pointermove', onPointerMove);
      [...menu.childNodes].forEach((node) => {
        node.removeEventListener('pointerenter', onPointerEnter);
      });
      window.removeEventListener('resize', updateMenuRects);
    };

  }, [menuRef, submenuRef, isOpen, triggerRef]);
}
