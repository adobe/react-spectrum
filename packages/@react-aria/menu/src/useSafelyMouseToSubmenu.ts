import {PointerEventHandler, RefObject, useRef, useState} from 'react';
import {useResizeObserver} from '@react-aria/utils';

interface SafelyMouseToSubmenuOptions {
  /** Ref for the parent menu. */
  menuRef: RefObject<Element>,
  /** Ref for the submenu. */
  submenuRef: RefObject<Element>,
  /** Ref for the trigger element. */
  triggerRef: RefObject<Element>,
  /** Whether the submenu is open. */
  isOpen: boolean
}

interface MenuEventListeners {
  onPointerMove: PointerEventHandler<HTMLElement>,
  onPointerEnter:  PointerEventHandler<HTMLElement>
}

/**
 * Allows the user to move their pointer to the submenu without it closing when their mouse leaves the trigger element.
 * Prevents pointer events from going to the underlying menu if the user is moving their pointer towards the sub-menu.
 */
export function useSafelyMouseToSubmenu(options: SafelyMouseToSubmenuOptions): MenuEventListeners {
  let {menuRef, submenuRef, triggerRef, isOpen} = options;
  let prevPointerPos = useRef<{x: number, y: number}>(null);
  let [submenuRect, setSubmenuRect] = useState<DOMRect>(null);
  let lastProcessedTime = useRef<number>(0);
  let isPointerMovingTowardsSubmenu = useRef<boolean>(false);

  let updateSubmenuRect = () => {
    if (submenuRef.current) {
      setSubmenuRect(submenuRef.current.getBoundingClientRect());
    }
  };
  
  useResizeObserver({
    ref: submenuRef,
    onResize: updateSubmenuRect
  });

  let menu = menuRef.current;
  let trigger = triggerRef.current;

  let onPointerMove = (e) => {
    let currentTime = Date.now();

    // Throttle
    if (currentTime - lastProcessedTime.current < 16) {
      return;
    }

    let prevIsPointerMovingTowardsSubmenu = isPointerMovingTowardsSubmenu.current;

    let {clientX: mouseX, clientY: mouseY} = e;

    if (!prevPointerPos.current) {
      prevPointerPos.current = {x: mouseX, y: mouseY};
      return;
    }

    if (!submenuRect) {
      return;
    }

    // Check if pointer is moving towards submenu.
    let direction = mouseX > submenuRect.right ? 'left' : 'right';
    let toSubmenuX = direction === 'right' ? submenuRect.left - mouseX :  mouseX - submenuRect.right;
    let angleTop = Math.atan2(mouseY - submenuRect.top, toSubmenuX);
    let angleBottom = Math.atan2(mouseY - submenuRect.bottom, toSubmenuX);
    let anglePointer = Math.atan2(prevPointerPos.current.y - mouseY, mouseX - prevPointerPos.current.x);
    isPointerMovingTowardsSubmenu.current =  anglePointer < angleTop && anglePointer > angleBottom;

    // If pointer was previously moving towards submenu but no longer is, fire a pointerenter on menu item the mouse is currently over.
    if (prevIsPointerMovingTowardsSubmenu && !isPointerMovingTowardsSubmenu.current) {
      let target = document.elementFromPoint(mouseX, mouseY);
      if (target && menu.contains(target)) {
        target.dispatchEvent(new PointerEvent('pointerenter', {bubbles: true, cancelable: true}));
      }
    }

    prevPointerPos.current = {x: mouseX, y: mouseY};
  };

  let onPointerEnter = (e) => {
    // If event came from within trigger, do nothing.
    if (trigger.contains(e.target as Node) || trigger === e.target) {
      return;
    }

    if (isPointerMovingTowardsSubmenu.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return {
    onPointerMove: isOpen ? onPointerMove : undefined,
    onPointerEnter: isOpen ? onPointerEnter : undefined
  };
}
