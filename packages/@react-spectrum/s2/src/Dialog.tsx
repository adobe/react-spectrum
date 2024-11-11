/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {PopoverProps as AriaPopoverProps, composeRenderProps, OverlayTriggerStateContext, Dialog as RACDialog, DialogProps as RACDialogProps} from 'react-aria-components';
import {CloseButtonContext} from './CloseButton';
import {DOMRef} from '@react-types/shared';
import {forwardRef} from 'react';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Modal} from './Modal';
import {Popover} from './Popover';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef, useIsMobileDevice} from '@react-spectrum/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface DialogProps extends Omit<RACDialogProps, 'className' | 'style'>, Pick<AriaPopoverProps, 'placement' | 'shouldFlip' | 'isKeyboardDismissDisabled' | 'containerPadding' | 'offset' | 'crossOffset'>, StyleProps {
  /**
   * The type of Dialog that should be rendered. 
   * 
   * @default 'modal'
   */
  type?: 'modal' | 'popover' | 'fullscreen' | 'fullscreenTakeover', // TODO: add tray back in
  /** The type of Dialog that should be rendered when on a mobile device. */
  mobileType?: 'popover' | 'fullscreen' | 'fullscreenTakeover', // TODO: add tray back in
  /**
   * The size of the Dialog.
   */
  size?: 'S' | 'M' | 'L',
  /**
   * Whether the Dialog is dismissable.
   */
  isDismissable?: boolean,
  /** Whether pressing the escape key to close the dialog should be disabled. */
  isKeyboardDismissDisabled?: boolean,
  /**
   * Whether a popover type Dialog's arrow should be hidden.
   */
  hideArrow?: boolean,
  /** Whether the content of the Dialog should extend edge-to-edge, without any padding. */
  isFullBleed?: boolean
}

const modalPadding = {
  default: 24,
  sm: 32
} as const;

const dialogStyle = style({
  padding: {
    type: {
      modal: modalPadding,
      popover: 8,
      fullscreen: modalPadding,
      fullscreenTakeover: modalPadding
    },
    isFullBleed: 0
  },
  boxSizing: 'border-box',
  outlineStyle: 'none',
  borderRadius: '[inherit]',
  overflow: 'auto',
  position: 'relative',
  size: 'full',
  maxSize: 'full'
}, getAllowedOverrides({height: true}));

function Dialog(props: DialogProps, ref: DOMRef) {
  let {
    type = 'modal',
    mobileType = type === 'popover' ? 'modal' : type,
    size,
    isDismissable,
    isKeyboardDismissDisabled,
    isFullBleed
  } = props;
  let domRef = useDOMRef(ref);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');

  let dialog = (
    <RACDialog
      {...props}
      ref={domRef}
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + dialogStyle({type, isFullBleed}, props.styles)}>
      {composeRenderProps(props.children, (children) => (
        // Reset OverlayTriggerStateContext so the buttons inside the dialog don't retain their hover state.
        <OverlayTriggerStateContext.Provider value={null}>
          {children}
        </OverlayTriggerStateContext.Provider>
      ))}
    </RACDialog>
  );

  // On small devices, show a modal or tray instead of a popover.
  // NOTE: this is done _after_ creating the dialog. The mobile type should not affect the padding.
  let isMobile = useIsMobileDevice();
  if (isMobile) {
    if (type === 'popover') {
      isDismissable = true;
    }

    type = mobileType;
  }

  switch (type) {
    case 'modal':
    case 'fullscreen':
    case 'fullscreenTakeover': {
      let size = type === 'modal' ? props.size : type;
      return (
        <Modal size={size} isDismissable={isDismissable} isKeyboardDismissDisabled={isKeyboardDismissDisabled}>
          <CloseButtonContext.Provider value={{'aria-label': stringFormatter.format('dialog.dismiss')}}>
            {dialog}
          </CloseButtonContext.Provider>
        </Modal>
      );
    }
    case 'popover':
      return (
        <Popover size={size} hideArrow={props.hideArrow} placement={props.placement} shouldFlip={props.shouldFlip} containerPadding={props.containerPadding} offset={props.offset} crossOffset={props.crossOffset}>
          <CloseButtonContext.Provider value={{UNSAFE_style: {display: 'none'}}}>
            {dialog}
          </CloseButtonContext.Provider>
        </Popover>
      );

    // TODO: popover/tray
    // how do we want to do popover, v3 dialogtrigger rendered it, not the dialog
    // in addition, how do we want to handle the margins that dialog currently imposes, just change them to 0 for popover?
    // in order for the dialog to contain scrolling behavior, we'd need to follow what i did for menu otherwise the internal padding
    // of the popover will squish the scrollable content area and the scroll bar will appear to be inside instead of part of the popover
  }
}

/**
 * A Dialog is a floating window, such as a modal or popover, with a custom layout.
 */
let _Dialog = forwardRef(Dialog);
export {_Dialog as Dialog};
