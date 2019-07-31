import {RefObject, SyntheticEvent, useEffect, useRef} from 'react';

interface InteractOutsideProps {
  ref: RefObject<Element>,
  onInteractOutside?: (e: SyntheticEvent) => void
}

export function useInteractOutside({ref, onInteractOutside}: InteractOutsideProps) {
  let stateRef = useRef({
    ignoreEmulatedMouseEvents: false
  });
  let state = stateRef.current;

  useEffect(() => {
    // Use pointer events if available. Otherwise, fall back to mouse and touch events.
    if (typeof PointerEvent !== 'undefined') {
      let onPointerUp = (e) => {
        if (onInteractOutside && isValidEvent(e, ref)) {
          onInteractOutside(e);
        }
      };

      document.addEventListener('pointerup', onPointerUp, false);

      return () => {
        document.removeEventListener('pointerup', onPointerUp, false);
      };
    } else {
      let onMouseUp = (e) => {
        if (state.ignoreEmulatedMouseEvents) {
          state.ignoreEmulatedMouseEvents = false;
        } else if (onInteractOutside && isValidEvent(e, ref)) {
          onInteractOutside(e);
        }
      };

      let onTouchEnd = (e) => {
        state.ignoreEmulatedMouseEvents = true;
        if (onInteractOutside && isValidEvent(e, ref)) {
          onInteractOutside(e);
        }
      };

      document.addEventListener('mouseup', onMouseUp, false);
      document.addEventListener('touchend', onTouchEnd, false);

      return () => {
        document.removeEventListener('mouseup', onMouseUp, false);
        document.removeEventListener('touchend', onTouchEnd, false);
      };
    }
  }, [onInteractOutside, ref, state.ignoreEmulatedMouseEvents]);
}

function isValidEvent(event, ref) {
  if (event.button > 0) {
    return false;
  }

  return ref.current && !ref.current.contains(event.target);
}
