import {DialogContext} from './context';
import {Modal, Overlay, Popover, Tray} from '@react-spectrum/overlays';
import {PositionProps, useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, RefObject, useRef} from 'react';
import {useControlledState} from '@react-stately/utils';
import {useMediaQuery} from '@react-spectrum/utils';

interface DialogTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'modal' | 'popover' | 'tray',
  mobileType?: 'modal' | 'tray',
  hideArrow?: boolean,
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export function DialogTrigger(props: DialogTriggerProps) {
  let {
    children,
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type,
    hideArrow,
    targetRef,
    ...positionProps
  } = props;
  let [trigger, content] = React.Children.toArray(children);

  // On small devices, show a modal or tray instead of a popover.
  // TODO: DNA variable?
  let isMobile = useMediaQuery('(max-width: 700px)');
  if (isMobile) {
    type = mobileType;
  }

  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);
  let onPress = () => {
    setOpen(!isOpen);
  };

  let onClose = () => {
    setOpen(false);
  };

  if (type === 'popover') {
    return (
      <PopoverTrigger
        {...positionProps}
        isOpen={isOpen}
        onPress={onPress}
        onClose={onClose}
        targetRef={targetRef}
        trigger={trigger}
        content={content}
        hideArrow={hideArrow} />
    );
  }

  let renderOverlay = () => {
    switch (type) {
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

  return (
    <DialogTriggerBase
      type={type}
      isOpen={isOpen}
      onPress={onPress}
      onClose={onClose}
      trigger={trigger}
      overlay={renderOverlay()} />
  );
}

function PopoverTrigger({isOpen, onPress, onClose, targetRef, trigger, content, hideArrow, ...props}) {
  let containerRef = useRef<HTMLDivElement>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();
  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    containerRef,
    targetRef: targetRef || triggerRef,
    overlayRef,
    placement: props.placement,
    containerPadding: props.containerPadding,
    offset: props.offset,
    crossOffset: props.crossOffset,
    shouldFlip: props.shouldFlip,
    isOpen
  });
  // console.log('overlayProps', overlayProps);
  // console.log('placement', placement);
  console.log('props', props)
  console.log('props placement', props.placement);
  console.log('containerRef', containerRef.current)
  console.log('targetRef', targetRef);
  console.log('triggerRef', triggerRef.current);
  console.log('overlayRef', overlayRef.current);
  let {triggerAriaProps, overlayAriaProps} = useOverlayTrigger({
    ref: triggerRef,
    type: 'dialog',
    onClose,
    isOpen
  });

  let triggerPropsWithRef = {
    ...triggerAriaProps,
    ref: targetRef ? undefined : triggerRef
  };

  let overlay = (
    <Overlay isOpen={isOpen} ref={containerRef}>
      <Popover {...overlayProps} ref={overlayRef} onClose={onClose} placement={placement} arrowProps={arrowProps} hideArrow={hideArrow}>
        {content}
      </Popover>
    </Overlay>
  );

  return (
    <DialogTriggerBase
      type="popover"
      isOpen={isOpen}
      onPress={onPress}
      onClose={onClose}
      triggerProps={triggerPropsWithRef}
      dialogProps={overlayAriaProps}
      trigger={trigger}
      overlay={overlay} />
  );
}

function DialogTriggerBase({type, isOpen, onPress, onClose, dialogProps = {}, triggerProps = {}, overlay, trigger}) {
  let context = {
    type,
    onClose,
    ...dialogProps
  };

  return (
    <Fragment>
      <PressResponder
        {...triggerProps}
        onPress={onPress}
        isPressed={isOpen && type !== 'modal'}>
        {trigger}
      </PressResponder>
      <DialogContext.Provider value={context}>
        {overlay}
      </DialogContext.Provider>
    </Fragment>
  );
}
