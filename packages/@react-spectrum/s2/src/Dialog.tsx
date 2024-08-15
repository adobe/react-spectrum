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

import {PopoverProps as AriaPopoverProps, composeRenderProps, Provider, Dialog as RACDialog, DialogProps as RACDialogProps} from 'react-aria-components';
import {ButtonGroupContext} from './ButtonGroup';
import {CloseButton} from './CloseButton';
import {ContentContext, FooterContext, HeaderContext, HeadingContext, ImageContext} from './Content';
import {createContext, forwardRef, RefObject, useContext} from 'react';
import {DOMRef} from '@react-types/shared';
import {Modal} from './Modal';
import {Popover} from './Popover';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleProps} from './style-utils';
import {useDOMRef, useMediaQuery} from '@react-spectrum/utils';

// TODO: what style overrides should be allowed?
export interface DialogProps extends Omit<RACDialogProps, 'className' | 'style'>, StyleProps {
  /**
   * Whether the Dialog is dismissable.
   */
  isDismissable?: boolean,
  /**
   * The size of the Dialog.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L'
}

const image = style({
  width: 'full',
  height: '[140px]',
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
    '@media (height < 400)': 'visible',
    type: {
      popover: 'visible'
    }
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

interface DialogContextValue extends Pick<AriaPopoverProps, 'placement' | 'shouldFlip' | 'containerPadding' | 'offset' | 'crossOffset'> {
  /**
   * The type of Dialog that should be rendered.
   */
  type?: 'modal' | 'popover' | 'fullscreen' | 'fullscreenTakeover', // TODO: add tray back in
  /**
   * Whether a modal type Dialog should be dismissable.
   */
  isDismissable?: boolean,
  /**
   * Whether a popover type Dialog's arrow should be hidden.
   */
  hideArrow?: boolean,
  /**
   * Whether pressing the escape key to close the dialog should be disabled.
   */
  isKeyboardDismissDisabled?: boolean
}

export const DialogContext = createContext<DialogContextValue>({
  type: 'modal',
  isDismissable: false,
  hideArrow: false,
  shouldFlip: true,
  isKeyboardDismissDisabled: false
});

function Dialog(props: DialogProps, ref: DOMRef) {
  let ctx = useContext(DialogContext);
  let isDismissable = ctx.isDismissable || props.isDismissable;
  let isKeyboardDismissDisabled = ctx.isKeyboardDismissDisabled;
  let domRef = useDOMRef(ref);

  switch (ctx.type) {
    case 'modal':
    case 'fullscreen':
    case 'fullscreenTakeover': {
      let size = ctx.type === 'modal' ? props.size : ctx.type;
      return (
        <Modal size={size} isDismissable={isDismissable} isKeyboardDismissDisabled={isKeyboardDismissDisabled}>
          <DialogInner {...props} {...ctx} dialogRef={domRef} isDismissable={isDismissable} />
        </Modal>
      );
    }
    case 'popover':
      // get hideArrow from dialog instead?
      return (
        <Popover size={props.size || 'M'} hideArrow={ctx.hideArrow} placement={ctx.placement} shouldFlip={ctx.shouldFlip} containerPadding={ctx.containerPadding} offset={ctx.offset} crossOffset={ctx.crossOffset}>
          <DialogInner {...props} {...ctx} dialogRef={domRef} isDismissable={isDismissable} />
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
 * Dialogs are windows containing contextual information, tasks, or workflows that appear over the user interface.
 * Depending on the kind of Dialog, further interactions may be blocked until the Dialog is acknowledged.
 */
let _Dialog = forwardRef(Dialog);
export {_Dialog as Dialog};

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

function DialogInner(props: DialogProps & DialogContextValue & {dialogRef: RefObject<HTMLElement | null>}) {
  // The button group in fullscreen dialogs usually goes at the top, but
  // when the window is small, it moves to the bottom. We could do this in
  // pure CSS with display: none, but then the ref would go to two places.
  // With JS we can actually unmount on of them to ensure there is only one at a time.
  // Hopefully apps don't SSR render a dialog that's already open, because this means
  // we don't evaluate the media query until JS loads.
  let isSmall = useMediaQuery('(max-width: 640px)');
  let buttonGroupPlacement = 'bottom';
  if (props.type === 'fullscreen' || props.type === 'fullscreenTakeover') {
    buttonGroupPlacement = isSmall ? 'bottom' : 'top';
  }

  if (props.isDismissable) {
    buttonGroupPlacement = 'none';
  }

  // TODO: manage focus when the button group placement changes and focus was on one of the buttons?

  return (
    <RACDialog
      {...props}
      ref={props.dialogRef}
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + dialogInner}>
      {composeRenderProps(props.children, (children, {close}) =>
          // Render the children multiple times inside the wrappers we need to implement the layout.
          // Each instance hides certain children so that they are all rendered in the correct locations.
          (<>
            {/* Hero image */}
            <Provider
              values={[
                [ImageContext, {className: image}],
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
                  isDismissable: 12
                },
                marginTop: {
                  default: 12 // margin to dismiss button
                }
              })({isDismissable: props.isDismissable, type: props.type})}>
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
                    [ButtonGroupContext, {isHidden: buttonGroupPlacement !== 'top'}]
                  ]}>
                  {children}
                </Provider>
              </div>
              {props.isDismissable &&
              <CloseButton onPress={close} styles={style({marginBottom: 12})} />
            }
            </div>
            {/* Main content */}
            <Provider
              values={[
                [ImageContext, {hidden: true}],
                [HeadingContext, {isHidden: true}],
                [HeaderContext, {isHidden: true}],
                [ContentContext, {styles: content({type: props.type})}],
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
                  [ButtonGroupContext, {isHidden: buttonGroupPlacement !== 'bottom', styles: buttonGroup, align: 'end'}]
                ]}>
                {children}
              </Provider>
            </div>
          </>)
        )}
    </RACDialog>
  );
}
