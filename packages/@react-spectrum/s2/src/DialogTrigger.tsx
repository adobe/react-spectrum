import {DialogTrigger as AriaDialogTrigger, DialogTriggerProps as AriaDialogTriggerProps, PopoverProps as AriaPopoverProps} from 'react-aria-components';
import {DialogContext} from './Dialog';

export interface DialogTriggerProps extends AriaDialogTriggerProps, Pick<AriaPopoverProps, 'placement' | 'shouldFlip' | 'isKeyboardDismissDisabled' | 'containerPadding' | 'offset' | 'crossOffset' > {
  /**
   * The type of Dialog that should be rendered. 
   * 
   * @default 'modal'
   */
  type?: 'modal' | 'popover' | 'fullscreen' | 'fullscreenTakeover', // TODO: add tray back in
  /**
   * Whether a popover type Dialog's arrow should be hidden.
   */
  hideArrow?: boolean,
  /** 
   * Whether the Dialog is dismissable.
   */
  isDismissable?: boolean
}

/**
 * DialogTrigger serves as a wrapper around a Dialog and its associated trigger, linking the Dialog's
 * open state with the trigger's press state. Additionally, it allows you to customize the type and
 * positioning of the Dialog.
 */
export function DialogTrigger(props: DialogTriggerProps) {
  return (
    <AriaDialogTrigger {...props}>
      <DialogContext.Provider
        value={{
          type: props.type || 'modal',
          hideArrow: props.hideArrow,
          placement: props.placement,
          shouldFlip: props.shouldFlip,
          isDismissable: props.isDismissable,
          isKeyboardDismissDisabled: props.isKeyboardDismissDisabled,
          containerPadding: props.containerPadding,
          offset: props.offset,
          crossOffset: props.crossOffset
        }}>
        {props.children}
      </DialogContext.Provider>
    </AriaDialogTrigger>
  );
}
