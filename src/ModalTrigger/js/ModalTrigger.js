import autobind from 'autobind-decorator';
import Modal from 'react-overlays/lib/Modal';
import PortalContainer from '../../PortalContainer';
import React, {cloneElement, Component} from 'react';
import ReactDOM from 'react-dom';
import '../style/index.styl';

let MODAL_KEY = 0;

@autobind
export default class ModalTrigger extends Component {
  modalKey = MODAL_KEY++;

  show() {
    const children = React.Children.toArray(this.props.children);
    const modalChild = children.find(c => c.props.modalContent) || children[children.length - 1];

    this.modal = (
      <Modal
        show={true}
        onHide={this.hide}
        backdropClassName="coral3-Backdrop"
        className="coral3-modal"
        key={this.modalKey}>
          {cloneElement(modalChild, {onClose: this.hide})}
      </Modal>
    );

    PortalContainer.add(this.modal);
  }

  hide() {
    if (this.modal) {
      PortalContainer.remove(this.modal);
      this.modal = null;
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
