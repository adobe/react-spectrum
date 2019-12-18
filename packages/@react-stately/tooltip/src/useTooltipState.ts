import {useControlledState} from '@react-stately/utils';

export interface TooltipState {
  open: boolean,
  setOpen: (open: boolean) => void,
}

export function useTooltipState(props: TooltipTriggerProps): TooltipState {
  let [open, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  let sample = () => {
    console.log('I am a sample');
  }

  return {
    open,
    setOpen
  };
}
