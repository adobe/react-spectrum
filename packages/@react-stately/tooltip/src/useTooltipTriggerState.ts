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

import {TooltipTriggerProps} from '@react-types/tooltip';
import {useEffect} from 'react';
import {useId} from '@react-aria/utils';
import {useOverlayTriggerState} from '@react-stately/overlays';

export const TOOLTIP_DELAY = 1500; // this seems to be a 1.5 second delay, check with design
export const TOOLTIP_COOLDOWN = 500;

interface TooltipTriggerStateProps extends TooltipTriggerProps {}

export interface TooltipTriggerState {
  isOpen: boolean,
  open: (immediate?: boolean) => void,
  close: () => void
}

let tooltips = {};
let globalWarmedUp = false;
let globalWarmUpTimeout = null;
let globalCooldownTimeout = null;


export function useTooltipTriggerState(props: TooltipTriggerStateProps): TooltipTriggerState {
  let {delay = TOOLTIP_DELAY} = props;
  let {isOpen, open, close} = useOverlayTriggerState(props);
  // this is a unique id for the tooltips in the map, it's not a dom id
  let id = useId();

  let ensureTooltipEntry = () => {
    tooltips[id] = hideTooltip;
  };

  let closeOpenTooltips = () => {
    for (let hideTooltipId in tooltips) {
      if (hideTooltipId !== id) {
        tooltips[hideTooltipId]();
        delete tooltips[hideTooltipId];
      }
    }
  };

  let showTooltip = () => {
    closeOpenTooltips();
    ensureTooltipEntry();
    globalWarmedUp = true;
    open();
    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }
    if (globalCooldownTimeout) {
      clearTimeout(globalCooldownTimeout);
      globalCooldownTimeout = null;
    }
  };

  let hideTooltip = () => {
    close();
    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }
    if (globalWarmedUp) {
      if (globalCooldownTimeout) {
        clearTimeout(globalCooldownTimeout);
      }
      globalCooldownTimeout = setTimeout(() => {
        delete tooltips[id];
        globalCooldownTimeout = null;
        globalWarmedUp = false;
      }, TOOLTIP_COOLDOWN);
    }
  };

  let warmupTooltip = () => {
    closeOpenTooltips();
    ensureTooltipEntry();
    if (!isOpen && !globalWarmUpTimeout && !globalWarmedUp) {
      globalWarmUpTimeout = setTimeout(() => {
        globalWarmUpTimeout = null;
        globalWarmedUp = true;
        showTooltip();
      }, TOOLTIP_DELAY);
    } else if (!isOpen) {
      showTooltip();
    }
  };

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      let tooltip = tooltips[id];
      if (tooltip) {
        delete tooltips[id];
      }
    };
  }, []);

  return {
    isOpen,
    open: (immediate) => {
      if (!immediate && delay > 0) {
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
