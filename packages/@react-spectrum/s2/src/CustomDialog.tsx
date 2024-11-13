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

import {CloseButtonContext} from './CloseButton';
import {composeRenderProps, OverlayTriggerStateContext, Dialog as RACDialog, DialogProps as RACDialogProps} from 'react-aria-components';
import {DOMRef} from '@react-types/shared';
import {forwardRef} from 'react';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Modal} from './Modal';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface CustomDialogProps extends Omit<RACDialogProps, 'className' | 'style'>, StyleProps {
  /**
   * The size of the Dialog.
   */
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
  /**
   * Whether the Dialog is dismissable.
   */
  isDismissable?: boolean,
  /** Whether pressing the escape key to close the dialog should be disabled. */
  isKeyboardDismissDisabled?: boolean,
  /** Whether the content of the Dialog should extend edge-to-edge, without any padding. */
  isFullBleed?: boolean
}

const dialogStyle = style({
  padding: {
    default: {
      default: 24,
      sm: 32
    },
    isFullBleed: 0
  },
  boxSizing: 'border-box',
  outlineStyle: 'none',
  borderRadius: '[inherit]',
  overflow: 'auto',
  position: 'relative',
  size: 'full',
  maxSize: '[inherit]'
}, getAllowedOverrides({height: true}));

function CustomDialog(props: CustomDialogProps, ref: DOMRef) {
  let {
    size,
    isDismissable,
    isKeyboardDismissDisabled,
    isFullBleed
  } = props;
  let domRef = useDOMRef(ref);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');

  return (
    <Modal size={size} isDismissable={isDismissable} isKeyboardDismissDisabled={isKeyboardDismissDisabled}>
      <CloseButtonContext.Provider value={{'aria-label': stringFormatter.format('dialog.dismiss')}}>
        <RACDialog
          {...props}
          ref={domRef}
          style={props.UNSAFE_style}
          className={(props.UNSAFE_className || '') + dialogStyle({isFullBleed}, props.styles)}>
          {composeRenderProps(props.children, (children) => (
            // Reset OverlayTriggerStateContext so the buttons inside the dialog don't retain their hover state.
            <OverlayTriggerStateContext.Provider value={null}>
              {children}
            </OverlayTriggerStateContext.Provider>
          ))}
        </RACDialog>
      </CloseButtonContext.Provider>
    </Modal>
  );
}

/**
 * A CustomDialog is a floating window with a custom layout.
 */
let _CustomDialog = forwardRef(CustomDialog);
export {_CustomDialog as CustomDialog};
