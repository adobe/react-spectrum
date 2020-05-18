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

import {MultipleTolltipManager, TooltipState} from './types';

const CLOSE_DELAY = 220; // --spectrum-global-animation-duration-400
const WARMUP_DELAY = 350;  // --spectrum-global-animation-duration-700
const COOLDOWN_DELAY = 400; // --spectrum-global-animation-duration-1000

let visibleTooltip: null | TooltipState = null;
let warmupTimer: null | ReturnType<typeof setTimeout> = null;
let cooldownTimer: null | ReturnType<typeof setTimeout> = null;
let closeTimer: null | ReturnType<typeof setTimeout> = null;
let warmedup: boolean = false;

export class TooltipManager implements MultipleTolltipManager {
  private state: TooltipState;

  constructor(state: TooltipState) {
    this.state = state;
  }

  get isOpen(): boolean {
    return this.state.isOpen;
  }

  openTooltip() {
    // Close previously open tooltip
    if (visibleTooltip) {
      visibleTooltip.close();
    }

    this.state.open();
    visibleTooltip = this.state;
  }

  closeTooltip() {
    this.state.close();
    visibleTooltip = null;
  }

  openTooltipDelayed() {
    if (cooldownTimer) {
      clearTimeout(cooldownTimer);
    }

    if (closeTimer) {
      clearTimeout(closeTimer);
    }

    if (warmedup) {
      this.openTooltip();
      return;
    }

    warmupTimer = setTimeout(() => {
      this.openTooltip();
      warmedup = true;
    }, WARMUP_DELAY);
  }

  closeTooltipDelayed() {
    if (warmupTimer) {
      clearTimeout(warmupTimer);
    }

    closeTimer = setTimeout(() => {
      this.closeTooltip();

      cooldownTimer = setTimeout(() => {
        warmedup = false;
      }, COOLDOWN_DELAY);

    }, CLOSE_DELAY);
  }
}
