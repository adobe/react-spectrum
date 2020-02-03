import {TooltipManager} from './TooltipManager';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {useControlledState} from '@react-stately/utils';
import {useCallback, useMemo} from 'react';

export interface TooltipTriggerState {
  open: boolean,
  setOpen: (value: boolean) => void,
  tooltipManager: TooltipManager
}

let tooltipManager = new TooltipManager();

export function useTooltipTriggerState(props: TooltipTriggerProps): TooltipTriggerState {
  let [open, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  return {
    open,
    setOpen,
    tooltipManager
  };
}
