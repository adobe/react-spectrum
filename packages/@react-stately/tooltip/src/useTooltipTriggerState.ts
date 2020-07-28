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
import {useEffect, useRef} from 'react';
import {useId} from '@react-aria/utils';
import {useOverlayTriggerState} from '@react-stately/overlays';

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
  let state = useRef({warmedUp: false, warmupTimeout: null, cooldownTimeout: null});

  let id = useId(); // this is a unique id for the tooltips in the map, it's not a dom id

  let ensureTooltipEntry = () => {
    tooltips[id] = hideTooltip;
  };

  let closeOpenTooltips = () => {
    for (let hideTooltipId in tooltips) {
      if (hideTooltipId !== id) {
        tooltips[hideTooltipId]();
      }
    }
  }

  let showTooltip = () => {
    closeOpenTooltips();
    ensureTooltipEntry();
    if (state.current.warmedUp || !state.current.warmupTimeout || state.current.cooldownTimeout) {
      open();
      if (state.current.cooldownTimeout) {
        clearTimeout(state.current.cooldownTimeout);
        state.current.cooldownTimeout = null;
      }
    }
  };

  let hideTooltip = () => {
    let tooltip = tooltips[id];
    if (tooltip) {
      close();
      if (state.current.warmupTimeout) {
        clearTimeout(state.current.warmupTimeout);
        state.current.warmupTimeout = null;
      }
      if (!state.current.cooldownTimeout) {
        state.current.cooldownTimeout = setTimeout(() => {
          delete tooltips[id];
          state.current.cooldownTimeout = null;
          state.current.warmedUp = false;
        }, TOOLTIP_COOLDOWN);
      }
    }
  };

  let warmupTooltip = () => {
    closeOpenTooltips();
    ensureTooltipEntry();
    if (!isOpen && !state.current.warmupTimeout && !state.current.warmedUp) {
      state.current.warmupTimeout = setTimeout(() => {
        state.current.warmupTimeout = null;
        state.current.warmedUp = true;
        showTooltip();
      }, TOOLTIP_DELAY);
    } else if (!isOpen && !state.current.warmupTimeout && state.current.warmedUp) {
      showTooltip();
    }
  };

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      let tooltip = tooltips[id];
      clearTimeout(state.current.warmupTimeout);
      clearTimeout(state.current.cooldownTimeout);
      if (tooltip) {
        delete tooltips[id];
      }
    };
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
