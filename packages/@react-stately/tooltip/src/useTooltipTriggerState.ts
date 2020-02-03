import {TooltipManager} from './TooltipManager';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {useControlledState} from '@react-stately/utils';
import {useMemo} from 'react';

export interface TooltipTriggerState {
  open: boolean,
  setOpen: (value: boolean) => void,
  tooltipManager: TooltipManager
}

export function useTooltipTriggerState(props: TooltipTriggerProps): TooltipTriggerState {
  let [open, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);
  let tooltipManager = useMemo(() => new TooltipManager(), []);

  tooltipManager.delegate = {
    openTooltip: () => setOpen(true),
    closeTooltip: () => setOpen(false)
  };

  return {
    open,
    setOpen,
    tooltipManager
  };
}
