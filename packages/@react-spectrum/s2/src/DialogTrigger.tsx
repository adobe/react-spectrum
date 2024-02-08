import {DialogTrigger as AriaDialogTrigger, DialogTriggerProps as AriaDialogTriggerProps} from 'react-aria-components';
import {DialogContext} from './Dialog';

export interface DialogTriggerProps extends AriaDialogTriggerProps {
  type?: 'modal' | 'popover' | 'tray'
}

export function DialogTrigger(props: DialogTriggerProps) {
  return (
    <AriaDialogTrigger {...props}>
      <DialogContext.Provider value={{type: props.type || 'modal'}}>
        {props.children}
      </DialogContext.Provider>
    </AriaDialogTrigger>
  );
}
