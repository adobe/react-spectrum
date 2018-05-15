import autobind from 'autobind-decorator';
import BaseModal from 'react-overlays/lib/Modal';
import classNames from 'classnames';
import closest from 'dom-helpers/query/closest';
import filterDOMProps from '../../utils/filterDOMProps';
import OpenTransition from '../../utils/OpenTransition';
import PortalContainer from '../../PortalContainer';
import React, {cloneElement} from 'react';
import ReactDOM from 'react-dom';

importSpectrumCSS('underlay');

let MODAL_KEY = 1;

export default class ModalContainer {
  static show(content, context, container) {
    let key = MODAL_KEY++;

    // If container is not specified, look for the provider of context
    if (!container && context) {
      container = () => closest(ReactDOM.findDOMNode(context), '.react-spectrum-provider');
    }

    let modal = (
      <Modal
        container={container}
        key={key}
        onHide={this.hide.bind(this, key)}
        onClose={content.props.onClose}>
        {content}
      </Modal>
    );

    PortalContainer.add(modal, context);
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
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  onEntering() {
    // Make sure that autoFocus actually moves focus to the Modal.
    if (this.baseModal.lastFocus === document.activeElement) {
      this.baseModal.autoFocus();
    }
  }

  backdropMode() {
    // I am sorry for this atrocity. I needed a way to detect when not to have a backdrop.
    const fullscreenTakeover = this.props.children.props.mode === 'fullscreenTakeover';

    /*
     * backdropClickable (bc)
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
    const {role} = this.props.children.props;

    let hasDialogRole = role && role.indexOf('dialog') !== -1;

    // The z-index here should match the one in Overlay
    return (
      <BaseModal
        container={this.props.container}
        style={{zIndex: 100000, position: 'relative'}}
        show={this.state.show}
        ref={baseModal => this.baseModal = baseModal}
        onEntering={this.onEntering}
        onExited={this.props.onHide}
        onHide={this.onClose}
        backdrop={backdrop}
        renderBackdrop={(props) => <Underlay {...props} />}
        transition={OpenTransition}
        backdropTransition={OpenTransition}
        role={hasDialogRole ? 'presentation' : 'dialog'}
        aria-modal={null}>
        {cloneElement(this.props.children, {
          onClose: this.onClose
        })}
      </BaseModal>
    );
  }
}

class Underlay extends React.Component {
  render() {
    let {open, ...props} = this.props;
    return <div {...filterDOMProps(props)} className={classNames('spectrum-Underlay', {'is-open': open})} />;
  }
}
