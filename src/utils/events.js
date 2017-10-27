export function interpretKeyboardEvent(event) {
  switch (event.key) {
    case 'Enter':
    case 'Tab':
      if (this.onSelectFocused) {
        this.onSelectFocused(event);
      }
      break;

    case 'PageUp':
    case 'Home':
      if (this.onFocusFirst) {
        this.onFocusFirst(event);
      }
      break;

    case 'PageDown':
    case 'End':
      if (this.onFocusLast) {
        this.onFocusLast(event);
      }
      break;

    case 'ArrowUp':
      if (this.onFocusPrevious) {
        this.onFocusPrevious(event);
      }
      break;

    case 'ArrowDown':
      if (this.onFocusNext) {
        this.onFocusNext(event);
      }
      break;

    case 'Escape':
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
