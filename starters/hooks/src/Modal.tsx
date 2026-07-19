'use client';
import {Overlay} from 'react-aria/Overlay';
import {useDialog, type AriaDialogProps} from 'react-aria/useDialog';
import {useModalOverlay, type AriaModalOverlayProps} from 'react-aria/useModalOverlay';
import {useOverlayTrigger} from 'react-aria/useOverlayTrigger';
import {
  useOverlayTriggerState,
  type OverlayTriggerProps,
  type OverlayTriggerState
} from 'react-stately/useOverlayTriggerState';
import {Button} from 'react-aria-components/Button';
import {cloneElement, createContext, useContext, useRef} from 'react';
import type {ReactElement, ReactNode} from 'react';
import './Button.css';
import './Dialog.css';
import './Modal.css';

let OverlayStateContext = createContext<OverlayTriggerState | null>(null);

interface ModalProps extends AriaModalOverlayProps {
  state: OverlayTriggerState;
  children: ReactNode;
}

export function Modal({state, children, ...props}: ModalProps) {
  let ref = useRef<HTMLDivElement>(null);
  let {modalProps, underlayProps} = useModalOverlay(props, state, ref);

  return (
    <Overlay>
      <div {...underlayProps} className="react-aria-ModalOverlay">
        <div {...modalProps} ref={ref} className="react-aria-Modal">
          <OverlayStateContext.Provider value={state}>{children}</OverlayStateContext.Provider>
        </div>
      </div>
    </Overlay>
  );
}

export function ModalTrigger({
  label,
  children,
  ...props
}: OverlayTriggerProps & {
  label: ReactNode;
  children: (close: () => void) => ReactElement;
}) {
  let state = useOverlayTriggerState(props);
  let triggerRef = useRef<HTMLButtonElement>(null);
  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'dialog'}, state, triggerRef);

  return (
    <>
      <Button
        {...triggerProps}
        ref={triggerRef}
        className="react-aria-Button button-base"
        data-variant="primary">
        {label}
      </Button>
      {state.isOpen && (
        <Modal {...props} state={state}>
          {cloneElement(children(state.close), overlayProps)}
        </Modal>
      )}
    </>
  );
}

export function Dialog({
  title,
  children,
  ...props
}: AriaDialogProps & {title?: ReactNode; children?: ReactNode}) {
  let ref = useRef<HTMLDivElement>(null);
  let {dialogProps, titleProps} = useDialog(props, ref);

  return (
    <div {...dialogProps} ref={ref} className="react-aria-Dialog">
      {title && (
        <h3 {...titleProps} slot="title" className="react-aria-Heading">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function CloseButton({children = 'Close'}: {children?: ReactNode}) {
  let state = useContext(OverlayStateContext);
  return (
    <Button
      onPress={() => state?.close()}
      className="react-aria-Button button-base"
      data-variant="primary">
      {children}
    </Button>
  );
}
