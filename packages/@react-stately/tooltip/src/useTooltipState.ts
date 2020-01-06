import {useControlledState} from '@react-stately/utils';

export interface TooltipState {
  open: boolean,
  setOpen: (value: boolean) => void,
}

// TODO: add tooltip to react-types and import TooltipTriggerProps from it to get rid of this typescript error
// @ts-ignore
export function useTooltipState(props: TooltipTriggerProps): TooltipState {
  let [open, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  return {
    open,
    setOpen
  };
}
