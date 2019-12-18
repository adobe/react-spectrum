import {useControlledState} from '@react-stately/utils';

export interface TooltipState {
  open: boolean,
  setOpen: (value: boolean) => void,
}

export function useTooltipState(props: TooltipTriggerProps): TooltipState {
  let [open, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  return {
    open,
    setOpen
  };
}
