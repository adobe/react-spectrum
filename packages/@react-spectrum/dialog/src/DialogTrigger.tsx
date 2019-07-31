import {DialogContext} from './context';
import {mergeProps} from '@react-aria/utils';
import {Modal, Overlay, Popover, Tray} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';
import React, {Fragment, ReactElement, useRef, useState} from 'react';
import {useMediaQuery} from '@react-spectrum/utils';

interface DialogTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'modal' | 'popover' | 'tray',
  mobileType?: 'modal' | 'tray',
}

export function DialogTrigger(props: DialogTriggerProps) {
  let {
    children,
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type
  } = props;

  // On small devices, show a modal or tray instead of a popover.
  // TODO: DNA variable?
  let isMobile = useMediaQuery('(max-width: 700px)');
  if (isMobile) {
    type = mobileType;
  }

  let [isOpen, setOpen] = useState(false); // todo controlled state
  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();
  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    containerRef,
    triggerRef,
    overlayRef,
    placement: props.placement,
    containerPadding: props.containerPadding,
    offset: props.offset,
    crossOffset: props.crossOffset,
    shouldFlip: props.shouldFlip,
    isOpen,
    shouldUpdatePosition: type === 'popover'
  });

  let onPress = () => {
    setOpen(!isOpen);
  };

  let onClose = () => {
    setOpen(false);
  };

  useOverlayTrigger({ref: triggerRef, onClose, isOpen});

  let [trigger, content] = React.Children.toArray(children);
  trigger = React.cloneElement(trigger, mergeProps(trigger.props, {
    ref: triggerRef,
    onPress,
    isSelected: isOpen && type !== 'modal' // todo: unsafe...
  }));

  let renderOverlay = () => {
    switch (type) {
      case 'popover':
        return (
          <Overlay isOpen={isOpen} ref={containerRef}>
            <Popover {...overlayProps} ref={overlayRef} onClose={onClose} placement={placement} arrowProps={arrowProps}>
              {content}
            </Popover>
          </Overlay>
        );
      case 'modal':
        return (
          <Modal isOpen={isOpen} onClose={onClose}>
            {content}
          </Modal>
        );
      case 'tray':
        return (
          <Tray isOpen={isOpen} onClose={onClose}>
            {content}
          </Tray>
        );
    }
  };

  let context = {
    type,
    onClose
  };

  return (
    <Fragment>
      {trigger}
      <DialogContext.Provider value={context}>
        {renderOverlay()}
      </DialogContext.Provider>
    </Fragment>
  );
}
