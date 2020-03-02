/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DialogContext} from './context';
import {DOMRefValue} from '@react-types/shared';
import {Modal, Overlay, Popover, Tray} from '@react-spectrum/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, useRef} from 'react';
import {SpectrumDialogTriggerProps} from '@react-types/dialog';
import {unwrapDOMRef, useMediaQuery} from '@react-spectrum/utils';
import {useControlledState} from '@react-stately/utils';
import {useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';

export function DialogTrigger(props: SpectrumDialogTriggerProps) {
  let {
    children,
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type,
    hideArrow,
    targetRef,
    size,
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
          <Modal isOpen={isOpen} onClose={onClose} size={size}>
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
      overlay={renderOverlay()}
      size={size} />
  );
}

function PopoverTrigger({isOpen, onPress, onClose, targetRef, trigger, content, hideArrow, ...props}) {
  let containerRef = useRef<DOMRefValue<HTMLDivElement>>();
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();
  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    containerRef: unwrapDOMRef(containerRef),
    targetRef: targetRef || triggerRef,
    overlayRef,
    placement: props.placement,
    containerPadding: props.containerPadding,
    offset: props.offset,
    crossOffset: props.crossOffset,
    shouldFlip: props.shouldFlip,
    isOpen
  });
  
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

function DialogTriggerBase({type, isOpen, onPress, onClose, dialogProps = {}, triggerProps = {}, overlay, trigger, size = null}) {
  let context = {
    type,
    onClose,
    size,
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
