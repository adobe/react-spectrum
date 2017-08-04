import autobind from 'autobind-decorator';
import ModalContainer from '../../ModalContainer';
import React, {cloneElement, Component} from 'react';
import ReactDOM from 'react-dom';

@autobind
export default class ModalTrigger extends Component {
  show() {
    const children = React.Children.toArray(this.props.children);
    const modalChild = children.find(c => c.props.modalContent) || children[children.length - 1];
    this.modalKey = ModalContainer.show(modalChild);
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

    return (
      <div>
        {children.map((child) => {
          if (child === trigger) {
            return cloneElement(child, {onClick: this.show});
          } else if (child === modalChild) {
            return null;
          } else {
            return child;
          }
        }, this)}
      </div>
    );
  }
}
