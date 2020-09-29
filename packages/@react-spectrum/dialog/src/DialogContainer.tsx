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
import {Modal} from '@react-spectrum/overlays';
import React, {ReactElement, useRef} from 'react';
import {SpectrumDialogContainerProps} from '@react-types/dialog';

/**
 * A DialogContainer accepts a single Dialog as a child, and manages showing and hiding
 * it in a modal. Useful in cases where there is no trigger element
 * or when the trigger unmounts while the dialog is open.
 */
export function DialogContainer(props: SpectrumDialogContainerProps) {
  let {
    children,
    type = 'modal',
    onDismiss,
    isDismissable,
    isKeyboardDismissDisabled
  } = props;

  let childArray = React.Children.toArray(children);
  if (childArray.length > 1) {
    throw new Error('Only a single child can be passed to DialogContainer.');
  }

  let lastChild = useRef<ReactElement>(null);
  let child = React.isValidElement(childArray[0]) ? childArray[0] : null;
  if (child) {
    lastChild.current = child;
  }

  let context = {
    type,
    onClose: onDismiss,
    isDismissable
  };

  return (
    <Modal
      isOpen={!!child}
      onClose={onDismiss}
      type={type}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}>
      <DialogContext.Provider value={context}>
        {lastChild.current}
      </DialogContext.Provider>
    </Modal>
  );
}
