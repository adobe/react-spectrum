import Modal from 'react-overlays/lib/Modal';
import OpenTransition from '../../utils/OpenTransition';
import PortalContainer from '../../PortalContainer';
import React, {cloneElement} from 'react';
import '../style/index.styl';
import classNames from 'classnames';

let MODAL_KEY = 1;

export default class ModalContainer {
  static show(content) {
    let key = MODAL_KEY++;
    let hide = this.hide.bind(this, key);

    let modal = (
      <Modal
        show
        onHide={hide}
        backdropClassName="spectrum-Underlay"
        key={key}
        renderBackdrop={(props) => <Underlay {...props} />}
        transition={OpenTransition}
        backdropTransition={OpenTransition}>
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

function Underlay({open, ...props}) {
  return <div {...props} className={classNames('spectrum-Underlay', {'is-open': open})} />;
}
