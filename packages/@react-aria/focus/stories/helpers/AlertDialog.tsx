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
import {Button} from './Button';
import {
  FocusScope,
  useDialog,
  useModal,
  useOverlay,
  usePreventScroll
} from 'react-aria';
import React from 'react';

export function AlertDialog(props) {
  let {children, isOpen, onClose, confirmLabel} = props;

  let ref = React.useRef(null);
  let {overlayProps, underlayProps} = useOverlay(props, ref);
  usePreventScroll({isDisabled: !isOpen});
  let {modalProps} = useModal();
  let {dialogProps, titleProps} = useDialog(
    {
      ...props,
      role: 'alertdialog'
    },
    ref
  );

  return isOpen && (
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
            padding: 30,
            maxWidth: '24rem',
            maxHeight: '80vh'
          }}>
          <h3
            {...titleProps}
            style={{marginTop: 0}}>
            {props.title}
          </h3>
          <p>{children}</p>
          <div style={{display: 'flex', gap: 5, justifyContent: 'flex-end'}}>
            <Button onPress={onClose}>Cancel</Button>
            <Button onPress={onClose}>{confirmLabel}</Button>
          </div>
        </div>
      </FocusScope>
    </div>
  );
}
