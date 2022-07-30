import {AriaDialogProps, FocusScope, useDialog, useOverlayTrigger} from 'react-aria';
import {ButtonContext} from './Button';
import {DOMProps, Provider, useContextProps} from './utils';
import {HeadingContext} from './Heading';
import {ModalContext} from './Modal';
import {OverlayTriggerProps, useOverlayTriggerState} from 'react-stately';
import {PopoverContext} from './Popover';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, useRef} from 'react';

interface DialogTriggerProps extends OverlayTriggerProps {
  children: ReactNode
}

interface DialogProps extends AriaDialogProps, DOMProps {
  onClose?: () => void
}

export const DialogContext = createContext<DialogProps>(null);

export function DialogTrigger(props: DialogTriggerProps) {
  let state = useOverlayTriggerState(props);
  
  let buttonRef = useRef();
  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'dialog'}, state, buttonRef);

  return (
    <Provider
      values={[
        [ModalContext, {state}],
        [DialogContext, {...overlayProps, onClose: state.close}],
        [ButtonContext, {...triggerProps, onPress: () => state.open(), ref: buttonRef}],
        [PopoverContext, {state, triggerRef: buttonRef, restoreFocus: false}]
      ]}>
      {props.children}
    </Provider>
  );
}


function Dialog(props: DialogProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, DialogContext);
  let {dialogProps, titleProps} = useDialog(props, ref);
  
  let children = props.children;
  if (typeof children === 'function') {
    children = children({
      close: props.onClose
    });
  }
  
  return (
    <FocusScope contain restoreFocus autoFocus>
      <section {...dialogProps} ref={ref} style={props.style} className={props.className}>
        <Provider
          values={[
            [ButtonContext, undefined],
            // TODO: clear context within dialog content?
            [HeadingContext, {...titleProps, level: 2}]
          ]}>
          {children}
        </Provider>
      </section>
    </FocusScope>
  );
}

const _Dialog = forwardRef(Dialog);
export {_Dialog as Dialog};
