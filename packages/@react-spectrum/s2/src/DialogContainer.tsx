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

import {ModalContext, useSlottedContext} from 'react-aria-components';
import React, {ReactElement, useState} from 'react';
import {SpectrumDialogContainerProps} from '@react-types/dialog';

export interface DialogContainerProps extends Omit<SpectrumDialogContainerProps, 'type' | 'isDismissable' | 'isKeyboardDismissDisabled'> {}

/**
 * A DialogContainer accepts a single Dialog as a child, and manages showing and hiding
 * it in a modal. Useful in cases where there is no trigger element
 * or when the trigger unmounts while the dialog is open.
 */
export function DialogContainer(props: DialogContainerProps) {
  let {
    children,
    onDismiss
  } = props;

  let childArray = React.Children.toArray(children);
  if (childArray.length > 1) {
    throw new Error('Only a single child can be passed to DialogContainer.');
  }

  let [lastChild, setLastChild] = useState<ReactElement | null>(null);

  // React.Children.toArray mutates the children, and we need them to be stable
  // between renders so that the lastChild comparison works.
  let child: ReactElement | undefined = undefined;
  if (Array.isArray(children)) {
    child = children.find(React.isValidElement);
  } else if (React.isValidElement(children)) {
    child = children;
  }

  if (child && child !== lastChild) {
    setLastChild(child);
  }

  let onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onDismiss();
    }
  };

  return (
    <ModalContext.Provider value={{isOpen: !!child, onOpenChange}}>
      {lastChild}
    </ModalContext.Provider>
  );
}

export interface DialogContainerValue {
  /**
   * A handler to programmatically dismiss the dialog.
   */
  dismiss(): void
}

export function useDialogContainer(): DialogContainerValue {
  let context = useSlottedContext(ModalContext);
  if (!context) {
    throw new Error('Cannot call useDialogContext outside a <DialogTrigger> or <DialogContainer>.');
  }

  return {
    dismiss() {
      context?.onOpenChange?.(false);
    }
  };
}
