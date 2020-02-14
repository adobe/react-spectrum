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

export class TooltipManager {

  visibleTooltips?: null | {triggerId: string, state: {open: boolean, setOpen(value: boolean), tooltipManager: string}}
  hoverHideTimeout?: null | ReturnType<typeof setTimeout>;
  hoverShowTimeout?: null | ReturnType<typeof setTimeout>;

  // Arbitrary timeout lengths in place for current demo purposes. Delays to be adjusted for warmup / cooldown logic PR
  constructor() {
    this.visibleTooltips = null;
    this.hoverHideTimeout = null;
    this.hoverShowTimeout = null;
  }

  updateTooltipState(state, triggerId)  {
    state.setOpen(!state.open);
    this.visibleTooltips = {triggerId, state};
  }

  isSameTarget(currentTriggerId) {
    return currentTriggerId === this.visibleTooltips.triggerId;
  }

  showTooltip(state) {
    state.setOpen(true);
    // Close previously open tooltip
    if (this.visibleTooltips) {
      this.visibleTooltips.state.setOpen(false);
    }
  }

  hideTooltip(state) {
    state.setOpen(false);
    this.visibleTooltips = null;
  }

  showTooltipDelayed(state, triggerId) {
    if (this.hoverHideTimeout && this.isSameTarget(triggerId)) {
      clearTimeout(this.hoverHideTimeout);
      this.hoverHideTimeout = null;
      return;
    }

    this.hoverShowTimeout = setTimeout(() => {
      this.hoverShowTimeout = null;
      this.showTooltip(state);
      this.visibleTooltips = {triggerId, state};
    }, 200);
  }

  hideTooltipDelayed(state) {
    if (this.hoverShowTimeout) {
      clearTimeout(this.hoverShowTimeout);
      this.hoverShowTimeout = null;
      return;
    }

    this.hoverHideTimeout = setTimeout(() => {
      this.hoverHideTimeout = null;
      this.hideTooltip(state);
    }, 200);
  }
}
