import autobind from 'autobind-decorator';
import ModalContainer from '../../ModalContainer';
import React, {cloneElement, Component} from 'react';

@autobind
export default class ModalTrigger extends Component {
  show() {
    const children = React.Children.toArray(this.props.children);
    const modalChild = children.find(c => c.props.modalContent) || children[children.length - 1];
    this.modalKey = ModalContainer.show(modalChild, this, this.props.container);
  }

  hide() {
    if (this.modalKey) {
      ModalContainer.hide(this.modalKey);
      this.modalKey = null;
    }
  }

  render() {
    const children = React.Children.toArray(this.props.children);
    const trigger = children.find(c => c.props.modalTrigger) || children[0];
    const modalChild = children.find(c => c.props.modalContent) || children[children.length - 1];
    
    let nodes = [];
    children.forEach(child => {
      if (child === trigger) {
        nodes.push(cloneElement(child, {onClick: this.show}));
      } else if (child !== modalChild) {
        nodes.push(child);
      }
    });

    if (nodes.length === 1) {
      return nodes[0];
    }

    return (
      <div>
        {nodes}
      </div>
    );
  }
}
