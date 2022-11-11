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

import {DEFAULT_MODAL_PADDING, useOverlayTrigger} from '@react-aria/overlays';
import {DialogContext} from './context';
import {Modal, Popover, Tray} from '@react-spectrum/overlays';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, useEffect, useRef} from 'react';
import {SpectrumDialogClose, SpectrumDialogProps, SpectrumDialogTriggerProps} from '@react-types/dialog';
import {useMediaQuery} from '@react-spectrum/utils';

function DialogTrigger(props: SpectrumDialogTriggerProps) {
  let {
    children,
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type,
    hideArrow,
    targetRef,
    isDismissable,
    isKeyboardDismissDisabled,
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

  let state = useOverlayTriggerState(props);
  let wasOpen = useRef(false);
  wasOpen.current = state.isOpen;
  let isExiting = useRef(false);
  let onExiting = () => isExiting.current = true;
  let onExited = () => isExiting.current = false;

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      if ((wasOpen.current || isExiting.current) && type !== 'popover' && type !== 'tray') {
        console.warn('A DialogTrigger unmounted while open. This is likely due to being placed within a trigger that unmounts or inside a conditional. Consider using a DialogContainer instead.');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (type === 'popover') {
    return (
      <PopoverTrigger
        {...positionProps}
        state={state}
        targetRef={targetRef}
        trigger={trigger}
        content={content}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled}
        hideArrow={hideArrow} />
    );
  }

  let renderOverlay = () => {
    switch (type) {
      case 'fullscreen':
      case 'fullscreenTakeover':
      case 'modal':
        return (
          <Modal
            state={state}
            isDismissable={type === 'modal' ? isDismissable : false}
            type={type}
            isKeyboardDismissDisabled={isKeyboardDismissDisabled}
            onExiting={onExiting}
            onExited={onExited}>
            {typeof content === 'function' ? content(state.close) : content}
          </Modal>
        );
      case 'tray':
        return (
          <Tray
            state={state}
            isKeyboardDismissDisabled={isKeyboardDismissDisabled}>
            {typeof content === 'function' ? content(state.close) : content}
          </Tray>
        );
    }
  };

  return (
    <DialogTriggerBase
      type={type}
      state={state}
      isDismissable={isDismissable}
      trigger={trigger}
      overlay={renderOverlay()} />
  );
}

// Support DialogTrigger inside components using CollectionBuilder.
DialogTrigger.getCollectionNode = function* (props: SpectrumDialogTriggerProps) {
  let [trigger] = React.Children.toArray(props.children);
  let [, content] = props.children as [ReactElement, SpectrumDialogClose];
  yield {
    element: trigger,
    wrapper: (element) => (
      <DialogTrigger key={element.key} {...props}>
        {element}
        {content}
      </DialogTrigger>
    )
  };
};

/**
 * DialogTrigger serves as a wrapper around a Dialog and its associated trigger, linking the Dialog's
 * open state with the trigger's press state. Additionally, it allows you to customize the type and
 * positioning of the Dialog.
 */

// We don't want getCollectionNode to show up in the type definition
let _DialogTrigger = DialogTrigger as (props: SpectrumDialogTriggerProps) => JSX.Element;
export {_DialogTrigger as DialogTrigger};

function PopoverTrigger({state, targetRef, trigger, content, hideArrow, ...props}) {
  let triggerRef = useRef<HTMLElement>();
  let isMoveCloserToContainerBoundary = false;

  // For popover triggers close to the edge, decrease the container padding allowing popovers to
  // move closer to their trigger.
  if (triggerRef?.current) {
    // The popover ref is not defined here, we don't know the arrow size to factor into the below.
    let triggerRect = triggerRef.current.getBoundingClientRect();
    let documentRect = document.body.getBoundingClientRect();
    // 'bottom' is the default when no value is provided
    let [axisPlacement] = props.placement?.split(' ') || ['bottom']; // Flip and RTL don't matter

    // The following math, while not straightforward, identifies button proximity for both scales.
    if (axisPlacement === 'start' || axisPlacement === 'end' || axisPlacement === 'right' || axisPlacement === 'left') {
      // Trigger at top edge with start/end/right/left arrow.
      if ((DEFAULT_MODAL_PADDING * 2) - (triggerRect.height / 2) > triggerRect.top) {
        isMoveCloserToContainerBoundary = true;
      }
      // Trigger at bottom edge with start/end/right/left arrow.
      // Determining the buttons location relative to the bottom edge via window.innderHeight.
      if (triggerRect.top + (DEFAULT_MODAL_PADDING * 2) + (triggerRect.height / 2) > window.innerHeight) {
        isMoveCloserToContainerBoundary = true;
      }
    }
    if (axisPlacement === 'top' || axisPlacement === 'bottom') {
      // Trigger at right edge with top/bottom arrow.
      if ((DEFAULT_MODAL_PADDING * 2) - (triggerRect.width / 2) > triggerRect.left) {
        isMoveCloserToContainerBoundary = true;
      }
      // Trigger at left edge with top/bottom arrow.
      if (triggerRect.right - (triggerRect.width / 2) + (DEFAULT_MODAL_PADDING * 2) > documentRect.right) {
        isMoveCloserToContainerBoundary = true;
      }
    }
  }

  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'dialog'}, state, triggerRef);

  let triggerPropsWithRef = {
    ...triggerProps,
    ref: targetRef ? undefined : triggerRef
  };

  let overlay = (
    <Popover
      {...props}
      containerPadding={isMoveCloserToContainerBoundary && (props.containerPadding === undefined || props.containerPadding > 6) ? 6 : props.containerPadding}
      hideArrow={hideArrow}
      triggerRef={targetRef || triggerRef}
      state={state}>
      {typeof content === 'function' ? content(state.close) : content}
    </Popover>
  );

  return (
    <DialogTriggerBase
      type="popover"
      state={state}
      triggerProps={triggerPropsWithRef}
      dialogProps={overlayProps}
      trigger={trigger}
      overlay={overlay} />
  );
}

interface SpectrumDialogTriggerBase {
  type: 'modal' | 'popover' | 'tray' | 'fullscreen' | 'fullscreenTakeover',
  state: OverlayTriggerState,
  isDismissable?: boolean,
  dialogProps?: SpectrumDialogProps | {},
  triggerProps?: any,
  overlay: ReactElement,
  trigger: ReactElement
}

function DialogTriggerBase({type, state, isDismissable, dialogProps = {}, triggerProps = {}, overlay, trigger}: SpectrumDialogTriggerBase) {
  let context = {
    type,
    onClose: state.close,
    isDismissable,
    ...dialogProps
  };

  return (
    <Fragment>
      <PressResponder
        {...triggerProps}
        onPress={state.toggle}
        isPressed={state.isOpen && type !== 'modal' && type !== 'fullscreen' && type !== 'fullscreenTakeover'}>
        {trigger}
      </PressResponder>
      <DialogContext.Provider value={context}>
        {overlay}
      </DialogContext.Provider>
    </Fragment>
  );
}
