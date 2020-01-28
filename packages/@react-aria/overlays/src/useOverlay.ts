import {AllHTMLAttributes, RefObject, useEffect} from 'react';
import {useInteractOutside} from '@react-aria/interactions';

interface OverlayProps {
  ref: RefObject<HTMLElement | null>,
  onClose?: () => void,
  isOpen?: boolean
}

interface OverlayAria {
  overlayProps: AllHTMLAttributes<HTMLElement>
}

const visibleOverlays: RefObject<HTMLElement>[] = [];

export function useOverlay(props: OverlayProps): OverlayAria {
  let {ref, onClose, isOpen} = props;
  
  // Add the overlay ref to the stack of visible overlays on mount, and remove on unmount.
  useEffect(() => {
    if (isOpen) {
      visibleOverlays.push(ref);
    }

    return () => {
      let index = visibleOverlays.indexOf(ref);
      if (index >= 0) {
        visibleOverlays.splice(index, 1);
      }
    };
  }, [isOpen, ref]);

  // Only hide the overlay when it is the topmost visible overlay in the stack.
  let onHide = () => {
    if (visibleOverlays[visibleOverlays.length - 1] === ref && onClose) {
      onClose();
    }
  };

  // Handle the escape key
  let onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onHide();
    }
  };

  // Handle clicking outside the overlay to close it
  useInteractOutside({ref, onInteractOutside: onHide});

  return {
    overlayProps: {
      onKeyDown
    }
  };
}
