import React, {ReactElement, useContext, useState} from 'react';
import {SpectrumDialogContainerProps} from '@react-types/dialog';
import {DialogContext} from './Dialog';
import {ModalContext, useSlottedContext} from 'react-aria-components';

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
    isDismissable = false,
    isKeyboardDismissDisabled
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
    <DialogContext.Provider value={{type, isDismissable}}>
      <ModalContext.Provider value={{isOpen: !!child, onOpenChange, isDismissable, isKeyboardDismissDisabled}}>
        {lastChild}
      </ModalContext.Provider>
    </DialogContext.Provider>
  );
}

export interface DialogContainerValue {
  /**
   * The type of container the dialog is rendered in.
   */
  type: 'modal' | 'popover' | 'fullscreen' | 'fullscreenTakeover', // TODO: add tray back in
  /**
   * A handler to programmatically dismiss the dialog.
   */
  dismiss(): void
}

export function useDialogContainer(): DialogContainerValue {
  let context = useSlottedContext(ModalContext);
  let dialogContext = useContext(DialogContext);
  if (!context) {
    throw new Error('Cannot call useDialogContext outside a <DialogTrigger> or <DialogContainer>.');
  }

  return {
    type: dialogContext.type || 'modal',
    dismiss() {
      context?.onOpenChange?.(false);
    }
  };
}
