import {fireEvent} from '@testing-library/react';

// Triggers a "hover" event on an element.
export function triggerHover(element) {
  fireEvent.mouseOver(element);
  // mouseEnter didn't work either
}





// Delete this file 
