export function interpretKeyboardEvent(event, orientation = 'vertical') {
  switch (event.key) {
    case 'Enter':
    case ' ':
      if (this.onSelectFocused) {
        this.onSelectFocused(event);
      }
      break;

    case 'Tab':
      if (this.onTab) {
        this.onTab(event);
      }
      break;

    case 'PageUp':
      if (this.onPageUp) {
        this.onPageUp(event);
      } else if (this.onFocusFirst) {
        this.onFocusFirst(event);
      }
      break;

    case 'PageDown':
      if (this.onPageDown) {
        this.onPageDown(event);
      } else if (this.onFocusLast) {
        this.onFocusLast(event);
      }
      break;

    case 'Home':
      if (this.onFocusFirst) {
        this.onFocusFirst(event);
      }
      break;

    case 'End':
      if (this.onFocusLast) {
        this.onFocusLast(event);
      }
      break;

    case 'ArrowUp':
    case 'Up':
      if (event.altKey && this.onAltArrowUp) {
        this.onAltArrowUp(event);
      } else if (orientation !== 'horizontal' && this.onFocusPrevious) {
        this.onFocusPrevious(event);
      }
      break;

    case 'ArrowDown':
    case 'Down':
      if (event.altKey && this.onAltArrowDown) {
        this.onAltArrowDown(event);
      } else if (orientation !== 'horizontal' && this.onFocusNext) {
        this.onFocusNext(event);
      }
      break;

    case 'ArrowLeft':
    case 'Left':
      if (orientation !== 'vertical' && this.onFocusPrevious) {
        this.onFocusPrevious(event);
      }
      break;

    case 'ArrowRight':
    case 'Right':
      if (orientation !== 'vertical' && this.onFocusNext) {
        this.onFocusNext(event);
      }
      break;

    case 'Escape':
    case 'Esc':
      if (this.onEscape) {
        this.onEscape(event);
      }
      break;

    default:
      // do nothing
  }
}

export function chain(...callbacks) {
  return (...args) => {
    for (let callback of callbacks) {
      if (typeof callback === 'function') {
        callback(...args);
      }
    }
  };
}

let mouseDownPrevented = false;
export function focusAfterMouseEvent(handler, event) {
  // If server side rendering, just call handler method.
  if (!document) {
    handler && handler.call(this, event);
    return;
  }

  // execute the handler
  if (handler) {
    handler.call(this, event);
    if (event.isDefaultPrevented()) {
      mouseDownPrevented = event.type === 'mousedown';
      return;
    }
  }

  // make sure that the element has focus by calling this.focus();
  if (!mouseDownPrevented && typeof this.focus === 'function') {
    this.focus();
  }

  if (event.type === 'mouseup') {
    mouseDownPrevented = false;
  }
}
