// Determine which event to add a transition event to depending on the browser being used.
let transitionEvent;
export function getTransitionEvent() {
  if (!transitionEvent) {
    const el = document.createElement('fakeelement');
    const transitions = {
      transition: 'transitionend',
      OTransition: 'oTransitionEnd',
      MozTransition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd'
    };
    const keys = Object.keys(transitions);

    for (let i = 0; i < keys.length; i++) {
      const t = keys[i];
      if (el.style[t] !== undefined) {
        transitionEvent = transitions[t];
        break;
      }
    }
  }
  return transitionEvent;
}
