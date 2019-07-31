import {fireEvent} from '@testing-library/react';

// Triggers a "press" event on an element.
// TODO: move to somewhere more common
export function triggerPress(element) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
}
