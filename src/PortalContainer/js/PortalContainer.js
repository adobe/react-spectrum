import React from 'react';
import ReactDOM from 'react-dom';

let children = {};

/*
 * A global portal that lives in the document body which can be used to add
 * overlays like modals outside the normal React component tree.
 */
export default class PortalContainer {
  /**
   * Renders the child
   * @param child component to be render
   * @param context Parent with the context
   */
  static add(child, context) {
    let node = document.createElement('div');
    if (!context) {
      ReactDOM.render(child, node);
    } else {
      ReactDOM.unstable_renderSubtreeIntoContainer(context, child, node);
    }
    children[child.key] = node;
  }

  /**
   * Remove child from the dom
   * @param child
   */
  static remove(child) {
    ReactDOM.unmountComponentAtNode(children[child.key]);
    delete children[child.key];
  }
}
