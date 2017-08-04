import Modal from 'react-overlays/lib/Modal';
import PortalContainer from '../../PortalContainer';
import React, {cloneElement} from 'react';
import '../style/index.styl';

let MODAL_KEY = 1;

export default class ModalContainer {
  static show(content) {
    let key = MODAL_KEY++;
    let hide = this.hide.bind(this, key);
    let modal = (
      <Modal
        show={true}
        onHide={hide}
        backdropClassName="coral3-Backdrop"
        className="coral3-modal"
        key={key}>
          {cloneElement(content, {onClose: hide})}
      </Modal>
    );

    PortalContainer.add(modal);
    return key;
  }

  static hide(key) {
    PortalContainer.remove({key});
  }
}
