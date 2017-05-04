
import autobind from 'autobind-decorator';
import Modal from 'react-overlays/lib/Modal';
import React, {cloneElement, Component} from 'react';
import '../style/index.styl';

@autobind
export default class ModalTrigger extends Component {
  state = {
    show: false
  }

  trigger() {
    this.setState({show: !this.state.show});
  }

  show() {
    this.setState({show: true});
  }

  hide() {
    this.setState({show: false});
  }

  render() {
    const children = React.Children.toArray(this.props.children);
    const trigger = children.find(c => c.props.modalTrigger) || children[0];
    const modalChild = children.find(c => c.props.modalContent) || children[children.length - 1];

    let props = {};
    props.onClose = this.hide;

    return (
      <div className="modalstuff">
        {children.map((child) => {
          if (child === trigger) {
            return cloneElement(child, {onClick: this.trigger});
          } else if (child === modalChild) {
            return (
              <Modal
                show={this.state.show}
                onHide={this.hide}
                backdropClassName="coral3-Backdrop"
                className="coral3-modal">
                  {cloneElement(modalChild, props)}
              </Modal>
            );
          } else {
            return child;
          }
        }, this)}
      </div>
    );
  }
}
