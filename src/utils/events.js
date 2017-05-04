export function interpretKeyboardEvent(event) {
  switch (event.key) {
    case 'Enter':
    case 'Tab':
      if (this.onSelectFocused) {
        event.preventDefault();
        this.onSelectFocused(event);
      }
      break;

    case 'PageUp':
    case 'Home':
      if (this.onFocusFirst) {
        event.preventDefault();
        this.onFocusFirst(event);
      }
      break;

    case 'PageDown':
    case 'End':
      if (this.onFocusLast) {
        event.preventDefault();
        this.onFocusLast(event);
      }
      break;

    case 'ArrowUp':
      if (this.onFocusPrevious) {
        event.preventDefault();
        this.onFocusPrevious(event);
      }
      break;

    case 'ArrowDown':
      if (this.onFocusNext) {
        event.preventDefault();
        this.onFocusNext(event);
      }
      break;

    case 'Escape':
      if (this.onEscape) {
        event.preventDefault();
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
