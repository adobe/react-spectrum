/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FocusScope} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import {
  OverlayContainer,
  OverlayProvider,
  useModal,
  useOverlay,
  usePreventScroll
} from '../';
import React, {useRef, useState} from 'react';
import {useButton} from '@react-aria/button';
import {useDialog} from '@react-aria/dialog';

function ModalDialog(props) {
  let {title, children} = props;

  // Handle interacting outside the dialog and pressing
  // the Escape key to close the modal.
  let ref = React.useRef();
  let {overlayProps, underlayProps} = useOverlay(props, ref);

  // Prevent scrolling while the modal is open, and hide content
  // outside the modal from screen readers.
  usePreventScroll();
  let {modalProps} = useModal();

  // Get props for the dialog and its title
  let {dialogProps, titleProps} = useDialog(props, ref);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 100,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      {...underlayProps}>
      <FocusScope contain restoreFocus autoFocus>
        <div
          {...overlayProps}
          {...dialogProps}
          {...modalProps}
          ref={ref}
          style={{
            background: 'white',
            color: 'black',
            padding: 30
          }}>
          <h3 {...titleProps} style={{marginTop: 0}}>
            {title}
          </h3>
          {children}
        </div>
      </FocusScope>
    </div>
  );
}

function Modal({onClose}) {
  let closeButtonRef = React.useRef();

  // useButton ensures that focus management is handled correctly,
  // across all browsers. Focus is restored to the button once the
  // dialog closes.
  let {buttonProps: closeButtonProps} = useButton(
    {
      onPress: () => onClose()
    },
    closeButtonRef
  );

  return (
    <>
      <OverlayContainer>
        <ModalDialog isOpen onClose={onClose} isDismissable>
          <button
            {...closeButtonProps}
            ref={closeButtonRef}
            style={{marginTop: 10}}>
            Close with React aria button
          </button>
          <button
            onClick={onClose}>
            Close with regular button</button>
        </ModalDialog>
      </OverlayContainer>
    </>
  );
}

const Button = (props) => {
  const ref = useRef();

  const {buttonProps} = useButton(props, ref);

  const {children} = props;

  return (
    <button
      ref={ref}
      {...mergeProps(buttonProps)}
      style={{height: '22rem', width: '22rem'}}>
      {children}
    </button>
  );
};

export function ClickThroughExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAriaButton, setShowAriaButton] = useState(false);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <p>
        When closing a modal using a button using react aria useButton with a
        regular button behind, the button behind will immediately be clicked.
      </p>
      <button
        onClick={() => {
          showAriaButton ? setShowAriaButton(false) : setShowAriaButton(true);
        }}>
        Toggle aria button
      </button>
      <p>
        Currently showing
        {showAriaButton ? ' React aria button' : ' Regular button'}
      </p>
      <OverlayProvider>
        {!showAriaButton && (
          <button onClick={() => setIsOpen(true)} style={{height: '22rem', width: '22rem'}}>
            Open with regular Button
          </button>
        )}
        {showAriaButton && (
          <Button onPress={() => setIsOpen(true)}>
            Open with React aria button
          </Button>
        )}
        {isOpen && <Modal onClose={() => setIsOpen(false)} />}
      </OverlayProvider>
    </div>
  );
}
