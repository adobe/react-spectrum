import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {mergeProps} from '@react-aria/utils';
import {PressResponderContext} from './context';

export interface PressEvent {
  type: 'pressstart' | 'pressend' | 'press',
  pointerType: 'mouse' | 'pen' | 'touch' | 'keyboard',
  target: HTMLElement
}

export interface PressProps {
  isPressed?: boolean,
  isDisabled?: boolean,
  onPress?: (e: PressEvent) => void,
  onPressStart?: (e: PressEvent) => void,
  onPressEnd?: (e: PressEvent) => void,
  onPressChange?: (isPressed: boolean) => void
}

export interface PressHookProps extends PressProps, DOMProps {
  ref?: RefObject<HTMLElement>
}

interface PressState {
  isPressed: boolean,
  ignoreEmulatedMouseEvents: boolean,
  activePointerId: any,
  target: HTMLElement | null,
  isOverTarget: boolean
}

interface PressResult {
  isPressed: boolean,
  pressProps: HTMLAttributes<HTMLElement>
}

function usePressResponderContext(props: PressHookProps): PressHookProps {
  // Consume context from <PressResponder> and merge with props.
  let context = useContext(PressResponderContext);
  if (context) {
    let {register, ...contextProps} = context;
    props = mergeProps(contextProps, props) as PressHookProps;
    register();
  }

  // Sync ref from <PressResponder> with ref passed to usePress.
  useEffect(() => {
    if (context && context.ref) {
      context.ref.current = props.ref.current;
      return () => {
        context.ref.current = null;
      };
    }
  }, [context, props.ref]);

  return props;
}

export function usePress(props: PressHookProps): PressResult {
  let {
    onPress,
    onPressChange,
    onPressStart,
    onPressEnd,
    isDisabled,
    isPressed: isPressedProp,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref: _, // Removing `ref` from `domProps` because TypeScript is dumb
    ...domProps
  } = usePressResponderContext(props);

  let [isPressed, setPressed] = useState(false);
  let ref = useRef<PressState>({
    isPressed: false,
    ignoreEmulatedMouseEvents: false,
    activePointerId: null,
    target: null,
    isOverTarget: false
  });

  let pressProps = useMemo(() => {
    let state = ref.current;
    let triggerPressStart = (target, pointerType) => {
      if (isDisabled) {
        return;
      }

      if (onPressStart) {
        onPressStart({
          type: 'pressstart',
          target,
          pointerType
        });
      }

      if (onPressChange) {
        onPressChange(true);
      }

      setPressed(true);
    };

    let triggerPressEnd = (target, pointerType, wasPressed = true) => {
      if (isDisabled) {
        return;
      }

      if (onPressEnd) {
        onPressEnd({
          type: 'pressend',
          target,
          pointerType
        });
      }

      if (onPressChange) {
        onPressChange(false);
      }

      setPressed(false);

      if (onPress && wasPressed) {
        onPress({
          type: 'press',
          target,
          pointerType
        });
      }
    };

    let pressProps: HTMLAttributes<HTMLElement> = {
      onKeyDown(e) {
        if (!state.isPressed && isValidKeyboardEvent(e.nativeEvent)) {
          state.isPressed = true;
          triggerPressStart(e.target, 'keyboard');
        }
      },
      onKeyUp(e) {
        if (state.isPressed && isValidKeyboardEvent(e.nativeEvent)) {
          state.isPressed = false;
          triggerPressEnd(e.target, 'keyboard');
        }
      }
    };

    if (typeof PointerEvent !== 'undefined') {
      pressProps.onPointerDown = (e) => {
        if (!state.isPressed) {
          state.isPressed = true;
          state.activePointerId = e.pointerId;
          state.target = e.currentTarget;
          triggerPressStart(e.target, e.pointerType);

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
          triggerPressStart(e.target, e.pointerType);
        }
      };

      pressProps.onPointerLeave = (e) => {
        if (e.pointerId === state.activePointerId && state.isPressed) {
          triggerPressEnd(e.target, e.pointerType, false);
        }
      };

      let onPointerUp = (e) => {
        if (e.pointerId === state.activePointerId && state.isPressed) {
          state.isPressed = false;
          state.activePointerId = null;
          unbindEvents();

          if (state.target && state.target.contains(e.target)) {
            triggerPressEnd(state.target, e.pointerType);
          }
        }
      };

      let onPointerCancel = (e) => {
        if (state.isPressed) {
          state.isPressed = false;
          state.activePointerId = null;
          unbindEvents();
          triggerPressEnd(state.target, e.pointerType, false);
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
        triggerPressStart(e.target, 'mouse');

        document.addEventListener('mouseup', onMouseUp, false);
      };

      pressProps.onMouseEnter = (e) => {
        if (state.isPressed && !state.ignoreEmulatedMouseEvents) {
          triggerPressStart(e.target, 'mouse');
        }
      };

      pressProps.onMouseLeave = (e) => {
        if (state.isPressed && !state.ignoreEmulatedMouseEvents) {
          triggerPressEnd(e.target, 'mouse', false);
        }
      };

      let onMouseUp = (e) => {
        state.isPressed = false;
        document.removeEventListener('mouseup', onMouseUp, false);

        if (state.ignoreEmulatedMouseEvents || !state.target || !state.target.contains(e.target)) {
          state.ignoreEmulatedMouseEvents = false;
          return;
        }

        triggerPressEnd(state.target, 'mouse');
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
        triggerPressStart(e.target, 'touch');
      };

      pressProps.onTouchMove = (e) => {
        let rect = e.currentTarget.getBoundingClientRect();
        let touch = getTouchById(e.nativeEvent, state.activePointerId);
        if (touch && touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          if (!state.isOverTarget) {
            state.isOverTarget = true;
            triggerPressStart(e.target, 'touch');
          }
        } else if (state.isOverTarget) {
          state.isOverTarget = false;
          triggerPressEnd(e.target, 'touch', false);
        }
      };

      pressProps.onTouchEnd = (e) => {
        let rect = e.currentTarget.getBoundingClientRect();
        let touch = getTouchById(e.nativeEvent, state.activePointerId);
        if (touch && touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          triggerPressEnd(e.target, 'touch');
        } else if (state.isOverTarget) {
          triggerPressEnd(e.target, 'touch', false);
        }

        state.isPressed = false;
        state.activePointerId = null;
        state.isOverTarget = false;
      };

      pressProps.onTouchCancel = (e) => {
        if (state.isPressed) {
          if (state.isOverTarget) {
            triggerPressEnd(e.target, 'touch', false);
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
    isPressed: isPressedProp || isPressed,
    pressProps: mergeProps(domProps, pressProps)
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
