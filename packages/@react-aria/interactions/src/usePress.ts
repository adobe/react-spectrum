import {HTMLAttributes, useMemo, useRef} from 'react';

export interface PressEvent {
  type: 'pressstart' | 'pressend' | 'press',
  target: HTMLElement
}

export interface PressProps {
  isDisabled?: boolean,
  onPress?: (e: PressEvent) => void,
  onPressStart?: (e: PressEvent) => void,
  onPressEnd?: (e: PressEvent) => void,
  onPressChange?: (isPressed: boolean) => void
}

interface PressState {
  isPressed: boolean,
  ignoreEmulatedMouseEvents: boolean,
  activePointerId: any,
  target: HTMLElement | null,
  isOverTarget: boolean
}

export function usePress(props: PressProps) {
  let {onPress, onPressChange, onPressStart, onPressEnd, isDisabled} = props;
  let ref = useRef<PressState>({
    isPressed: false,
    ignoreEmulatedMouseEvents: false,
    activePointerId: null,
    target: null,
    isOverTarget: false
  });

  let pressProps = useMemo(() => {
    let state = ref.current;
    let triggerPressStart = (e) => {
      if (isDisabled) {
        return;
      }

      if (onPressStart) {
        onPressStart({
          type: 'pressstart',
          target: e.target
        });
      }

      if (onPressChange) {
        onPressChange(true);
      }
    };

    let triggerPressEnd = (e, wasPressed = true) => {
      if (isDisabled) {
        return;
      }

      if (onPressEnd) {
        onPressEnd({
          type: 'pressend',
          target: e.target
        });
      }

      if (onPressChange) {
        onPressChange(false);
      }

      if (onPress && wasPressed) {
        onPress({
          type: 'press',
          target: e.target
        });
      }
    };

    let pressProps: HTMLAttributes<HTMLElement> = {
      onKeyDown(e) {
        if (!state.isPressed && isValidKeyboardEvent(e.nativeEvent)) {
          state.isPressed = true;
          triggerPressStart(e);
        }
      },
      onKeyUp(e) {
        if (state.isPressed && isValidKeyboardEvent(e.nativeEvent)) {
          state.isPressed = false;
          triggerPressEnd(e);
        }
      }
    };

    if (typeof PointerEvent !== 'undefined') {
      pressProps.onPointerDown = (e) => {
        if (!state.isPressed) {
          state.isPressed = true;
          state.activePointerId = e.pointerId;
          state.target = e.currentTarget;
          triggerPressStart(e);

          document.addEventListener('pointerup', onPointerUp, false);
          document.addEventListener('pointercancel', onPointerCancel, false);
        }
      };

      let unbindEvents = () => {
        document.removeEventListener('pointerup', onPointerUp, false);
        document.removeEventListener('pointercancel', onPointerCancel, false);
      };

      pressProps.onPointerEnter = (e) => {
        if (e.pointerId === state.activePointerId && state.isPressed) {
          triggerPressStart(e);
        }
      };

      pressProps.onPointerLeave = (e) => {
        if (e.pointerId === state.activePointerId && state.isPressed) {
          triggerPressEnd(e, false);
        }
      };

      let onPointerUp = (e) => {
        if (e.pointerId === state.activePointerId && state.isPressed) {
          state.isPressed = false;
          state.activePointerId = null;
          unbindEvents();

          if (state.target && state.target.contains(e.target)) {
            triggerPressEnd({target: state.target});
          }
        }
      };

      let onPointerCancel = () => {
        if (state.isPressed) {
          state.isPressed = false;
          state.activePointerId = null;
          unbindEvents();
          triggerPressEnd({target: state.target}, false);
        }
      };
    } else {
      pressProps.onMouseDown = (e) => {
        if (state.ignoreEmulatedMouseEvents) {
          e.nativeEvent.preventDefault();
          return;
        }
        
        state.isPressed = true;
        state.target = e.currentTarget;
        triggerPressStart(e);
        
        document.addEventListener('mouseup', onMouseUp, false);
      };

      pressProps.onMouseEnter = (e) => {
        if (state.isPressed && !state.ignoreEmulatedMouseEvents) {
          triggerPressStart(e);
        }
      };

      pressProps.onMouseLeave = (e) => {
        if (state.isPressed && !state.ignoreEmulatedMouseEvents) {
          triggerPressEnd(e, false);
        }
      };
    
      let onMouseUp = (e) => {
        state.isPressed = false;
        document.removeEventListener('mouseup', onMouseUp, false);

        if (state.ignoreEmulatedMouseEvents || !state.target || !state.target.contains(e.target)) {
          state.ignoreEmulatedMouseEvents = false;
          return;
        }
    
        triggerPressEnd({target: state.target});
      };
    
      pressProps.onTouchStart = (e) => {
        let touch = getTouchFromEvent(e.nativeEvent);
        if (!touch) {
          return;
        }
        state.activePointerId = touch.identifier;
        state.ignoreEmulatedMouseEvents = true;
        state.isOverTarget = true;
        state.isPressed = true;
        triggerPressStart(e);
      };

      pressProps.onTouchMove = (e) => {
        let rect = e.currentTarget.getBoundingClientRect();
        let touch = getTouchById(e.nativeEvent, state.activePointerId);
        if (touch && touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          if (!state.isOverTarget) {
            state.isOverTarget = true;
            triggerPressStart(e);
          }
        } else if (state.isOverTarget) {
          state.isOverTarget = false;
          triggerPressEnd(e, false);
        }
      };

      pressProps.onTouchEnd = (e) => {
        let rect = e.currentTarget.getBoundingClientRect();
        let touch = getTouchById(e.nativeEvent, state.activePointerId);
        if (touch && touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          triggerPressEnd(e);
        } else if (state.isOverTarget) {
          triggerPressEnd(e, false);
        }

        state.isPressed = false;
        state.activePointerId = null;
        state.isOverTarget = false;
      };

      pressProps.onTouchCancel = (e) => {
        if (state.isPressed) {
          if (state.isOverTarget) {
            triggerPressEnd(e, false);
          }
          state.isPressed = false;
          state.activePointerId = null;
          state.isOverTarget = false;
        }
      };

      pressProps.onClick = (e) => {
        state.ignoreEmulatedMouseEvents = false;
        if (isDisabled) {
          e.preventDefault();
        }
      };
    }

    return pressProps;
  }, [onPress, onPressStart, onPressEnd, onPressChange, isDisabled]);

  return {
    pressProps
  };
}

function isValidKeyboardEvent(event: KeyboardEvent): boolean {
  const {key, target} = event;
  const {tagName, isContentEditable} = target as HTMLElement;
  // Accessibility for keyboards. Space and Enter only.
  // "Spacebar" is for IE 11
  return (
    (key === 'Enter' || key === ' ' || key === 'Spacebar') &&
    (tagName !== 'INPUT' &&
      tagName !== 'TEXTAREA' &&
      isContentEditable !== true)
  );
}

function getTouchFromEvent(event: TouchEvent): Touch | null {
  const {targetTouches} = event;
  if (targetTouches.length > 0) {
    return targetTouches[0];
  }
  return null;
}

function getTouchById(
  event: TouchEvent,
  pointerId: null | number,
): null | Touch {
  const changedTouches = event.changedTouches;
  for (let i = 0; i < changedTouches.length; i++) {
    const touch = changedTouches[i];
    if (touch.identifier === pointerId) {
      return touch;
    }
  }
  return null;
}
