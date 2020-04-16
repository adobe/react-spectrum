/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DOMProps, PointerType, PressEvents} from '@react-types/shared';
import {focusWithoutScrolling, mergeProps} from '@react-aria/utils';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {PressResponderContext} from './context';

export interface PressProps extends PressEvents {
  isPressed?: boolean,
  isDisabled?: boolean
}

export interface PressHookProps extends PressProps, DOMProps {
  ref?: RefObject<HTMLElement>
}

interface PressState {
  isPressed: boolean,
  ignoreEmulatedMouseEvents: boolean,
  ignoreClickAfterPress: boolean,
  activePointerId: any,
  target: HTMLElement | null,
  isOverTarget: boolean,
  userSelect?: string
}

interface EventBase {
  currentTarget: EventTarget,
  shiftKey: boolean,
  ctrlKey: boolean,
  metaKey: boolean
}

export interface PressResult {
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
    onPressUp,
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
    ignoreClickAfterPress: false,
    activePointerId: null,
    target: null,
    isOverTarget: false
  });

  let pressProps = useMemo(() => {
    let state = ref.current;
    let triggerPressStart = (originalEvent: EventBase, pointerType: PointerType) => {
      if (isDisabled) {
        return;
      }

      if (onPressStart) {
        onPressStart({
          type: 'pressstart',
          pointerType,
          target: originalEvent.currentTarget as HTMLElement,
          shiftKey: originalEvent.shiftKey,
          metaKey: originalEvent.metaKey,
          ctrlKey: originalEvent.ctrlKey
        });
      }

      if (onPressChange) {
        onPressChange(true);
      }

      setPressed(true);
    };

    let triggerPressEnd = (originalEvent: EventBase, pointerType: PointerType, wasPressed = true) => {
      if (isDisabled) {
        return;
      }

      state.ignoreClickAfterPress = true;

      if (onPressEnd) {
        onPressEnd({
          type: 'pressend',
          pointerType,
          target: originalEvent.currentTarget as HTMLElement,
          shiftKey: originalEvent.shiftKey,
          metaKey: originalEvent.metaKey,
          ctrlKey: originalEvent.ctrlKey
        });
      }

      if (onPressChange) {
        onPressChange(false);
      }

      setPressed(false);

      if (onPress && wasPressed) {
        onPress({
          type: 'press',
          pointerType,
          target: originalEvent.currentTarget as HTMLElement,
          shiftKey: originalEvent.shiftKey,
          metaKey: originalEvent.metaKey,
          ctrlKey: originalEvent.ctrlKey
        });
      }
    };

    let triggerPressUp = (originalEvent: EventBase, pointerType: PointerType) => {
      if (isDisabled) {
        return;
      }

      if (onPressUp) {
        onPressUp({
          type: 'pressup',
          pointerType,
          target: originalEvent.currentTarget as HTMLElement,
          shiftKey: originalEvent.shiftKey,
          metaKey: originalEvent.metaKey,
          ctrlKey: originalEvent.ctrlKey
        });
      }
    };

    let pressProps: HTMLAttributes<HTMLElement> = {
      onKeyDown(e) {
        if (isValidKeyboardEvent(e.nativeEvent)) {
          e.preventDefault();
          e.stopPropagation();


          // If the event is repeating, it may have started on a different element
          // after which focus moved to the current element. Ignore these events and
          // only handle the first key down event.
          if (!state.isPressed && !e.repeat) {
            state.target = e.currentTarget as HTMLElement;
            state.isPressed = true;
            triggerPressStart(e, 'keyboard');

            // Focus may move before the key up event, so register the event on the document
            // instead of the same element where the key down event occurred.
            document.addEventListener('keyup', onKeyUp, false);
          }
        }
      },
      onKeyUp(e) {
        if (isValidKeyboardEvent(e.nativeEvent) && !e.repeat) {
          triggerPressUp(createEvent(state.target, e), 'keyboard');
        }
      },
      onClick(e) {
        if (e && e.button === 0) {
          e.stopPropagation();
          if (isDisabled) {
            e.preventDefault();
          }

          // If triggered from a screen reader or by using element.click(),
          // trigger as if it were a keyboard click.
          if (!state.ignoreClickAfterPress && !state.ignoreEmulatedMouseEvents && isVirtualClick(e.nativeEvent)) {
            // Ensure the element receives focus (VoiceOver on iOS does not do this)
            if (!isDisabled) {
              focusWithoutScrolling(e.currentTarget);
            }

            triggerPressStart(e, 'virtual');
            triggerPressUp(e, 'virtual');
            triggerPressEnd(e, 'virtual');
          }

          state.ignoreEmulatedMouseEvents = false;
          state.ignoreClickAfterPress = false;
        }
      }
    };

    let onKeyUp = (e: KeyboardEvent) => {
      if (state.isPressed && isValidKeyboardEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
        
        state.isPressed = false;
        triggerPressEnd(createEvent(state.target, e), 'keyboard', e.target === state.target);
        document.removeEventListener('keyup', onKeyUp, false);

        // If the target is a link, trigger the click method to open the URL,
        // but defer triggering pressEnd until onClick event handler.
        if (e.target === state.target && isHTMLAnchorLink(state.target) || state.target.getAttribute('role') === 'link') {
          state.target.click();
        }
      }
    };

    // Safari on iOS starts selecting text on long press. The only way to avoid this, it seems,
    // is to add user-select: none to the entire page. Adding it to the pressable element prevents
    // that element from being selected, but nearby elements may still receive selection. We add
    // user-select: none on touch start, and remove it again on touch end to prevent this.
    let disableTextSelection = () => {
      state.userSelect = document.documentElement.style.webkitUserSelect;
      document.documentElement.style.webkitUserSelect = 'none';
    };

    let restoreTextSelection = () => {
      // There appears to be a delay on iOS where selection still might occur 
      // after pointer up, so wait a bit before removing user-select.
      setTimeout(() => {
        // Avoid race conditions
        if (!state.isPressed && document.documentElement.style.webkitUserSelect === 'none') {
          document.documentElement.style.webkitUserSelect = state.userSelect || '';
          state.userSelect = null;
        }
      }, 300);
    };

    if (typeof PointerEvent !== 'undefined') {
      pressProps.onPointerDown = (e) => {
        // Only handle left clicks
        if (e.button !== 0) {
          return;
        }

        // Due to browser inconsistencies, especially on mobile browsers, we prevent
        // default on pointer down and handle focusing the pressable element ourselves.
        e.preventDefault();
        e.stopPropagation();
        if (!state.isPressed) {
          state.isPressed = true;
          state.isOverTarget = true;
          state.activePointerId = e.pointerId;
          state.target = e.currentTarget;

          if (!isDisabled) {
            focusWithoutScrolling(e.currentTarget);
          }

          disableTextSelection();
          triggerPressStart(e, e.pointerType);

          document.addEventListener('pointermove', onPointerMove, false);
          document.addEventListener('pointerup', onPointerUp, false);
          document.addEventListener('pointercancel', onPointerCancel, false);
        }
      };

      pressProps.onMouseDown = (e) => {
        if (e.button === 0) {
          // Chrome and Firefox on touch Windows devices require mouse down events
          // to be canceled in addition to pointer events, or an extra asynchronous
          // focus event will be fired.
          e.preventDefault();
        }
      };

      let unbindEvents = () => {
        document.removeEventListener('pointermove', onPointerMove, false);
        document.removeEventListener('pointerup', onPointerUp, false);
        document.removeEventListener('pointercancel', onPointerCancel, false);
      };

      pressProps.onPointerUp = (e) => {
        // Only handle left clicks
        // Safari on iOS sometimes fires pointerup events, even
        // when the touch isn't over the target, so double check.
        if (e.button === 0 && isOverTarget(e, e.currentTarget)) {
          triggerPressUp(e, e.pointerType as PointerType);
        }
      };

      // Safari on iOS < 13.2 does not implement pointerenter/pointerleave events correctly.
      // Use pointer move events instead to implement our own hit testing.
      // See https://bugs.webkit.org/show_bug.cgi?id=199803
      let onPointerMove = (e: PointerEvent) => {
        if (e.pointerId !== state.activePointerId) {
          return;
        }

        if (isOverTarget(e, state.target)) {
          if (!state.isOverTarget) {
            state.isOverTarget = true;
            triggerPressStart(createEvent(state.target, e), e.pointerType as PointerType);
          }
        } else if (state.isOverTarget) {
          state.isOverTarget = false;
          triggerPressEnd(createEvent(state.target, e), e.pointerType as PointerType, false);
        }
      };

      let onPointerUp = (e: PointerEvent) => {
        if (e.pointerId === state.activePointerId && state.isPressed && e.button === 0) {
          if (isOverTarget(e, state.target)) {
            triggerPressEnd(createEvent(state.target, e), e.pointerType as PointerType);
          } else if (state.isOverTarget) {
            triggerPressEnd(createEvent(state.target, e), e.pointerType as PointerType, false);
          }

          state.isPressed = false;
          state.isOverTarget = false;
          state.activePointerId = null;
          unbindEvents();
          restoreTextSelection();
        }
      };

      let onPointerCancel = (e: PointerEvent) => {
        if (state.isPressed) {
          if (state.isOverTarget) {
            triggerPressEnd(createEvent(state.target, e), e.pointerType as PointerType, false);
          }
          state.isPressed = false;
          state.isOverTarget = false;
          state.activePointerId = null;
          unbindEvents();
          restoreTextSelection();
        }
      };
    } else {
      pressProps.onMouseDown = (e) => {
        // Only handle left clicks
        if (e.button !== 0) {
          return;
        }

        // Due to browser inconsistencies, especially on mobile browsers, we prevent
        // default on mouse down and handle focusing the pressable element ourselves.
        e.preventDefault();
        e.stopPropagation();
        if (state.ignoreEmulatedMouseEvents) {
          return;
        }

        state.isPressed = true;
        state.isOverTarget = true;
        state.target = e.currentTarget;

        if (!isDisabled) {
          focusWithoutScrolling(e.currentTarget);
        }

        triggerPressStart(e, isVirtualClick(e.nativeEvent) ? 'virtual' : 'mouse');

        document.addEventListener('mouseup', onMouseUp, false);
      };

      pressProps.onMouseEnter = (e) => {
        e.stopPropagation();
        if (state.isPressed && !state.ignoreEmulatedMouseEvents) {
          state.isOverTarget = true;
          triggerPressStart(e, 'mouse');
        }
      };

      pressProps.onMouseLeave = (e) => {
        e.stopPropagation();
        if (state.isPressed && !state.ignoreEmulatedMouseEvents) {
          state.isOverTarget = false;
          triggerPressEnd(e, 'mouse', false);
        }
      };

      pressProps.onMouseUp = (e) => {
        if (!state.ignoreEmulatedMouseEvents && e.button === 0) {
          triggerPressUp(e, isVirtualClick(e.nativeEvent) ? 'virtual' : 'mouse');
        }
      };

      let onMouseUp = (e: MouseEvent) => {
        // Only handle left clicks
        if (e.button !== 0) {
          return;
        }
        
        state.isPressed = false;
        document.removeEventListener('mouseup', onMouseUp, false);

        if (state.ignoreEmulatedMouseEvents) {
          state.ignoreEmulatedMouseEvents = false;
          return;
        }

        let pointerType: PointerType = isVirtualClick(e) ? 'virtual' : 'mouse';
        if (isOverTarget(e, state.target)) {
          triggerPressEnd(createEvent(state.target, e), pointerType);
        } else if (state.isOverTarget) {
          triggerPressEnd(createEvent(state.target, e), pointerType, false);
        }

        state.isOverTarget = false;
      };

      pressProps.onTouchStart = (e) => {
        e.stopPropagation();
        let touch = getTouchFromEvent(e.nativeEvent);
        if (!touch) {
          return;
        }
        state.activePointerId = touch.identifier;
        state.ignoreEmulatedMouseEvents = true;
        state.isOverTarget = true;
        state.isPressed = true;
        state.target = e.currentTarget;

        // Due to browser inconsistencies, especially on mobile browsers, we prevent default
        // on the emulated mouse event and handle focusing the pressable element ourselves.
        if (!isDisabled) {
          focusWithoutScrolling(e.currentTarget);
        }

        disableTextSelection();
        triggerPressStart(e, 'touch');

        window.addEventListener('scroll', onScroll, true);
      };

      pressProps.onTouchMove = (e) => {
        e.stopPropagation();
        if (!state.isPressed) {
          return;
        }

        let touch = getTouchById(e.nativeEvent, state.activePointerId);
        if (touch && isOverTarget(touch, e.currentTarget)) {
          if (!state.isOverTarget) {
            state.isOverTarget = true;
            triggerPressStart(e, 'touch');
          }
        } else if (state.isOverTarget) {
          state.isOverTarget = false;
          triggerPressEnd(e, 'touch', false);
        }
      };

      pressProps.onTouchEnd = (e) => {
        e.stopPropagation();
        if (!state.isPressed) {
          return;
        }

        let touch = getTouchById(e.nativeEvent, state.activePointerId);
        if (touch && isOverTarget(touch, e.currentTarget)) {
          triggerPressUp(e, 'touch');
          triggerPressEnd(e, 'touch');
        } else if (state.isOverTarget) {
          triggerPressEnd(e, 'touch', false);
        }

        state.isPressed = false;
        state.activePointerId = null;
        state.isOverTarget = false;
        state.ignoreEmulatedMouseEvents = true;
        restoreTextSelection();
        window.removeEventListener('scroll', onScroll, true);
      };

      pressProps.onTouchCancel = (e) => {
        e.stopPropagation();
        if (state.isPressed) {
          cancelTouchEvent(e, 'touch');
        }
      };

      let onScroll = (e: Event) => {
        if (state.isPressed && (e.target as HTMLElement).contains(state.target)) {
          cancelTouchEvent({
            currentTarget: state.target,
            shiftKey: false,
            ctrlKey: false,
            metaKey: false
          }, 'touch');
        }
      };

      let cancelTouchEvent = (e: EventBase, pointerType: PointerType) => {
        if (state.isOverTarget) {
          triggerPressEnd(e, pointerType, false);
        }

        state.isPressed = false;
        state.activePointerId = null;
        state.isOverTarget = false;
        restoreTextSelection();
        window.removeEventListener('scroll', onScroll, true);
      };
    }

    return pressProps;
  }, [onPress, onPressStart, onPressEnd, onPressChange, onPressUp, isDisabled]);

  return {
    isPressed: isPressedProp || isPressed,
    pressProps: mergeProps(domProps, pressProps)
  };
}

function isHTMLAnchorLink(target: HTMLElement): boolean {
  return target.tagName === 'A' && target.hasAttribute('href');
}

function isValidKeyboardEvent(event: KeyboardEvent): boolean {
  const {key, target} = event;
  const element = target as HTMLElement;
  const {tagName, isContentEditable} = element;
  const role = element.getAttribute('role');
  // Accessibility for keyboards. Space and Enter only.
  // "Spacebar" is for IE 11
  return (
    (key === 'Enter' || key === ' ' || key === 'Spacebar') &&
    (tagName !== 'INPUT' &&
      tagName !== 'TEXTAREA' &&
      isContentEditable !== true) &&
    // A link with a valid href should be handled natively,
    // unless it also has role='button' and was triggered using Space.
    (!isHTMLAnchorLink(element) || (role === 'button' && key !== 'Enter')) &&
    // An element with role='link' should only trigger with Enter key
    !(role === 'link' && key !== 'Enter')
  );
}

// Per: https://github.com/facebook/react/blob/3c713d513195a53788b3f8bb4b70279d68b15bcc/packages/react-interactions/events/src/dom/shared/index.js#L74-L87
// Keyboards, Assitive Technologies, and element.click() all produce a "virtual"
// click event. This is a method of inferring such clicks. Every browser except
// IE 11 only sets a zero value of "detail" for click events that are "virtual".
// However, IE 11 uses a zero value for all click events. For IE 11 we rely on
// the quirk that it produces click events that are of type PointerEvent, and
// where only the "virtual" click lacks a pointerType field.
function isVirtualClick(event: MouseEvent | PointerEvent): boolean {
  // JAWS/NVDA with Firefox.
  if ((event as any).mozInputSource === 0 && event.isTrusted) {
    return true;
  }

  return event.detail === 0 && !(event as PointerEvent).pointerType;
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
  pointerId: null | number
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

function createEvent(target: HTMLElement, e: EventBase): EventBase {
  return {
    currentTarget: target,
    shiftKey: e.shiftKey,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey
  };
}

interface EventPoint {
  clientX: number,
  clientY: number
}

function isOverTarget(point: EventPoint, target: HTMLElement) {
  let rect = target.getBoundingClientRect();
  return (point.clientX || 0) >= (rect.left || 0) && 
    (point.clientX || 0) <= (rect.right || 0) && 
    (point.clientY || 0) >= (rect.top || 0) && 
    (point.clientY || 0) <= (rect.bottom || 0);
}
