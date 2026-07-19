'use client';
import {DismissButton, Overlay} from 'react-aria/Overlay';
import {useOverlayTrigger} from 'react-aria/useOverlayTrigger';
import {usePopover, type AriaPopoverProps} from 'react-aria/usePopover';
import {useOverlayTriggerState} from 'react-stately/useOverlayTriggerState';
import {Button} from 'react-aria-components/Button';
import {cloneElement, useRef} from 'react';
import type {ReactElement, ReactNode} from 'react';
import './Button.css';
import './Popover.css';

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: ReactNode;
  state: ReturnType<typeof useOverlayTriggerState>;
}

export function Popover({state, children, triggerRef, ...props}: PopoverProps) {
  let popoverRef = useRef<HTMLDivElement>(null);
  let {popoverProps, underlayProps, placement} = usePopover(
    {...props, triggerRef, popoverRef},
    state
  );

  return (
    <Overlay>
      <div {...underlayProps} style={{position: 'fixed', inset: 0}} />
      <div
        {...popoverProps}
        ref={popoverRef}
        className="react-aria-Popover"
        data-placement={placement}>
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}

export function PopoverTrigger({
  label,
  children,
  ...props
}: Parameters<typeof useOverlayTriggerState>[0] & {
  label: ReactNode;
  children: ReactElement;
  placement?: AriaPopoverProps['placement'];
}) {
  let triggerRef = useRef<HTMLButtonElement>(null);
  let state = useOverlayTriggerState(props);
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
        <Popover {...props} triggerRef={triggerRef} state={state}>
          {cloneElement(children, overlayProps)}
        </Popover>
      )}
    </>
  );
}
