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

import {composeRenderProps, OverlayTriggerStateContext, Dialog as RACDialog, DialogProps as RACDialogProps} from 'react-aria-components';
import {DOMRef} from '@react-types/shared';
import {forwardRef} from 'react';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {Modal} from './Modal';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

export interface CustomDialogProps extends Omit<RACDialogProps, 'className' | 'style'>, StyleProps {
  /**
   * The size of the Dialog.
   */
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
  /**
   * Whether the Dialog is dismissible.
   */
  isDismissible?: boolean,
  /** Whether pressing the escape key to close the dialog should be disabled. */
  isKeyboardDismissDisabled?: boolean,
  /**
   * The amount of padding around the contents of the dialog.
   * @default 'default'
   */
  padding?: 'default' | 'none'
}

const dialogStyle = style({
  padding: {
    padding: {
      default: {
        default: 24,
        sm: 32
      },
      none: 0
    }
  },
  boxSizing: 'border-box',
  outlineStyle: 'none',
  borderRadius: '[inherit]',
  overflow: 'auto',
  position: 'relative',
  size: 'full',
  maxSize: '[inherit]'
}, getAllowedOverrides({height: true}));

/**
 * A CustomDialog is a floating window with a custom layout.
 */
export const CustomDialog = forwardRef(function CustomDialog(props: CustomDialogProps, ref: DOMRef) {
  let {
    size,
    isDismissible,
    isKeyboardDismissDisabled,
    padding = 'default'
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <Modal size={size} isDismissable={isDismissible} isKeyboardDismissDisabled={isKeyboardDismissDisabled}>
      <RACDialog
        {...props}
        ref={domRef}
        style={props.UNSAFE_style}
        className={(props.UNSAFE_className || '') + dialogStyle({padding}, props.styles)}>
        {composeRenderProps(props.children, (children) => (
          // Reset OverlayTriggerStateContext so the buttons inside the dialog don't retain their hover state.
          <OverlayTriggerStateContext.Provider value={null}>
            {children}
          </OverlayTriggerStateContext.Provider>
        ))}
      </RACDialog>
    </Modal>
  );
});
