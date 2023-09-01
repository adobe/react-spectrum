import {MutableRefObject, RefObject, useEffect, useRef} from 'react';
import {useResizeObserver} from '@react-aria/utils';

interface SafeMouseToSubmenuOptions {
  /** Ref for the parent menu. */
  menuRef: RefObject<Element>,
  /** Ref for the submenu. */
  submenuRef: MutableRefObject<any>
}

/**
 * Allows the user to move their pointer to the submenu without it closing when their mouse leaves the trigger element.
 * Prevents pointer events from going to the underlying menu if the user is moving their pointer towards the sub-menu.
 */
export function useSafelyMouseToSubmenu(options: SafeMouseToSubmenuOptions) {
  let {menuRef, submenuRef} = options;
  let prevPointerPos = useRef<{x: number, y: number, time: number}>(null);
  let triggerRect = useRef<DOMRect>(null);
  let menuRect = useRef<DOMRect>(null);
  let submenuRect = useRef<DOMRect>(null);
  let lastProcessedTime = useRef<number>(0);
  let isPointerMovingTowardsSubmenu = useRef<boolean>(false);

  useResizeObserver({
    ref: menuRef,
    onResize: () => menuRect.current = menuRef.current.getBoundingClientRect()
  });

  useEffect(() => {
    let menu = menuRef.current;
    let submenu = (submenuRef.current.UNSAFE_getDOMNode() as HTMLElement);

    if (!menu || !submenu) {
      return;
    }

    menuRect.current = menu.getBoundingClientRect();
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

      // If mouse is still over trigger element, do nothing.
      // if (e.clientX > triggerRect.current.left && e.clientX < triggerRect.current.right &&
      //   e.clientY > triggerRect.current.top && e.clientY < triggerRect.current.bottom) {
      //   return;
      // }

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

      // See if mouse is moving towards submenu.
      // Check if angle of mouse movement is between angle to top of submenu and angle to bottom of submenu.
      let anglePointer = Math.atan2(dy, dx);
      let angleTop = Math.atan2(toSubmenuTop, toSubmenuX);
      let angleBottom = Math.atan2(toSubmenuBottom, toSubmenuX);

      isPointerMovingTowardsSubmenu.current =  anglePointer < angleTop && anglePointer > angleBottom;
      console.log({anglePointer, angleTop, angleBottom});

      // If pointer was previously moving towards submenu but is no longer moving towards submenu,
      // fire a pointerenter on the underlying item.
      if (prevIsPointerMovingTowardsSubmenu && !isPointerMovingTowardsSubmenu.current) {
        let target = document.elementFromPoint(mouseX, mouseY);
        if (target && menu.contains(target)) {
          target.dispatchEvent(new PointerEvent('pointerenter', {bubbles: true, cancelable: true}));
        }
      }

      prevPointerPos.current = {x: mouseX, y: mouseY, time: currentTime};
    };

    let onPointerEnter = (e: PointerEvent) => {
      // Do nothing if over trigger element.
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submenuRef.current]);
}
