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

import {DialogContainer} from './DialogContainer';
import {DialogContainerContext} from './DialogContainerContext';
import {DialogContext, DialogContextValue} from './context';
import {DOMRefValue} from '@react-types/shared';
import {Modal, Popover, Tray} from '@react-spectrum/overlays';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, useContext, useEffect, useRef} from 'react';
import {SpectrumDialogClose, SpectrumDialogProps, SpectrumDialogTriggerProps} from '@react-types/dialog';
import {unwrapDOMRef, useMediaQuery} from '@react-spectrum/utils';
import {useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';

function DialogTrigger(props: SpectrumDialogTriggerProps) {
  let {
    children,
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type,
    hideArrow,
    isKeyboardDismissDisabled,
    targetRef,
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
    type = mobileType;
  }

  let state = useOverlayTriggerState(props);
  let dialogContainerContext = useContext(DialogContainerContext);

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

  const triggerBase = <DialogTriggerBase content={content}>{trigger}</DialogTriggerBase>;

  // if container exists and not being used (showing an overlay), pass trigger base, otherwise
  // create container for overlay to attach to
  return dialogContainerContext ? triggerBase : (
    <DialogContainer content={content} {...props}>
      {triggerBase}
    </DialogContainer>
  );
}

export function DialogTriggerBase(props) {
  let {children, content} = props;
  let {state, triggerProps, type, addContent} = useContext(DialogContainerContext);
  return (
    <PressResponder
      {...triggerProps}
      onPress={() => {
        addContent(state.isOpen ? null : content);
        state.toggle();
      }}
      isPressed={state.isOpen && type !== 'modal' && type !== 'fullscreen' && type !== 'fullscreenTakeover'}>
      {children}
    </PressResponder>
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


function PopoverTrigger({state, targetRef, trigger, content, hideArrow, isKeyboardDismissDisabled, ...props}) {
  let triggerRef = useRef<HTMLElement>();

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
  let triggerPropsWithRef = {
    ...triggerProps,
    ref: targetRef ? undefined : triggerRef
  };
  let context : DialogContextValue = {
    type: 'popover',
    onClose: state.close,
    ...overlayProps
  };

  return (
    <Fragment>
      <PressResponder
        {...triggerPropsWithRef}
        onPress={state.toggle}
        isPressed={state.isOpen}>
        {trigger}
      </PressResponder>
      <DialogContext.Provider value={context}>
        <Popover
          isOpen={state.isOpen}
          UNSAFE_style={popoverProps.style}
          ref={overlayRef}
          onClose={state.close}
          placement={placement}
          arrowProps={arrowProps}
          isKeyboardDismissDisabled={isKeyboardDismissDisabled}
          hideArrow={hideArrow}>
          {typeof content === 'function' ? content(state.close) : content}
        </Popover>
      </DialogContext.Provider>
    </Fragment>
  );
}

/**
 * DialogTrigger serves as a wrapper around a Dialog and its associated trigger, linking the Dialog's
 * open state with the trigger's press state. Additionally, it allows you to customize the type and
 * positioning of the Dialog.
 */

// We don't want getCollectionNode to show up in the type definition
let _DialogTrigger = DialogTrigger as (props: SpectrumDialogTriggerProps) => JSX.Element;
export {_DialogTrigger as DialogTrigger};
