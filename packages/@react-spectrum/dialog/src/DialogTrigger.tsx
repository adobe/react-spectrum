import {DialogContext} from './context';
import {Modal, Overlay, Popover, Tray} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, useRef} from 'react';
import {useControlledState} from '@react-stately/utils';
import {useMediaQuery} from '@react-spectrum/utils';

interface DialogTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'modal' | 'popover' | 'tray',
  mobileType?: 'modal' | 'tray',
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
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

  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);
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
      <PressResponder
        ref={triggerRef}
        onPress={onPress}
        isPressed={isOpen && type !== 'modal'}>
        {trigger}
      </PressResponder>
      <DialogContext.Provider value={context}>
        {renderOverlay()}
      </DialogContext.Provider>
    </Fragment>
  );
}
