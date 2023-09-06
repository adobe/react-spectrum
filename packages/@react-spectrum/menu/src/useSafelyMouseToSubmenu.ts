import {RefObject, useEffect, useRef} from 'react';
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
export function useSafelyMouseToSubmenu(options: SafelyMouseToSubmenuOptions) {
  let {menuRef, submenuRef, isOpen} = options;
  let prevPointerPos = useRef<{x: number, y: number, time: number}>(null);
  let triggerRect = useRef<DOMRect>(null);
  let submenuRect = useRef<DOMRect>(null);
  let lastProcessedTime = useRef<number>(0);
  let isPointerMovingTowardsSubmenu = useRef<boolean>(false);

  useResizeObserver({
    ref: submenuRef,
    onResize: () => submenuRect.current = submenuRef.current.getBoundingClientRect()
  });

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

      // Measure trigger element if we haven't already.
      if (!triggerRect.current) {
        triggerRect.current = (e.target as HTMLElement).closest('li').getBoundingClientRect();
      }

      let prevIsPointerMovingTowardsSubmenu = isPointerMovingTowardsSubmenu.current;

      let {clientX: mouseX, clientY: mouseY} = e;

      if (!prevPointerPos.current) {
        prevPointerPos.current = {x: mouseX, y: mouseY, time: currentTime};
        return;
      }

      if (!submenuRect.current) {
        return;
      }

      // Check if pointer is moving towards submenu.
      let direction = mouseX > submenuRect.current.right ? 'left' : 'right';
      let toSubmenuX = direction === 'right' ? submenuRect.current.right - mouseX :  mouseX - submenuRect.current.left;
      let angleTop = Math.atan2(mouseY - submenuRect.current.top, toSubmenuX);
      let angleBottom = Math.atan2(mouseY - submenuRect.current.bottom, toSubmenuX);
      let anglePointer = Math.atan2(mouseY - prevPointerPos.current.y, mouseX - prevPointerPos.current.x);
      isPointerMovingTowardsSubmenu.current =  anglePointer < angleTop && anglePointer > angleBottom;

      // If pointer was previously moving towards submenu but no longer is, fire a pointerenter on menu item the mouse is currently over.
      if (prevIsPointerMovingTowardsSubmenu && !isPointerMovingTowardsSubmenu.current) {
        let target = document.elementFromPoint(mouseX, mouseY);
        if (target && menu.contains(target)) {
          target.dispatchEvent(new PointerEvent('pointerenter', {bubbles: true, cancelable: true}));
        }
      }

      prevPointerPos.current = {x: mouseX, y: mouseY, time: currentTime};
    };

    let onPointerEnter = (e: PointerEvent) => {
      // Do nothing if mouse is still over trigger element.
      if (e.clientX > triggerRect.current.left && e.clientX < triggerRect.current.right &&
        e.clientY > triggerRect.current.top && e.clientY < triggerRect.current.bottom) {
        return;
      }

      if (isPointerMovingTowardsSubmenu.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    menu.addEventListener('pointermove', onPointerMove);
    menu.addEventListener('pointerenter', onPointerEnter, {capture: true});

    return () => {
      menu.removeEventListener('pointermove', onPointerMove);
      menu.removeEventListener('pointerenter', onPointerEnter, {capture: true});
    };

  }, [isOpen, menuRef, submenuRef]);
}
