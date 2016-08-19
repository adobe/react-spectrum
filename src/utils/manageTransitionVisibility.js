import { getTransitionEvent } from './transition';

const transitionEvent = getTransitionEvent();

/*
 * Sets an element's visibility to visible as soon as it's opened so an opacity transition can
 * be seen. When an element is closed, it waits until the opacity transition has completed before
 * setting visibility to hidden. Visibility must be set to hidden since an element will block
 * interaction on elements behind it if we merely set opacity to 0.
 */
module.exports = (element, isOpen = false) => {

  const onTransitionEnd = e => {
    if (!isOpen && e.propertyName === 'opacity') {
      element.style.visibility = 'hidden';
    }
  };

  element.addEventListener(transitionEvent, onTransitionEnd);

  return {
    // Must be called with the element is opened or closed.
    setIsOpen(value) {
      isOpen = value;

      if (isOpen) {
        element.style.visibility = 'visible';
      }
    },
    // Cleans up listeners.
    destroy() {
      element.removeEventListener(transitionEvent, onTransitionEnd);
    }
  }
};
