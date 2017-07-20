import React, {Component} from 'react';
import ReactDOM from 'react-dom';

let PORTAL_CONTAINER = null;

/**
 * A global portal that lives in the document body which can be used to add
 * overlays like modals outside the normal React component tree.
 */
export default class PortalContainer extends Component {
  state = {
    children: {}
  }

  add(child) {
    let children = Object.assign({}, this.state.children);
    children[child.key] = child;
    this.setState({children});
  }

  remove(child) {
    let children = Object.assign({}, this.state.children);
    delete children[child.key];
    this.setState({children});
  }

  render() {
    return <div>{Object.values(this.state.children)}</div>;
  }

  static ensure() {
    if (PORTAL_CONTAINER) {
      return PORTAL_CONTAINER;
    }

    let node = document.createElement('div');
    document.body.appendChild(node);
    PORTAL_CONTAINER = ReactDOM.render(<PortalContainer />, node);
    return PORTAL_CONTAINER;
  }

  static add(child) {
    PortalContainer.ensure().add(child);
  }

  static remove(child) {
    PortalContainer.ensure().remove(child);
  }
}
