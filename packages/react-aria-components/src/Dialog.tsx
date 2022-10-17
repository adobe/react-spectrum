import {AriaDialogProps, useDialog, useOverlayTrigger} from 'react-aria';
import {ButtonContext} from './Button';
import {ContextValue, DOMProps, Provider, SlotProps, useContextProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {HeadingContext} from './Heading';
import {ModalContext} from './Modal';
import {OverlayTriggerProps, useOverlayTriggerState} from 'react-stately';
import {PopoverContext} from './Popover';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, useRef} from 'react';

export interface DialogTriggerProps extends OverlayTriggerProps {
  children: ReactNode
}

export interface DialogProps extends AriaDialogProps, DOMProps, SlotProps {
  onClose?: () => void
}

export const DialogContext = createContext<ContextValue<DialogProps, HTMLElement>>(null);

/**
 * A DialogTrigger opens a dialog when a trigger element is pressed.
 */
export function DialogTrigger(props: DialogTriggerProps) {
  let state = useOverlayTriggerState(props);
  
  let buttonRef = useRef();
  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'dialog'}, state, buttonRef);

  return (
    <Provider
      values={[
        [ModalContext, {state}],
        [DialogContext, {...overlayProps, onClose: state.close}],
        [ButtonContext, {...triggerProps, isPressed: state.isOpen, ref: buttonRef}],
        [PopoverContext, {state, triggerRef: buttonRef}]
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
    <section
      {...filterDOMProps(props)}
      {...dialogProps}
      ref={ref}
      slot={props.slot}
      style={props.style}
      className={props.className ?? 'react-aria-Dialog'}>
      <Provider
        values={[
          [ButtonContext, undefined],
          // TODO: clear context within dialog content?
          [HeadingContext, {...titleProps, level: 2}]
        ]}>
        {children}
      </Provider>
    </section>
  );
}

/**
 * A dialog is an overlay shown above other content in an application.
 */
const _Dialog = forwardRef(Dialog);
export {_Dialog as Dialog};
