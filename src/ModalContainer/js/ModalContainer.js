import autobind from 'autobind-decorator';
import BaseModal from 'react-overlays/lib/Modal';
import {chain} from '../../utils/events';
import classNames from 'classnames';
import closest from 'dom-helpers/query/closest';
import filterDOMProps from '../../utils/filterDOMProps';
import ModalManager from './ModalManager';
import OpenTransition from '../../utils/OpenTransition';
import PortalContainer from '../../PortalContainer';
import React, {cloneElement} from 'react';
import ReactDOM from 'react-dom';

importSpectrumCSS('underlay');

const MODAL_LIFECYCLE_METHODS = [
  'onBackdropClick',
  'onEnter',
  'onEntering',
  'onEntered',
  'onEscapeKeyDown',
  'onExit',
  'onExiting',
  'onExited',
  'onHide',
  'onShow'
];
const MANAGER_SINGLETON = new ModalManager({handleContainerOverflow: false});
let MODAL_KEY = 1;

export default class ModalContainer {
  static show(content, context, container) {
    let key = MODAL_KEY++;

    // If container is not specified, look for the provider of context
    if (!container && context) {
      container = () => closest(ReactDOM.findDOMNode(context), '.react-spectrum-provider');
    } else if (!container) {
      container = () => document.querySelector('.react-spectrum-provider') || document.body;
    }

    let {
      disableEscKey,
      role,
      onClose,
      onHide,
      onExited,
      ...modalProps
    } = content.props;

    role = role && role.indexOf('dialog') !== -1 ? 'presentation' : 'dialog';

    // filter out content.props that are not modal lifecycle methods
    modalProps = MODAL_LIFECYCLE_METHODS.reduce((obj, key) => ({...obj, [key]: modalProps[key]}), {});

    let modal = (
      <Modal
        {...modalProps}
        container={container}
        key={key}
        keyboard={!disableEscKey}
        role={role}
        onClose={onClose}
        onHide={chain(this.hide.bind(this, key), onHide, onExited)}
        aria-modal={role === 'dialog' || null}>
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

  onEntering(e) {
    if (this.props.onEntering) {
      this.props.onEntering(e);
    }
    // Make sure that autoFocus actually moves focus to the Modal.
    if (this.baseModal.lastFocus === document.activeElement) {
      this.baseModal.autoFocus();
    }
  }

  backdropMode() {
    /*
     * backdropClickable (bc)
     *     bc | !bc
     *     ---|------
     *      t |static
     * if fullscreenTakeover, then always false
     */
    const {backdropClickable, mode} = this.props.children.props;
    let backdrop = 'static';
    if (backdropClickable) {
      backdrop = true;
    }
    if (mode === 'fullscreenTakeover') {
      backdrop = false;
    }
    return backdrop;
  }

  render() {
    const backdrop = this.backdropMode();
    const {children, onHide, ...modalProps} = this.props;

    // The z-index here should match the one in Overlay
    return (
      <BaseModal
        {...modalProps}
        style={{zIndex: 100000, position: 'relative'}}
        show={this.state.show}
        ref={baseModal => this.baseModal = baseModal}
        onEntering={this.onEntering}
        onExited={onHide}
        onHide={this.onClose}
        backdrop={backdrop}
        manager={MANAGER_SINGLETON}
        renderBackdrop={(props) => <Underlay {...props} />}
        transition={OpenTransition}
        backdropTransition={OpenTransition}>
        {cloneElement(children, {
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
export {MANAGER_SINGLETON as modalManager};
