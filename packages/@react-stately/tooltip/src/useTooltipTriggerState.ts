/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {TooltipManager} from './TooltipManager';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {useControlledState} from '@react-stately/utils';

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
