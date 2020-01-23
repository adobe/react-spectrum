import {TooltipTriggerProps} from '@react-types/tooltip';
import {useControlledState} from '@react-stately/utils';

export interface TooltipTriggerState {
  open: boolean,
  setOpen: (value: boolean) => void,
}

export function useTooltipTriggerState(props: TooltipTriggerProps): TooltipTriggerState {
  let [open, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  return {
    open,
    setOpen
  };
}
