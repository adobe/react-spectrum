import autobind from 'autobind-decorator';
import BaseModal from 'react-overlays/lib/Modal';
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
export class Modal extends React.Component {

  state = {
    show: true
  };

  onClose() {
    this.setState({show: false});
  }

  backdropMode() {
    // I am sorry for this atrocity. I needed a way to detect when not to have a backdrop.
    const fullscreenTakeover = this.props.children.props.mode === 'fullscreenTakeover';

    /*
     * backdropClickable (bc), backdropEnabled (be)
     *     bc | !bc
     *     ---|------
     *      t |static
     * if fullscreenTakeover, then always false
     */
    let {backdropClickable} = this.props.children.props;
    let backdrop = 'static';
    if (backdropClickable) {
      backdrop = true;
    }
    if (fullscreenTakeover) {
      backdrop = false;
    }
    return backdrop;
  }

  render() {
    const backdrop = this.backdropMode();

    // The z-index here should match the one in Overlay
    return (
      <BaseModal
        style={{zIndex: 100000, position: 'relative'}}
        show={this.state.show}
        onExited={this.props.onHide}
        onHide={this.onClose}
        backdrop={backdrop}
        renderBackdrop={(props) => <Underlay {...props} />}
        transition={OpenTransition}
        backdropTransition={OpenTransition}>
        {cloneElement(this.props.children, {onClose: this.onClose})}
      </BaseModal>
    );
  }
}

class Underlay extends React.Component {
  render() {
    let {open, ...props} = this.props;
    return <div {...props} className={classNames('spectrum-Underlay', {'is-open': open})} />;
  }
}
