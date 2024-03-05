import {DialogTrigger as AriaDialogTrigger, DialogTriggerProps as AriaDialogTriggerProps, PopoverProps as AriaPopoverProps} from 'react-aria-components';
import {DialogContext} from './Dialog';

export interface DialogTriggerProps extends AriaDialogTriggerProps, Pick<AriaPopoverProps, 'placement' | 'shouldFlip'> {
  type?: 'modal' | 'popover' | 'tray',
  hideArrow?: boolean
}

export function DialogTrigger(props: DialogTriggerProps) {
  return (
    <AriaDialogTrigger {...props}>
      <DialogContext.Provider
        value={{
          type: props.type || 'modal',
          hideArrow: props.hideArrow,
          placement: props.placement,
          shouldFlip: props.shouldFlip
        }}>
        {props.children}
      </DialogContext.Provider>
    </AriaDialogTrigger>
  );
}
