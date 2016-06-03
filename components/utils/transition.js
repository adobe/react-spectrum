// Determine which event to add a transition event to depending on the browser being used.
let transitionEvent;
export function getTransitionEvent() {
  if (!transitionEvent) {
    const el = document.createElement('fakeelement');
    const transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (let t in transitions) {
      if (el.style[t] !== undefined) {
        transitionEvent = transitions[t];
        break;
      }
    }
  }
  return transitionEvent;
}
