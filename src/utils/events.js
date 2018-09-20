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

export function focusAfterMouseEvent(handler, event) {
  if (handler) {
    handler(event);
    if (event.isDefaultPrevented()) {
      return;
    }
  }
  if (typeof this.focus === 'function') {
    this.focus();
  }
}
