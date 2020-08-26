import {DialogContainerContext} from './DialogContainerContext';
import React, {Fragment, ReactElement, useContext, useEffect, useRef, useState} from 'react';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {SpectrumDialogClose, SpectrumDialogProps} from '@react-types/dialog';
import {unwrapDOMRef, useMediaQuery} from '@react-spectrum/utils';
import {Modal, Popover, Tray} from '@react-spectrum/overlays';
import {DOMRefValue} from '@react-types/shared';
import {useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import {DialogContext} from './context';
import {DialogTriggerBase} from './DialogTrigger';
import {Dialog} from './Dialog';


export function DialogContainer(props): ReactElement {
  let {
    children,
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type,
    isDismissable
  } = props;
  // NOTE: content needs to be saved as function in order to save in useState (since it's a function as child)
  let [overlays, setOverlays] = useState([]);
  let [overlayProps, setOverlayProps] = useState(props);

  // On small devices, show a modal or tray instead of a popover.
  // TODO: DNA variable?
  let isMobile = useMediaQuery('(max-width: 700px)');
  if (isMobile) {
    // handle cases where desktop popovers need a close button for the mobile modal view
    if (type !== 'modal' && mobileType === 'modal') {
      isDismissable = true;
    }

    type = mobileType;
  }

  let state = useOverlayTriggerState(overlayProps);

  let addContent = content => {
    let newOverlayContent = [...overlays];
    newOverlayContent.unshift(content);
    setOverlays(newOverlayContent);
  };

  let overlayContent = overlays.length ? overlays[0] : null;
  let context = {
    type,
    onClose: state.close,
    isDismissable
  };
  let onClose = () => {
    let newOverlays = [...overlays];
    newOverlays.shift();
    setOverlays(newOverlays);
    state.close();
  };

  let renderOverlay = () => {
    switch (type) {
      case 'fullscreen':
      case 'fullscreenTakeover':
        return (
          <Modal isOpen={state.isOpen} isDismissable={false} onClose={onClose} type={type}>
            {typeof overlayContent === 'function' ? overlayContent(onClose) : overlayContent}
          </Modal>
        );
      case 'modal':
        return (
          <Modal isOpen={state.isOpen} isDismissable={isDismissable} onClose={onClose}>
            {typeof overlayContent === 'function' ? overlayContent(onClose) : overlayContent}
          </Modal>
        );
      case 'tray':
        return (
          <Tray isOpen={state.isOpen} onClose={onClose}>
            {typeof overlayContent === 'function' ? overlayContent(onClose) : overlayContent}
          </Tray>
        );
    }
  };

  return (
    <>
      <DialogContainerContext.Provider value={{isDismissable, state, overlayContent, addContent, setOverlayProps, type}}>
        {children}
      </DialogContainerContext.Provider>
      <DialogContext.Provider value={context}>
        {renderOverlay()}
      </DialogContext.Provider>
    </>
  );
}
