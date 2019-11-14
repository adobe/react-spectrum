import {fireEvent} from '@testing-library/react';

// Triggers a "hover" event on an element.
// TODO: move to somewhere more common
export function triggerHover(element) {
  fireEvent.mouseEnter(element);
}
