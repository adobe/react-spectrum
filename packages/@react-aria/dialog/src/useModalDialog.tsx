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
import React, {AriaAttributes, ReactNode, useContext, useEffect, useState} from 'react';

interface ModalProviderProps {
  children: ReactNode
}

interface ModalContext {
  parent: ModalContext | null,
  modalCount: number,
  addModal: () => void,
  removeModal: () => void
}

const Context = React.createContext<ModalContext | null>(null);

// Each ModalProvider tracks how many modals are open in its subtree. On mount, the modals
// trigger `addModal` to increment the count, and trigger `removeModal` on unmount to decrement it.
// This is done recursively so that all parent providers are incremented and decremented.
// If the modal count is greater than zero, we add `aria-hidden` to this provider to hide its
// subtree from screen readers. This is done using React context in order to account for things
// like portals, which can cause the React tree and the DOM tree to differ significantly in structure.
// TODO: maybe move this?
export function ModalProvider(props: ModalProviderProps) {
  let {children} = props;
  let parent = useContext(Context);
  let [modalCount, setModalCount] = useState(parent ? parent.modalCount : 0);
  let context = {
    parent,
    modalCount,
    addModal() {
      setModalCount(count => count + 1);
      if (parent) {
        parent.addModal();
      }
    },
    removeModal() {
      setModalCount(count => count - 1);
      if (parent) {
        parent.removeModal();
      }
    }
  };

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
}

interface ModalProviderAria {
  modalProviderProps: AriaAttributes
}

export function useModalProvider(): ModalProviderAria {
  let context = useContext(Context);
  return {
    modalProviderProps: {
      'aria-hidden': context && context.modalCount > 0 ? true : null
    }
  };
}

interface ModalDialogAria {
  modalProps: AriaAttributes
}

export function useModalDialog(): ModalDialogAria {
  // Add aria-hidden to all parent providers on mount, and restore on unmount.
  let context = useContext(Context);
  if (!context) {
    throw new Error('Modal is not contained within a provider');
  }

  useEffect(() => {
    if (!context || !context.parent) {
      return;
    }

    // The immediate context is from the provider containing this modal, so we only
    // want to trigger aria-hidden on its parents not on the modal provider itself.
    context.parent.addModal();
    return () => {
      if (context && context.parent) {
        context.parent.removeModal();
      }
    };
  }, [context, context.parent]);

  return {
    modalProps: {
      'aria-modal': true
    }
  };
}
