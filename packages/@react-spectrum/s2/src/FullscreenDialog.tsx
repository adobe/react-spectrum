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

import {ButtonGroupContext} from './ButtonGroup';
import {composeRenderProps, OverlayTriggerStateContext, Provider, Dialog as RACDialog, DialogProps as RACDialogProps} from 'react-aria-components';
import {ContentContext, HeaderContext, HeadingContext} from './Content';
import {DOMRef} from '@react-types/shared';
import {forwardRef} from 'react';
import {Modal} from './Modal';
import {style} from '../style' with {type: 'macro'};
import {StyleProps} from './style-utils';
import {useDOMRef} from '@react-spectrum/utils';

// TODO: what style overrides should be allowed?
export interface FullscreenDialogProps extends Omit<RACDialogProps, 'className' | 'style'>, StyleProps {
  /**
   * The variant of fullscreen dialog to display.
   * @default "fullscreen"
   */
  variant?: 'fullscreen' | 'fullscreenTakeover',
  /** Whether pressing the escape key to close the dialog should be disabled. */
  isKeyboardDismissDisabled?: boolean
}

const heading = style({
  gridArea: 'heading',
  flexGrow: 1,
  marginY: 0,
  font: 'heading'
});

const header = style({
  gridArea: 'header',
  marginX: {
    sm: 'auto'
  },
  font: 'body-lg'
});

const content =  style({
  gridArea: 'content',
  flexGrow: 1,
  overflowY: {
    default: 'auto',
    // Make the whole dialog scroll rather than only the content when the height it small.
    '@media (height < 400)': 'visible'
  },
  font: 'body'
});

const buttonGroup = style({
  gridArea: 'buttons',
  marginStart: 'auto',
  maxWidth: 'full'
});

export const dialogInner = style({
  display: 'grid',
  gridTemplateAreas: {
    // Button group moves to the bottom on small screens.
    default: [
      'heading',
      'header',
      '.',
      'content',
      '.',
      'buttons'
    ],
    sm: [
      'heading header buttons',
      '. . .',
      'content content content'
    ]
  },
  gridTemplateColumns: {
    default: ['1fr'],
    sm: ['auto', '1fr', 'auto']
  },
  gridTemplateRows: {
    default: [
      'auto',
      'auto',
      24,
      '1fr',
      24,
      'auto'
    ],
    sm: [
      'auto',
      32,
      '1fr'
    ]
  },
  padding: {
    default: 24,
    sm: 32
  },
  columnGap: {
    default: 16,
    sm: 24
  },
  maxHeight: '[inherit]',
  height: 'full',
  boxSizing: 'border-box',
  outlineStyle: 'none',
  fontFamily: 'sans',
  borderRadius: '[inherit]',
  overflow: 'auto'
});

/**
 * Takeover dialogs are large types of dialogs. They use the totality of the screen and should be used for modal experiences with complex workflows.
 */
export const FullscreenDialog = forwardRef(function FullscreenDialog(props: FullscreenDialogProps, ref: DOMRef) {
  let {variant = 'fullscreen', isKeyboardDismissDisabled} = props;
  let domRef = useDOMRef(ref);

  return (
    <Modal size={variant} isKeyboardDismissDisabled={isKeyboardDismissDisabled}>
      <RACDialog
        {...props}
        ref={domRef}
        style={props.UNSAFE_style}
        className={(props.UNSAFE_className || '') + dialogInner}>
        {composeRenderProps(props.children, (children) => (
          // Reset OverlayTriggerStateContext so the buttons inside the dialog don't retain their hover state.
          <OverlayTriggerStateContext.Provider value={null}>
            <Provider
              values={[
                [HeadingContext, {styles: heading}],
                [HeaderContext, {styles: header}],
                [ContentContext, {styles: content}],
                [ButtonGroupContext, {styles: buttonGroup}]
              ]}>
              {children}
            </Provider>
          </OverlayTriggerStateContext.Provider>
        ))}
      </RACDialog>
    </Modal>
  );
});

