import {fireEvent} from '@testing-library/react';

// Triggers a "hover" event on an element.
export function triggerHover(element) {
  fireEvent.mouseEnter(element);
}
