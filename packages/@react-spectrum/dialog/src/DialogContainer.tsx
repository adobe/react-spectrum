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
    content,
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type,
    hideArrow,
    targetRef,
    isDismissable,
    ...positionProps
  } = props;
  // NOTE: content needs to be saved as function in order to save in useState (since it's a function as child)
  let [overlayContent, setOverlayContent] = useState(() => content);
  let [overlayProps, setOverlayProps] = useState(props);
  let [dialogProps, setDialogProps] = useState({});
  let [triggerProps, setTriggerProps] = useState({});

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

  // todo just pass setOverlayContent via context value
  let addContent = content => setOverlayContent(() => content);

  let dialogContainerContext = {
    isDismissable,
    state,
    setDialogProps,
    setTriggerProps,
    setOverlayContent,
    setOverlayProps,
    triggerProps,
    type
  };

  if (type === 'popover') {
    let context = {
      type,
      onClose: state.close,
      isDismissable,
      ...dialogProps
    };
    return (
      <DialogContainerContext.Provider value={dialogContainerContext}>
        {children}
        <DialogContext.Provider value={context}>
          <PopoverTrigger
            {...positionProps}
            state={state}
            targetRef={targetRef}
            content={content}
            hideArrow={hideArrow} />
        </DialogContext.Provider>
      </DialogContainerContext.Provider>
    );
  }

  let context = {
    type,
    onClose: state.close,
    isDismissable,
    ...dialogProps
  };
  return (
    <DialogContainerContext.Provider value={{isDismissable, state, overlayContent, addContent, setOverlayProps, type}}>
      {children}
      <DialogContext.Provider value={context}>
        <DialogContainerOverlay />
      </DialogContext.Provider>
    </DialogContainerContext.Provider>
  );
}

function DialogContainerOverlay() {
  let {isDismissable, overlayContent, state, type} = useContext(DialogContainerContext);

  let renderOverlay = () => {
    switch (type) {
      case 'fullscreen':
      case 'fullscreenTakeover':
        return (
          <Modal isOpen={state.isOpen} isDismissable={false} onClose={state.close} type={type}>
            {typeof overlayContent === 'function' ? overlayContent(state.close) : overlayContent}
          </Modal>
        );
      case 'modal':
        return (
          <Modal isOpen={state.isOpen} isDismissable={isDismissable} onClose={state.close}>
            {typeof overlayContent === 'function' ? overlayContent(state.close) : overlayContent}
          </Modal>
        );
      case 'tray':
        return (
          <Tray isOpen={state.isOpen} onClose={state.close}>
            {typeof overlayContent === 'function' ? overlayContent(state.close) : overlayContent}
          </Tray>
        );
    }
  };
  return renderOverlay();
}

function PopoverTrigger({targetRef, content, hideArrow, ...props}) {
  let triggerRef = useRef<HTMLElement>();

  let dialogContainerContext = useContext(DialogContainerContext);
  let {state} = dialogContainerContext;
  let overlayRef = useRef<DOMRefValue<HTMLDivElement>>();
  let {overlayProps: popoverProps, placement, arrowProps} = useOverlayPosition({
    targetRef: targetRef || triggerRef,
    overlayRef: unwrapDOMRef(overlayRef),
    placement: props.placement,
    containerPadding: props.containerPadding,
    offset: props.offset,
    crossOffset: props.crossOffset,
    shouldFlip: props.shouldFlip,
    isOpen: state.isOpen
  });

  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'dialog'}, state, triggerRef);

  useEffect(() => {
    dialogContainerContext.setTriggerProps({
      ...triggerProps,
      ref: targetRef ? undefined : triggerRef
    });
    dialogContainerContext.setDialogProps(overlayProps);
  }, []);

  return (
    <Popover
      isOpen={state.isOpen}
      UNSAFE_style={popoverProps.style}
      ref={overlayRef}
      onClose={state.close}
      placement={placement}
      arrowProps={arrowProps}
      hideArrow={hideArrow}>
      {content}
    </Popover>
  );
}
