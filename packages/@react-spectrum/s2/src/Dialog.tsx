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
import {CloseButton} from './CloseButton';
import {composeRenderProps, OverlayTriggerStateContext, Provider, Dialog as RACDialog, DialogProps as RACDialogProps} from 'react-aria-components';
import {ContentContext, FooterContext, HeaderContext, HeadingContext} from './Content';
import {DOMRef} from '@react-types/shared';
import {forwardRef} from 'react';
import {ImageContext} from './Image';
import {Modal} from './Modal';
import {style} from '../style' with {type: 'macro'};
import {StyleProps} from './style-utils';
import {useDOMRef} from '@react-spectrum/utils';

// TODO: what style overrides should be allowed?
export interface DialogProps extends Omit<RACDialogProps, 'className' | 'style'>, StyleProps {
  /**
   * Whether the Dialog is dismissible.
   */
  isDismissible?: boolean,
  /**
   * The size of the Dialog.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L',
  /** Whether pressing the escape key to close the dialog should be disabled. */
  isKeyboardDismissDisabled?: boolean
}

const image = style({
  width: 'full',
  height: 140,
  objectFit: 'cover'
});

const heading = style({
  flexGrow: 1,
  marginY: 0,
  font: 'heading'
});

const header = style({
  font: 'body-lg'
});

const content =  style({
  flexGrow: 1,
  overflowY: {
    default: 'auto',
    // Make the whole dialog scroll rather than only the content when the height it small.
    '@media (height < 400)': 'visible'
  },
  font: 'body',
  // TODO: adjust margin on mobile?
  marginX: {
    default: 32
  }
});

const footer = style({
  flexGrow: 1,
  font: 'body'
});

const buttonGroup = style({
  marginStart: 'auto',
  maxWidth: 'full'
});

export const dialogInner = style({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  maxHeight: '[inherit]',
  boxSizing: 'border-box',
  outlineStyle: 'none',
  fontFamily: 'sans',
  borderRadius: '[inherit]',
  overflow: 'auto'
});

/**
 * Dialogs are windows containing contextual information, tasks, or workflows that appear over the user interface.
 * Depending on the kind of Dialog, further interactions may be blocked until the Dialog is acknowledged.
 */
export const Dialog = forwardRef(function Dialog(props: DialogProps, ref: DOMRef) {
  let {size = 'M', isDismissible, isKeyboardDismissDisabled} = props;
  let domRef = useDOMRef(ref);

  return (
    <Modal size={size} isDismissable={isDismissible} isKeyboardDismissDisabled={isKeyboardDismissDisabled}>
      <RACDialog
        {...props}
        ref={domRef}
        style={props.UNSAFE_style}
        className={(props.UNSAFE_className || '') + dialogInner}>
        {composeRenderProps(props.children, (children) => (
          // Render the children multiple times inside the wrappers we need to implement the layout.
          // Each instance hides certain children so that they are all rendered in the correct locations.
          // Reset OverlayTriggerStateContext so the buttons inside the dialog don't retain their hover state.
          <OverlayTriggerStateContext.Provider value={null}>
            {/* Hero image */}
            <Provider
              values={[
                [ImageContext, {styles: image}],
                [HeadingContext, {isHidden: true}],
                [HeaderContext, {isHidden: true}],
                [ContentContext, {isHidden: true}],
                [FooterContext, {isHidden: true}],
                [ButtonGroupContext, {isHidden: true}]
              ]}>
              {children}
            </Provider>
            {/* Top header: heading, header, dismiss button, and button group (in fullscreen dialogs). */}
            <div
              className={style({
                // Wrapper that creates the margin for the dismiss button.
                display: 'flex',
                alignItems: 'start',
                columnGap: 12,
                marginStart: {
                  default: 32
                },
                marginEnd: {
                  default: 32,
                  isDismissible: 12
                },
                marginTop: {
                  default: 12 // margin to dismiss button
                }
              })({isDismissible: props.isDismissible})}>
              <div
                className={style({
                  // Wrapper for heading, header, and button group.
                  // This swaps orientation from horizontal to vertical at small screen sizes.
                  display: 'flex',
                  flexGrow: 1,
                  marginTop: {
                    default: 20, // 32 - 12 (handled above)
                    ':empty': 0
                  },
                  marginBottom: {
                    default: 16,
                    ':empty': 0
                  },
                  columnGap: 24,
                  rowGap: 8,
                  flexDirection: {
                    default: 'column',
                    sm: 'row'
                  },
                  alignItems: {
                    default: 'start',
                    sm: 'center'
                  }
                })}>
                <Provider
                  values={[
                    [ImageContext, {hidden: true}],
                    [HeadingContext, {styles: heading}],
                    [HeaderContext, {styles: header}],
                    [ContentContext, {isHidden: true}],
                    [FooterContext, {isHidden: true}],
                    [ButtonGroupContext, {isHidden: true}]
                  ]}>
                  {children}
                </Provider>
              </div>
              {props.isDismissible && 
                <CloseButton styles={style({marginBottom: 12})} />
              }
            </div>
            {/* Main content */}
            <Provider
              values={[
                [ImageContext, {hidden: true}],
                [HeadingContext, {isHidden: true}],
                [HeaderContext, {isHidden: true}],
                [ContentContext, {styles: content}],
                [FooterContext, {isHidden: true}],
                [ButtonGroupContext, {isHidden: true}]
              ]}>
              {children}
            </Provider>
            {/* Footer and button group */}
            <div
              className={style({
                display: 'flex',
                paddingX: {
                  default: 32
                },
                paddingBottom: {
                  default: 32
                },
                paddingTop: {
                  default: 32,
                  ':empty': 0
                },
                gap: 24,
                alignItems: 'center',
                flexWrap: 'wrap'
              })}>
              <Provider
                values={[
                  [ImageContext, {hidden: true}],
                  [HeadingContext, {isHidden: true}],
                  [HeaderContext, {isHidden: true}],
                  [ContentContext, {isHidden: true}],
                  [FooterContext, {styles: footer}],
                  [ButtonGroupContext, {isHidden: props.isDismissible, styles: buttonGroup, align: 'end'}]
                ]}>
                {children}
              </Provider>
            </div>
          </OverlayTriggerStateContext.Provider>
        ))}
      </RACDialog>
    </Modal>
  );
});
