import React from 'react';
import ReactDOM from 'react-dom';

/**
 * This is a decorator that ensures a focus-ring className set by the focus-ring-polyfill
 * is retained when a focused component is rendered following a state change.
*/
export default function focusRing(WrappedComponent) {
  const proto = WrappedComponent.prototype;
  const componentWillUpdate = proto.componentWillUpdate;
  const componentDidUpdate = proto.componentDidUpdate;

  const FOCUS_RING_CLASSNAME = 'focus-ring';
  let elementWithFocusRing = null;

  proto.componentWillUpdate = function (props, state) {
    // call original method
    if (componentWillUpdate) {
      componentWillUpdate.apply(this, arguments);
    }

    if (elementWithFocusRing == null || elementWithFocusRing !== document.activeElement) {
      try {
        const node = ReactDOM.findDOMNode(this);
        elementWithFocusRing = node.parentNode.querySelector('.' + FOCUS_RING_CLASSNAME);
      } catch (error) {
        // do nothing if component is not mounted
      }
    }
  };

  proto.componentDidUpdate = function (props, state) {
    // call original method
    if (componentDidUpdate) {
      componentDidUpdate.apply(this, arguments);
    }

    try {
      const node = ReactDOM.findDOMNode(this);
      if (elementWithFocusRing &&
          (document.activeElement === elementWithFocusRing || node.contains(document.activeElement)) &&
          !elementWithFocusRing.classList.contains(FOCUS_RING_CLASSNAME)) {
        document.activeElement.classList.add(FOCUS_RING_CLASSNAME);
        elementWithFocusRing = null;
      }
    } catch (error) {
      // do nothing if component is not mounted
    }
  };
}
