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

import {useEffect} from 'react';
import {useId} from '@react-aria/utils';
import {TooltipTriggerProps} from '@react-types/tooltip';
import {useOverlayTriggerState} from "@react-stately/overlays";

export const TOOLTIP_DELAY = 2000; // this seems to be a 2 second delay, check with design
export const TOOLTIP_COOLDOWN = 2000;
// should the cooldown be a different length of time?
// what happens if one trigger is focused and a different trigger is hovered, does one of them win?

interface TooltipTriggerStateProps extends TooltipTriggerProps {}

export interface TooltipTriggerState {
  isOpen: boolean,
  open: () => void,
  close: () => void
}

let tooltips = {};
// open to ideas of how to improve this, it's a tad gross right now, though not complicated, just gross

export function useTooltipTriggerState(props: TooltipTriggerStateProps): TooltipTriggerState {
  let {isOpen, open, close} = useOverlayTriggerState(props);
  let id = useId(); // this is a unique id for the tooltips in the map, it's not a dom id

  let ensureTooltipEntry = () => {
    if (!tooltips[id]) {
      tooltips[id] = {open: false, warmedUp: false, warmupTimeout: null, cooldownTimeout: null};
    }
    return tooltips[id];
  };

  let showTooltip = () => {
    let tooltip = ensureTooltipEntry();
    if (tooltip.warmedUp || !tooltip.warmupTimeout || tooltip.cooldownTimeout) {
      open();
      tooltip.open = true;
      if (tooltip.cooldownTimeout) {
        clearTimeout(tooltip.cooldownTimeout);
        tooltip.cooldownTimeout = null;
      }
    }
  }

  let hideTooltip = () => {
    let tooltip = tooltips[id];
    if (tooltip) {
      tooltip.open = false;
      close();
      if (tooltip.warmupTimeout) {
        clearTimeout(tooltip.warmupTimeout);
        tooltip.warmupTimeout = null;
      }
      if (!tooltip.cooldownTimeout) {
        tooltip.cooldownTimeout = setTimeout(() => delete tooltips[id], TOOLTIP_COOLDOWN);
      }
    }
  }

  let warmupTooltip = () => {
    let tooltip = ensureTooltipEntry();
    if (!tooltip.open && !tooltip.warmupTimeout && !tooltip.warmedUp) {
      tooltip.warmupTimeout = setTimeout(() => {
        tooltip.warmupTimeout = null;
        tooltip.warmedUp = true;
        showTooltip();
      }, TOOLTIP_DELAY);
    } else if (!tooltip.open && !tooltip.warmupTimeout && tooltip.warmedUp) {
      showTooltip();
    }
  }

  useEffect(() => {
    return () => {
      let tooltip = tooltips[id];
      if (tooltip) {
        clearTimeout(tooltip.warmupTimeout);
        clearTimeout(tooltip.cooldownTimeout);
        delete tooltips[id];
      }
    }
  }, []);

  return {
    isOpen,
    open: () => {
      if (props && props.delay) {
        warmupTooltip();
      } else {
        showTooltip();
      }
    },
    close: () => {
      hideTooltip();
    }
  };
}
