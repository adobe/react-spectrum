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
import {Modal, Popover, Tray} from '@react-spectrum/overlays';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, ReactElement, useContext, useEffect, useRef} from 'react';
import {SpectrumDialogClose, SpectrumDialogProps, SpectrumDialogTriggerProps} from '@react-types/dialog';
import {unwrapDOMRef, useMediaQuery} from '@react-spectrum/utils';
import {useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';
import {DialogContainerContext} from './DialogContainerContext';
import {DialogContainer} from './DialogContainer';

function DialogTrigger(props: SpectrumDialogTriggerProps) {
  let {
    children,
    ...otherProps
  } = props;
  if (!Array.isArray(children) || children.length > 2) {
    throw new Error('DialogTrigger must have exactly 2 children');
  }
  // if a function is passed as the second child, it won't appear in toArray
  let [trigger, content] = children as [ReactElement, SpectrumDialogClose];

  let context = useContext(DialogContainerContext);
  useEffect(() => {
    context && context.addOverlayContent(content);
  });

  let dialogContainerContext = useContext(DialogContainerContext);
  const triggerBase = <DialogTriggerBase>{trigger}</DialogTriggerBase>;

  return dialogContainerContext ? triggerBase : (
    <DialogContainer content={content} {...otherProps}>
      {triggerBase}
    </DialogContainer>
  );
}


export function DialogTriggerBase(props) {
  let {children} = props;
  let {state, triggerProps, type} = useContext(DialogContainerContext);
  return (
    <PressResponder
      {...triggerProps}
      onPress={state.toggle}
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

/**
 * DialogTrigger serves as a wrapper around a Dialog and its associated trigger, linking the Dialog's
 * open state with the trigger's press state. Additionally, it allows you to customize the type and
 * positioning of the Dialog.
 */

// We don't want getCollectionNode to show up in the type definition
let _DialogTrigger = DialogTrigger as (props: SpectrumDialogTriggerProps) => JSX.Element;
export {_DialogTrigger as DialogTrigger};
