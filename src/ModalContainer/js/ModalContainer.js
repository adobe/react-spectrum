import autobind from 'autobind-decorator';
import BaseModal from 'devongovett-react-overlays/lib/Modal';
import OpenTransition from '../../utils/OpenTransition';
import PortalContainer from '../../PortalContainer';
import React, {cloneElement} from 'react';
import '../style/index.styl';
import classNames from 'classnames';

let MODAL_KEY = 1;

export default class ModalContainer {
  static show(content) {
    let key = MODAL_KEY++;

    let modal = (
      <Modal
        key={key}
        onHide={this.hide.bind(this, key)}>
        {content}
      </Modal>
    );

    PortalContainer.add(modal);
    return key;
  }

  static hide(key) {
    PortalContainer.remove({key});
  }
}

@autobind
class Modal extends React.Component {
  state = {
    show: true
  };

  onClose() {
    this.setState({show: false});
  }

  render() {
    // I am sorry for this atrocity. I needed a way to detect when not to have a backdrop.
    let hasBackdrop = this.props.children.props.mode !== 'fullscreenTakeover';

    return (
      <BaseModal
        show={this.state.show}
        onExited={this.props.onHide}
        onHide={this.onClose}
        backdrop={hasBackdrop}
        renderBackdrop={(props) => <Underlay {...props} />}
        transition={OpenTransition}
        backdropTransition={OpenTransition}>
        {cloneElement(this.props.children, {onClose: this.onClose})}
      </BaseModal>
    );
  }
}

function Underlay({open, ...props}) {
  return <div {...props} className={classNames('spectrum-Underlay', {'is-open': open})} />;
}
