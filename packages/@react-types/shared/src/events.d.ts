import {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  SyntheticEvent
} from 'react';

// Event bubbling can be problematic in real-world applications, so the default for React Spectrum components
// is not to propagate. This can be overridden by calling continuePropagation() on the event.
export type BaseEvent<T extends SyntheticEvent> = T & {
  /** @deprecated use continuePropagation */
  stopPropagation(): void,
  continuePropagation(): void
}

export type KeyboardEvent = BaseEvent<ReactKeyboardEvent<any>>;
export type FocusEvent = BaseEvent<ReactFocusEvent<any>>;

export type PointerType = 'mouse' | 'pen' | 'touch' | 'keyboard';

export interface PressEvent {
  type: 'pressstart' | 'pressend' | 'press',
  pointerType: PointerType,
  target: HTMLElement,
  shiftKey: boolean,
  ctrlKey: boolean,
  metaKey: boolean
}

export interface HoverEvent {
  type: 'hoverstart' | 'hoverend' | 'hover',
  pointerType: 'mouse' | 'touch' | 'pen',
  target: HTMLElement
}

export interface KeyboardEvents {
  /** 
   * A user defined callback function triggered upon keypress.
   * Passes the keyboard event as an input to the callback.
   */
  onKeyDown?: (e: KeyboardEvent) => void,
  /** 
   * A user defined callback function triggered when a key is released.
   * Passes the keyboard event as an input to the callback.
   */
  onKeyUp?: (e: KeyboardEvent) => void
}

export interface FocusEvents {
  /** 
   * A user defined callback function triggered when the element receives focus.
   * Passes the focus event as an input to the callback.
   */
  onFocus?: (e: FocusEvent) => void,
  /** 
   * A user defined callback function triggered when the element loses focus.
   * Passes the focus event as an input to the callback.
   */
  onBlur?: (e: FocusEvent) => void,
  /** 
   * A user defined callback function triggered when the element's focus status changes.
   * Passes a boolean reflecting the element's new focus status as an input to the callback.
   */
  onFocusChange?: (isFocused: boolean) => void
}

export interface HoverEvents {
  onHover?: (e: HoverEvent) => void,
  onHoverEnd?: (e: HoverEvent) => void,
  onHoverChange?: (isHovering: boolean) => void
}

export interface PressEvents {
  /**
   * Called when the mouse or touch is released
   * @param e A press event
   * @returns nothing
   */
  onPress?: (e: PressEvent) => void,
  onPressStart?: (e: PressEvent) => void,
  onPressEnd?: (e: PressEvent) => void,
  onPressChange?: (isPressed: boolean) => void
}

export interface FocusableProps extends FocusEvents, KeyboardEvents {
  /** Whether or not the element should receive focus on render */
  autoFocus?: boolean
}
