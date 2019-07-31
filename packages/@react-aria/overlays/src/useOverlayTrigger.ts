import {RefObject, useEffect} from 'react';

interface OverlayTriggerProps {
  ref: RefObject<HTMLElement | null>,
  onClose?: () => void,
  isOpen?: boolean
}

export function useOverlayTrigger({ref, onClose, isOpen}: OverlayTriggerProps) {
  // When scrolling a parent scrollable region of the trigger (other than the body),
  // we hide the popover. Otherwise, its position would be incorrect.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let onScroll = (e: MouseEvent) => {
      // Ignore if scrolling an scrollable region outside the trigger's tree.
      let target = e.target as HTMLElement;
      if (target === document.body || !ref.current || !target.contains(ref.current)) {
        return;
      }

      if (onClose) {
        onClose();
      }
    };

    document.body.addEventListener('scroll', onScroll, true);
    return () => {
      document.body.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, onClose, ref]);
}
