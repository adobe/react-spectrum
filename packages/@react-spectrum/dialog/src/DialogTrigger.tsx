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
import {Modal, Overlay, Popover, Tray} from '@react-spectrum/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, useRef} from 'react';
import {SpectrumDialogClose, SpectrumDialogProps, SpectrumDialogTriggerProps} from '@react-types/dialog';
import {useDialogTriggerState} from '@react-stately/dialog';
import {useMediaQuery} from '@react-spectrum/utils';
import {useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';

export function DialogTrigger(props: SpectrumDialogTriggerProps) {
  let {
    children,
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type,
    hideArrow,
    targetRef,
    isDismissable,
    ...positionProps
  } = props;
  if (!Array.isArray(children) || children.length > 2) {
    throw new Error('DialogTrigger must have exactly 2 children');
  }
  // if a function is passed as the second child, it won't appear in toArray
  let [trigger, content] = children as [ReactElement, SpectrumDialogClose];

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

  let state = useDialogTriggerState(props);

  if (type === 'popover') {
    return (
      <PopoverTrigger
        {...positionProps}
        isOpen={state.isOpen}
        onPress={state.toggle}
        onClose={state.close}
        targetRef={targetRef}
        trigger={trigger}
        content={content}
        hideArrow={hideArrow} />
    );
  }

  let renderOverlay = () => {
    switch (type) {
      case 'fullscreen':
      case 'fullscreenTakeover':
        return (
          <Modal isOpen={state.isOpen} isDismissable={false} onClose={state.close} type={type}>
            {typeof content === 'function' ? content(state.close) : content}
          </Modal>
        );
      case 'modal':
        return (
          <Modal isOpen={state.isOpen} isDismissable={isDismissable} onClose={state.close}>
            {typeof content === 'function' ? content(state.close) : content}
          </Modal>
        );
      case 'tray':
        return (
          <Tray isOpen={state.isOpen} onClose={state.close}>
            {typeof content === 'function' ? content(state.close) : content}
          </Tray>
        );
    }
  };

  return (
    <DialogTriggerBase
      type={type}
      isOpen={state.isOpen}
      onPress={state.toggle}
      onClose={state.close}
      isDismissable={isDismissable}
      trigger={trigger}
      overlay={renderOverlay()} />
  );
}

// Support DialogTrigger inside components using CollectionBuilder.
DialogTrigger.getCollectionNode = function (props: SpectrumDialogTriggerProps) {
  let [trigger, content] = React.Children.toArray(props.children);
  return {
    element: trigger,
    wrapper: (element) => (
      <DialogTrigger key={element.key} {...props}>
        {element}
        {content}
      </DialogTrigger>
    )
  };
};

function PopoverTrigger({isOpen, onPress, onClose, targetRef, trigger, content, hideArrow, ...props}) {
  let triggerRef = useRef<HTMLElement>();
  let overlayRef = useRef<HTMLDivElement>();
  let {overlayProps: popoverProps, placement, arrowProps} = useOverlayPosition({
    targetRef: targetRef || triggerRef,
    overlayRef,
    placement: props.placement,
    containerPadding: props.containerPadding,
    offset: props.offset,
    crossOffset: props.crossOffset,
    shouldFlip: props.shouldFlip,
    isOpen
  });

  let {triggerProps, overlayProps} = useOverlayTrigger({
    ref: triggerRef,
    type: 'dialog',
    onClose,
    isOpen
  });

  let triggerPropsWithRef = {
    ...triggerProps,
    ref: targetRef ? undefined : triggerRef
  };

  let overlay = (
    <Overlay isOpen={isOpen}>
      <Popover {...popoverProps} ref={overlayRef} onClose={onClose} placement={placement} arrowProps={arrowProps} hideArrow={hideArrow}>
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
      dialogProps={overlayProps}
      trigger={trigger}
      overlay={overlay} />
  );
}

interface SpectrumDialogTriggerBase {
  type?: 'modal' | 'popover' | 'tray' | 'fullscreen' | 'fullscreenTakeover',
  isOpen?: boolean,
  onPress?: any,
  onClose?: () => void,
  isDismissable?: boolean
  dialogProps?: SpectrumDialogProps | {},
  triggerProps?: any,
  overlay: ReactElement,
  trigger: ReactElement
}

function DialogTriggerBase({type, isOpen, onPress, onClose, isDismissable, dialogProps = {}, triggerProps = {}, overlay, trigger}: SpectrumDialogTriggerBase) {
  let context = {
    type,
    onClose,
    isDismissable,
    ...dialogProps
  };

  return (
    <Fragment>
      <PressResponder
        {...triggerProps}
        onPress={onPress}
        isPressed={isOpen && type !== 'modal' && type !== 'fullscreen' && type !== 'fullscreenTakeover'}>
        {trigger}
      </PressResponder>
      <DialogContext.Provider value={context}>
        {overlay}
      </DialogContext.Provider>
    </Fragment>
  );
}
